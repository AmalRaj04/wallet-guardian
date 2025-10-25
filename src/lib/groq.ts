// Groq AI Integration for Wallet Guardian (OpenAI-compatible)
import Groq from "groq-sdk";
import { AIResponse, Coin, Token, SecurityRisk } from "@/types";

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

let groq: Groq | null = null;

if (GROQ_API_KEY) {
  groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });
} else {
  console.warn(
    "⚠️ Groq API key not found. AI features will be disabled. Add GROQ_API_KEY to .env.local"
  );
}

// Use llama-3.3-70b-versatile (updated model)
const MODEL = "llama-3.3-70b-versatile";

export class GroqAI {
  // Analyze coin for investment insights
  static async analyzeCoin(
    coin: Coin,
    priceHistory?: any[]
  ): Promise<AIResponse> {
    if (!groq) {
      return this.getFallbackCoinAnalysis(coin);
    }

    try {
      const prompt = `Analyze the cryptocurrency ${coin.name} (${coin.symbol}) for investment potential.

Current Data:
- Price: $${coin.current_price}
- Market Cap: $${coin.market_cap}
- 24h Change: ${coin.price_change_percentage_24h}%
- Volume: $${coin.total_volume}
- Market Cap Rank: #${coin.market_cap_rank}

${priceHistory ? `Recent Price Trend: ${JSON.stringify(priceHistory.slice(-7))}` : ""}

Provide a concise analysis in JSON format:
{
  "recommendation": "buy|hold|sell",
  "score": <number 1-10>,
  "reason": "<detailed explanation>",
  "summary": "<brief outlook>"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a professional cryptocurrency analyst. Provide investment analysis in JSON format only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || "";

      try {
        // Try to extract JSON from markdown code blocks or plain text
        let jsonText = responseText;
        const jsonMatch = responseText.match(
          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
        );
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else if (responseText.includes("{") && responseText.includes("}")) {
          // Extract JSON object from text
          const start = responseText.indexOf("{");
          const end = responseText.lastIndexOf("}") + 1;
          jsonText = responseText.substring(start, end);
        }

        const parsed = JSON.parse(jsonText);
        return {
          context: "coin",
          summary: parsed.summary || "AI analysis completed",
          recommendation: parsed.recommendation,
          score: parsed.score,
          reason: parsed.reason,
          confidence: this.calculateConfidence(coin),
          timestamp: new Date(),
        };
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text response
        console.warn("Failed to parse AI response as JSON, using plain text");
        return {
          context: "coin",
          summary:
            responseText.split("\n")[0].substring(0, 150) ||
            "AI analysis completed",
          reason: responseText,
          confidence: 0.7,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error("Error analyzing coin with Groq:", error);
      return this.getFallbackCoinAnalysis(coin);
    }
  }

  // Analyze security risks with Groq
  static async analyzeSecurityRisk(prompt: string): Promise<string> {
    if (!groq) {
      return "AI analysis unavailable. Please configure GROQ_API_KEY in your environment variables.";
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a Web3 security expert. Analyze risks and provide actionable recommendations in well-formatted paragraphs. Use clear sections with headers. Do NOT return JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: MODEL,
        temperature: 0.5,
        max_tokens: 1024,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "Unable to generate analysis.";

      // Clean up any JSON artifacts if present
      if (response.includes("{") && response.includes("}")) {
        // If response contains JSON, try to extract meaningful text
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Convert JSON to readable format
            return Object.entries(parsed)
              .map(
                ([key, value]) =>
                  `**${key.charAt(0).toUpperCase() + key.slice(1)}:**\n${value}`
              )
              .join("\n\n");
          }
        } catch {
          // If JSON parsing fails, return as is
        }
      }

      return response;
    } catch (error) {
      console.error("Error analyzing security risk with Groq:", error);
      return "Error generating AI analysis. Please try again.";
    }
  }

  // Explain market alert
  static async explainMarketAlert(
    token: Token,
    alertType: string,
    data: any
  ): Promise<AIResponse> {
    if (!groq) {
      return {
        context: "portfolio",
        summary: `${alertType} detected for ${token.symbol}`,
        reason: `Market alert triggered for ${token.name}. Please review your position.`,
        confidence: 0.5,
        timestamp: new Date(),
      };
    }

    try {
      const prompt = `Explain this cryptocurrency market alert:

Token: ${token.name} (${token.symbol})
Alert Type: ${alertType}
Current Price: $${token.price || 0}
24h Change: ${token.change24h || 0}%

Alert Data: ${JSON.stringify(data)}

Provide a clear explanation of:
1. What caused this alert
2. Potential implications
3. Recommended user actions
4. Market context

Keep response concise and actionable.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a cryptocurrency market analyst. Explain market events in plain English.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 512,
      });

      const responseText = completion.choices[0]?.message?.content || "";

      return {
        context: "portfolio",
        summary: responseText.substring(0, 150) + "...",
        reason: responseText,
        confidence: 0.8,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error explaining market alert with Groq:", error);
      return {
        context: "portfolio",
        summary: `${alertType} detected for ${token.symbol}`,
        reason: `Market alert triggered for ${token.name}. Please review your position.`,
        confidence: 0.5,
        timestamp: new Date(),
      };
    }
  }

  // Ask Groq for a general AI response
  static async askGroq(payload: Record<string, any>): Promise<any> {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI proxy failed (${res.status}): ${txt}`);
    }

    return res.json();
  }

  // Calculate confidence based on data quality
  private static calculateConfidence(coin: Coin): number {
    let confidence = 0.5;

    if (coin.market_cap_rank <= 100) confidence += 0.2;
    if (coin.market_cap > 1e9) confidence += 0.1;
    if (coin.total_volume > 1e6) confidence += 0.1;
    if (Math.abs(coin.price_change_percentage_24h) < 10) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Fallback responses
  private static getFallbackCoinAnalysis(coin: Coin): AIResponse {
    const change = coin.price_change_percentage_24h;
    let recommendation: "buy" | "hold" | "sell" = "hold";
    let score = 5;

    if (change > 10) {
      recommendation = "sell";
      score = 7;
    } else if (change < -10) {
      recommendation = "buy";
      score = 6;
    }

    return {
      context: "coin",
      summary: `${coin.name} analysis based on recent performance`,
      recommendation,
      score,
      reason: `Based on 24h change of ${change.toFixed(2)}% and market cap rank of #${coin.market_cap_rank}. AI analysis unavailable - configure GROQ_API_KEY for detailed insights.`,
      confidence: 0.6,
      timestamp: new Date(),
    };
  }

  // Check if AI is available
  static isAvailable(): boolean {
    return !!groq;
  }
}

export default GroqAI;

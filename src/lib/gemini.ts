// Gemini AI Integration for Crypto Sentinel X
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse, Coin, Token, SecurityRisk, Portfolio } from '@/types';

const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found. AI features will be disabled.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiAI {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Analyze coin for investment insights
  static async analyzeCoin(coin: Coin, priceHistory?: any[]): Promise<AIResponse> {
    try {
      const prompt = `
        Analyze the cryptocurrency ${coin.name} (${coin.symbol}) for investment potential.
        
        Current Data:
        - Price: $${coin.current_price}
        - Market Cap: $${coin.market_cap}
        - 24h Change: ${coin.price_change_percentage_24h}%
        - Volume: $${coin.total_volume}
        - Market Cap Rank: #${coin.market_cap_rank}
        
        ${priceHistory ? `Recent Price Trend: ${JSON.stringify(priceHistory.slice(-7))}` : ''}
        
        Provide a concise analysis including:
        1. Investment recommendation (buy/hold/sell)
        2. Risk assessment score (1-10, where 10 is highest risk)
        3. Key factors influencing the recommendation
        4. Short-term outlook (1-2 sentences)
        
        Format your response as JSON:
        {
          "recommendation": "buy|hold|sell",
          "score": number,
          "reason": "detailed explanation",
          "summary": "brief outlook"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text);
        return {
          context: 'coin',
          summary: parsed.summary || 'AI analysis completed',
          recommendation: parsed.recommendation,
          score: parsed.score,
          reason: parsed.reason,
          confidence: this.calculateConfidence(coin),
          timestamp: new Date(),
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          context: 'coin',
          summary: text.substring(0, 200) + '...',
          reason: text,
          confidence: 0.7,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('Error analyzing coin with Gemini:', error);
      return this.getFallbackCoinAnalysis(coin);
    }
  }

  // Analyze portfolio for risk assessment
  static async analyzePortfolio(portfolio: Portfolio): Promise<AIResponse> {
    try {
      const topTokens = portfolio.tokens
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 5);

      const prompt = `
        Analyze this cryptocurrency portfolio for risk and opportunities:
        
        Portfolio Overview:
        - Total Value: $${portfolio.totalValue.toFixed(2)}
        - 24h Change: ${portfolio.totalChangePercentage24h.toFixed(2)}%
        - Number of Tokens: ${portfolio.tokens.length}
        
        Top Holdings:
        ${topTokens.map(token => 
          `- ${token.name} (${token.symbol}): $${(token.value || 0).toFixed(2)} (${token.change24h || 0}%)`
        ).join('\n')}
        
        Provide analysis including:
        1. Overall portfolio health assessment
        2. Risk level (1-10)
        3. Diversification analysis
        4. Recommended actions
        
        Format as JSON:
        {
          "recommendation": "hold|rebalance|reduce_risk|take_profits",
          "score": number,
          "reason": "detailed analysis",
          "summary": "key insights"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text);
        return {
          context: 'portfolio',
          summary: parsed.summary,
          recommendation: parsed.recommendation,
          score: parsed.score,
          reason: parsed.reason,
          confidence: 0.8,
          timestamp: new Date(),
        };
      } catch (parseError) {
        return {
          context: 'portfolio',
          summary: text.substring(0, 200) + '...',
          reason: text,
          confidence: 0.7,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('Error analyzing portfolio with Gemini:', error);
      return this.getFallbackPortfolioAnalysis(portfolio);
    }
  }

  // Analyze security risks
  static async analyzeSecurityRisk(risk: SecurityRisk, context?: any): Promise<AIResponse> {
    try {
      const prompt = `
        Analyze this Web3 security risk:
        
        Risk Type: ${risk.type}
        Severity: ${risk.severity}
        Description: ${risk.description}
        Contract: ${risk.contractAddress || 'N/A'}
        
        ${context ? `Additional Context: ${JSON.stringify(context)}` : ''}
        
        Provide security analysis including:
        1. Threat assessment
        2. Recommended immediate actions
        3. Prevention strategies
        4. Risk mitigation steps
        
        Format as JSON:
        {
          "recommendation": "revoke|monitor|investigate|ignore",
          "score": number,
          "reason": "security analysis",
          "summary": "immediate action needed"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text);
        return {
          context: 'security',
          summary: parsed.summary,
          recommendation: parsed.recommendation,
          score: parsed.score,
          reason: parsed.reason,
          confidence: 0.9,
          timestamp: new Date(),
        };
      } catch (parseError) {
        return {
          context: 'security',
          summary: text.substring(0, 200) + '...',
          reason: text,
          confidence: 0.8,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('Error analyzing security risk with Gemini:', error);
      return this.getFallbackSecurityAnalysis(risk);
    }
  }

  // Generate market alert explanation
  static async explainMarketAlert(
    token: Token,
    alertType: string,
    data: any
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Explain this cryptocurrency market alert:
        
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
        
        Keep response concise and actionable.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        context: 'portfolio',
        summary: text.substring(0, 150) + '...',
        reason: text,
        confidence: 0.8,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error explaining market alert with Gemini:', error);
      return {
        context: 'portfolio',
        summary: `${alertType} detected for ${token.symbol}`,
        reason: `Market alert triggered for ${token.name}. Please review your position.`,
        confidence: 0.5,
        timestamp: new Date(),
      };
    }
  }

  // Calculate confidence based on data quality
  private static calculateConfidence(coin: Coin): number {
    let confidence = 0.5;
    
    // Higher confidence for established coins
    if (coin.market_cap_rank <= 100) confidence += 0.2;
    if (coin.market_cap > 1e9) confidence += 0.1;
    if (coin.total_volume > 1e6) confidence += 0.1;
    if (Math.abs(coin.price_change_percentage_24h) < 10) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  // Fallback responses when AI is unavailable
  private static getFallbackCoinAnalysis(coin: Coin): AIResponse {
    const change = coin.price_change_percentage_24h;
    let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
    let score = 5;

    if (change > 10) {
      recommendation = 'sell';
      score = 7;
    } else if (change < -10) {
      recommendation = 'buy';
      score = 6;
    }

    return {
      context: 'coin',
      summary: `${coin.name} analysis based on recent performance`,
      recommendation,
      score,
      reason: `Based on 24h change of ${change.toFixed(2)}% and market cap rank of #${coin.market_cap_rank}`,
      confidence: 0.6,
      timestamp: new Date(),
    };
  }

  private static getFallbackPortfolioAnalysis(portfolio: Portfolio): AIResponse {
    const change = portfolio.totalChangePercentage24h;
    let recommendation: 'hold' | 'rebalance' | 'reduce_risk' | 'take_profits' = 'hold';
    let score = 5;

    if (change > 20) {
      recommendation = 'take_profits';
      score = 3;
    } else if (change < -20) {
      recommendation = 'reduce_risk';
      score = 8;
    }

    return {
      context: 'portfolio',
      summary: `Portfolio showing ${change > 0 ? 'gains' : 'losses'} of ${Math.abs(change).toFixed(2)}%`,
      recommendation,
      score,
      reason: `Portfolio analysis based on 24h performance and diversification across ${portfolio.tokens.length} tokens`,
      confidence: 0.7,
      timestamp: new Date(),
    };
  }

  private static getFallbackSecurityAnalysis(risk: SecurityRisk): AIResponse {
    const severityScore = {
      low: 3,
      medium: 6,
      high: 8,
      critical: 10,
    };

    return {
      context: 'security',
      summary: `${risk.severity} security risk detected`,
      recommendation: risk.severity === 'critical' ? 'revoke' : 'monitor',
      score: severityScore[risk.severity],
      reason: risk.description,
      confidence: 0.8,
      timestamp: new Date(),
    };
  }

  // Check if AI is available
  static isAvailable(): boolean {
    return !!API_KEY;
  }
}

export default GeminiAI;
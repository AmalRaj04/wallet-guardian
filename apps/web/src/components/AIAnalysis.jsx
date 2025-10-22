'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle, DollarSign, Star } from 'lucide-react';
import useHandleStreamResponse from '../utils/useHandleStreamResponse';

export default function AIAnalysis({ coin }) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState('');
  const [rating, setRating] = useState(null);

  // ✅ Clean and extract only the 3 sections (final corrected version)
  // Clean and extract only the 3 sections
const cleanAIResponse = (rawText) => {
  if (!rawText) return '';

  let text = rawText.replace(/\r/g, '').trim();

  // Start from the first real section (ignore reasoning before that)
  const startMatch = text.match(/(?:\*\*)?\s*Market Sentiment\s*[:：]/i);
  if (startMatch) {
    text = text.slice(text.indexOf(startMatch[0]));
  }

  // Remove instructions, reasoning, or meta lines
  text = text
    .split('\n')
    .filter((line) => {
      const l = line.toLowerCase();
      return !(
        l.includes('use only') ||
        l.includes('provide') ||
        l.includes('must not') ||
        l.includes('ensure') ||
        l.includes('let’s') ||
        l.includes('we need') ||
        l.includes('analyze') ||
        l.includes('draft') ||
        l.includes('count') ||
        l.includes('good') ||
        l.includes('section') ||
        l.includes('format') ||
        l.includes('example') ||
        l.includes('data:') ||
        l.includes('evaluate')
      );
    })
    .join('\n')
    .trim();

  // Extract only one copy of each section
  const sentimentMatch = text.match(/Market Sentiment[:：]\s*(.*?)(?=Risk Assessment[:：]|Outlook[:：]|$)/is);
  const riskMatch = text.match(/Risk Assessment[:：]\s*(.*?)(?=Outlook[:：]|$)/is);
  const outlookMatch = text.match(/Outlook[:：]\s*(.*)$/is);

  const sentiment = sentimentMatch?.[1]?.trim() || '';
  const risk = riskMatch?.[1]?.trim() || '';
  const outlook = outlookMatch?.[1]?.trim() || '';

  // Build clean output with consistent spacing
  let cleaned = '';
  if (sentiment) cleaned += `Market Sentiment: ${sentiment}\n\n`;
  if (risk) cleaned += `Risk Assessment: ${risk}\n\n`;
  if (outlook) cleaned += `Outlook: ${outlook}`;

  // Remove duplicate section headings if the model echoed them twice
  cleaned = cleaned
    .replace(/(Market Sentiment:.*?)(Market Sentiment:)/gis, '$1')
    .replace(/(Risk Assessment:.*?)(Risk Assessment:)/gis, '$1')
    .replace(/(Outlook:.*?)(Outlook:)/gis, '$1')
    .trim();

  return cleaned;
};


  // Enhanced AI Rating using data + sentiment cues
const getSentimentRating = (text, coin) => {
  if (!coin || !text) return 5;

  const lower = text.toLowerCase();
  const change24h = coin.market_data?.price_change_percentage_24h || 0;
  const change7d = coin.market_data?.price_change_percentage_7d || 0;
  const change30d = coin.market_data?.price_change_percentage_30d || 0;

  // Weighted score based on recent performance
  let score =
    (change24h * 0.5 + change7d * 0.3 + change30d * 0.2) / 10 + 5; // normalize around 5

  // Clamp score between 1 and 10
  score = Math.max(1, Math.min(10, score));

  // Adjust slightly based on sentiment words
  if (lower.includes('strong bullish') || lower.includes('very positive')) score += 1;
  else if (lower.includes('bullish') || lower.includes('upward')) score += 0.5;
  else if (lower.includes('bearish') || lower.includes('negative')) score -= 0.5;
  else if (lower.includes('strong bearish') || lower.includes('very negative')) score -= 1;

  // Clamp again
  score = Math.max(1, Math.min(10, Math.round(score)));

  return score;
};

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: (chunk) => setStreamingMessage(cleanAIResponse(chunk)),
    onFinish: (finalContent) => {
      const cleaned = cleanAIResponse(finalContent);
      setAnalysis(cleaned);
      setStreamingMessage('');
      setRating(getSentimentRating(cleaned, coin));
      setIsLoading(false);
    },
  });

  const generateAnalysis = useCallback(async () => {
    if (!coin || isLoading) return;

    setIsLoading(true);
    setAnalysis('');
    setStreamingMessage('');
    setError('');
    setRating(null);

    try {
      const currentPrice = coin.market_data?.current_price?.usd;
      const change24h = coin.market_data?.price_change_percentage_24h;
      const change7d = coin.market_data?.price_change_percentage_7d;
      const change30d = coin.market_data?.price_change_percentage_30d;
      const marketCap = coin.market_data?.market_cap?.usd;
      const volume = coin.market_data?.total_volume?.usd;
      const marketCapRank = coin.market_cap_rank;

      const chartResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`
      );
      let trendData = null;
      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        trendData = chartData.prices;
      }

      const analysisPrompt = `
You are a precise cryptocurrency analyst. 
Return ONLY the formatted report below — nothing else, no explanations.

FORMAT (use exactly this):
Market Sentiment: [1–2 sentences]
Risk Assessment: [1–2 sentences]
Outlook: [1–2 sentences]

Write in neutral analytical tone using data only. Do not explain what you're doing.
Do not repeat instructions, do not say "we need to analyze" or anything else outside the format.

DATA:
- Name: ${coin.name} (${coin.symbol?.toUpperCase()})
- Current Price: $${currentPrice?.toLocaleString()}
- 24h Change: ${change24h?.toFixed(2)}%
- 7d Change: ${change7d?.toFixed(2)}%
- 30d Change: ${change30d?.toFixed(2)}%
- Market Cap: $${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- 24h Volume: $${volume ? (volume / 1e6).toFixed(2) + 'M' : 'N/A'}
- Rank: #${marketCapRank || 'N/A'}
- 7-Day Trend: ${
  trendData
    ? trendData.length > 1
      ? trendData[trendData.length - 1][1] > trendData[0][1]
        ? 'Upward momentum'
        : 'Downward momentum'
      : 'Limited data'
    : 'N/A'
}

EXAMPLE OUTPUT (structure only, not content):
Market Sentiment: Bitcoin (BTC) shows strong positive sentiment with a 10% 7-day rise and upward momentum.
Risk Assessment: Moderate risk due to large market cap but increasing volatility.
Outlook: Short-term bullish continuation likely if momentum sustains.
`;


      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: analysisPrompt }], stream: true }),
      });

      if (!response.ok) throw new Error('AI response failed');
      if (response.body) await handleStreamResponse(response);
      else {
        const text = await response.text();
        const cleaned = cleanAIResponse(text);
        setAnalysis(cleaned);
        setRating(getSentimentRating(cleaned));
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate AI analysis.');
      setIsLoading(false);
    }
  }, [coin, isLoading, handleStreamResponse]);

  useEffect(() => {
    if (coin && !analysis && !isLoading) {
      const timer = setTimeout(() => generateAnalysis(), 1000);
      return () => clearTimeout(timer);
    }
  }, [coin, analysis, isLoading, generateAnalysis]);

  const getRecommendationIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('bullish') || lower.includes('positive') || lower.includes('upward'))
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (lower.includes('bearish') || lower.includes('negative') || lower.includes('downward'))
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <DollarSign className="w-5 h-5 text-yellow-400" />;
  };

  const getSentimentColor = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('bullish') || lower.includes('positive') || lower.includes('upward'))
      return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
    if (lower.includes('bearish') || lower.includes('negative') || lower.includes('downward'))
      return 'from-red-500/20 to-rose-500/20 border-red-400/30';
    return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
  };

  if (!coin) return null;
  const displayText = analysis || streamingMessage;

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-[family-name:Space_Grotesk]">AI Analysis</h2>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        {!isLoading && analysis && (
          <button
            onClick={generateAnalysis}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/30">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {isLoading && !streamingMessage ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Analyzing {coin.name}...</span>
            </div>
          </div>
        ) : displayText ? (
          <div className={`p-4 rounded-xl bg-gradient-to-r ${getSentimentColor(displayText)} border backdrop-blur-sm`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">{getRecommendationIcon(displayText)}</div>
              <div className="flex-1 text-white leading-relaxed font-[family-name:Inter]">
                {displayText.split('\n').map((line, i) => (
                  <div
                    key={i}
                    className="mb-3 last:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>'),
                    }}
                  />
                ))}
                {isLoading && streamingMessage && (
                  <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse"></span>
                )}
              </div>
            </div>

            {rating !== null && (
              <div className="mt-4 flex items-center space-x-2 text-yellow-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">AI Rating: {rating}/10</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No analysis available</div>
            <button
              onClick={generateAnalysis}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Generate Analysis
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          AI analysis is for informational purposes only. Not financial advice.
        </div>
      </div>
    </div>
  );
}

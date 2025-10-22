'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import useHandleStreamResponse from '@/utils/useHandleStreamResponse';

export default function AIAnalysis({ coin }) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const handleFinish = useCallback((message) => {
    setAnalysis(message);
    setStreamingMessage('');
    setIsLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({ 
    onChunk: setStreamingMessage, 
    onFinish: handleFinish 
  });

  const generateAnalysis = useCallback(async () => {
    if (!coin || isLoading) return;

    setIsLoading(true);
    setAnalysis('');
    setStreamingMessage('');

    try {
      const currentPrice = coin.market_data?.current_price?.usd;
      const change24h = coin.market_data?.price_change_percentage_24h;
      const change7d = coin.market_data?.price_change_percentage_7d;
      const change30d = coin.market_data?.price_change_percentage_30d;
      const marketCap = coin.market_data?.market_cap?.usd;
      const volume = coin.market_data?.total_volume?.usd;
      const marketCapRank = coin.market_cap_rank;

      // Fetch recent price chart data for trend analysis
      const chartResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`
      );
      let trendData = null;
      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        trendData = chartData.prices;
      }

      const analysisPrompt = `Analyze ${coin.name} (${coin.symbol}) cryptocurrency with the following data:

Current Price: $${currentPrice?.toLocaleString()}
24h Change: ${change24h?.toFixed(2)}%
7d Change: ${change7d?.toFixed(2)}%
30d Change: ${change30d?.toFixed(2)}%
Market Cap: $${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
24h Volume: $${volume ? (volume / 1e6).toFixed(2) + 'M' : 'N/A'}
Market Cap Rank: #${marketCapRank || 'N/A'}

${trendData ? `Recent 7-day price trend shows ${trendData.length > 1 ? 
  (trendData[trendData.length - 1][1] > trendData[0][1] ? 'upward momentum' : 'downward momentum') : 'limited data'
}.` : ''}

Provide a concise investment analysis (2-3 sentences) focusing on:
1. Current market sentiment based on recent price action
2. Risk assessment considering volatility and market position
3. Brief outlook recommendation (bullish/bearish/neutral)

Keep it professional, factual, and include a clear recommendation. Do not provide financial advice disclaimers.`;

      const response = await fetch('/integrations/google-gemini-2-5-pro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI analysis');
      }

      handleStreamResponse(response);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.error('Failed to generate AI analysis');
      setIsLoading(false);
      setStreamingMessage('');
    }
  }, [coin, isLoading, handleStreamResponse]);

  useEffect(() => {
    if (coin && !analysis && !isLoading) {
      // Auto-generate analysis when coin is selected
      const timer = setTimeout(() => {
        generateAnalysis();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [coin, analysis, isLoading, generateAnalysis]);

  const getRecommendationIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('bullish') || lowerText.includes('buy') || lowerText.includes('positive')) {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    } else if (lowerText.includes('bearish') || lowerText.includes('sell') || lowerText.includes('negative')) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    } else {
      return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSentimentColor = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('bullish') || lowerText.includes('positive')) {
      return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
    } else if (lowerText.includes('bearish') || lowerText.includes('negative')) {
      return 'from-red-500/20 to-rose-500/20 border-red-400/30';
    } else {
      return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
    }
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
          <h2 className="text-xl font-bold text-white font-[family-name:Space_Grotesk]">
            AI Analysis
          </h2>
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
              <div className="flex-shrink-0 mt-1">
                {getRecommendationIcon(displayText)}
              </div>
              <div className="flex-1">
                <div className="text-white leading-relaxed font-[family-name:Inter]">
                  {displayText}
                  {isLoading && streamingMessage && (
                    <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
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
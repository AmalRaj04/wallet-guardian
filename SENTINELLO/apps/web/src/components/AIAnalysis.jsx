import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Brain, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/types/token';
import { coinGeckoAPI } from '@/lib/coingecko';
import useHandleStreamResponse from '@/utils/useHandleStreamResponse';

export default function AIAnalysis({ isOpen, onClose, token }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState(null);

  const handleFinish = (message) => {
    try {
      const parsedAnalysis = JSON.parse(message);
      setAnalysis(parsedAnalysis);
      setStreamingMessage('');
    } catch (err) {
      console.error('Error parsing AI response:', err);
      setError('Failed to parse AI analysis');
    }
    setIsLoading(false);
  };

  const handleStreamResponse = useHandleStreamResponse({ 
    onChunk: setStreamingMessage, 
    onFinish: handleFinish 
  });

  // Fetch market data and analyze with AI
  const analyzeToken = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setStreamingMessage('');

    try {
      // Gather market data
      const marketData = await coinGeckoAPI.getMarketData(token.address);
      const historicalPrices = await coinGeckoAPI.getHistoricalPrices(token.address, 7);
      
      // Prepare context for AI analysis
      const context = {
        token: {
          symbol: token.symbol,
          name: token.name,
          currentPrice: token.price,
          change24h: token.change24h,
          portfolioValue: token.value,
          balance: token.balanceFormatted
        },
        marketData: marketData || {
          volume24h: 0,
          marketCap: 0,
          price: token.price,
          change24h: token.change24h
        },
        priceHistory: historicalPrices.slice(-7).map(([timestamp, price]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          price
        })),
        timestamp: new Date().toISOString()
      };

      // Call AI analysis
      const response = await fetch('/integrations/google-gemini-2-5-pro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a professional crypto market analyst. Analyze the provided token data and give actionable insights. Be concise but thorough. Focus on price trends, market conditions, and trading recommendations.`
            },
            {
              role: 'user',
              content: `Analyze this token data and provide insights:

Token: ${context.token.symbol} (${context.token.name})
Current Price: $${context.token.currentPrice}
24h Change: ${context.token.change24h}%
Portfolio Value: $${context.token.portfolioValue}
Market Cap: $${context.marketData.marketCap?.toLocaleString() || 'N/A'}
24h Volume: $${context.marketData.volume24h?.toLocaleString() || 'N/A'}

Recent Price History (7 days):
${context.priceHistory.map(p => `${p.date}: $${p.price.toFixed(4)}`).join('\n')}

Please provide:
1. Market sentiment analysis
2. Price trend assessment
3. Risk factors
4. Trading recommendation (Hold/Sell/Convert to stablecoin)
5. Key support/resistance levels if applicable

Format your response as a structured analysis.`
            }
          ],
          json_schema: {
            name: "token_analysis",
            schema: {
              type: "object",
              properties: {
                sentiment: {
                  type: "string",
                  enum: ["bullish", "bearish", "neutral"]
                },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 100
                },
                summary: {
                  type: "string"
                },
                priceAnalysis: {
                  type: "object",
                  properties: {
                    trend: {
                      type: "string",
                      enum: ["uptrend", "downtrend", "sideways"]
                    },
                    support: {
                      type: ["number", "null"]
                    },
                    resistance: {
                      type: ["number", "null"]
                    },
                    volatility: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    }
                  },
                  required: ["trend", "support", "resistance", "volatility"],
                  additionalProperties: false
                },
                riskFactors: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                recommendation: {
                  type: "object",
                  properties: {
                    action: {
                      type: "string",
                      enum: ["hold", "sell", "convert_to_stablecoin", "buy_more"]
                    },
                    reasoning: {
                      type: "string"
                    },
                    timeframe: {
                      type: "string",
                      enum: ["short_term", "medium_term", "long_term"]
                    }
                  },
                  required: ["action", "reasoning", "timeframe"],
                  additionalProperties: false
                },
                keyInsights: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                }
              },
              required: ["sentiment", "confidence", "summary", "priceAnalysis", "riskFactors", "recommendation", "keyInsights"],
              additionalProperties: false
            }
          },
          stream: true
        }),
      });

      handleStreamResponse(response);
    } catch (err) {
      console.error('Error analyzing token:', err);
      setError('Failed to analyze token. Please try again.');
      setIsLoading(false);
    }
  };

  // Start analysis when modal opens
  useEffect(() => {
    if (isOpen && token) {
      analyzeToken();
    }
  }, [isOpen, token]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnalysis(null);
      setStreamingMessage('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'bearish':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getRecommendationIcon = (action) => {
    switch (action) {
      case 'buy_more':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'convert_to_stablecoin':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-space-grotesk font-semibold">AI Market Analysis</h2>
                <p className="text-sm text-gray-400">{token?.symbol} ({token?.name})</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-6">
              {/* Loading State */}
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analyzing Market Data</h3>
                  <p className="text-gray-400">AI is processing market trends and generating insights...</p>
                </div>
              </div>

              {/* Streaming Response */}
              {streamingMessage && (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">AI Analysis in Progress</span>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {streamingMessage}
                  </div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={analyzeToken}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Sentiment & Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${getSentimentColor(analysis.sentiment)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getSentimentIcon(analysis.sentiment)}
                    <span className="font-semibold capitalize">{analysis.sentiment}</span>
                  </div>
                  <div className="text-sm opacity-80">Market Sentiment</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">{analysis.confidence}%</div>
                  <div className="text-sm text-gray-400">Confidence Level</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Executive Summary</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Price Analysis */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Price Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Trend</div>
                    <div className="font-semibold text-white capitalize">{analysis.priceAnalysis.trend}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Volatility</div>
                    <div className="font-semibold text-white capitalize">{analysis.priceAnalysis.volatility}</div>
                  </div>
                  {analysis.priceAnalysis.support && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Support</div>
                      <div className="font-semibold text-white">{formatCurrency(analysis.priceAnalysis.support)}</div>
                    </div>
                  )}
                  {analysis.priceAnalysis.resistance && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Resistance</div>
                      <div className="font-semibold text-white">{formatCurrency(analysis.priceAnalysis.resistance)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  {getRecommendationIcon(analysis.recommendation.action)}
                  <h3 className="font-semibold text-white">Recommendation</h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                    {analysis.recommendation.timeframe.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-lg font-semibold text-white mb-2 capitalize">
                  {analysis.recommendation.action.replace('_', ' ')}
                </div>
                <p className="text-gray-300 text-sm">{analysis.recommendation.reasoning}</p>
              </div>

              {/* Risk Factors */}
              {analysis.riskFactors.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Risk Factors</h3>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Insights */}
              {analysis.keyInsights.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Key Insights</h3>
                  <ul className="space-y-2">
                    {analysis.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
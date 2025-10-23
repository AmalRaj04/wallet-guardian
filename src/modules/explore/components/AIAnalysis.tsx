'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Coin, AIResponse } from '@/types';
import { GroqAI } from '@/lib/groq';
import GlassCard from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/LoadingState';

interface AIAnalysisProps {
  coin: Coin;
}

export default function AIAnalysis({ coin }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coin) {
      analyzeCoins();
    }
  }, [coin.id]);

  const analyzeCoins = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const aiAnalysis = await GroqAI.analyzeCoin(coin);
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Error analyzing coin:', err);
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'hold':
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'buy':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'sell':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'hold':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'No Score';
    if (score >= 8) return 'Strong';
    if (score >= 6) return 'Moderate';
    if (score >= 4) return 'Weak';
    return 'Poor';
  };

  return (
    <GlassCard className="p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neon-purple" />
          AI Analysis
        </h2>
        
        <button
          onClick={analyzeCoins}
          disabled={isLoading}
          className="p-2 rounded-lg bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 text-neon-purple transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8">
          <LoadingState message="Analyzing with AI..." size="sm" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={analyzeCoins}
            className="px-4 py-2 bg-red-400/20 hover:bg-red-400/30 border border-red-400/30 rounded-lg text-red-400 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Recommendation Badge */}
          {analysis.recommendation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border ${getRecommendationColor(analysis.recommendation)}`}
            >
              {getRecommendationIcon(analysis.recommendation)}
              <span className="font-bold uppercase tracking-wide">
                {analysis.recommendation}
              </span>
            </motion.div>
          )}

          {/* Score */}
          {analysis.score && (
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Investment Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/10
              </div>
              <div className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
                {getScoreLabel(analysis.score)}
              </div>
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-neon-blue" />
                Quick Summary
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          )}

          {/* Detailed Analysis */}
          {analysis.reason && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Detailed Analysis
              </h3>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.reason}
                </p>
              </div>
            </div>
          )}

          {/* Confidence */}
          {analysis.confidence && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Confidence Level</span>
                <span className="text-sm text-white font-medium">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.confidence * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/10">
            Analysis generated on {analysis.timestamp.toLocaleString()}
          </div>

          {/* AI Disclaimer */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-400">
                <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not be considered financial advice. Always do your own research before making investment decisions.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Select a cryptocurrency to get AI-powered investment analysis
          </p>
          <div className="text-xs text-gray-500">
            Powered by Groq AI
          </div>
        </div>
      )}
    </GlassCard>
  );
}
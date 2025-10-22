import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, X, Brain, DollarSign, Repeat } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/types/token';

const severityConfig = {
  critical: {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: AlertTriangle,
    iconColor: 'text-red-400'
  },
  high: {
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: TrendingDown,
    iconColor: 'text-orange-400'
  },
  medium: {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    icon: TrendingDown,
    iconColor: 'text-yellow-400'
  },
  low: {
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: TrendingDown,
    iconColor: 'text-blue-400'
  }
};

export default function PriceAlert({ alert, onSwap, onAnalyze, onDismiss }) {
  const config = severityConfig[alert.severity] || severityConfig.medium;
  const Icon = config.icon;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <motion.div
      className={`${config.bgColor} ${config.borderColor} border backdrop-blur-lg rounded-2xl p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Dismiss Button */}
      <motion.button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={`p-2 ${config.bgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white">{alert.token.symbol} Price Alert</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Current: {formatCurrency(alert.currentPrice)}</span>
              <span>Change: {formatPercentage(alert.priceChange)}</span>
              <span>{formatTimestamp(alert.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Token Info */}
        <div className="flex items-center space-x-3 mb-6 p-3 bg-white/5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            {alert.token.logo ? (
              <img 
                src={alert.token.logo} 
                alt={alert.token.symbol}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className="text-white font-semibold text-sm" style={{ display: alert.token.logo ? 'none' : 'flex' }}>
              {alert.token.symbol.slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">{alert.token.name}</div>
            <div className="text-sm text-gray-400">{alert.token.symbol}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{formatCurrency(alert.token.value)}</div>
            <div className="text-sm text-gray-400">Portfolio Value</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.button
            onClick={() => onAnalyze(alert.token)}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Brain className="w-4 h-4" />
            <span>AI Analysis</span>
          </motion.button>

          <motion.button
            onClick={() => onSwap(alert.token, 'sell')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DollarSign className="w-4 h-4" />
            <span>Sell Now</span>
          </motion.button>

          <motion.button
            onClick={() => onSwap(alert.token, 'pyusd')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Repeat className="w-4 h-4" />
            <span>Convert to PYUSD</span>
          </motion.button>
        </div>

        {/* AI Analysis Preview */}
        {alert.aiAnalysis && (
          <motion.div
            className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">AI Insight</span>
            </div>
            <p className="text-sm text-gray-300">{alert.aiAnalysis.summary}</p>
            {alert.aiAnalysis.recommendation && (
              <div className="mt-2 text-xs text-gray-400">
                Recommendation: <span className="text-blue-400">{alert.aiAnalysis.recommendation}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
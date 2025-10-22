// Token type definitions for TypeScript-like structure in JavaScript

export const TokenSchema = {
  address: 'string',
  symbol: 'string', 
  name: 'string',
  decimals: 'number',
  balance: 'string',
  balanceFormatted: 'number',
  price: 'number',
  value: 'number',
  change24h: 'number',
  logo: 'string'
};

export const AlertSchema = {
  token: 'TokenSchema',
  type: 'string', // 'price_drop', 'volume_spike', etc.
  message: 'string',
  severity: 'string', // 'low', 'medium', 'high', 'critical'
  timestamp: 'number',
  aiAnalysis: 'object'
};

// Helper functions
export const formatTokenBalance = (balance, decimals) => {
  return parseFloat(balance) / Math.pow(10, decimals);
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
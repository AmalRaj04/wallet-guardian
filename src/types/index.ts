// Core Types for Crypto Sentinel X

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: number;
  price?: number;
  value?: number;
  change24h?: number;
  logo?: string;
}

export interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  tokens: Token[];
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  type: 'price_drop' | 'volume_spike' | 'security_risk' | 'mempool_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  token?: Token;
  title: string;
  message: string;
  recommendation?: string;
  aiAnalysis?: AIResponse;
  timestamp: Date;
  isRead: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'sell' | 'convert' | 'revoke' | 'ignore';
  data?: any;
}

export interface AIResponse {
  context: 'coin' | 'portfolio' | 'security';
  summary: string;
  recommendation?: 'buy' | 'hold' | 'sell' | 'convert' | 'revoke' | 'reduce_risk' | 'take_profits' | 'monitor';
  score?: number; // 0-100 or 1-10
  reason: string;
  confidence?: number;
  timestamp: Date;
}

export interface SecurityRisk {
  id: string;
  type: 'unverified_contract' | 'high_allowance' | 'honeypot' | 'malicious_code' | 'mempool_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  contractAddress?: string;
  tokenAddress?: string;
  description: string;
  recommendation: string;
  aiAnalysis?: AIResponse;
  timestamp: Date;
}

export interface TokenAllowance {
  spender: string;
  spenderName?: string;
  token: Token;
  allowance: string;
  allowanceFormatted: number;
  isUnlimited: boolean;
  lastUpdated: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface WalletRiskScore {
  overall: number; // 0-100
  factors: {
    allowances: number;
    unverifiedContracts: number;
    recentActivity: number;
    tokenDiversity: number;
  };
  recommendations: string[];
  lastCalculated: Date;
}

export interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high';
  threatType?: 'frontrun' | 'sandwich' | 'mev' | 'suspicious';
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

export interface CoinDetails extends Coin {
  description?: {
    en: string;
  };
  image?: {
    thumb: string;
    small: string;
    large: string;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  market_data?: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    high_24h: { [key: string]: number };
    low_24h: { [key: string]: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: { [key: string]: number };
    ath_change_percentage: { [key: string]: number };
    ath_date: { [key: string]: string };
    atl: { [key: string]: number };
    atl_change_percentage: { [key: string]: number };
    atl_date: { [key: string]: string };
  };
  community_data?: {
    facebook_likes: number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
  };
  developer_data?: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    code_additions_deletions_4_weeks: {
      additions: number;
      deletions: number;
    };
    commit_count_4_weeks: number;
  };
}

export interface ChartData {
  timestamp: number;
  time: string;
  price: number;
  volume?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  gasEstimate: string;
  priceImpact: number;
  route?: any;
  slippage: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: 'blue' | 'purple' | 'pink' | 'green';
}

export interface AppState {
  theme: ThemeConfig;
  connectedWallet?: string;
  portfolio?: Portfolio;
  alerts: Alert[];
  securityRisks: SecurityRisk[];
  riskScore?: WalletRiskScore;
}

// API Response Types
export interface CoinGeckoResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface BlockscoutResponse<T> {
  result?: T;
  message?: string;
  status: string;
}

export interface EnvioResponse<T> {
  data?: T;
  error?: string;
  subscription_id?: string;
}

// Component Props Types
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  neonColor?: 'blue' | 'purple' | 'pink' | 'green';
  onClick?: () => void;
}

export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Global type extensions for Next.js environment
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Export empty object to make this a module
export {};

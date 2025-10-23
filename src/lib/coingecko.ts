// CoinGecko API Integration
import axios from 'axios';
import { Coin, CoinDetails, TrendingCoin, ChartData } from '@/types';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY;

const api = axios.create({
  baseURL: COINGECKO_BASE_URL,
  headers: API_KEY ? { 'x-cg-demo-api-key': API_KEY } : {},
  timeout: 10000,
});

export class CoinGeckoAPI {
  // Search coins by query
  static async searchCoins(query: string): Promise<any[]> {
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
      return response.data.coins || [];
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search coins');
    }
  }

  // Get trending coins
  static async getTrendingCoins(): Promise<TrendingCoin[]> {
    try {
      const response = await api.get('/search/trending');
      return response.data.coins || [];
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw new Error('Failed to fetch trending coins');
    }
  }

  // Get coin market data
  static async getCoins(
    page: number = 1,
    perPage: number = 100,
    currency: string = 'usd'
  ): Promise<Coin[]> {
    try {
      const response = await api.get('/coins/markets', {
        params: {
          vs_currency: currency,
          order: 'market_cap_desc',
          per_page: perPage,
          page,
          sparkline: false,
          price_change_percentage: '24h,7d,30d',
        },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching coins:', error);
      throw new Error('Failed to fetch coin data');
    }
  }

  // Get specific coin details
  static async getCoinDetails(coinId: string): Promise<CoinDetails> {
    try {
      const response = await api.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
          sparkline: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      throw new Error('Failed to fetch coin details');
    }
  }

  // Get coin price history
  static async getCoinHistory(
    coinId: string,
    days: number = 7,
    currency: string = 'usd'
  ): Promise<ChartData[]> {
    try {
      const response = await api.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: currency,
          days,
          interval: days <= 1 ? 'hourly' : 'daily',
        },
      });

      const prices = response.data.prices || [];
      const volumes = response.data.total_volumes || [];

      return prices.map((price: [number, number], index: number) => {
        const date = new Date(price[0]);
        let timeLabel: string;
        
        if (days <= 1) {
          // For 24h, show time
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else if (days <= 7) {
          // For 7 days, show day and time
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } else {
          // For 30+ days, show date
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }

        return {
          timestamp: price[0],
          time: timeLabel,
          price: price[1],
          volume: volumes[index] ? volumes[index][1] : 0,
        };
      });
    } catch (error) {
      console.error('Error fetching coin history:', error);
      throw new Error('Failed to fetch price history');
    }
  }

  // Get multiple coin prices
  static async getCoinPrices(
    coinIds: string[],
    currency: string = 'usd'
  ): Promise<{ [key: string]: { [key: string]: number } }> {
    try {
      const response = await api.get('/simple/price', {
        params: {
          ids: coinIds.join(','),
          vs_currencies: currency,
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true,
        },
      });
      return response.data || {};
    } catch (error) {
      console.error('Error fetching coin prices:', error);
      throw new Error('Failed to fetch coin prices');
    }
  }

  // Get coin by contract address
  static async getCoinByContract(
    platform: string,
    contractAddress: string
  ): Promise<CoinDetails> {
    try {
      const response = await api.get(`/coins/${platform}/contract/${contractAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coin by contract:', error);
      throw new Error('Failed to fetch coin by contract address');
    }
  }

  // Get global market data
  static async getGlobalData(): Promise<any> {
    try {
      const response = await api.get('/global');
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching global data:', error);
      throw new Error('Failed to fetch global market data');
    }
  }

  // Get supported currencies
  static async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await api.get('/simple/supported_vs_currencies');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      return ['usd', 'eur', 'btc', 'eth'];
    }
  }

  // Rate limiting helper
  static async withRateLimit<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await apiCall();
      }
      throw error;
    }
  }
}

// Helper function to format market cap
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
}

// Helper function to format price
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
}

// Helper function to format percentage change
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default CoinGeckoAPI;
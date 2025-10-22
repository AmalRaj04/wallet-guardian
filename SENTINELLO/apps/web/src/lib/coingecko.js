// CoinGecko API integration for live price data

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export class CoinGeckoAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  async fetchWithCache(url, cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      // Return cached data if available, even if expired
      if (cached) return cached.data;
      throw error;
    }
  }

  async getTokenPrices(tokenAddresses) {
    if (!tokenAddresses || tokenAddresses.length === 0) return {};
    
    const addresses = tokenAddresses.join(',');
    const url = `${COINGECKO_API_BASE}/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true`;
    const cacheKey = `prices_${addresses}`;
    
    return this.fetchWithCache(url, cacheKey);
  }

  async getTokenInfo(tokenAddress) {
    const url = `${COINGECKO_API_BASE}/coins/ethereum/contract/${tokenAddress}`;
    const cacheKey = `info_${tokenAddress}`;
    
    return this.fetchWithCache(url, cacheKey);
  }

  async getMarketData(tokenAddress) {
    try {
      const tokenInfo = await this.getTokenInfo(tokenAddress);
      return {
        price: tokenInfo.market_data?.current_price?.usd || 0,
        change24h: tokenInfo.market_data?.price_change_percentage_24h || 0,
        volume24h: tokenInfo.market_data?.total_volume?.usd || 0,
        marketCap: tokenInfo.market_data?.market_cap?.usd || 0,
        logo: tokenInfo.image?.large || tokenInfo.image?.small || '',
        name: tokenInfo.name || '',
        symbol: tokenInfo.symbol?.toUpperCase() || ''
      };
    } catch (error) {
      console.error(`Error fetching market data for ${tokenAddress}:`, error);
      return null;
    }
  }

  // Get trending tokens for discovery
  async getTrendingTokens() {
    const url = `${COINGECKO_API_BASE}/search/trending`;
    const cacheKey = 'trending';
    
    try {
      const data = await this.fetchWithCache(url, cacheKey);
      return data.coins || [];
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  // Get historical price data for charts
  async getHistoricalPrices(tokenAddress, days = 7) {
    const url = `${COINGECKO_API_BASE}/coins/ethereum/contract/${tokenAddress}/market_chart?vs_currency=usd&days=${days}`;
    const cacheKey = `history_${tokenAddress}_${days}`;
    
    try {
      const data = await this.fetchWithCache(url, cacheKey);
      return data.prices || [];
    } catch (error) {
      console.error(`Error fetching historical prices for ${tokenAddress}:`, error);
      return [];
    }
  }
}

export const coinGeckoAPI = new CoinGeckoAPI();
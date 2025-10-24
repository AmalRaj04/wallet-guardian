// Unified Data Integration Layer
import { Token, Alert } from "@/types";
import { BlockscoutAPI } from "@/lib/blockscout";
import { AlchemyAPI } from "@/lib/alchemy";
import { RiskEngine } from "@/lib/risk-engine";
import EnvioHyperSync from "@/lib/envio";
import RedisCache from "./redis-cache";
import axios from "axios";

const COINGECKO_API_KEY =
  process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export class DataIntegrationService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;
    await RedisCache.connect();
    this.initialized = true;
    console.log("✅ Data Integration Service initialized");
  }

  // Get complete portfolio with caching
  static async getPortfolio(
    address: string,
    chainId?: number
  ): Promise<Token[]> {
    const cacheKey = `portfolio:${address}:${chainId || 1}`;

    // Check cache
    const cached = await RedisCache.get<Token[]>(cacheKey);
    if (cached) {
      console.log("📦 Portfolio loaded from cache");
      return cached;
    }

    console.log("🔄 Fetching fresh portfolio data...");

    try {
      // Try Alchemy first
      let tokens = await AlchemyAPI.getCompletePortfolio(address, chainId);

      // Fallback to Blockscout if Alchemy fails
      if (!tokens || tokens.length === 0) {
        tokens = await BlockscoutAPI.getTokenBalances(address);
      }

      // Enrich with prices
      tokens = await this.enrichWithPrices(tokens);

      // Cache for 5 minutes
      await RedisCache.set(cacheKey, tokens, 300);

      return tokens;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      return [];
    }
  }

  // Enrich tokens with price data
  static async enrichWithPrices(tokens: Token[]): Promise<Token[]> {
    if (!COINGECKO_API_KEY) {
      console.warn("CoinGecko API key not configured");
      return tokens;
    }

    try {
      const addresses = tokens.map((t) => t.address).join(",");
      const response = await axios.get(
        `${COINGECKO_BASE}/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: addresses,
            vs_currencies: "usd",
            include_24hr_change: true,
          },
          headers: {
            "x-cg-pro-api-key": COINGECKO_API_KEY,
          },
        }
      );

      return tokens.map((token) => {
        const priceData = response.data[token.address.toLowerCase()];
        if (priceData) {
          return {
            ...token,
            price: priceData.usd,
            change24h: priceData.usd_24h_change,
            value: (token.balanceFormatted || 0) * priceData.usd,
          };
        }
        return token;
      });
    } catch (error) {
      console.error("Error enriching with prices:", error);
      return tokens;
    }
  }

  // Get risk scores with caching
  static async getRiskScores(
    tokens: Token[],
    provider: any
  ): Promise<Map<string, any>> {
    const riskScores = new Map();

    for (const token of tokens) {
      const cacheKey = `risk:${token.address}`;

      // Check cache
      let riskScore = await RedisCache.get(cacheKey);

      if (!riskScore) {
        // Calculate fresh risk score
        riskScore = await RiskEngine.calculateTokenRisk(
          token,
          token.address,
          provider
        );
        // Cache for 10 minutes
        await RedisCache.set(cacheKey, riskScore, 600);
      }

      riskScores.set(token.address, riskScore);
    }

    return riskScores;
  }

  // Get transaction history with caching
  static async getTransactionHistory(
    address: string,
    page: number = 1
  ): Promise<any[]> {
    const cacheKey = `txhistory:${address}:${page}`;

    const cached = await RedisCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const txs = await BlockscoutAPI.getTransactionHistory(address, page, 50);
      await RedisCache.set(cacheKey, txs, 300);
      return txs;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }

  // Get gas prices with caching
  static async getGasPrices(): Promise<{
    slow: string;
    standard: string;
    fast: string;
  }> {
    const cacheKey = "gas:prices";

    const cached = await RedisCache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const prices = await BlockscoutAPI.getGasPrice();
      const gasPrices = {
        slow: prices.toString(),
        standard: (prices * 1.2).toString(),
        fast: (prices * 1.5).toString(),
      };

      await RedisCache.set(cacheKey, gasPrices, 30); // Cache for 30 seconds
      return gasPrices;
    } catch (error) {
      console.error("Error fetching gas prices:", error);
      return { slow: "20", standard: "25", fast: "30" };
    }
  }

  // Clear cache for address
  static async clearCache(address: string) {
    await RedisCache.del(`portfolio:${address}:1`);
    await RedisCache.del(`portfolio:${address}:11155111`);
    console.log(`🗑️ Cache cleared for ${address}`);
  }

  // Get cache stats
  static async getCacheStats(): Promise<{ hits: number; misses: number }> {
    // This would track cache performance
    return { hits: 0, misses: 0 };
  }
}

export default DataIntegrationService;

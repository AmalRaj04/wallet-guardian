// Token price lookup via CoinGecko API (free tier)

interface TokenPrice {
  usd: number;
  usd_24h_change?: number;
}

interface CoinGeckoResponse {
  [key: string]: TokenPrice;
}

// In-memory cache for prices (TTL: 5 minutes)
const priceCache = new Map<string, { price: TokenPrice; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Common token contract -> CoinGecko ID mapping (mainnet)
const TOKEN_ID_MAP: Record<string, string> = {
  // Stablecoins
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "usd-coin", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "tether", // USDT
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "dai", // DAI

  // DeFi tokens
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "uniswap", // UNI
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": "aave-token", // AAVE
  "0x514910771AF9Ca656af840dff83E8264EcF986CA": "chainlink", // LINK
  "0xc00e94Cb662C3520282E6f5717214004A7f26888": "compound-coin", // COMP
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": "maker", // MKR
  "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2": "sushi", // SUSHI

  // Wrapped tokens
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "weth", // WETH
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "wrapped-bitcoin", // WBTC

  // Layer 2 & scaling
  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": "matic-network", // MATIC
  "0x4200000000000000000000000000000000000042": "optimism", // OP
};

// Sepolia testnet tokens (map to mainnet equivalents for price estimation)
const SEPOLIA_TOKEN_MAP: Record<string, string> = {
  "0x779877A7B0D9E8603169DdbD7836e478b4624789": "chainlink", // LINK on Sepolia
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "usd-coin", // USDC on Sepolia
};

/**
 * Get CoinGecko ID for a token contract address
 */
function getCoinGeckoId(
  contractAddress: string,
  chainId: number
): string | null {
  if (chainId === 11155111) {
    // Sepolia testnet - use mapping to mainnet equivalent
    return SEPOLIA_TOKEN_MAP[contractAddress] || null;
  }

  return TOKEN_ID_MAP[contractAddress] || null;
}

/**
 * Fetch token price from CoinGecko with caching
 */
export async function getTokenPrice(
  contractAddress?: string,
  chainId: number = 1
): Promise<TokenPrice | null> {
  // If no contract address provided, bail out early
  if (!contractAddress) return null;

  const normalized = contractAddress.toLowerCase();
  const cacheKey = `${chainId}-${normalized}`;

  // Check cache
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  const coinGeckoId = getCoinGeckoId(contractAddress, chainId);
  if (!coinGeckoId) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      console.warn(`CoinGecko API error: ${response.status}`);
      return null;
    }

    const data: CoinGeckoResponse = await response.json();
    const price = data[coinGeckoId];

    if (price) {
      // Cache the result
      priceCache.set(cacheKey, { price, timestamp: Date.now() });
      return price;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch token price:", error);
    return null;
  }
}

/**
 * Batch fetch multiple token prices
 */
export async function getTokenPrices(
  tokens: Array<{ address: string; chainId: number }>
): Promise<Map<string, TokenPrice>> {
  const results = new Map<string, TokenPrice>();

  // Get unique CoinGecko IDs
  const coinGeckoIds = new Set<string>();
  const addressToId = new Map<string, string>();

  for (const token of tokens) {
    const id = getCoinGeckoId(token.address, token.chainId);
    if (id) {
      coinGeckoIds.add(id);
      addressToId.set(token.address.toLowerCase(), id);
    }
  }

  if (coinGeckoIds.size === 0) {
    return results;
  }

  try {
    const idsParam = Array.from(coinGeckoIds).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      console.warn(`CoinGecko batch API error: ${response.status}`);
      return results;
    }

    const data: CoinGeckoResponse = await response.json();

    // Map results back to addresses
    for (const token of tokens) {
      const id = addressToId.get(token.address.toLowerCase());
      if (id && data[id]) {
        results.set(token.address.toLowerCase(), data[id]);

        // Cache individual results
        const cacheKey = `${token.chainId}-${token.address.toLowerCase()}`;
        priceCache.set(cacheKey, { price: data[id], timestamp: Date.now() });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to batch fetch token prices:", error);
    return results;
  }
}

/**
 * Get ETH price (for convenience)
 */
export async function getEthPrice(): Promise<number> {
  const cacheKey = "eth-price";
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price.usd;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    const data = await response.json();
    const price = data.ethereum?.usd || 2500;

    priceCache.set(cacheKey, {
      price: { usd: price },
      timestamp: Date.now(),
    });

    return price;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 2500; // Fallback
  }
}

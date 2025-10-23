import Redis from "ioredis";

let redis: Redis | null = null;

/**
 * Get or create Redis client
 * Falls back to in-memory cache if Redis is not available
 */
export function getRedisClient(): Redis | null {
  // Skip Redis in development if not configured
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.REDIS_URL &&
    !process.env.REDIS_HOST
  ) {
    return null;
  }

  if (redis) {
    return redis;
  }

  try {
    if (process.env.REDIS_URL) {
      // Production: Use connection string
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    } else if (process.env.REDIS_HOST) {
      // Custom Redis configuration
      redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || "0", 10),
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }

    if (redis) {
      redis.on("error", (error) => {
        console.error("Redis connection error:", error);
      });

      redis.on("connect", () => {
        console.log("Redis connected successfully");
      });
    }

    return redis;
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    return null;
  }
}

/**
 * In-memory cache fallback when Redis is not available
 */
class InMemoryCache {
  private cache: Map<string, { value: string; expiry: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Cleanup expired entries periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Every minute
  }
}

const inMemoryCache = new InMemoryCache();
inMemoryCache.startCleanup();

/**
 * Unified cache interface that uses Redis if available, otherwise in-memory
 */
export const cache = {
  async get(key: string): Promise<string | null> {
    const redis = getRedisClient();
    if (redis) {
      return redis.get(key);
    }
    return inMemoryCache.get(key);
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await inMemoryCache.set(key, value, ttlSeconds);
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(key);
    } else {
      await inMemoryCache.del(key);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  },
};

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  WALLET_TOKENS: 60, // 1 minute
  WALLET_NFTS: 300, // 5 minutes
  WALLET_TRANSACTIONS: 30, // 30 seconds
  TOKEN_PRICES: 300, // 5 minutes
  ALLOWANCES: 60, // 1 minute
  TOKEN_METADATA: 3600, // 1 hour
  SPENDER_INFO: 86400, // 24 hours
};

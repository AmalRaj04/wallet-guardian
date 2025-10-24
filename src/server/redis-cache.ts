// Redis Caching Layer for Data Integration
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const DEFAULT_TTL = 300; // 5 minutes

export class RedisCache {
  private client: Redis | null = null;
  private isConnected = false;

  async connect() {
    try {
      this.client = new Redis(REDIS_URL, {
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn("Redis connection failed, using in-memory cache");
            return null;
          }
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Redis connected");
      });

      this.client.on("error", (err) => {
        console.warn(
          "Redis error, falling back to in-memory cache:",
          err.message
        );
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      console.warn("Redis unavailable, using in-memory cache");
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return this.memoryGet(key);
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return this.memoryGet(key);
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = DEFAULT_TTL
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      this.memorySet(key, value, ttl);
      return true;
    }

    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      this.memorySet(key, value, ttl);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      this.memoryDelete(key);
      return true;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Redis del error:", error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return this.memoryHas(key);
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis exists error:", error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      this.memoryClear();
      return true;
    }

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error("Redis flush error:", error);
      return false;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.isConnected = false;
    }
  }

  // In-memory fallback cache
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  private memoryGet(key: string): any | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  private memorySet(key: string, value: any, ttl: number) {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  private memoryDelete(key: string) {
    this.memoryCache.delete(key);
  }

  private memoryHas(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return false;
    }
    return true;
  }

  private memoryClear() {
    this.memoryCache.clear();
  }
}

export default new RedisCache();

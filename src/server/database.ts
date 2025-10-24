// PostgreSQL Database Layer for Cache, Logs, and Alerts
import { Pool, PoolClient } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

export interface Alert {
  id: string;
  user_address: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  recommendation: string;
  token_address?: string;
  transaction_hash?: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CacheEntry {
  key: string;
  value: any;
  expires_at: Date;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  user_address: string;
  action: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class Database {
  private static pool: Pool | null = null;
  private static isConnected = false;

  // Initialize database connection
  static async connect(): Promise<boolean> {
    if (this.isConnected && this.pool) {
      return true;
    }

    if (!DATABASE_URL) {
      console.warn("⚠️ DATABASE_URL not configured, using in-memory storage");
      return false;
    }

    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      this.isConnected = true;
      console.log("✅ PostgreSQL connected");

      // Initialize tables
      await this.initializeTables();

      return true;
    } catch (error) {
      console.error("❌ PostgreSQL connection failed:", error);
      console.warn("⚠️ Falling back to in-memory storage");
      this.isConnected = false;
      return false;
    }
  }

  // Initialize database tables
  private static async initializeTables(): Promise<void> {
    if (!this.pool) return;

    const client = await this.pool.connect();

    try {
      // Alerts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS alerts (
          id VARCHAR(255) PRIMARY KEY,
          user_address VARCHAR(42) NOT NULL,
          type VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          recommendation TEXT,
          token_address VARCHAR(42),
          transaction_hash VARCHAR(66),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_alerts_user_address ON alerts(user_address);
        CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
      `);

      // Cache table
      await client.query(`
        CREATE TABLE IF NOT EXISTS cache (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
      `);

      // Activity logs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id VARCHAR(255) PRIMARY KEY,
          user_address VARCHAR(42) NOT NULL,
          action VARCHAR(100) NOT NULL,
          details JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_logs_user_address ON activity_logs(user_address);
        CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at DESC);
      `);

      // Risk scores table
      await client.query(`
        CREATE TABLE IF NOT EXISTS risk_scores (
          token_address VARCHAR(42) PRIMARY KEY,
          overall_score INTEGER NOT NULL,
          category VARCHAR(20) NOT NULL,
          warnings JSONB,
          recommendations JSONB,
          last_updated TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_risk_scores_category ON risk_scores(category);
        CREATE INDEX IF NOT EXISTS idx_risk_scores_updated ON risk_scores(last_updated DESC);
      `);

      // Portfolio snapshots table
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_snapshots (
          id VARCHAR(255) PRIMARY KEY,
          user_address VARCHAR(42) NOT NULL,
          total_value DECIMAL(20, 2),
          overall_risk INTEGER,
          token_count INTEGER,
          snapshot_data JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_snapshots_user_address ON portfolio_snapshots(user_address);
        CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON portfolio_snapshots(created_at DESC);
      `);

      console.log("✅ Database tables initialized");
    } catch (error) {
      console.error("Error initializing tables:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // === ALERTS ===

  static async saveAlert(
    alert: Omit<Alert, "created_at" | "updated_at">
  ): Promise<boolean> {
    if (!this.pool) return false;

    try {
      await this.pool.query(
        `INSERT INTO alerts (id, user_address, type, severity, title, message, recommendation, token_address, transaction_hash, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           is_read = EXCLUDED.is_read,
           updated_at = NOW()`,
        [
          alert.id,
          alert.user_address,
          alert.type,
          alert.severity,
          alert.title,
          alert.message,
          alert.recommendation,
          alert.token_address,
          alert.transaction_hash,
          alert.is_read,
        ]
      );

      return true;
    } catch (error) {
      console.error("Error saving alert:", error);
      return false;
    }
  }

  static async getAlerts(
    userAddress: string,
    limit: number = 50
  ): Promise<Alert[]> {
    if (!this.pool) return [];

    try {
      const result = await this.pool.query(
        `SELECT * FROM alerts WHERE user_address = $1 ORDER BY created_at DESC LIMIT $2`,
        [userAddress, limit]
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    if (!this.pool) return false;

    try {
      await this.pool.query(
        `UPDATE alerts SET is_read = TRUE, updated_at = NOW() WHERE id = $1`,
        [alertId]
      );

      return true;
    } catch (error) {
      console.error("Error marking alert as read:", error);
      return false;
    }
  }

  static async deleteAlert(alertId: string): Promise<boolean> {
    if (!this.pool) return false;

    try {
      await this.pool.query(`DELETE FROM alerts WHERE id = $1`, [alertId]);
      return true;
    } catch (error) {
      console.error("Error deleting alert:", error);
      return false;
    }
  }

  // === CACHE ===

  static async getCached<T>(key: string): Promise<T | null> {
    if (!this.pool) return null;

    try {
      const result = await this.pool.query(
        `SELECT value FROM cache WHERE key = $1 AND expires_at > NOW()`,
        [key]
      );

      if (result.rows.length > 0) {
        return result.rows[0].value as T;
      }

      return null;
    } catch (error) {
      console.error("Error getting cached value:", error);
      return null;
    }
  }

  static async setCached<T>(
    key: string,
    value: T,
    ttlSeconds: number = 300
  ): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await this.pool.query(
        `INSERT INTO cache (key, value, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           expires_at = EXCLUDED.expires_at,
           created_at = NOW()`,
        [key, JSON.stringify(value), expiresAt]
      );

      return true;
    } catch (error) {
      console.error("Error setting cached value:", error);
      return false;
    }
  }

  static async deleteCached(key: string): Promise<boolean> {
    if (!this.pool) return false;

    try {
      await this.pool.query(`DELETE FROM cache WHERE key = $1`, [key]);
      return true;
    } catch (error) {
      console.error("Error deleting cached value:", error);
      return false;
    }
  }

  static async clearExpiredCache(): Promise<number> {
    if (!this.pool) return 0;

    try {
      const result = await this.pool.query(
        `DELETE FROM cache WHERE expires_at < NOW()`
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error("Error clearing expired cache:", error);
      return 0;
    }
  }

  // === ACTIVITY LOGS ===

  static async logActivity(
    log: Omit<ActivityLog, "id" | "created_at">
  ): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await this.pool.query(
        `INSERT INTO activity_logs (id, user_address, action, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          log.user_address,
          log.action,
          JSON.stringify(log.details),
          log.ip_address,
          log.user_agent,
        ]
      );

      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      return false;
    }
  }

  static async getActivityLogs(
    userAddress: string,
    limit: number = 100
  ): Promise<ActivityLog[]> {
    if (!this.pool) return [];

    try {
      const result = await this.pool.query(
        `SELECT * FROM activity_logs WHERE user_address = $1 ORDER BY created_at DESC LIMIT $2`,
        [userAddress, limit]
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }
  }

  // === RISK SCORES ===

  static async saveRiskScore(
    tokenAddress: string,
    riskData: any
  ): Promise<boolean> {
    if (!this.pool) return false;

    try {
      await this.pool.query(
        `INSERT INTO risk_scores (token_address, overall_score, category, warnings, recommendations)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (token_address) DO UPDATE SET
           overall_score = EXCLUDED.overall_score,
           category = EXCLUDED.category,
           warnings = EXCLUDED.warnings,
           recommendations = EXCLUDED.recommendations,
           last_updated = NOW()`,
        [
          tokenAddress,
          riskData.overall,
          riskData.category,
          JSON.stringify(riskData.warnings),
          JSON.stringify(riskData.recommendations),
        ]
      );

      return true;
    } catch (error) {
      console.error("Error saving risk score:", error);
      return false;
    }
  }

  static async getRiskScore(tokenAddress: string): Promise<any | null> {
    if (!this.pool) return null;

    try {
      const result = await this.pool.query(
        `SELECT * FROM risk_scores WHERE token_address = $1`,
        [tokenAddress]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return null;
    } catch (error) {
      console.error("Error fetching risk score:", error);
      return null;
    }
  }

  // === PORTFOLIO SNAPSHOTS ===

  static async savePortfolioSnapshot(
    userAddress: string,
    totalValue: number,
    overallRisk: number,
    tokenCount: number,
    snapshotData: any
  ): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const id = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await this.pool.query(
        `INSERT INTO portfolio_snapshots (id, user_address, total_value, overall_risk, token_count, snapshot_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          userAddress,
          totalValue,
          overallRisk,
          tokenCount,
          JSON.stringify(snapshotData),
        ]
      );

      return true;
    } catch (error) {
      console.error("Error saving portfolio snapshot:", error);
      return false;
    }
  }

  static async getPortfolioSnapshots(
    userAddress: string,
    limit: number = 30
  ): Promise<any[]> {
    if (!this.pool) return [];

    try {
      const result = await this.pool.query(
        `SELECT * FROM portfolio_snapshots WHERE user_address = $1 ORDER BY created_at DESC LIMIT $2`,
        [userAddress, limit]
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching portfolio snapshots:", error);
      return [];
    }
  }

  // === UTILITIES ===

  static async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const result = await this.pool.query("SELECT NOW()");
      return !!result.rows[0];
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  static async getStats(): Promise<{
    alerts: number;
    cacheEntries: number;
    activityLogs: number;
    riskScores: number;
  }> {
    if (!this.pool) {
      return { alerts: 0, cacheEntries: 0, activityLogs: 0, riskScores: 0 };
    }

    try {
      const [alerts, cache, logs, risks] = await Promise.all([
        this.pool.query("SELECT COUNT(*) FROM alerts"),
        this.pool.query("SELECT COUNT(*) FROM cache WHERE expires_at > NOW()"),
        this.pool.query("SELECT COUNT(*) FROM activity_logs"),
        this.pool.query("SELECT COUNT(*) FROM risk_scores"),
      ]);

      return {
        alerts: parseInt(alerts.rows[0].count),
        cacheEntries: parseInt(cache.rows[0].count),
        activityLogs: parseInt(logs.rows[0].count),
        riskScores: parseInt(risks.rows[0].count),
      };
    } catch (error) {
      console.error("Error fetching database stats:", error);
      return { alerts: 0, cacheEntries: 0, activityLogs: 0, riskScores: 0 };
    }
  }

  static async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log("PostgreSQL disconnected");
    }
  }

  static isConnectedToDB(): boolean {
    return this.isConnected;
  }
}

export default Database;

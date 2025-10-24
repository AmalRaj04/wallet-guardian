// Backend API Server for Wallet Guardian
import express from "express";
import cors from "cors";
import { DataIntegrationService } from "./api-integration";
import WebSocketServer from "./websocket";
import RedisCache from "./redis-cache";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Initialize services
async function initializeServices() {
  await DataIntegrationService.initialize();

  // Initialize PostgreSQL database
  try {
    const { Database } = await import("./database");
    await Database.connect();
  } catch (error) {
    console.warn("Database initialization skipped:", error);
  }

  WebSocketServer.start(8080);
  console.log("✅ All services initialized");
}

// Health check
app.get("/health", async (req, res) => {
  let dbStatus = "not configured";
  try {
    const { Database } = await import("./database");
    dbStatus = (await Database.healthCheck()) ? "connected" : "disconnected";
  } catch (error) {
    dbStatus = "not configured";
  }

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      redis: RedisCache ? "connected" : "disconnected",
      websocket: "running",
      database: dbStatus,
    },
  });
});

// Portfolio endpoint
app.get("/api/portfolio/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { chainId } = req.query;

    const portfolio = await DataIntegrationService.getPortfolio(
      address,
      chainId ? parseInt(chainId as string) : undefined
    );

    res.json({ success: true, data: portfolio });
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Risk scores endpoint
app.post("/api/risk-scores", async (req, res) => {
  try {
    const { tokens, provider } = req.body;

    const riskScores = await DataIntegrationService.getRiskScores(
      tokens,
      provider
    );

    // Convert Map to object for JSON response
    const scoresObj = Object.fromEntries(riskScores);

    res.json({ success: true, data: scoresObj });
  } catch (error: any) {
    console.error("Error calculating risk scores:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transaction history endpoint
app.get("/api/transactions/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { page } = req.query;

    const transactions = await DataIntegrationService.getTransactionHistory(
      address,
      page ? parseInt(page as string) : 1
    );

    res.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gas prices endpoint
app.get("/api/gas-prices", async (req, res) => {
  try {
    const gasPrices = await DataIntegrationService.getGasPrices();
    res.json({ success: true, data: gasPrices });
  } catch (error: any) {
    console.error("Error fetching gas prices:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear cache endpoint
app.post("/api/cache/clear/:address", async (req, res) => {
  try {
    const { address } = req.params;
    await DataIntegrationService.clearCache(address);
    res.json({ success: true, message: "Cache cleared" });
  } catch (error: any) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cache stats endpoint
app.get("/api/cache/stats", async (req, res) => {
  try {
    const stats = await DataIntegrationService.getCacheStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching cache stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alert broadcast endpoint (for testing)
app.post("/api/alerts/broadcast", (req, res) => {
  try {
    const { type, severity, data } = req.body;

    WebSocketServer.broadcast({
      type,
      severity,
      data,
      timestamp: new Date(),
    });

    res.json({ success: true, message: "Alert broadcasted" });
  } catch (error: any) {
    console.error("Error broadcasting alert:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
);

// Start server
async function startServer() {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      console.log(`🚀 Backend API server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket server running on ws://localhost:8080`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  WebSocketServer.stop();
  RedisCache.disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  WebSocketServer.stop();
  RedisCache.disconnect();
  process.exit(0);
});

// Export for testing
export { app, startServer };

// Start if run directly
if (require.main === module) {
  startServer();
}

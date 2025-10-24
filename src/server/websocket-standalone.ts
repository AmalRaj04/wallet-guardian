// Standalone WebSocket Server
import WebSocketServer from "./websocket";

console.log("🚀 Starting WebSocket server...");
WebSocketServer.start(8080);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  WebSocketServer.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  WebSocketServer.stop();
  process.exit(0);
});

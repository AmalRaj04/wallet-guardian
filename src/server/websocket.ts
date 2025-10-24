// WebSocket Server for Real-Time Alerts & Notifications
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

export interface AlertMessage {
  type: "alert" | "transaction" | "risk_update" | "price_update";
  severity?: "low" | "medium" | "high" | "critical";
  data: any;
  timestamp: Date;
}

export class WalletGuardianWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private server: any = null;

  start(port: number = 8080) {
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on("connection", (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(
        `✅ Client connected: ${clientId} (Total: ${this.clients.size})`
      );

      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(clientId, data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        this.clients.delete(clientId);
        console.log(
          `❌ Client disconnected: ${clientId} (Total: ${this.clients.size})`
        );
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: "connection",
        data: { clientId, message: "Connected to Wallet Guardian" },
        timestamp: new Date(),
      });
    });

    this.server.listen(port, () => {
      console.log(`🚀 WebSocket server running on ws://localhost:${port}`);
    });
  }

  private handleClientMessage(clientId: string, data: any) {
    if (data.type === "subscribe") {
      console.log(`Client ${clientId} subscribed to ${data.address}`);
    } else if (data.type === "unsubscribe") {
      console.log(`Client ${clientId} unsubscribed from ${data.address}`);
    }
  }

  broadcast(message: AlertMessage) {
    const payload = JSON.stringify(message);
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  sendToClient(clientId: string, message: any) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop() {
    this.clients.forEach((ws) => ws.close());
    this.clients.clear();
    if (this.server) {
      this.server.close();
    }
    console.log("WebSocket server stopped");
  }
}

export default new WalletGuardianWebSocketServer();

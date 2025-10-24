// WebSocket Hook for Real-Time Updates
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";

export interface WebSocketMessage {
  type: "alert" | "transaction" | "risk_update" | "price_update" | "connection";
  severity?: "low" | "medium" | "high" | "critical";
  data: any;
  timestamp: Date;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  messages: WebSocketMessage[];
  sendMessage: (message: any) => void;
  clearMessages: () => void;
  reconnect: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(): UseWebSocketReturn {
  const { address, isConnected: walletConnected } = useAccount();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const connect = useCallback(() => {
    if (!walletConnected || !address) {
      console.log("Wallet not connected, skipping WebSocket connection");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      console.log("🔌 Connecting to WebSocket:", WS_URL);
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to address updates
        ws.send(
          JSON.stringify({
            type: "subscribe",
            address,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages((prev) =>
            [
              {
                ...message,
                timestamp: new Date(message.timestamp),
              },
              ...prev,
            ].slice(0, 100)
          ); // Keep last 100 messages
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(
            `Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          );
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        } else {
          console.warn("Max reconnection attempts reached");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
    }
  }, [walletConnected, address]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Connect when wallet is connected
  useEffect(() => {
    if (walletConnected && address) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [walletConnected, address, connect, disconnect]);

  return {
    isConnected,
    messages,
    sendMessage,
    clearMessages,
    reconnect,
  };
}

export default useWebSocket;

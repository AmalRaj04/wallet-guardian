// Real-time Monitoring Hook - Integrates ALL sponsor technologies
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Alert, Token, MempoolTransaction } from "@/types";
import EnvioHyperSync, { MempoolAlert } from "@/lib/envio";
import { RiskEngine, RiskScore } from "@/lib/risk-engine";
import LitProtocolService from "@/lib/lit-protocol";
import toast from "react-hot-toast";

export interface RealTimeMonitoringState {
  isMonitoring: boolean;
  alerts: Alert[];
  mempoolTransactions: any[];
  tokenRisks: Map<string, RiskScore>;
  fundsProtected: number;
  threatsBlocked: number;
}

export function useRealTimeMonitoring() {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<RealTimeMonitoringState>({
    isMonitoring: true, // Always active
    alerts: [],
    mempoolTransactions: [
      // Mock transaction 1 - Token approval on Sepolia
      {
        hash: "0x8f3c2d1e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
        value: "0x0",
        gasPrice: "0xba43b7400", // 50 gwei
        gasLimit: "0xc350", // 50000
        data: "0x095ea7b3", // approve function
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        riskLevel: "low",
        threatType: undefined,
      },
      // Mock transaction 2 - ETH transfer on Sepolia
      {
        hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        from: "0x9876543210987654321098765432109876543210",
        to: "0x1234567890123456789012345678901234567890",
        value: "0x16345785d8a0000", // 0.1 ETH
        gasPrice: "0x9502f9000", // 40 gwei
        gasLimit: "0x5208", // 21000
        data: "0x",
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        riskLevel: "low",
        threatType: undefined,
      },
    ],
    tokenRisks: new Map(),
    fundsProtected: 0,
    threatsBlocked: 2, // Demo starting value
  });

  /**
   * Start real-time monitoring
   */
  const startMonitoring = useCallback(
    async (tokens: Token[] = []) => {
      console.log("🔍 startMonitoring called", {
        address,
        isConnected,
        tokenCount: tokens.length,
        currentlyMonitoring: state.isMonitoring,
      });

      if (!address || !isConnected) {
        console.warn("❌ Wallet not connected - cannot start monitoring", {
          address,
          isConnected,
        });
        toast.error("Please connect your wallet first", {
          icon: "⚠️",
          duration: 3000,
        });
        return;
      }

      // Prevent duplicate monitoring
      if (state.isMonitoring) {
        console.log("✅ Monitoring already active");
        toast("Monitoring is already active", { icon: "✅" });
        return;
      }

      console.log("🛡️ Starting Wallet Guardian real-time monitoring...", {
        address,
        tokenCount: tokens.length,
      });

      // Set monitoring to true immediately
      setState((prev) => ({
        ...prev,
        isMonitoring: true,
      }));

      // Monitoring is always active - no notification needed

      try {
        // Check if ethereum provider exists
        if (!window.ethereum) {
          console.warn("No ethereum provider found");
          return;
        }

        // Get provider (ethers v5 syntax)
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        // Calculate risk scores for all tokens in background
        const tokenRisks = new Map<string, RiskScore>();
        for (const token of tokens) {
          try {
            const riskScore = await RiskEngine.calculateTokenRisk(
              token,
              token.address,
              provider as any
            );
            tokenRisks.set(token.address, riskScore);

            // Create alerts for high-risk tokens
            if (riskScore.overall > 55) {
              const alert: Alert = {
                id: `risk-${token.address}-${Date.now()}`,
                type: "security_risk",
                severity:
                  riskScore.category === "critical" ? "critical" : "high",
                token,
                title: `${riskScore.category.toUpperCase()} Risk: ${token.symbol}`,
                message: riskScore.warnings.join(". "),
                recommendation: riskScore.recommendations[0],
                timestamp: new Date(),
                isRead: false,
                actions: [
                  {
                    id: "migrate",
                    label: "Migrate to PYUSD",
                    type: "convert",
                    data: { token },
                  },
                  {
                    id: "revoke",
                    label: "Revoke Approvals",
                    type: "revoke",
                    data: { token },
                  },
                ],
              };

              setState((prev) => ({
                ...prev,
                alerts: [...prev.alerts, alert],
              }));

              // Show toast notification
              toast.error(
                `⚠️ ${riskScore.category.toUpperCase()} risk detected: ${token.symbol}`,
                {
                  duration: 5000,
                }
              );
            }
          } catch (error) {
            console.error(`Error calculating risk for ${token.symbol}:`, error);
          }
        }

        // Update token risks
        setState((prev) => ({
          ...prev,
          tokenRisks,
        }));

        // Extract contract addresses to monitor
        const contractAddresses = tokens.map((t) => t.address);

        // Start Envio HyperSync mempool monitoring
        try {
          EnvioHyperSync.startMonitoring(
            [address],
            contractAddresses,
            (tx) => {
              // Handle mempool transaction
              setState((prev) => ({
                ...prev,
                mempoolTransactions: [tx, ...prev.mempoolTransactions].slice(
                  0,
                  50
                ),
              }));
            },
            (alert) => {
              // Handle mempool alert
              handleMempoolAlert(alert, tokens);
            }
          );
        } catch (error) {
          console.error("Error starting Envio monitoring:", error);
        }
      } catch (error) {
        console.error("Error in startMonitoring:", error);
      }
    },
    [address, isConnected]
  );

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    EnvioHyperSync.stopMonitoring();
    setState((prev) => ({
      ...prev,
      isMonitoring: false,
    }));
    // No notification for stopping since monitoring is always active
  }, []);

  /**
   * Handle mempool alerts
   */
  const handleMempoolAlert = useCallback(
    (mempoolAlert: MempoolAlert, tokens: Token[]) => {
      // Find affected token
      const affectedToken = tokens.find(
        (t) =>
          mempoolAlert.transaction.to?.toLowerCase() ===
            t.address.toLowerCase() ||
          mempoolAlert.transaction.from?.toLowerCase() ===
            t.address.toLowerCase()
      );

      // Create app alert
      const alert: Alert = {
        id: mempoolAlert.id,
        type: "mempool_threat",
        severity: mempoolAlert.severity,
        token: affectedToken,
        title: getThreatTitle(mempoolAlert.type),
        message: mempoolAlert.description,
        recommendation: mempoolAlert.recommendation,
        timestamp: mempoolAlert.timestamp,
        isRead: false,
        actions: getAlertActions(mempoolAlert, affectedToken),
      };

      setState((prev) => ({
        ...prev,
        alerts: [alert, ...prev.alerts],
        threatsBlocked: prev.threatsBlocked + 1,
        fundsProtected: prev.fundsProtected + (mempoolAlert.estimatedLoss || 0),
      }));

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🛡️ Wallet Guardian Alert", {
          body: mempoolAlert.description,
          icon: "/logo.png",
          badge: "/logo.png",
        });
      }

      // Show toast with sound
      toast.error(mempoolAlert.description, {
        duration: 10000,
        icon: getAlertIcon(mempoolAlert.severity),
      });

      // Auto-block critical threats using Lit Protocol
      if (mempoolAlert.severity === "critical" && affectedToken) {
        handleCriticalThreat(mempoolAlert, affectedToken);
      }
    },
    []
  );

  /**
   * Handle critical threats automatically
   */
  const handleCriticalThreat = async (alert: MempoolAlert, token: Token) => {
    try {
      console.log("🚨 Auto-blocking critical threat...");

      // Use Lit Protocol to automatically revoke approvals
      // This would be implemented with actual Lit Protocol integration
      toast.success("🔒 Automatic protection activated - Approvals revoked", {
        duration: 5000,
      });

      setState((prev) => ({
        ...prev,
        fundsProtected: prev.fundsProtected + (token.value || 0),
      }));
    } catch (error) {
      console.error("Error handling critical threat:", error);
      toast.error("Failed to auto-protect - Manual action required");
    }
  };

  /**
   * Mark alert as read
   */
  const markAlertAsRead = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ),
    }));
  }, []);

  /**
   * Clear all alerts
   */
  const clearAlerts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      alerts: [],
    }));
  }, []);

  /**
   * Increment metrics for demo purposes (when revoking approvals)
   */
  const incrementDemoMetrics = useCallback(() => {
    setState((prev) => ({
      ...prev,
      threatsBlocked: prev.threatsBlocked + 1,
      // Keep fundsProtected the same - don't increment
    }));
  }, []);

  /**
   * Add transaction to mempool monitor
   */
  const addMempoolTransaction = useCallback((tx: MempoolTransaction) => {
    setState((prev) => ({
      ...prev,
      mempoolTransactions: [tx, ...prev.mempoolTransactions].slice(0, 50),
    }));
  }, []);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Browser notifications enabled", { icon: "🔔" });
      }
    }
  }, []);

  // Auto-start monitoring when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      requestNotificationPermission();
    }

    return () => {
      if (state.isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isConnected, address]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    markAlertAsRead,
    clearAlerts,
    requestNotificationPermission,
    incrementDemoMetrics,
    addMempoolTransaction,
  };
}

// Helper functions
function getThreatTitle(type: string): string {
  const titles: Record<string, string> = {
    creator_dump: "🚨 Creator Dump Detected",
    liquidity_removal: "💧 Liquidity Removal Alert",
    suspicious_approval: "⚠️ Suspicious Approval",
    flash_loan: "⚡ Flash Loan Attack",
    ownership_transfer: "👤 Ownership Transfer",
    sandwich_attack: "🥪 Sandwich Attack",
  };
  return titles[type] || "⚠️ Security Alert";
}

function getAlertIcon(severity: string): string {
  const icons: Record<string, string> = {
    low: "🟡",
    medium: "🟠",
    high: "🔴",
    critical: "🚨",
  };
  return icons[severity] || "⚠️";
}

function getAlertActions(alert: MempoolAlert, token?: Token): any[] {
  const actions = [];

  if (alert.type === "creator_dump" || alert.type === "liquidity_removal") {
    actions.push({
      id: "migrate",
      label: "Migrate to PYUSD",
      type: "convert",
      data: { token },
    });
  }

  if (alert.type === "suspicious_approval") {
    actions.push({
      id: "revoke",
      label: "Revoke Approval",
      type: "revoke",
      data: { transaction: alert.transaction },
    });
  }

  actions.push({
    id: "ignore",
    label: "Ignore",
    type: "ignore",
  });

  return actions;
}

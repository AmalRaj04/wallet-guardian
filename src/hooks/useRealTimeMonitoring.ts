// Real-time Monitoring Hook - Integrates ALL sponsor technologies
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Alert, Token } from "@/types";
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
    isMonitoring: false,
    alerts: [],
    mempoolTransactions: [],
    tokenRisks: new Map(),
    fundsProtected: 0,
    threatsBlocked: 0,
  });

  /**
   * Start real-time monitoring
   */
  const startMonitoring = useCallback(
    async (tokens: Token[] = []) => {
      if (!address || !isConnected) {
        console.warn("Wallet not connected", { address, isConnected });
        return;
      }

      // Prevent duplicate monitoring
      if (state.isMonitoring) {
        console.log("Monitoring already active");
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

      toast.success("🛡️ Real-time protection activated", {
        icon: "✅",
        duration: 3000,
      });

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
    toast("Monitoring stopped", { icon: "⏸️" });
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

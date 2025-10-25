"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";
import { Alert } from "@/types";

export default function AlertsPanel() {
  const {
    alerts,
    markAlertAsRead,
    clearAlerts,
    threatsBlocked,
    fundsProtected,
  } = useRealTimeMonitoring();

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "medium":
        return <Info className="w-5 h-5 text-yellow-400" />;
      case "low":
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500/50 bg-red-500/10";
      case "high":
        return "border-orange-500/50 bg-orange-500/10";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "border-blue-500/50 bg-blue-500/10";
      default:
        return "border-gray-500/50 bg-gray-500/10";
    }
  };

  const handleAlertAction = (alert: Alert, actionId: string) => {
    // USER-INITIATED: Handle alert actions (migrate, revoke, ignore)
    console.log("User-initiated alert action:", actionId, alert);

    switch (actionId) {
      case "convert":
      case "migrate":
        toast.loading("Preparing migration transaction...", { id: "action" });
        // Show user the transaction details and redirect to wallet
        setTimeout(() => {
          toast.success(
            "Transaction prepared! Please confirm in your wallet to migrate to PYUSD",
            { id: "action", duration: 5000 }
          );
        }, 1000);
        break;

      case "revoke":
        toast.loading("Preparing revoke transaction...", { id: "action" });
        setTimeout(() => {
          toast.success(
            "Transaction prepared! Please confirm in your wallet to revoke approval",
            { id: "action", duration: 5000 }
          );
        }, 1000);
        break;

      case "sell":
        toast.loading("Preparing sell transaction...", { id: "action" });
        setTimeout(() => {
          toast.success(
            "Transaction prepared! Please confirm in your wallet to sell token",
            { id: "action", duration: 5000 }
          );
        }, 1000);
        break;

      case "ignore":
        toast("Alert dismissed", { icon: "👍" });
        break;

      default:
        console.log("Unknown action:", actionId);
    }

    markAlertAsRead(alert.id);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InteractiveGlassCard
          className="p-4"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold">{unreadAlerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-neon-blue" />
          </div>
        </InteractiveGlassCard>

        <InteractiveGlassCard
          className="p-4"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Threats Blocked</p>
              <p className="text-2xl font-bold">{threatsBlocked}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </InteractiveGlassCard>

        <InteractiveGlassCard
          className="p-4"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Funds Protected</p>
              <p className="text-2xl font-bold">${fundsProtected.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-neon-purple" />
          </div>
        </InteractiveGlassCard>
      </div>

      {/* Alerts List */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        glowColor="132, 0, 255"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-neon-blue" />
            <h2 className="text-xl font-space-grotesk font-bold">
              Security Alerts
            </h2>
            {unreadAlerts.length > 0 && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                {unreadAlerts.length} New
              </span>
            )}
          </div>
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">All Clear!</h3>
            <p className="text-gray-400">
              No security alerts at the moment. We're monitoring your wallet
              24/7.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
                    alert.isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-white">
                            {alert.title}
                          </h4>
                          {alert.token && (
                            <p className="text-sm text-gray-400">
                              Token: {alert.token.symbol}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-300 mb-3">
                        {alert.message}
                      </p>

                      {alert.recommendation && (
                        <div className="bg-white/5 rounded p-3 mb-3">
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-neon-blue">
                              Recommendation:
                            </span>{" "}
                            {alert.recommendation}
                          </p>
                        </div>
                      )}

                      {alert.actions && alert.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {alert.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() =>
                                handleAlertAction(alert, action.id)
                              }
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                action.type === "convert" ||
                                action.type === "revoke"
                                  ? "bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30"
                                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </InteractiveGlassCard>
    </div>
  );
}

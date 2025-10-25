"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Shield, Zap } from "lucide-react";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";

export default function ThreatMonitor() {
  const {
    mempoolTransactions,
    threatsBlocked,
    fundsProtected,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useRealTimeMonitoring();

  const recentTransactions = mempoolTransactions.slice(0, 10);

  const getThreatIcon = (threatType?: string) => {
    switch (threatType) {
      case "sandwich":
        return "🥪";
      case "frontrun":
        return "⚡";
      case "mev":
        return "🤖";
      case "suspicious":
        return "⚠️";
      default:
        return "📊";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <InteractiveGlassCard
          className="p-6"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          tiltIntensity={0.4}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-neon-blue" />
              <h2 className="text-xl font-space-grotesk font-bold">
                Live Mempool Monitor
              </h2>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">
                LIVE
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {recentTransactions.length} transactions
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">All Clear</h3>
              <p className="text-gray-400">
                No suspicious activity detected. We're monitoring your wallet
                24/7.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${getRiskColor(tx.riskLevel)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">
                        {getThreatIcon(tx.threatType)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm truncate">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </span>
                          {tx.threatType && (
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full uppercase">
                              {tx.threatType}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          <span>
                            From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </span>
                          {" → "}
                          <span>
                            To: {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tx.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getRiskColor(tx.riskLevel)}`}
                    >
                      {tx.riskLevel}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </InteractiveGlassCard>
      </motion.div>

      {/* Threat Types Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <InteractiveGlassCard
          className="p-6"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          tiltIntensity={0.4}
          glowColor="132, 0, 255"
        >
          <h3 className="text-lg font-bold mb-4">Threat Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥪</span>
              <div>
                <h4 className="font-semibold">Sandwich Attack</h4>
                <p className="text-sm text-gray-400">
                  Front-running and back-running your transaction
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold">Front-Running</h4>
                <p className="text-sm text-gray-400">
                  Transaction placed ahead of yours with higher gas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-semibold">MEV Bot</h4>
                <p className="text-sm text-gray-400">
                  Maximal Extractable Value exploitation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold">Suspicious Activity</h4>
                <p className="text-sm text-gray-400">
                  Unusual transaction patterns detected
                </p>
              </div>
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>
    </div>
  );
}

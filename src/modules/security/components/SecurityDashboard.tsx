"use client";

import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Activity,
} from "lucide-react";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { usePortfolioRisk } from "@/hooks/usePortfolioRisk";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";
import { Token } from "@/types";

interface SecurityDashboardProps {
  tokens: Token[];
}

export default function SecurityDashboard({ tokens }: SecurityDashboardProps) {
  const {
    overallRisk,
    category,
    color,
    highRiskTokens,
    safeTokens,
    isCalculating,
  } = usePortfolioRisk(tokens);
  const {
    threatsBlocked,
    fundsProtected,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useRealTimeMonitoring();

  const getRiskColor = () => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          border: "border-green-500/30",
        };
      case "yellow":
        return {
          bg: "bg-yellow-500/20",
          text: "text-yellow-400",
          border: "border-yellow-500/30",
        };
      case "orange":
        return {
          bg: "bg-orange-500/20",
          text: "text-orange-400",
          border: "border-orange-500/30",
        };
      case "red":
        return {
          bg: "bg-red-500/20",
          text: "text-red-400",
          border: "border-red-500/30",
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          border: "border-gray-500/30",
        };
    }
  };

  const riskColor = getRiskColor();

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <InteractiveGlassCard
          className={`p-8 border-2 ${riskColor.border}`}
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={12}
          glowColor="132, 0, 255"
          tiltIntensity={0.4}
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className={`w-16 h-16 ${riskColor.text}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Portfolio Security Score
            </h2>
            {isCalculating ? (
              <div className="text-4xl font-bold text-gray-400 mb-2">
                Calculating...
              </div>
            ) : (
              <>
                <div className={`text-6xl font-bold ${riskColor.text} mb-2`}>
                  {Math.round(overallRisk)}
                </div>
                <div
                  className={`text-xl font-semibold ${riskColor.text} uppercase mb-4`}
                >
                  {category}
                </div>
              </>
            )}

            {/* Risk Bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    color === "green"
                      ? "bg-green-500"
                      : color === "yellow"
                        ? "bg-yellow-500"
                        : color === "orange"
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                  style={{ width: `${overallRisk}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0 (Safe)</span>
                <span>100 (Critical)</span>
              </div>
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monitoring Status</p>
                <p
                  className={`text-xl font-bold ${isMonitoring ? "text-green-400" : "text-orange-400"}`}
                >
                  {isMonitoring ? "Active" : "Paused"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isMonitoring ? "Click to stop" : "Click to start"}
                </p>
              </div>
              <Activity
                className={`w-8 h-8 ${isMonitoring ? "text-green-400" : "text-gray-400"}`}
              />
            </div>
          </InteractiveGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Threats Blocked</p>
                <p className="text-xl font-bold text-green-400">
                  {threatsBlocked}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </InteractiveGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Funds Protected</p>
                <p className="text-xl font-bold text-neon-blue">
                  ${fundsProtected.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-neon-blue" />
            </div>
          </InteractiveGlassCard>
        </motion.div>

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
            glowColor="132, 0, 255"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Risk Assets</p>
                <p className="text-xl font-bold text-red-400">
                  {highRiskTokens.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </InteractiveGlassCard>
        </motion.div>
      </div>

      {/* Risk Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
          <h3 className="text-xl font-bold mb-4">Asset Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">
                {safeTokens.length}
              </p>
              <p className="text-sm text-gray-400">Safe Assets</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">
                {tokens.length - safeTokens.length - highRiskTokens.length}
              </p>
              <p className="text-sm text-gray-400">Medium Risk</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">
                {highRiskTokens.length}
              </p>
              <p className="text-sm text-gray-400">High Risk</p>
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>

      {/* Recommendations */}
      {highRiskTokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InteractiveGlassCard
            className="p-6 border border-red-500/30 bg-red-500/5"
            enableParticles={true}
            enableTilt={true}
            enableMagnetism={false}
            enableBorderGlow={true}
            clickEffect={true}
            particleCount={8}
            glowColor="132, 0, 255"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-red-400 mb-2">Action Required</h4>
                <p className="text-gray-300 mb-3">
                  You have {highRiskTokens.length} high-risk asset
                  {highRiskTokens.length > 1 ? "s" : ""} in your portfolio.
                </p>
                <button className="px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors">
                  Secure My Assets
                </button>
              </div>
            </div>
          </InteractiveGlassCard>
        </motion.div>
      )}
    </div>
  );
}

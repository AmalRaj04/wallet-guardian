"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
} from "lucide-react";
import { Portfolio } from "@/types";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/LoadingState";
import { usePortfolioRisk } from "@/hooks/usePortfolioRisk";

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  isLoading?: boolean;
}

export default function PortfolioOverview({
  portfolio,
  isLoading,
}: PortfolioOverviewProps) {
  const { overallRisk, category, color, isCalculating } = usePortfolioRisk(
    portfolio?.tokens || []
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <InteractiveGlassCard
            key={i}
            className="p-6"
            enableParticles={false}
            enableTilt={false}
            enableMagnetism={false}
            enableBorderGlow={false}
            clickEffect={false}
          >
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </InteractiveGlassCard>
        ))}
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const isPositive = portfolio.totalChangePercentage24h >= 0;

  // Risk color mapping
  const riskColors = {
    green: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
    },
    orange: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
    },
    red: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
    },
  };

  const riskColor = riskColors[color] || riskColors.green;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <InteractiveGlassCard
          className="p-6"
          neonColor="blue"
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
              <p className="text-gray-400 text-sm">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-neon-blue" />
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>

      {/* 24h Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <InteractiveGlassCard
          className="p-6"
          neonColor={isPositive ? "green" : "pink"}
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          tiltIntensity={0.4}
          particleCount={8}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">24h Change</p>
              <p
                className={`text-2xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(Math.abs(portfolio.totalChange24h))}
              </p>
              <p
                className={`text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {formatPercentage(portfolio.totalChangePercentage24h)}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isPositive ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>

      {/* Token Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <InteractiveGlassCard
          className="p-6"
          neonColor="purple"
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
              <p className="text-gray-400 text-sm">Assets</p>
              <p className="text-2xl font-bold text-white">
                {portfolio.tokens.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {portfolio.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-neon-purple" />
            </div>
          </div>
        </InteractiveGlassCard>
      </motion.div>

      {/* Risk Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <InteractiveGlassCard
          className={`p-6 border ${riskColor.border}`}
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
              <p className="text-gray-400 text-sm">Portfolio Risk</p>
              <p className={`text-2xl font-bold ${riskColor.text}`}>
                {isCalculating ? "..." : Math.round(overallRisk)}
              </p>
              <p
                className={`text-sm ${riskColor.text} uppercase font-semibold`}
              >
                {category}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${riskColor.bg} rounded-lg flex items-center justify-center`}
            >
              <Shield className={`w-6 h-6 ${riskColor.text}`} />
            </div>
          </div>
          {!isCalculating && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
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
            </div>
          )}
        </InteractiveGlassCard>
      </motion.div>
    </div>
  );
}

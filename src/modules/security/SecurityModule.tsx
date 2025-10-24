"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@/hooks/useWallet";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";
import SecurityDashboard from "./components/SecurityDashboard";
import TokenAllowances from "./components/TokenAllowances";
import RiskAnalysis from "./components/RiskAnalysis";
import ThreatMonitor from "./components/ThreatMonitor";
import BytecodeAnalyzer from "./components/BytecodeAnalyzer";
import GlassCard from "@/components/ui/GlassCard";
import { LoadingState } from "@/components/ui/LoadingState";

export default function SecurityModule() {
  const { isConnected, address } = useAccount();
  const { portfolio, isLoadingPortfolio } = useWallet();
  const { startMonitoring, isMonitoring } = useRealTimeMonitoring();

  // Start monitoring when wallet is connected
  useEffect(() => {
    if (isConnected && address && !isMonitoring && !isLoadingPortfolio) {
      console.log("Starting monitoring for address:", address);
      console.log("Tokens available:", portfolio?.tokens?.length || 0);
      startMonitoring(portfolio?.tokens || []);
    }
  }, [
    isConnected,
    address,
    isMonitoring,
    isLoadingPortfolio,
    portfolio?.tokens,
    startMonitoring,
  ]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <GlassCard className="p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-space-grotesk font-bold mb-4">
              Secure Your Wallet
            </h2>
            <p className="text-gray-400 mb-8">
              Connect your wallet to access advanced security monitoring, risk
              analysis, and threat detection features.
            </p>
            <ConnectButton />
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (isLoadingPortfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading security data..." size="lg" />
      </div>
    );
  }

  const tokens = portfolio?.tokens || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-space-grotesk font-bold text-gradient mb-4">
          Security Center
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Advanced wallet security monitoring and threat intelligence
        </p>
      </motion.div>

      {/* Security Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SecurityDashboard tokens={tokens} />
      </motion.div>

      {/* Hardhat 3 Bytecode Analyzer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <BytecodeAnalyzer />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TokenAllowances tokens={tokens} walletAddress={address} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RiskAnalysis tokens={tokens} />
          </motion.div>
        </div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ThreatMonitor />
        </motion.div>
      </div>
    </div>
  );
}

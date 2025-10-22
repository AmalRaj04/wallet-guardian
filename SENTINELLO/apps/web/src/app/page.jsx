"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Header from "../components/Header";
import WalletConnect from "../components/WalletConnect";
import PortfolioTable from "../components/PortfolioTable";
import PriceAlert from "../components/PriceAlert";
import SwapModal from "../components/SwapModal";
import AIAnalysis from "../components/AIAnalysis";
import PortfolioChart from "../components/PortfolioChart";
import { useWallet } from "../hooks/useWallet";
import { usePriceMonitor } from "../hooks/usePriceMonitor";

export default function SentinelDashboard() {
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [aiAnalysisOpen, setAIAnalysisOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [swapType, setSwapType] = useState("sell"); // 'sell' or 'pyusd'

  const {
    isConnected,
    address,
    tokens,
    totalValue,
    isLoading: walletLoading,
    connectWallet,
    disconnect,
  } = useWallet();

  const { alerts, clearAlert } = usePriceMonitor(tokens);

  const handleSwap = (token, type) => {
    setSelectedToken(token);
    setSwapType(type);
    setSwapModalOpen(true);
  };

  const handleAIAnalysis = (token) => {
    setSelectedToken(token);
    setAIAnalysisOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-2xl mx-auto">
                <motion.h1
                  className="text-6xl font-space-grotesk font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Sentinel
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-300 mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  AI-Powered Web3 Portfolio Tracker with Real-Time Alerts &
                  Automated Trading
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <WalletConnect onConnect={connectWallet} />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Portfolio Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-space-grotesk font-semibold mb-4">
                    Portfolio Overview
                  </h2>
                  <div className="h-64">
                    <PortfolioChart tokens={tokens} />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold mb-4">
                    Total Portfolio Value
                  </h3>
                  <div className="text-3xl font-space-grotesk font-bold text-green-400">
                    ${totalValue?.toLocaleString() || "0.00"}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {tokens?.length || 0} tokens tracked
                  </div>
                </motion.div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-space-grotesk font-semibold mb-4">
                    Active Alerts
                  </h2>
                  <div className="grid gap-4">
                    {alerts.map((alert, index) => (
                      <PriceAlert
                        key={`${alert.token.address}-${index}`}
                        alert={alert}
                        onSwap={handleSwap}
                        onAnalyze={handleAIAnalysis}
                        onDismiss={() => clearAlert(alert.token.address)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Portfolio Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <PortfolioTable
                  tokens={tokens}
                  isLoading={walletLoading}
                  onSwap={handleSwap}
                />
              </motion.div>
            </motion.div>
          )}
        </main>

        {/* Modals */}
        <SwapModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          token={selectedToken}
          swapType={swapType}
        />

        <AIAnalysis
          isOpen={aiAnalysisOpen}
          onClose={() => setAIAnalysisOpen(false)}
          token={selectedToken}
        />
      </div>
    </div>
  );
}

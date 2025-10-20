"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && isConnected && address) router.push("/dashboard");
  }, [mounted, isConnected, address, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-gray-900 text-white">
      <header className="max-w-7xl mx-auto flex items-center justify-between py-6 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1L3 5V11C3 17 7 22 12 23C17 22 21 17 21 11V5L12 1Z"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-bold text-lg">WalletGuard</span>
        </div>

        <div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto w-fit p-6 rounded-full bg-gradient-to-br from-purple-800/30 to-blue-700/20 mb-8">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto"
            >
              <path
                d="M12 1L3 5V11C3 17 7 22 12 23C17 22 21 17 21 11V5L12 1Z"
                stroke="#C7B8FF"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Protect Your Crypto Assets
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              with AI-Powered Security
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-300 mt-4 mb-8">
            Real-time transaction monitoring, smart contract verification, and
            AI-driven risk analysis to keep your wallet safe from threats.
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-lg"
            >
              Connect Wallet to Get Started
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <h3 className="font-semibold text-white mb-2">
              Real-Time Monitoring
            </h3>
            <p className="text-sm text-gray-300">
              Track pending transactions and mempool activity with instant risk
              alerts.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <h3 className="font-semibold text-white mb-2">
              Smart Contract Verification
            </h3>
            <p className="text-sm text-gray-300">
              Automated analysis of contract approvals and token permissions.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <h3 className="font-semibold text-white mb-2">AI Risk Analysis</h3>
            <p className="text-sm text-gray-300">
              Plain-English explanations of security threats powered by AI.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

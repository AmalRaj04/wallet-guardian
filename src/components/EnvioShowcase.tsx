"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import EnvioHyperSync from "@/lib/envio-hypersync";
import GlassCard from "@/components/ui/GlassCard";
import { Activity, TrendingUp, Users, Zap, AlertTriangle } from "lucide-react";

export default function EnvioShowcase() {
  const { address, isConnected, chain } = useAccount();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);

  const analyzeWallet = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const envio = new EnvioHyperSync(chain?.id || 1);

      // Get wallet activity analysis
      const activityAnalysis = await envio.analyzeWalletActivity(address, 30);
      setAnalysis(activityAnalysis);

      // Get recent transactions
      const txHistory = await envio.getTransactionHistory(
        address,
        0,
        undefined,
        10
      );
      setTransactions(txHistory);

      // Get token transfers
      const transfers = await envio.getTokenTransfers(
        address,
        undefined,
        0,
        undefined,
        10
      );
      setTokenTransfers(transfers);
    } catch (error) {
      console.error("Error analyzing wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <GlassCard className="p-8 text-center">
        <Zap className="w-16 h-16 text-neon-blue mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Envio HyperSync Integration</h2>
        <p className="text-gray-400">
          Connect your wallet to see ultra-fast blockchain data analysis
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-8 h-8 text-neon-blue" />
              Envio HyperSync Analysis
            </h2>
            <p className="text-gray-400">
              Ultra-fast historical blockchain data powered by Envio
            </p>
          </div>
          <button
            onClick={analyzeWallet}
            disabled={loading}
            className="px-6 py-3 bg-neon-blue hover:bg-neon-blue/80 disabled:bg-gray-600 
                       rounded-lg font-semibold transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Wallet"}
          </button>
        </div>
      </GlassCard>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-sm text-gray-400">30 Days</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {analysis.totalTransactions}
            </div>
            <div className="text-sm text-gray-400">Total Transactions</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-sm text-gray-400">Unique</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {analysis.uniqueContracts}
            </div>
            <div className="text-sm text-gray-400">Contracts Interacted</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-sm text-gray-400">Volume</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {(Number(analysis.totalValue) / 1e18).toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">ETH Transferred</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle
                className={`w-6 h-6 ${
                  analysis.riskScore > 60
                    ? "text-red-400"
                    : analysis.riskScore > 30
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              />
              <span className="text-sm text-gray-400">Activity</span>
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${
                analysis.riskScore > 60
                  ? "text-red-400"
                  : analysis.riskScore > 30
                    ? "text-yellow-400"
                    : "text-green-400"
              }`}
            >
              {analysis.riskScore}
            </div>
            <div className="text-sm text-gray-400">Risk Score</div>
          </GlassCard>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">
            Recent Transactions (via Envio)
          </h3>
          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <div
                key={idx}
                className="p-3 bg-black/30 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Block {tx.blockNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {(Number(tx.value) / 1e18).toFixed(4)} ETH
                  </div>
                  <div
                    className={`text-xs ${tx.status === 1 ? "text-green-400" : "text-red-400"}`}
                  >
                    {tx.status === 1 ? "Success" : "Failed"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Token Transfers */}
      {tokenTransfers.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">
            Recent Token Transfers (via Envio)
          </h3>
          <div className="space-y-2">
            {tokenTransfers.map((transfer, idx) => (
              <div
                key={idx}
                className="p-3 bg-black/30 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm">
                    {transfer.tokenAddress.slice(0, 10)}...
                    {transfer.tokenAddress.slice(-8)}
                  </div>
                  <div className="text-xs text-gray-400">
                    From: {transfer.from.slice(0, 10)}...
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">Transfer</div>
                  <div className="text-xs text-gray-400">
                    Block {transfer.blockNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Envio Badge */}
      <GlassCard className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-400" />
          <div>
            <div className="font-semibold">Powered by Envio HyperSync</div>
            <div className="text-sm text-gray-400">
              Ultra-fast blockchain data indexing - 100x faster than standard
              RPC
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

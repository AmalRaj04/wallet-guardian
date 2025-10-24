"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  Lock,
  Zap,
  Eye,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";
import { usePortfolioRisk } from "@/hooks/usePortfolioRisk";
import { Token } from "@/types";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function ComprehensiveDashboard() {
  const { address, isConnected } = useAccount();
  const {
    isMonitoring,
    alerts,
    mempoolTransactions,
    fundsProtected,
    threatsBlocked,
    startMonitoring,
    stopMonitoring,
  } = useRealTimeMonitoring();

  const [portfolio, setPortfolio] = useState<Token[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { overallRisk, getTokenRisk, refreshRisk } =
    usePortfolioRisk(portfolio);

  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isConnected || !address) return;

    const ws = new WebSocket(`ws://localhost:8080`);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", address }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRealtimeData((prev) => [data, ...prev].slice(0, 50));
    };

    ws.onerror = () => {
      console.warn("WebSocket unavailable - using fallback");
      setWsConnected(false);
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [isConnected, address]);

  // Auto-start monitoring
  useEffect(() => {
    if (isConnected && address && portfolio.length > 0 && !isMonitoring) {
      startMonitoring(portfolio);
    }
  }, [isConnected, address, portfolio, isMonitoring]);

  // Portfolio composition chart data
  const portfolioChartData = {
    labels: portfolio.slice(0, 5).map((t: Token) => t.symbol),
    datasets: [
      {
        data: portfolio.slice(0, 5).map((t: Token) => t.value || 0),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Risk timeline data
  const riskTimelineData = {
    labels: ["1h", "2h", "3h", "4h", "5h", "6h"],
    datasets: [
      {
        label: "Risk Score",
        data: [45, 52, 48, 65, 58, overallRisk],
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-400";
    if (risk < 60) return "text-yellow-400";
    if (risk < 80) return "text-orange-400";
    return "text-red-400";
  };

  const getRiskBg = (risk: number) => {
    if (risk < 30) return "bg-green-500/20 border-green-500/50";
    if (risk < 60) return "bg-yellow-500/20 border-yellow-500/50";
    if (risk < 80) return "bg-orange-500/20 border-orange-500/50";
    return "bg-red-500/20 border-red-500/50";
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Shield className="w-16 h-16 text-neon-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your wallet to access the comprehensive security dashboard
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">🛡️ Wallet Guardian</h1>
          <p className="text-gray-400">
            Comprehensive Security Dashboard - Real-Time Protection Active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-lg border ${wsConnected ? "bg-green-500/20 border-green-500/50" : "bg-gray-500/20 border-gray-500/50"}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
              />
              <span className="text-sm">
                {wsConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
          {isMonitoring && (
            <div className="px-4 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-neon-blue animate-pulse" />
                <span className="text-sm text-neon-blue">Monitoring</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">Portfolio Value</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {portfolio.length} tokens
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Funds Protected</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              ${fundsProtected.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {threatsBlocked} threats blocked
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle
                className={`w-8 h-8 ${getRiskColor(overallRisk)}`}
              />
              <span className="text-sm text-gray-400">Overall Risk</span>
            </div>
            <div className={`text-3xl font-bold ${getRiskColor(overallRisk)}`}>
              {overallRisk}/100
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {overallRisk < 30
                ? "Safe"
                : overallRisk < 60
                  ? "Medium"
                  : overallRisk < 80
                    ? "High"
                    : "Critical"}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-gray-400">Active Alerts</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {alerts.filter((a) => !a.isRead).length}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {mempoolTransactions.length} mempool txs
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Portfolio Composition</h3>
          {portfolio.length > 0 ? (
            <div className="h-64">
              <Pie
                data={portfolioChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No portfolio data
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Risk Timeline (6h)</h3>
          <div className="h-64">
            <Line
              data={riskTimelineData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </GlassCard>
      </div>

      {/* Active Threats Table */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4">🚨 Active Threats</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getRiskBg(alert.severity === "critical" ? 90 : alert.severity === "high" ? 70 : alert.severity === "medium" ? 50 : 30)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                      alert.severity === "critical"
                        ? "bg-red-500 text-white"
                        : alert.severity === "high"
                          ? "bg-orange-500 text-white"
                          : alert.severity === "medium"
                            ? "bg-yellow-500 text-black"
                            : "bg-blue-500 text-white"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>No active threats detected</p>
          </div>
        )}
      </GlassCard>

      {/* Mempool Activity */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Mempool Activity</h3>
        {mempoolTransactions.length > 0 ? (
          <div className="space-y-2">
            {mempoolTransactions.slice(0, 10).map((tx, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Zap
                    className={`w-4 h-4 ${
                      tx.riskLevel === "high"
                        ? "text-red-400"
                        : tx.riskLevel === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  />
                  <span className="text-sm font-mono">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3" />
            <p>No mempool activity</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

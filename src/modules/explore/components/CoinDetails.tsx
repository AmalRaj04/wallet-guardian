"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Globe,
  Github,
  Twitter,
  MessageCircle,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Coin, ChartData } from "@/types";
import { CoinGeckoAPI } from "@/lib/coingecko";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface CoinDetailsProps {
  coin: Coin;
}

export default function CoinDetails({ coin }: CoinDetailsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState<"1" | "7" | "30">("7");

  useEffect(() => {
    if (coin.id) {
      fetchChartData();
    }
  }, [coin.id, timeframe]);

  const fetchChartData = async () => {
    setIsLoadingChart(true);
    try {
      const data = await CoinGeckoAPI.getCoinHistory(
        coin.id,
        parseInt(timeframe)
      );
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(8)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e12) {
      return `${(supply / 1e12).toFixed(2)}T`;
    } else if (supply >= 1e9) {
      return `${(supply / 1e9).toFixed(2)}B`;
    } else if (supply >= 1e6) {
      return `${(supply / 1e6).toFixed(2)}M`;
    }
    return supply.toLocaleString();
  };

  const isPositiveChange = coin.price_change_percentage_24h >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-coin.png";
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg text-gray-400 uppercase">
                  {coin.symbol}
                </span>
                <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                  Rank #{coin.market_cap_rank}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(coin.current_price)}
            </div>
            <div
              className={`flex items-center justify-end space-x-1 mt-1 ${
                isPositiveChange ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-lg font-medium">
                {isPositiveChange ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </InteractiveGlassCard>

      {/* Price Chart */}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Price Chart</h2>

          <div className="flex bg-black/20 rounded-lg p-1">
            {[
              { value: "1", label: "24H" },
              { value: "7", label: "7D" },
              { value: "30", label: "30D" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeframe === option.value
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingChart ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingState message="Loading chart..." size="sm" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#6B7280"
                  fontSize={12}
                  tick={{ fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tick={{ fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(0, 212, 255, 0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    backdropFilter: "blur(10px)",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: value >= 1 ? 2 : 8,
                    })}`,
                    "Price",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#00D4FF",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  fill="url(#colorPrice)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">No chart data available</div>
          </div>
        )}
      </InteractiveGlassCard>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-neon-blue" />
            Market Data
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="text-white font-medium">
                {formatMarketCap(coin.market_cap)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-white font-medium">
                {formatMarketCap(coin.total_volume)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">24h High</span>
              <span className="text-white font-medium">
                {formatPrice(coin.high_24h)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">24h Low</span>
              <span className="text-white font-medium">
                {formatPrice(coin.low_24h)}
              </span>
            </div>
          </div>
        </InteractiveGlassCard>

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
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-neon-purple" />
            Supply Info
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="text-white font-medium">
                {formatSupply(coin.circulating_supply)}
              </span>
            </div>

            {coin.total_supply && (
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply</span>
                <span className="text-white font-medium">
                  {formatSupply(coin.total_supply)}
                </span>
              </div>
            )}

            {coin.max_supply && (
              <div className="flex justify-between">
                <span className="text-gray-400">Max Supply</span>
                <span className="text-white font-medium">
                  {formatSupply(coin.max_supply)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-400">All-Time High</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatPrice(coin.ath)}
                </div>
                <div className="text-red-400 text-sm">
                  {coin.ath_change_percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </InteractiveGlassCard>
      </div>

      {/* Additional Info */}
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
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-neon-green" />
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-gray-400 mb-2">All-Time Low</div>
            <div className="text-white font-medium">
              {formatPrice(coin.atl)}
            </div>
            <div className="text-green-400 text-sm">
              +{Math.abs(coin.atl_change_percentage).toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-gray-400 mb-2">Last Updated</div>
            <div className="text-white font-medium">
              {new Date(coin.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </InteractiveGlassCard>
    </div>
  );
}

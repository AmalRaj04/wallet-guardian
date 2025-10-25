"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { CoinGeckoAPI } from "@/lib/coingecko";
import { Coin, TrendingCoin } from "@/types";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface TrendingCoinsProps {
  onCoinSelect: (coin: Coin) => void;
}

export default function TrendingCoins({ onCoinSelect }: TrendingCoinsProps) {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [topCoins, setTopCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trending" | "top">("trending");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch trending coins and top coins in parallel
      const [trending, top] = await Promise.all([
        CoinGeckoAPI.getTrendingCoins(),
        CoinGeckoAPI.getCoins(1, 20), // Top 20 coins
      ]);

      setTrendingCoins(trending);
      setTopCoins(top);
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinClick = async (coinId: string) => {
    try {
      const coinDetails = await CoinGeckoAPI.getCoinDetails(coinId);

      // Convert to our Coin type
      const coin: Coin = {
        id: coinDetails.id,
        symbol: coinDetails.symbol,
        name: coinDetails.name,
        image:
          typeof coinDetails.image === "string"
            ? coinDetails.image
            : coinDetails.image?.large || coinDetails.image?.small || "",
        current_price: coinDetails.market_data?.current_price?.usd || 0,
        market_cap: coinDetails.market_data?.market_cap?.usd || 0,
        market_cap_rank: coinDetails.market_cap_rank || 0,
        total_volume: coinDetails.market_data?.total_volume?.usd || 0,
        high_24h: coinDetails.market_data?.high_24h?.usd || 0,
        low_24h: coinDetails.market_data?.low_24h?.usd || 0,
        price_change_24h: coinDetails.market_data?.price_change_24h || 0,
        price_change_percentage_24h:
          coinDetails.market_data?.price_change_percentage_24h || 0,
        circulating_supply: coinDetails.market_data?.circulating_supply || 0,
        total_supply: coinDetails.market_data?.total_supply || 0,
        max_supply: coinDetails.market_data?.max_supply || 0,
        ath: coinDetails.market_data?.ath?.usd || 0,
        ath_change_percentage:
          coinDetails.market_data?.ath_change_percentage?.usd || 0,
        ath_date: coinDetails.market_data?.ath_date?.usd || "",
        atl: coinDetails.market_data?.atl?.usd || 0,
        atl_change_percentage:
          coinDetails.market_data?.atl_change_percentage?.usd || 0,
        atl_date: coinDetails.market_data?.atl_date?.usd || "",
        last_updated: coinDetails.last_updated || new Date().toISOString(),
      };

      onCoinSelect(coin);
    } catch (error) {
      console.error("Error fetching coin details:", error);
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

  if (isLoading) {
    return (
      <InteractiveGlassCard
        className="p-8"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        glowColor="132, 0, 255"
        tiltIntensity={0.1}
      >
        <LoadingState message="Loading market data..." size="lg" />
      </InteractiveGlassCard>
    );
  }

  return (
    <InteractiveGlassCard
      className="p-6"
      enableParticles={true}
      enableTilt={true}
      enableMagnetism={false}
      enableBorderGlow={true}
      clickEffect={true}
      particleCount={8}
      glowColor="132, 0, 255"
      tiltIntensity={0.3}
    >
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gradient">Market Overview</h2>

        <div className="flex bg-black/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "trending"
                ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab("top")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "top"
                ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Top Coins
          </button>
        </div>
      </div>

      {/* Coin List */}
      <div className="space-y-3">
        {activeTab === "trending"
          ? // Trending Coins
            trendingCoins.map((trending, index) => (
              <motion.button
                key={trending.item.id}
                onClick={() => handleCoinClick(trending.item.id)}
                className="w-full p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <img
                      src={trending.item.small}
                      alt={trending.item.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-coin.png";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white group-hover:text-neon-blue transition-colors">
                        {trending.item.name}
                      </span>
                      <span className="text-sm text-gray-400 uppercase">
                        {trending.item.symbol}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Rank #{trending.item.market_cap_rank || "N/A"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Trending</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          : // Top Coins
            topCoins.map((coin, index) => (
              <motion.button
                key={coin.id}
                onClick={() => onCoinSelect(coin)}
                className="w-full p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400 w-6">
                      #{coin.market_cap_rank}
                    </span>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-coin.png";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white group-hover:text-neon-blue transition-colors">
                        {coin.name}
                      </span>
                      <span className="text-sm text-gray-400 uppercase">
                        {coin.symbol}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatMarketCap(coin.market_cap)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-white">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div
                      className={`text-sm flex items-center justify-end space-x-1 ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 rounded-lg text-neon-blue font-medium transition-all duration-300"
        >
          Refresh Data
        </button>
      </div>
    </InteractiveGlassCard>
  );
}

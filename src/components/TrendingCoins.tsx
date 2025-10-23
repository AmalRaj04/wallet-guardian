'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { CoinGeckoAPI } from '@/lib/coingecko';
import { TrendingCoin } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/LoadingState';

interface TrendingCoinsProps {
  onCoinSelect: (coin: any) => void;
}

export default function TrendingCoins({ onCoinSelect }: TrendingCoinsProps) {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingCoins();
  }, []);

  const fetchTrendingCoins = async () => {
    setIsLoading(true);
    try {
      const trending = await CoinGeckoAPI.getTrendingCoins();
      setTrendingCoins(trending);
    } catch (error) {
      console.error('Error fetching trending coins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinClick = async (coinId: string) => {
    try {
      const coinDetails = await CoinGeckoAPI.getCoinDetails(coinId);
      onCoinSelect(coinDetails);
    } catch (error) {
      console.error('Error fetching coin details:', error);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-8">
        <LoadingState message="Loading trending coins..." size="lg" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gradient flex items-center">
          <Star className="w-6 h-6 mr-2 text-neon-blue" />
          Trending Coins
        </h2>
        
        <button
          onClick={fetchTrendingCoins}
          className="px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 rounded-lg text-neon-blue font-medium transition-all duration-300"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCoins.map((trending, index) => (
          <motion.button
            key={trending.item.id}
            onClick={() => handleCoinClick(trending.item.id)}
            className="p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={trending.item.small}
                alt={trending.item.name}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-coin.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white group-hover:text-neon-blue transition-colors truncate">
                  {trending.item.name}
                </div>
                <div className="text-sm text-gray-400 uppercase">
                  {trending.item.symbol}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Rank #{trending.item.market_cap_rank || 'N/A'}
              </span>
              <div className="flex items-center space-x-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Trending</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
}
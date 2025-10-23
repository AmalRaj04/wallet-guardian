'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  DollarSign,
  Calendar
} from 'lucide-react';
import { ChartData } from '@/types';
import { CoinGeckoAPI } from '@/lib/coingecko';
import GlassCard from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/LoadingState';

interface CoinDetailsProps {
  coin: any;
}

export default function CoinDetails({ coin }: CoinDetailsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeframe, setTimeframe] = useState<'1' | '7' | '30'>('7');

  useEffect(() => {
    if (coin?.id) {
      fetchChartData();
    }
  }, [coin?.id, timeframe]);

  const fetchChartData = async () => {
    setIsLoadingChart(true);
    try {
      const data = await CoinGeckoAPI.getCoinHistory(coin.id, parseInt(timeframe));
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
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

  if (!coin) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-gray-400">Select a coin to view details</div>
      </GlassCard>
    );
  }

  const currentPrice = coin.market_data?.current_price?.usd || 0;
  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const marketCap = coin.market_data?.market_cap?.usd || 0;
  const volume24h = coin.market_data?.total_volume?.usd || 0;
  const isPositiveChange = priceChange24h >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={coin.image?.large || coin.image?.small || ''}
              alt={coin.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-coin.png';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg text-gray-400 uppercase">{coin.symbol}</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                  Rank #{coin.market_cap_rank || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(currentPrice)}
            </div>
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              isPositiveChange ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositiveChange ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-lg font-medium">
                {isPositiveChange ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Price Chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Price Chart</h2>
          
          <div className="flex bg-black/20 rounded-lg p-1">
            {[
              { value: '1', label: '24H' },
              { value: '7', label: '7D' },
              { value: '30', label: '30D' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeframe === option.value
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    : 'text-gray-400 hover:text-white'
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
        ) : (
          <div className="h-64 bg-black/20 rounded-lg p-4 flex items-center justify-center">
            <div className="text-gray-400">
              Chart visualization would be implemented here with Chart.js
            </div>
          </div>
        )}
      </GlassCard>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-neon-blue" />
            Market Data
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="text-white font-medium">
                {formatMarketCap(marketCap)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-white font-medium">
                {formatMarketCap(volume24h)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h High</span>
              <span className="text-white font-medium">
                {formatPrice(coin.market_data?.high_24h?.usd || 0)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h Low</span>
              <span className="text-white font-medium">
                {formatPrice(coin.market_data?.low_24h?.usd || 0)}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-neon-purple" />
            Supply Info
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="text-white font-medium">
                {coin.market_data?.circulating_supply?.toLocaleString() || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Total Supply</span>
              <span className="text-white font-medium">
                {coin.market_data?.total_supply?.toLocaleString() || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Max Supply</span>
              <span className="text-white font-medium">
                {coin.market_data?.max_supply?.toLocaleString() || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">All-Time High</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatPrice(coin.market_data?.ath?.usd || 0)}
                </div>
                <div className="text-red-400 text-sm">
                  {coin.market_data?.ath_change_percentage?.usd?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
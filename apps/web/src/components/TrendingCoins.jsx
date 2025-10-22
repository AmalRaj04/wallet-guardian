'use client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function TrendingCoins({ onCoinSelect }) {
  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const fetchCoinDetails = async (coinId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch coin details');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching coin details:', error);
      toast.error('Failed to load coin details');
      return null;
    }
  };

  const handleCoinClick = async (coin) => {
    const coinDetails = await fetchCoinDetails(coin.id);
    if (coinDetails) {
      onCoinSelect(coinDetails);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap?.toLocaleString() || 'N/A'}`;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">Failed to load trending coins</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-3xl font-bold text-white font-[family-name:Space_Grotesk]">
            Trending Coins
          </h2>
        </div>
        <p className="text-gray-400 font-[family-name:Inter]">
          Most popular cryptocurrencies right now
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 animate-pulse"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-600 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingData?.coins?.slice(0, 6).map((trendingCoin) => {
            const coin = trendingCoin.item;
            return (
              <button
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                className="group backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 hover:border-blue-400/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 text-left"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={coin.large}
                    alt={coin.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">{coin.name}</div>
                    <div className="text-gray-400 text-sm uppercase">{coin.symbol}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(coin.price_btc * 50000)} {/* Approximate USD conversion */}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">24h Change</span>
                    <span className={`text-sm font-medium ${
                      coin.data?.price_change_percentage_24h?.usd >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {formatChange(coin.data?.price_change_percentage_24h?.usd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Rank</span>
                    <span className="text-gray-300 text-sm">#{coin.market_cap_rank || 'N/A'}</span>
                  </div>
                </div>

                {/* Neon glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
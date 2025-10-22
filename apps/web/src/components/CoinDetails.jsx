'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, Globe, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CoinDetails({ coin }) {
  const [chartPeriod, setChartPeriod] = useState('7');

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['chart', coin.id, chartPeriod],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${chartPeriod}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      const data = await response.json();
      return data.prices.map(([timestamp, price]) => ({
        time: new Date(timestamp).toLocaleDateString(),
        price: price,
        timestamp
      }));
    },
    enabled: !!coin.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

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

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume?.toLocaleString() || 'N/A'}`;
  };

  const formatSupply = (supply) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply?.toLocaleString() || 'N/A';
  };

  const chartPeriods = [
    { label: '1D', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
    { label: '1Y', value: '365' }
  ];

  const currentPrice = coin.market_data?.current_price?.usd;
  const change24h = coin.market_data?.price_change_percentage_24h;
  const change7d = coin.market_data?.price_change_percentage_7d;
  const change30d = coin.market_data?.price_change_percentage_30d;

  return (
    <div className="space-y-6">
      {/* Coin Header */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img src={coin.image?.large} alt={coin.name} className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-white font-[family-name:Space_Grotesk]">
                {coin.name}
              </h1>
              <span className="text-gray-400 text-lg uppercase">({coin.symbol})</span>
              <span className="text-gray-500 text-sm">#{coin.market_cap_rank || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-4">
              {coin.links?.homepage?.[0] && (
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="text-4xl font-bold text-white mb-2">
              {formatPrice(currentPrice)}
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="font-medium">{formatChange(change24h)} (24h)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-gray-400 text-sm">7d Change</div>
            <div className={`font-medium ${change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(change7d)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-gray-400 text-sm">30d Change</div>
            <div className={`font-medium ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(change30d)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-[family-name:Space_Grotesk]">
            Price Chart
          </h2>
          <div className="flex space-x-2">
            {chartPeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setChartPeriod(period.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          {chartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatPrice(value), 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Failed to load chart data
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4">
          <div className="text-gray-400 text-sm mb-1">Market Cap</div>
          <div className="text-xl font-bold text-white">
            {formatMarketCap(coin.market_data?.market_cap?.usd)}
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4">
          <div className="text-gray-400 text-sm mb-1">24h Volume</div>
          <div className="text-xl font-bold text-white">
            {formatVolume(coin.market_data?.total_volume?.usd)}
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4">
          <div className="text-gray-400 text-sm mb-1">Circulating Supply</div>
          <div className="text-xl font-bold text-white">
            {formatSupply(coin.market_data?.circulating_supply)}
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4">
          <div className="text-gray-400 text-sm mb-1">Total Supply</div>
          <div className="text-xl font-bold text-white">
            {formatSupply(coin.market_data?.total_supply)}
          </div>
        </div>
      </div>

      {/* Description */}
      {coin.description?.en && (
        <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 font-[family-name:Space_Grotesk]">
            About {coin.name}
          </h2>
          <div 
            className="text-gray-300 leading-relaxed font-[family-name:Inter]"
            dangerouslySetInnerHTML={{ 
              __html: coin.description.en.split('.')[0] + '.' // First sentence only
            }}
          />
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, Repeat } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/types/token';

export default function PortfolioTable({ tokens = [], isLoading, onSwap }) {
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-400" /> : 
      <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-space-grotesk font-semibold mb-6">Portfolio Holdings</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-space-grotesk font-semibold mb-6">Portfolio Holdings</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">No tokens found in your wallet</p>
          <p className="text-sm text-gray-500 mt-2">Connect your wallet and add some tokens to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-space-grotesk font-semibold">Portfolio Holdings</h2>
        <p className="text-gray-400 text-sm mt-1">{tokens.length} tokens tracked</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 font-medium text-gray-300">
                <button 
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                >
                  <span>Token</span>
                  <SortIcon field="symbol" />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-gray-300">
                <button 
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-2 hover:text-white transition-colors ml-auto"
                >
                  <span>Price</span>
                  <SortIcon field="price" />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-gray-300">
                <button 
                  onClick={() => handleSort('change24h')}
                  className="flex items-center space-x-2 hover:text-white transition-colors ml-auto"
                >
                  <span>24h Change</span>
                  <SortIcon field="change24h" />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-gray-300">
                <button 
                  onClick={() => handleSort('balanceFormatted')}
                  className="flex items-center space-x-2 hover:text-white transition-colors ml-auto"
                >
                  <span>Balance</span>
                  <SortIcon field="balanceFormatted" />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-gray-300">
                <button 
                  onClick={() => handleSort('value')}
                  className="flex items-center space-x-2 hover:text-white transition-colors ml-auto"
                >
                  <span>Value</span>
                  <SortIcon field="value" />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token, index) => (
              <motion.tr
                key={token.address}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {token.logo ? (
                        <img 
                          src={token.logo} 
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className="text-white font-semibold text-sm" style={{ display: token.logo ? 'none' : 'flex' }}>
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-semibold text-white">
                    {formatCurrency(token.price)}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {formatPercentage(token.change24h)}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-semibold text-white">
                    {token.balanceFormatted.toLocaleString(undefined, { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 4 
                    })}
                  </div>
                  <div className="text-sm text-gray-400">{token.symbol}</div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-semibold text-white">
                    {formatCurrency(token.value)}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.button
                      onClick={() => onSwap(token, 'sell')}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sell
                    </motion.button>
                    <motion.button
                      onClick={() => onSwap(token, 'pyusd')}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center space-x-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Repeat className="w-3 h-3" />
                      <span>PYUSD</span>
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
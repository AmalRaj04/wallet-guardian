'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './components/SearchBar';
import TrendingCoins from './components/TrendingCoins';
import CoinDetails from './components/CoinDetails';
import AIAnalysis from './components/AIAnalysis';
import { Coin } from '@/types';

export default function ExploreModule() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-space-grotesk font-bold text-gradient mb-4">
          Crypto Explorer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover and analyze cryptocurrencies with AI-powered insights and real-time market data
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onCoinSelect={setSelectedCoin}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Trending Coins */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <TrendingCoins onCoinSelect={setSelectedCoin} />
        </motion.div>

        {/* Right Column - Coin Details & AI Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {selectedCoin ? (
            <>
              <CoinDetails coin={selectedCoin} />
              <AIAnalysis coin={selectedCoin} />
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Coin</h3>
              <p className="text-gray-400">
                Choose a cryptocurrency to view detailed analysis and AI insights
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
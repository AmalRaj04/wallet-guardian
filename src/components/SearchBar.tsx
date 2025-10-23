'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { CoinGeckoAPI } from '@/lib/coingecko';
import GlassCard from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/LoadingState';

interface SearchBarProps {
  onCoinSelect: (coin: any) => void;
}

export default function SearchBar({ onCoinSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for coins
  const searchCoins = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await CoinGeckoAPI.searchCoins(searchQuery);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Error searching coins:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    if (newValue.trim()) {
      setIsOpen(true);
      searchCoins(newValue.trim());
    } else {
      setIsOpen(false);
      setResults([]);
    }
  };

  // Handle coin selection
  const handleCoinSelect = async (searchResult: any) => {
    try {
      // Get full coin data
      const coinData = await CoinGeckoAPI.getCoinDetails(searchResult.id);
      onCoinSelect(coinData);
      setIsOpen(false);
      setQuery('');
    } catch (error) {
      console.error('Error fetching coin details:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search cryptocurrencies..."
          className="w-full pl-12 pr-12 py-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <GlassCard className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <LoadingState message="Searching..." size="sm" />
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleCoinSelect(result)}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <img
                        src={result.thumb}
                        alt={result.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-coin.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {result.name}
                        </div>
                        <div className="text-sm text-gray-400 uppercase">
                          {result.symbol}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        #{result.market_cap_rank || 'N/A'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="p-4 text-center text-gray-400">
                  No cryptocurrencies found for "{query}"
                </div>
              ) : null}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
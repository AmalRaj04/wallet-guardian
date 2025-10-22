'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchBar({ onCoinSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const searchCoins = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSuggestions(data.coins?.slice(0, 5) || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCoinDetails = useCallback(async (coinId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch coin details');
      }
      const coinData = await response.json();
      return coinData;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      toast.error('Failed to load coin details');
      return null;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCoins(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCoins]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoinSelect = async (coin) => {
    const coinDetails = await fetchCoinDetails(coin.id);
    if (coinDetails) {
      onCoinSelect(coinDetails);
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl">
        <div className="flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none font-[family-name:Inter]"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (searchTerm || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-2xl z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((coin) => (
              <button
                key={coin.id}
                onClick={() => handleCoinSelect(coin)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 flex items-center space-x-3"
              >
                <img
                  src={coin.large}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{coin.name}</div>
                  <div className="text-gray-400 text-sm uppercase">{coin.symbol}</div>
                </div>
                <div className="text-gray-400 text-sm">#{coin.market_cap_rank || 'N/A'}</div>
              </button>
            ))
          ) : searchTerm ? (
            <div className="px-4 py-3 text-center text-gray-400">
              No results found for "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
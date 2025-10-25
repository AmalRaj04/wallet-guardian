"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { CoinGeckoAPI } from "@/lib/coingecko";
import { Coin } from "@/types";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCoinSelect: (coin: Coin) => void;
}

export default function SearchBar({
  value,
  onChange,
  onCoinSelect,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for coins
  const searchCoins = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await CoinGeckoAPI.searchCoins(query);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error("Error searching coins:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

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

      // Convert to our Coin type
      const coin: Coin = {
        id: coinData.id,
        symbol: coinData.symbol,
        name: coinData.name,
        image:
          typeof coinData.image === "string"
            ? coinData.image
            : coinData.image?.large || coinData.image?.small || "",
        current_price: coinData.market_data?.current_price?.usd || 0,
        market_cap: coinData.market_data?.market_cap?.usd || 0,
        market_cap_rank: coinData.market_cap_rank || 0,
        total_volume: coinData.market_data?.total_volume?.usd || 0,
        high_24h: coinData.market_data?.high_24h?.usd || 0,
        low_24h: coinData.market_data?.low_24h?.usd || 0,
        price_change_24h: coinData.market_data?.price_change_24h || 0,
        price_change_percentage_24h:
          coinData.market_data?.price_change_percentage_24h || 0,
        circulating_supply: coinData.market_data?.circulating_supply || 0,
        total_supply: coinData.market_data?.total_supply || 0,
        max_supply: coinData.market_data?.max_supply || 0,
        ath: coinData.market_data?.ath?.usd || 0,
        ath_change_percentage:
          coinData.market_data?.ath_change_percentage?.usd || 0,
        ath_date: coinData.market_data?.ath_date?.usd || "",
        atl: coinData.market_data?.atl?.usd || 0,
        atl_change_percentage:
          coinData.market_data?.atl_change_percentage?.usd || 0,
        atl_date: coinData.market_data?.atl_date?.usd || "",
        last_updated: coinData.last_updated || new Date().toISOString(),
      };

      onCoinSelect(coin);
      setIsOpen(false);
      onChange("");
    } catch (error) {
      console.error("Error fetching coin details:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Search cryptocurrencies..."
          className="w-full pl-12 pr-12 py-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/20 transition-all duration-300"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
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
            <InteractiveGlassCard
              className="max-h-96 overflow-y-auto"
              enableParticles={true}
              enableTilt={true}
              enableMagnetism={false}
              enableBorderGlow={true}
              clickEffect={true}
              particleCount={8}
              glowColor="132, 0, 255"
            >
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
                          (e.target as HTMLImageElement).src =
                            "/placeholder-coin.png";
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
                        #{result.market_cap_rank || "N/A"}
                      </div>
                    </button>
                  ))}
                </div>
              ) : value.length >= 2 ? (
                <div className="p-4 text-center text-gray-400">
                  No cryptocurrencies found for "{value}"
                </div>
              ) : null}
            </InteractiveGlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

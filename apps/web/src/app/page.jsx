"use client";
import { useState } from "react";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TrendingCoins from "@/components/TrendingCoins";
import CoinDetails from "@/components/CoinDetails";
import AIAnalysis from "@/components/AIAnalysis";

export default function HomePage() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const backgroundPattern =
    "data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E";

  return (
    <div className={`${isDarkMode ? "dark" : ""} transition-all duration-500`}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url("${backgroundPattern}")` }}
        ></div>

        <div className="relative z-10">
          <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

          <main className="container mx-auto px-4 py-8 space-y-8">
            {/* Search Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-[family-name:Space_Grotesk]">
                  CoinScope
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto font-[family-name:Inter]">
                  Explore cryptocurrencies with AI-powered insights and
                  real-time data
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <SearchBar onCoinSelect={setSelectedCoin} />
              </div>
            </div>

            {/* Selected Coin Details */}
            {selectedCoin && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CoinDetails coin={selectedCoin} />
                </div>
                <div className="lg:col-span-1">
                  <AIAnalysis coin={selectedCoin} />
                </div>
              </div>
            )}

            {/* Trending Coins */}
            <TrendingCoins onCoinSelect={setSelectedCoin} />
          </main>
        </div>

        <Toaster position="top-right" theme={isDarkMode ? "dark" : "light"} />
      </div>
    </div>
  );
}

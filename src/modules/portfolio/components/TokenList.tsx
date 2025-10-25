"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Shield,
  RefreshCw,
  Repeat,
  DollarSign,
  ChevronRight,
  Info,
} from "lucide-react";
import { useAccount } from "wagmi";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import SwapModal from "@/components/SwapModal";
import { Token } from "@/types";
import { usePortfolioRisk } from "@/hooks/usePortfolioRisk";
import { formatCurrency } from "@/lib/utils";

interface TokenListProps {
  tokens: Token[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

type SortField = "value" | "change" | "name" | "risk";
type SortOrder = "asc" | "desc";
type SwapType = "sell" | "pyusd";

export default function TokenList({
  tokens,
  onRefresh,
  isLoading,
}: TokenListProps) {
  const [sortBy, setSortBy] = useState<SortField>("value");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapType, setSwapType] = useState<SwapType>("sell");
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const { getTokenRisk, isCalculating } = usePortfolioRisk(tokens);
  const { address } = useAccount();

  const sortedTokens = useMemo(() => {
    return [...tokens].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "value":
          comparison = (a.value || 0) - (b.value || 0);
          break;
        case "change":
          comparison = (a.change24h || 0) - (b.change24h || 0);
          break;
        case "name":
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        case "risk":
          const riskA = getTokenRisk(a.address)?.overall || 0;
          const riskB = getTokenRisk(b.address)?.overall || 0;
          comparison = riskA - riskB;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [tokens, sortBy, sortOrder, getTokenRisk]);

  const handleSort = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("desc");
      return field;
    });
  }, []);

  const openSwap = useCallback((token: Token, type: SwapType) => {
    setSelectedToken(token);
    setSwapType(type);
    setSwapModalOpen(true);
  }, []);

  const closeSwap = useCallback(() => {
    setSwapModalOpen(false);
    setSelectedToken(null);
  }, []);

  const RiskBadge = useCallback(
    ({ tokenAddress }: { tokenAddress: string }) => {
      const risk = getTokenRisk(tokenAddress);

      if (!risk || isCalculating) {
        return (
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Analyzing...</span>
          </div>
        );
      }

      const visibleBadges = risk.badges.slice(0, 2);
      const remainingCount = risk.badges.length - 2;

      return (
        <div className="flex items-center gap-1 flex-wrap">
          {visibleBadges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                badge.color === "green"
                  ? "bg-green-500/20 text-green-400"
                  : badge.color === "yellow"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}
              title={badge.description}
            >
              {badge.icon}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs text-gray-400 px-1">
              +{remainingCount}
            </span>
          )}
        </div>
      );
    },
    [getTokenRisk, isCalculating]
  );

  const RiskIndicator = useCallback(
    ({ tokenAddress }: { tokenAddress: string }) => {
      const risk = getTokenRisk(tokenAddress);

      if (!risk || isCalculating) {
        return (
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
        );
      }

      const colorClasses = {
        green: "bg-green-500 text-green-400",
        yellow: "bg-yellow-500 text-yellow-400",
        orange: "bg-orange-500 text-orange-400",
        red: "bg-red-500 text-red-400",
      };

      const colors = colorClasses[risk.color] || colorClasses.red;
      const [bgColor, textColor] = colors.split(" ");

      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${bgColor} rounded-full`} />
          <span className={`text-xs font-semibold ${textColor}`}>
            {Math.round(risk.overall)}
          </span>
        </div>
      );
    },
    [getTokenRisk, isCalculating]
  );

  const SortButton = ({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 hover:text-white transition-colors ${className}`}
    >
      {children}
      <ArrowUpDown className="w-3 h-3 opacity-50" />
    </button>
  );

  if (tokens.length === 0) {
    return (
      <InteractiveGlassCard
        className="p-12 text-center"
        enableParticles={true}
        enableTilt={false}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        glowColor="132, 0, 255"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Tokens Found</h3>
          <p className="text-gray-400">
            Connect your wallet to view your assets
          </p>
        </motion.div>
      </InteractiveGlassCard>
    );
  }

  return (
    <>
      <InteractiveGlassCard
        className="p-4 md:p-6"
        enableParticles={true}
        enableTilt={false}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        glowColor="132, 0, 255"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-space-grotesk font-bold">Your Assets</h2>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Refresh tokens"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-sm text-gray-400 font-medium">
          <div className="col-span-3">
            <SortButton field="name">Asset</SortButton>
          </div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">
            <SortButton field="value" className="ml-auto">
              Value
            </SortButton>
          </div>
          <div className="col-span-2 text-right">
            <SortButton field="change" className="ml-auto">
              24h Change
            </SortButton>
          </div>
          <div className="col-span-1 flex items-center justify-end gap-2">
            <SortButton field="risk" className="text-right">
              <Shield className="w-3 h-3" />
            </SortButton>
            <span className="text-xs ml-1">Actions</span>
          </div>
        </div>

        {/* Token List */}
        <div className="space-y-2 mt-4">
          <AnimatePresence mode="popLayout">
            {sortedTokens.map((token, index) => {
              const isExpanded = expandedToken === token.address;

              return (
                <motion.div
                  key={token.address}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: index * 0.03,
                    layout: { duration: 0.3 },
                  }}
                  className="group"
                >
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 p-4 hover:bg-white/5 rounded-lg transition-all duration-200 hover:-translate-y-1">
                    {/* Asset Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.name}
                          className="w-10 h-10 rounded-full ring-2 ring-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold ring-2 ring-white/10">
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {token.name}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span>{token.symbol}</span>
                          <RiskBadge tokenAddress={token.address} />
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="col-span-2 text-right flex flex-col justify-center">
                      <div className="font-semibold">
                        {token.balanceFormatted.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {token.symbol}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-right flex items-center justify-end">
                      <div className="font-semibold">
                        {token.price ? formatCurrency(token.price) : "—"}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="col-span-2 text-right flex items-center justify-end">
                      <div className="font-semibold text-lg">
                        {token.value ? formatCurrency(token.value) : "—"}
                      </div>
                    </div>

                    {/* 24h Change */}
                    <div className="col-span-2 text-right flex items-center justify-end">
                      {token.change24h !== undefined ? (
                        <div
                          className={`flex items-center gap-1 font-semibold ${
                            token.change24h >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {token.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(2)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    {/* Risk & Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <RiskIndicator tokenAddress={token.address} />

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSwap(token, "pyusd");
                          }}
                          className="p-1.5 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue rounded-lg transition-all"
                          title="Convert to PYUSD"
                          aria-label="Convert to PYUSD"
                        >
                          <Repeat className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSwap(token, "sell");
                          }}
                          className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
                          title="Sell Token"
                          aria-label="Sell token"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="lg:hidden">
                    <div
                      className="p-4 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                      onClick={() =>
                        setExpandedToken(isExpanded ? null : token.address)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {token.logo ? (
                            <img
                              src={token.logo}
                              alt={token.name}
                              className="w-10 h-10 rounded-full ring-2 ring-white/10 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold ring-2 ring-white/10 flex-shrink-0">
                              {token.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">
                              {token.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {token.symbol}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">
                              {token.value ? formatCurrency(token.value) : "—"}
                            </div>
                            {token.change24h !== undefined && (
                              <div
                                className={`text-sm ${
                                  token.change24h >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {token.change24h >= 0 ? "+" : ""}
                                {token.change24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Balance</span>
                                <span className="font-semibold">
                                  {token.balanceFormatted.toFixed(4)}{" "}
                                  {token.symbol}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Price</span>
                                <span className="font-semibold">
                                  {token.price
                                    ? formatCurrency(token.price)
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-400">
                                  Risk Score
                                </span>
                                <RiskIndicator tokenAddress={token.address} />
                              </div>
                              <div className="flex justify-between text-sm items-start">
                                <span className="text-gray-400">
                                  Risk Badges
                                </span>
                                <RiskBadge tokenAddress={token.address} />
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSwap(token, "pyusd");
                                  }}
                                  className="flex-1 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <Repeat className="w-4 h-4" />
                                  <span>Convert to PYUSD</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSwap(token, "sell");
                                  }}
                                  className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  <span>Sell</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </InteractiveGlassCard>

      {/* Swap Modal */}
      {selectedToken && (
        <SwapModal
          isOpen={swapModalOpen}
          onClose={closeSwap}
          fromToken={selectedToken}
          toToken={swapType === "pyusd" ? "PYUSD" : "USDC"}
          walletAddress={address}
          swapType={swapType === "pyusd" ? "convert" : "sell"}
        />
      )}
    </>
  );
}

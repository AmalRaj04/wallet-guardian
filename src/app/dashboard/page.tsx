"use client";

import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  AlertTriangle,
  Shield,
  Coins,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface TokenBalance {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  value: string;
  token_type: string;
}

interface Transaction {
  hash: string;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  } | null;
  value: string;
  timestamp: string;
  status: string;
  method: string;
}

interface NFT {
  token: {
    name: string;
    symbol: string;
  };
  id: string;
  image_url: string | null;
}

interface WalletData {
  totalValue: number;
  weeklyChange: number;
  tokenBalances: TokenBalance[];
  transactions: Transaction[];
  nfts: NFT[];
  approvals: number;
  riskScore: string;
}

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "approvals">(
    "tokens"
  );
  const [ethPrice, setEthPrice] = useState(2500); // Default ETH price
  const [mounted, setMounted] = useState(false);

  // Get Blockscout API URL based on chain
  const getBlockscoutUrl = useCallback(() => {
    if (chain?.id === 1) {
      return (
        process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ||
        "https://eth.blockscout.com/api/v2"
      );
    } else if (chain?.id === 11155111) {
      return (
        process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ||
        "https://eth-sepolia.blockscout.com/api/v2"
      );
    }
    // Default to Sepolia if chain not recognized
    return (
      process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ||
      "https://eth-sepolia.blockscout.com/api/v2"
    );
  }, [chain]);

  const fetchWalletData = useCallback(
    async (walletAddress: string) => {
      setLoading(true);
      try {
        const blockscoutUrl = getBlockscoutUrl();

        // Fetch ETH price from CoinGecko
        const priceResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const priceData = await priceResponse.json();
        const currentEthPrice = priceData.ethereum?.usd || 2500;
        setEthPrice(currentEthPrice);

        // Fetch address info
        const addressResponse = await fetch(
          `${blockscoutUrl}/addresses/${walletAddress}`
        );
        const addressData = await addressResponse.json();

        // Fetch token balances
        const tokensResponse = await fetch(
          `${blockscoutUrl}/addresses/${walletAddress}/token-balances`
        );
        const tokensData = await tokensResponse.json();

        // Fetch recent transactions
        const txResponse = await fetch(
          `${blockscoutUrl}/addresses/${walletAddress}/transactions?filter=to%20%7C%20from`
        );
        const txData = await txResponse.json();

        // Fetch NFTs
        const nftResponse = await fetch(
          `${blockscoutUrl}/addresses/${walletAddress}/nft?type=ERC-721,ERC-404,ERC-1155`
        );
        const nftData = await nftResponse.json();

        // Calculate total value
        const ethBalance = parseFloat(addressData.coin_balance || "0") / 1e18;
        let totalValue = ethBalance * currentEthPrice;

        // Add token values (simplified - in production, fetch real prices)
        const tokenBalances = tokensData || [];
        tokenBalances.forEach((token: TokenBalance) => {
          const balance =
            parseFloat(token.value) /
            Math.pow(10, parseInt(token.token.decimals));
          // For demo purposes, we'll assign approximate values based on token symbols
          if (token.token.symbol === "USDC" || token.token.symbol === "USDT") {
            totalValue += balance;
          } else if (token.token.symbol === "UNI") {
            totalValue += balance * 5; // Approximate UNI price
          }
        });

        // Mock weekly change (in production, calculate from historical data)
        const weeklyChange = (Math.random() - 0.3) * 10;

        // Count approvals (simplified)
        const approvals = Math.floor(Math.random() * 12) + 3;

        // Calculate risk score
        const riskScore =
          approvals > 10 ? "Medium" : approvals > 5 ? "Low" : "Very Low";

        setWalletData({
          totalValue,
          weeklyChange,
          tokenBalances: tokenBalances.slice(0, 10),
          transactions: txData.items?.slice(0, 10) || [],
          nfts: nftData.items?.slice(0, 20) || [],
          approvals,
          riskScore,
        });
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    },
    [getBlockscoutUrl]
  );

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }

    if (address) {
      fetchWalletData(address);
    }
  }, [address, isConnected, router, fetchWalletData]);

  // mark mounted to ensure certain client-only computations (dates, randoms)
  // don't cause server/client HTML mismatches during hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR the component should render the same HTML as initial client
  // to avoid hydration mismatch. We show the same deterministic loading
  // placeholder until the component has mounted on the client.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading wallet data...</p>
        </motion.div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading wallet data...</p>
        </motion.div>
      </div>
    );
  }

  const approvalWarnings =
    walletData?.approvals && walletData.approvals > 5
      ? walletData.approvals - 5
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Total Value Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Value</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">
              $
              {walletData?.totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`text-sm ${
                walletData?.weeklyChange && walletData.weeklyChange >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {walletData?.weeklyChange && walletData.weeklyChange >= 0
                ? "+"
                : ""}
              {walletData?.weeklyChange.toFixed(2)}% this week
            </div>
          </div>

          {/* Active Approvals Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Approvals</span>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {walletData?.approvals}
            </div>
            <div className="text-sm text-orange-400">
              {approvalWarnings} require review
            </div>
          </div>

          {/* Risk Score Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Risk Score</span>
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {walletData?.riskScore}
            </div>
            <div className="text-sm text-green-400">No critical threats</div>
          </div>
        </motion.div>

        {/* Wallet Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Wallet Portfolio</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "tokens"
                  ? "bg-slate-700/70 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Coins className="w-4 h-4" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab("nfts")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "nfts"
                  ? "bg-slate-700/70 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              NFTs
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "approvals"
                  ? "bg-slate-700/70 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Approvals
            </button>
          </div>

          {/* Tokens Tab */}
          {activeTab === "tokens" && (
            <div className="space-y-3">
              {walletData?.tokenBalances &&
              walletData.tokenBalances.length > 0 ? (
                walletData.tokenBalances.map((token, index) => {
                  const balance =
                    parseFloat(token.value) /
                    Math.pow(10, parseInt(token.token.decimals));
                  const symbol = token.token.symbol;
                  let usdValue = 0;
                  let changePercent = 0;

                  // Mock values for demo
                  if (symbol === "USDC" || symbol === "USDT") {
                    usdValue = balance;
                    changePercent = 0;
                  } else if (symbol === "UNI") {
                    usdValue = balance * 5;
                    changePercent = 12.4;
                  } else {
                    usdValue = balance * 0.5;
                    changePercent = -5.2;
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Coins className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {token.token.name}
                          </div>
                          <div className="text-sm text-gray-400">{symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          $
                          {usdValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-sm ${
                            changePercent >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {changePercent >= 0 ? "+" : ""}
                          {changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No tokens found
                </div>
              )}
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === "nfts" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {walletData?.nfts && walletData.nfts.length > 0 ? (
                walletData.nfts.map((nft, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/30 rounded-xl overflow-hidden hover:bg-slate-900/50 transition-all"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                      {nft.image_url ? (
                        <Image
                          src={nft.image_url}
                          alt={nft.token.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm truncate">
                        {nft.token.name}
                      </div>
                      <div className="text-xs text-gray-400">#{nft.id}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No NFTs found
                </div>
              )}
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400 mb-4">
                Active token approvals allow contracts to spend your tokens.
                Review regularly.
              </div>
              {[...Array(walletData?.approvals || 0)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Contract {index + 1}</div>
                      <div className="text-sm text-gray-400">
                        Unlimited approval
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm">
                    Revoke
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              walletData.transactions.map((tx, index) => {
                const isIncoming =
                  tx.to?.hash.toLowerCase() === address.toLowerCase();
                const value = parseFloat(tx.value) / 1e18;
                const usdValue = value * ethPrice;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isIncoming ? "bg-green-500/20" : "bg-blue-500/20"
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {isIncoming ? "From" : "To"}{" "}
                            {isIncoming
                              ? tx.from.hash.slice(0, 10)
                              : tx.to?.hash.slice(0, 10) || "Contract"}
                            ...
                          </span>
                          <a
                            href={`https://eth-sepolia.blockscout.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
                          </a>
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {relativeTimeFromISOString(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          isIncoming ? "text-green-400" : "text-white"
                        }`}
                      >
                        {isIncoming ? "+" : ""}
                        {value.toFixed(4)} ETH
                      </div>
                      <div
                        className={`text-sm ${
                          tx.status === "ok"
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                      >
                        ${usdValue.toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Client-only helper to format relative time so server render stays deterministic
function relativeTimeFromISOString(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  } catch {
    return "";
  }
}

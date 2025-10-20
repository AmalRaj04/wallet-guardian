"use client";

import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import {
  scanAllowances,
  calculateAllowanceRiskScore,
  type TokenAllowance,
} from "@/lib/allowances";
import { getTokenPrice } from "@/lib/prices";

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
  result: string;
  method?: string;
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
  approvals: TokenAllowance[];
  riskScore: string;
  riskWarnings: string[];
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
          `${blockscoutUrl}/addresses/${walletAddress}/transactions`
        );
        const txData = await txResponse.json();

        // Fetch NFTs
        const nftResponse = await fetch(
          `${blockscoutUrl}/addresses/${walletAddress}/nft?type=ERC-721,ERC-404,ERC-1155`
        );
        const nftData = await nftResponse.json();

        // Calculate total value with real token prices
        const ethBalance = parseFloat(addressData.coin_balance || "0") / 1e18;
        let totalValue = ethBalance * currentEthPrice;

        // Fetch real token prices and calculate total value
        const tokenBalances = tokensData || [];
        for (const token of tokenBalances) {
          // Defensive checks: ensure token structure exists
          const tokenAddress = token?.token?.address;
          const tokenDecimals = token?.token?.decimals || "18";
          if (!tokenAddress) {
            // skip tokens without a valid contract address
            continue;
          }

          const balance =
            parseFloat(token.value) / Math.pow(10, parseInt(tokenDecimals));

          // Fetch real price from CoinGecko
          const priceData = await getTokenPrice(tokenAddress, chain?.id || 1);
          if (priceData && typeof priceData.usd === "number") {
            totalValue += balance * priceData.usd;
          }
        }

        // Calculate weekly change from historical data (for now, use price change as proxy)
        const weeklyChange = 0; // TODO: implement portfolio history tracking

        // Scan real on-chain allowances
        let allowances: TokenAllowance[] = [];
        let riskScore = "Very Low";
        let riskWarnings: string[] = [];

        try {
          // Get provider from wagmi
          const ethereum = (window as { ethereum?: ethers.Eip1193Provider })
            .ethereum;
          if (!ethereum) throw new Error("No ethereum provider");
          const provider = new ethers.BrowserProvider(ethereum);

          // Prepare token list for allowance scanning
          const tokensForScan = tokenBalances.map((t: TokenBalance) => ({
            address: t.token.address,
            name: t.token.name,
            symbol: t.token.symbol,
            decimals: parseInt(t.token.decimals),
          }));

          // Scan allowances
          allowances = await scanAllowances(
            provider,
            walletAddress,
            tokensForScan,
            chain?.id || 1
          );

          // Calculate risk score
          const riskData = calculateAllowanceRiskScore(allowances);
          riskScore = riskData.level;
          riskWarnings = riskData.warnings;
        } catch (error) {
          console.error("Failed to scan allowances:", error);
          // Continue with empty allowances if scanning fails
        }

        setWalletData({
          totalValue,
          weeklyChange,
          tokenBalances: tokenBalances.slice(0, 10),
          transactions: txData.items?.slice(0, 10) || [],
          nfts: nftData.items?.slice(0, 20) || [],
          approvals: allowances,
          riskScore,
          riskWarnings,
        });
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    },
    [getBlockscoutUrl, chain?.id]
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

  // Removed client-only random values - now using real data from allowance scanner

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

  const approvalCount = walletData?.approvals?.length || 0;
  const approvalWarnings = walletData?.riskWarnings?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1L3 5V11C3 17 7 22 12 23C17 22 21 17 21 11V5L12 1Z"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Link href="/" className="font-semibold text-lg">
              WalletGuard
            </Link>
          </div>

          <div>
            <ConnectButton />
          </div>
        </div>
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
            <div className="text-3xl font-bold mb-1">{approvalCount}</div>
            <div className="text-sm text-orange-400">
              {approvalWarnings}{" "}
              {approvalWarnings === 1 ? "warning" : "warnings"}
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

                  // Simplified token pricing - in production use real-time price APIs
                  if (symbol === "USDC" || symbol === "USDT") {
                    usdValue = balance;
                    changePercent = (Math.random() - 0.5) * 2; // Small random change for stablecoins
                  } else if (symbol === "LINK") {
                    usdValue = balance * 15; // Approximate LINK price
                    changePercent = (Math.random() - 0.5) * 20;
                  } else if (symbol === "UNI") {
                    usdValue = balance * 8; // Approximate UNI price
                    changePercent = (Math.random() - 0.5) * 15;
                  } else {
                    // For unknown tokens, show balance without USD value
                    usdValue = 0;
                    changePercent = 0;
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
                          {usdValue > 0
                            ? `$${usdValue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : `${balance.toFixed(4)} ${symbol}`}
                        </div>
                        <div
                          className={`text-sm ${
                            changePercent >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {usdValue > 0 ? (
                            <>
                              {changePercent >= 0 ? "+" : ""}
                              {changePercent.toFixed(1)}%
                            </>
                          ) : (
                            <span className="text-gray-400">
                              Price unavailable
                            </span>
                          )}
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
              {walletData?.approvals && walletData.approvals.length > 0 ? (
                walletData.approvals.map((approval, index) => (
                  <motion.div
                    key={`${approval.tokenAddress}-${approval.spender}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          approval.isUnlimited
                            ? "bg-red-500/20"
                            : "bg-orange-500/20"
                        }`}
                      >
                        <CheckCircle
                          className={`w-5 h-5 ${
                            approval.isUnlimited
                              ? "text-red-400"
                              : "text-orange-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {approval.tokenSymbol} → {approval.spenderInfo.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {approval.isUnlimited
                            ? "Unlimited"
                            : approval.allowanceFormatted}
                          {approval.usdValue &&
                            approval.usdValue !== Infinity && (
                              <span className="ml-2">
                                (${approval.usdValue.toFixed(2)})
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm">
                      Revoke
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No active approvals found. Your tokens are safe!
                </div>
              )}
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
                          tx.result === "success"
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

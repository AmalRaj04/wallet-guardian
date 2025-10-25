"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { useAccount } from "wagmi";
import InteractiveGlassCard from "@/components/ui/InteractiveGlassCard";
import { Token, TokenAllowance } from "@/types";
import { AlchemyAPI } from "@/lib/alchemy";
import { HardhatAnalyzer } from "@/lib/hardhat-analyzer";
import { useRealTimeMonitoring } from "@/hooks/useRealTimeMonitoring";
// Lit Protocol integration for revoking approvals
// import LitProtocol from '@/lib/lit-protocol';
import toast from "react-hot-toast";
import { ethers } from "ethers";

interface TokenAllowancesProps {
  tokens: Token[];
  walletAddress?: string;
}

export default function TokenAllowances({
  tokens,
  walletAddress,
}: TokenAllowancesProps) {
  const { chain } = useAccount();
  const { incrementDemoMetrics, addMempoolTransaction } =
    useRealTimeMonitoring();
  const [allowances, setAllowances] = useState<TokenAllowance[]>([]);
  const [previousAllowances, setPreviousAllowances] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [selectedAllowances, setSelectedAllowances] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (walletAddress && tokens.length > 0) {
      fetchAllowances();
    }
  }, [walletAddress, tokens]);

  const fetchAllowances = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Use ethers v5 syntax
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const allAllowances: TokenAllowance[] = [];

      // Common spender addresses (DEXes, protocols)
      const commonSpenders = [
        {
          address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          name: "Uniswap V2 Router",
        },
        {
          address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
          name: "Uniswap V3 Router",
        },
        {
          address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
          name: "Uniswap Universal Router",
        },
        {
          address: "0x1111111254EEB25477B68fb85Ed929f73A960582",
          name: "1inch V5 Router",
        },
        {
          address: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
          name: "0x Exchange Proxy",
        },
        {
          address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
          name: "Uniswap Universal Router 2",
        },
      ];

      for (const token of tokens.slice(0, 20)) {
        // Limit to first 20 tokens
        for (const spender of commonSpenders) {
          try {
            const allowanceHex = await AlchemyAPI.getTokenAllowances(
              walletAddress,
              token.address,
              spender.address,
              chain?.id
            );

            // Handle empty or invalid hex values
            if (
              !allowanceHex ||
              allowanceHex === "0x" ||
              allowanceHex === "0x0"
            ) {
              continue; // Skip if no allowance
            }

            const allowanceValue = BigInt(allowanceHex);

            if (allowanceValue > BigInt(0)) {
              const allowanceFormatted =
                Number(allowanceValue) / Math.pow(10, token.decimals);
              const maxUint256 = BigInt(
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
              );
              const isUnlimited = allowanceValue >= maxUint256 / BigInt(2);

              // Analyze risk
              const riskAnalysis = HardhatAnalyzer.analyzeApprovalRisk(
                allowanceValue.toString(),
                token.balance
              );

              const allowance: TokenAllowance = {
                spender: spender.address,
                spenderName: spender.name,
                token,
                allowance: allowanceValue.toString(),
                allowanceFormatted,
                isUnlimited,
                lastUpdated: new Date(),
                riskLevel: riskAnalysis.riskLevel,
              };

              allAllowances.push(allowance);
            }
          } catch (error) {
            console.error(
              `Error fetching allowance for ${token.symbol} on ${spender.name}:`,
              error
            );
          }
        }
      }

      // Detect new approvals and add to mempool monitor
      const currentApprovalKeys = new Set(
        allAllowances.map((a) => `${a.token.address}-${a.spender}`)
      );

      allAllowances.forEach((allowance) => {
        const key = `${allowance.token.address}-${allowance.spender}`;

        // If this is a new approval (not in previous set)
        if (!previousAllowances.has(key)) {
          // Add to mempool monitor
          addMempoolTransaction({
            hash: "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"),
            from: walletAddress || "",
            to: allowance.token.address,
            value: "0x0",
            gasPrice: "0x0",
            gasLimit: "0x0",
            data: "0x095ea7b3", // approve function signature
            timestamp: new Date(),
            riskLevel: allowance.isUnlimited ? "high" : "medium",
            threatType: allowance.isUnlimited ? "suspicious" : undefined,
          });
        }
      });

      // Update previous allowances set
      setPreviousAllowances(currentApprovalKeys);

      setAllowances(allAllowances);

      // No toast notification - just update the list silently
    } catch (error) {
      console.error("Error fetching allowances:", error);
      toast.error("Failed to fetch token allowances");
    } finally {
      setLoading(false);
    }
  };

  const revokeAllowance = async (allowance: TokenAllowance) => {
    if (!walletAddress) return;

    setRevoking(allowance.spender + allowance.token.address);

    try {
      // Use ethers v5 syntax
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();

      // ERC-20 approve function to set allowance to 0
      const tokenContract = new ethers.Contract(
        allowance.token.address,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      const tx = await tokenContract.approve(allowance.spender, 0);

      toast.loading("Revoking approval...", { id: "revoke" });

      await tx.wait();

      toast.success(`Revoked approval for ${allowance.token.symbol}`, {
        id: "revoke",
      });

      // Increment threats blocked counter for demo video
      incrementDemoMetrics();

      // Remove from list
      setAllowances((prev) =>
        prev.filter(
          (a) =>
            !(
              a.spender === allowance.spender &&
              a.token.address === allowance.token.address
            )
        )
      );
    } catch (error: any) {
      console.error("Error revoking allowance:", error);
      toast.error(error.message || "Failed to revoke approval", {
        id: "revoke",
      });
    } finally {
      setRevoking(null);
    }
  };

  const revokeSelected = async () => {
    const selected = allowances.filter((a) =>
      selectedAllowances.has(a.spender + a.token.address)
    );

    for (const allowance of selected) {
      await revokeAllowance(allowance);
    }

    setSelectedAllowances(new Set());
  };

  const toggleSelection = (allowance: TokenAllowance) => {
    const key = allowance.spender + allowance.token.address;
    const newSelected = new Set(selectedAllowances);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedAllowances(newSelected);
  };

  const selectAll = () => {
    if (selectedAllowances.size === allowances.length) {
      setSelectedAllowances(new Set());
    } else {
      setSelectedAllowances(
        new Set(allowances.map((a) => a.spender + a.token.address))
      );
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  if (!walletAddress) {
    return (
      <InteractiveGlassCard
        className="p-12 text-center"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        glowColor="132, 0, 255"
      >
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
        <p className="text-gray-400">
          Connect your wallet to view token approvals
        </p>
      </InteractiveGlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Token Approvals</h2>
            <p className="text-gray-400 text-sm">
              Manage your ERC-20 token allowances
            </p>
          </div>
          <button
            onClick={fetchAllowances}
            disabled={loading}
            className="px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold">{allowances.length}</div>
            <div className="text-sm text-gray-400">Total Approvals</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {
                allowances.filter(
                  (a) => a.riskLevel === "critical" || a.riskLevel === "high"
                ).length
              }
            </div>
            <div className="text-sm text-gray-400">High Risk</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {allowances.filter((a) => a.isUnlimited).length}
            </div>
            <div className="text-sm text-gray-400">Unlimited</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {allowances.filter((a) => a.riskLevel === "low").length}
            </div>
            <div className="text-sm text-gray-400">Low Risk</div>
          </div>
        </div>
      </InteractiveGlassCard>

      {/* Bulk Actions */}
      {allowances.length > 0 && (
        <InteractiveGlassCard
          className="p-4"
          enableParticles={true}
          enableTilt={true}
          enableMagnetism={false}
          enableBorderGlow={true}
          clickEffect={true}
          particleCount={8}
          glowColor="132, 0, 255"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="text-sm text-neon-blue hover:underline"
              >
                {selectedAllowances.size === allowances.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {selectedAllowances.size > 0 && (
                <span className="text-sm text-gray-400">
                  {selectedAllowances.size} selected
                </span>
              )}
            </div>
            {selectedAllowances.size > 0 && (
              <button
                onClick={revokeSelected}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Revoke Selected
              </button>
            )}
          </div>
        </InteractiveGlassCard>
      )}

      {/* Allowances List */}
      <InteractiveGlassCard
        className="p-6"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
            <span className="ml-3">Loading approvals...</span>
          </div>
        ) : allowances.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Active Approvals</h3>
            <p className="text-gray-400">
              You don't have any active token approvals. This is good for
              security!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allowances.map((allowance, index) => {
              const key = allowance.spender + allowance.token.address;
              const isSelected = selectedAllowances.has(key);
              const isRevoking = revoking === key;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 ${getRiskColor(allowance.riskLevel)} ${
                    isSelected ? "ring-2 ring-neon-blue" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(allowance)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {allowance.token.logo && (
                            <img
                              src={allowance.token.logo}
                              alt={allowance.token.symbol}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-semibold">
                              {allowance.token.symbol}
                            </div>
                            <div className="text-sm text-gray-400">
                              {allowance.token.name}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs uppercase font-bold ${
                            allowance.riskLevel === "critical"
                              ? "bg-red-500 text-white"
                              : allowance.riskLevel === "high"
                                ? "bg-orange-500 text-white"
                                : allowance.riskLevel === "medium"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-green-500 text-white"
                          }`}
                        >
                          {allowance.riskLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Spender:</span>{" "}
                          <span className="font-mono">
                            {allowance.spenderName ||
                              allowance.spender.slice(0, 10) + "..."}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Allowance:</span>{" "}
                          <span
                            className={
                              allowance.isUnlimited
                                ? "text-red-400 font-bold"
                                : ""
                            }
                          >
                            {allowance.isUnlimited
                              ? "UNLIMITED"
                              : allowance.allowanceFormatted.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {allowance.isUnlimited && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded p-2 mb-3 text-sm">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Unlimited approval allows the spender to transfer any
                          amount of your tokens at any time
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => revokeAllowance(allowance)}
                      disabled={isRevoking}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isRevoking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Revoke
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </InteractiveGlassCard>

      {/* Info */}
      <InteractiveGlassCard
        className="p-6 bg-blue-500/5 border-blue-500/30"
        enableParticles={true}
        enableTilt={true}
        enableMagnetism={false}
        enableBorderGlow={true}
        clickEffect={true}
        particleCount={8}
        tiltIntensity={0.4}
        glowColor="132, 0, 255"
      >
        <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          About Token Approvals
        </h4>
        <p className="text-sm text-gray-300 mb-2">
          Token approvals allow smart contracts to spend your tokens on your
          behalf. While necessary for DeFi interactions, they can be risky if:
        </p>
        <ul className="text-sm text-gray-300 space-y-1 ml-4">
          <li>• The approval is unlimited (allows spending any amount)</li>
          <li>• The spender contract is unverified or malicious</li>
          <li>
            • You no longer use the protocol but the approval remains active
          </li>
        </ul>
        <p className="text-sm text-gray-300 mt-2">
          <strong>Best Practice:</strong> Revoke approvals you no longer need
          and avoid unlimited approvals when possible.
        </p>
      </InteractiveGlassCard>
    </div>
  );
}

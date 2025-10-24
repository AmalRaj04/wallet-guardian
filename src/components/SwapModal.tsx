"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowDown,
  AlertCircle,
  Loader2,
  DollarSign,
  Repeat,
  CheckCircle,
  Zap,
  ExternalLink,
} from "lucide-react";
import {
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Token } from "@/types";
import { OneInchService } from "@/lib/oneinch";
import { useOneInchSwap } from "@/hooks/useOneInchSwap";
import GlassCard from "@/components/ui/GlassCard";
import toast from "react-hot-toast";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken?: Token;
  toToken?: Token | "PYUSD" | "USDC";
  walletAddress?: string;
  swapType?: "sell" | "convert";
}

export default function SwapModal({
  isOpen,
  onClose,
  fromToken,
  toToken = "PYUSD",
  walletAddress,
  swapType = "convert",
}: SwapModalProps) {
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [step, setStep] = useState<"approve" | "swap">("approve");

  const chainId = useChainId();
  const {
    sendTransaction,
    data: hash,
    isPending,
    error: txError,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get target token
  const getTargetToken = (): Token => {
    if (swapType === "convert") {
      return OneInchService.getPYUSDToken();
    } else if (swapType === "sell") {
      return OneInchService.getUSDCToken();
    }
    if (typeof toToken === "string") {
      if (toToken === "PYUSD") return OneInchService.getPYUSDToken();
      return OneInchService.getUSDCToken();
    }
    return toToken as Token;
  };

  const targetToken = getTargetToken();

  // Use 1inch hook
  const {
    quote,
    isLoadingQuote,
    needsApproval,
    isCheckingApproval,
    error: swapError,
    getApprovalTx,
    prepareSwap,
  } = useOneInchSwap(fromToken || null, targetToken.address, amount, slippage);

  // Update step based on approval status
  useEffect(() => {
    setStep(needsApproval ? "approve" : "swap");
  }, [needsApproval]);

  // Validate amount
  const isAmountValid = () => {
    if (!amount || !fromToken) return false;
    const amountNum = parseFloat(amount);
    return amountNum > 0 && amountNum <= fromToken.balanceFormatted;
  };

  const getBalanceError = () => {
    if (!amount || !fromToken) return null;
    const amountNum = parseFloat(amount);
    if (amountNum > fromToken.balanceFormatted) {
      return `Insufficient balance. You have ${fromToken.balanceFormatted.toFixed(4)} ${fromToken.symbol}`;
    }
    return null;
  };

  // Handle approve
  const handleApprove = async () => {
    if (!fromToken || !walletAddress) return;

    try {
      toast.loading("Preparing approval...", { id: "approve" });

      const approvalTx = await getApprovalTx();

      toast.loading("Confirm approval in wallet...", { id: "approve" });

      sendTransaction({
        to: approvalTx.to as `0x${string}`,
        data: approvalTx.data as `0x${string}`,
        value: BigInt(approvalTx.value || "0"),
      });
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error?.message || "Failed to approve token", {
        id: "approve",
      });
    }
  };

  // Handle swap
  const handleSwap = async () => {
    if (!fromToken || !targetToken || !walletAddress) {
      toast.error("Missing required data for swap");
      return;
    }

    if (!isAmountValid()) {
      toast.error(getBalanceError() || "Invalid amount");
      return;
    }

    if (needsApproval && step === "approve") {
      await handleApprove();
      return;
    }

    try {
      toast.loading("Preparing swap...", { id: "swap" });

      const swapData = await prepareSwap();

      toast.loading("Confirm swap in wallet...", { id: "swap" });

      // Send transaction via 1inch
      sendTransaction({
        to: swapData.tx.to as `0x${string}`,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value || "0"),
        gas: BigInt(swapData.tx.gas),
      });
    } catch (error: any) {
      console.error("Swap error:", error);
      toast.error(error?.message || "Failed to execute swap", { id: "swap" });
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      if (step === "approve") {
        toast.success("Token approved! Now you can swap.", { id: "approve" });
        setStep("swap");
      } else {
        toast.success(
          `${swapType === "convert" ? "Conversion" : "Sale"} completed successfully!`,
          { id: "swap" }
        );
        onClose();
        setAmount("");
      }
    }
  }, [isSuccess, step, swapType, onClose]);

  // Handle transaction error
  useEffect(() => {
    if (txError) {
      const errorMsg = txError.message.includes("User rejected")
        ? "Transaction rejected by user"
        : `Transaction failed: ${txError.message}`;
      toast.error(errorMsg, { id: step === "approve" ? "approve" : "swap" });
    }
  }, [txError, step]);

  // Check PYUSD support
  const pyusdSupported = OneInchService.supportsPYUSD(chainId);
  const showPYUSDWarning = swapType === "convert" && !pyusdSupported;

  if (!isOpen || !fromToken) return null;

  const balanceError = getBalanceError();
  const modalTitle = swapType === "convert" ? "Convert to PYUSD" : "Sell Token";
  const modalIcon =
    swapType === "convert" ? (
      <Repeat className="w-6 h-6 text-neon-blue" />
    ) : (
      <DollarSign className="w-6 h-6 text-green-400" />
    );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {modalIcon}
                <h2 className="text-2xl font-space-grotesk font-bold">
                  {modalTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1inch Badge */}
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-neon-blue" />
              <span>Powered by 1inch - Best rates across all DEXs</span>
            </div>

            {/* PYUSD Warning */}
            {showPYUSDWarning && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-400">
                    <div className="font-semibold mb-1">
                      PYUSD Not Available
                    </div>
                    <div>
                      PYUSD is only available on Ethereum Mainnet. Please switch
                      to Ethereum to convert to PYUSD.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicator */}
            {needsApproval && (
              <div className="mb-4 flex items-center justify-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    step === "approve"
                      ? "bg-neon-blue/20 text-neon-blue"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {step === "swap" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-current rounded-full" />
                  )}
                  <span className="text-sm font-medium">1. Approve</span>
                </div>
                <div className="w-8 h-0.5 bg-white/20" />
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    step === "swap"
                      ? "bg-neon-blue/20 text-neon-blue"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                  <span className="text-sm font-medium">2. Swap</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* From Token */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">From</span>
                  {fromToken && (
                    <button
                      onClick={() =>
                        setAmount(fromToken.balanceFormatted.toString())
                      }
                      className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
                    >
                      Balance: {fromToken.balanceFormatted.toFixed(4)}
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {fromToken && (
                    <div className="flex items-center space-x-2">
                      {fromToken.logo ? (
                        <img
                          src={fromToken.logo}
                          alt={fromToken.symbol}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {fromToken.symbol[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold">{fromToken.symbol}</span>
                    </div>
                  )}
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    min="0"
                    max={fromToken?.balanceFormatted}
                    className="flex-1 bg-transparent text-right text-2xl font-bold outline-none"
                  />
                </div>
                {balanceError && (
                  <div className="mt-2 text-xs text-red-400">
                    {balanceError}
                  </div>
                )}
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ArrowDown className="w-5 h-5 text-neon-blue" />
                </div>
              </div>

              {/* To Token */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">To</span>
                  <span className="text-xs text-gray-500">
                    {swapType === "convert" ? "PayPal USD" : "USD Coin"}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {targetToken && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {targetToken.symbol[0]}
                        </span>
                      </div>
                      <span className="font-semibold">
                        {targetToken.symbol}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-right text-2xl font-bold">
                    {isLoadingQuote || isCheckingApproval ? (
                      <Loader2 className="w-6 h-6 animate-spin ml-auto" />
                    ) : quote ? (
                      quote.toAmount
                    ) : (
                      "0.0"
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              {quote && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact</span>
                    <span
                      className={
                        quote.priceImpact > 1
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {quote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Gas</span>
                    <span>{quote.estimatedGas} Gwei</span>
                  </div>
                  {quote.protocols.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Route</span>
                      <div className="text-right text-xs">
                        {quote.protocols.slice(0, 3).join(" → ")}
                        {quote.protocols.length > 3 &&
                          ` +${quote.protocols.length - 3}`}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slippage Tolerance</span>
                    <div className="flex items-center gap-2">
                      {[0.5, 1, 2].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSlippage(val)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            slippage === val
                              ? "bg-neon-blue/20 text-neon-blue"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {quote && quote.priceImpact > 5 && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-400">
                    High price impact! Consider reducing the swap amount.
                  </div>
                </div>
              )}

              {swapError && (
                <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="text-sm text-red-400">{swapError}</div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSwap}
                disabled={
                  !quote ||
                  isPending ||
                  isConfirming ||
                  !walletAddress ||
                  !isAmountValid() ||
                  !!balanceError ||
                  showPYUSDWarning ||
                  isLoadingQuote
                }
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {isPending
                        ? `Confirm ${step === "approve" ? "Approval" : "Swap"} in Wallet...`
                        : "Processing..."}
                    </span>
                  </div>
                ) : !walletAddress ? (
                  "Connect Wallet"
                ) : showPYUSDWarning ? (
                  "Switch to Ethereum Mainnet"
                ) : balanceError ? (
                  "Insufficient Balance"
                ) : !quote ? (
                  "Enter Amount"
                ) : needsApproval && step === "approve" ? (
                  `Approve ${fromToken.symbol}`
                ) : (
                  `${swapType === "convert" ? "Convert" : "Sell"} ${fromToken.symbol}`
                )}
              </button>

              {/* Notice */}
              <div className="text-xs text-center space-y-1 mt-2">
                <div className="text-gray-400">
                  🔒 Real on-chain{" "}
                  {swapType === "convert" ? "conversion" : "sale"} via 1inch
                </div>
                {needsApproval && step === "approve" && (
                  <div className="text-yellow-400/70">
                    ⚠️ Step 1: Approve token spending first
                  </div>
                )}
                <div className="text-gray-500 text-[10px] flex items-center justify-center gap-1">
                  <span>
                    Network:{" "}
                    {chainId === 1
                      ? "Ethereum Mainnet"
                      : chainId === 11155111
                        ? "Sepolia Testnet"
                        : `Chain ${chainId}`}
                  </span>
                  {hash && (
                    <>
                      <span>•</span>
                      <a
                        href={`https://${chainId === 1 ? "" : "sepolia."}etherscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:underline flex items-center gap-1"
                      >
                        View TX <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

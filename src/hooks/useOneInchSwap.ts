/**
 * React hook for 1inch swap functionality
 */

import { useState, useEffect, useCallback } from "react";
import { useChainId, useAccount } from "wagmi";
import { OneInchService, OneInchQuote, OneInchSwapData } from "@/lib/oneinch";
import { Token } from "@/types";
import { formatUnits } from "viem";

export interface SwapQuoteDisplay {
  toAmount: string;
  estimatedGas: string;
  protocols: string[];
  priceImpact: number;
}

export function useOneInchSwap(
  fromToken: Token | null,
  toTokenAddress: string | null,
  amount: string,
  slippage: number = 1
) {
  const chainId = useChainId();
  const { address } = useAccount();

  const [quote, setQuote] = useState<SwapQuoteDisplay | null>(null);
  const [swapData, setSwapData] = useState<OneInchSwapData | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingSwap, setIsLoadingSwap] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch quote (price info only)
   */
  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toTokenAddress || !amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    setError(null);

    try {
      const quoteData = await OneInchService.getQuote(
        chainId,
        fromToken,
        toTokenAddress,
        amount,
        slippage
      );

      // Calculate price impact (simplified)
      const fromValue = parseFloat(amount) * (fromToken.price || 0);
      const toAmount = parseFloat(formatUnits(BigInt(quoteData.toAmount), 6)); // Assuming 6 decimals for stablecoins
      const toValue = toAmount * 1.0; // Assuming $1 for stablecoins
      const priceImpact =
        fromValue > 0 ? ((fromValue - toValue) / fromValue) * 100 : 0;

      // Extract protocol names
      const protocols = quoteData.protocols
        .flat()
        .map((p: any) => p[0]?.name)
        .filter(Boolean);

      setQuote({
        toAmount: toAmount.toFixed(6),
        estimatedGas: (quoteData.estimatedGas / 1e9).toFixed(6), // Convert to Gwei
        protocols: [...new Set(protocols)],
        priceImpact: Math.abs(priceImpact),
      });
    } catch (err: any) {
      console.error("Error fetching quote:", err);
      setError(err.message || "Failed to fetch quote");
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [fromToken, toTokenAddress, amount, slippage, chainId]);

  /**
   * Check if approval is needed
   */
  const checkApproval = useCallback(async () => {
    if (!fromToken || !address || !amount || parseFloat(amount) <= 0) {
      setNeedsApproval(false);
      return;
    }

    setIsCheckingApproval(true);

    try {
      const needed = await OneInchService.needsApproval(
        chainId,
        fromToken.address,
        address,
        amount,
        fromToken.decimals
      );
      setNeedsApproval(needed);
    } catch (err: any) {
      console.error("Error checking approval:", err);
      setNeedsApproval(true); // Assume approval needed on error
    } finally {
      setIsCheckingApproval(false);
    }
  }, [fromToken, address, amount, chainId]);

  /**
   * Get approval transaction data
   */
  const getApprovalTx = useCallback(async () => {
    if (!fromToken) {
      throw new Error("No token selected");
    }

    return OneInchService.getApprovalTransaction(chainId, fromToken.address);
  }, [fromToken, chainId]);

  /**
   * Prepare swap transaction
   */
  const prepareSwap = useCallback(async () => {
    if (
      !fromToken ||
      !toTokenAddress ||
      !address ||
      !amount ||
      parseFloat(amount) <= 0
    ) {
      throw new Error("Missing required parameters");
    }

    setIsLoadingSwap(true);
    setError(null);

    try {
      const swapData = await OneInchService.getSwap(
        chainId,
        fromToken,
        toTokenAddress,
        amount,
        address,
        slippage
      );

      setSwapData(swapData);
      return swapData;
    } catch (err: any) {
      console.error("Error preparing swap:", err);
      setError(err.message || "Failed to prepare swap");
      throw err;
    } finally {
      setIsLoadingSwap(false);
    }
  }, [fromToken, toTokenAddress, address, amount, slippage, chainId]);

  /**
   * Auto-fetch quote when inputs change
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [fetchQuote]);

  /**
   * Auto-check approval when inputs change
   */
  useEffect(() => {
    checkApproval();
  }, [checkApproval]);

  return {
    quote,
    swapData,
    isLoadingQuote,
    isLoadingSwap,
    needsApproval,
    isCheckingApproval,
    error,
    fetchQuote,
    checkApproval,
    getApprovalTx,
    prepareSwap,
  };
}

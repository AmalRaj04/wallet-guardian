'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, AlertCircle, Loader2, DollarSign, Repeat, CheckCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseUnits } from 'viem';
import { Token, SwapQuote } from '@/types';
import { SwapService } from '@/lib/swap';
import { UniswapSwapService, UNISWAP_V3_ROUTER, UNISWAP_ROUTER_ABI, ERC20_ABI } from '@/lib/uniswap-swap';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken?: Token;
  toToken?: Token | 'PYUSD' | 'USDC';
  walletAddress?: string;
  swapType?: 'sell' | 'convert';
}

export default function SwapModal({
  isOpen,
  onClose,
  fromToken,
  toToken = 'PYUSD',
  walletAddress,
  swapType = 'convert',
}: SwapModalProps) {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [step, setStep] = useState<'approve' | 'swap'>('approve');

  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get target token
  const getTargetToken = (): Token => {
    if (swapType === 'convert') {
      return SwapService.getPYUSDToken();
    } else if (swapType === 'sell') {
      return {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        balance: '0',
        balanceFormatted: 0,
        price: 1.0,
      };
    }
    if (typeof toToken === 'string') {
      if (toToken === 'PYUSD') return SwapService.getPYUSDToken();
      return {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        balance: '0',
        balanceFormatted: 0,
        price: 1.0,
      };
    }
    return toToken as Token;
  };

  const targetToken = getTargetToken();

  // Check allowance
  const { data: allowanceData } = useReadContract({
    address: fromToken?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [walletAddress as `0x${string}`, UNISWAP_V3_ROUTER as `0x${string}`],
    query: {
      enabled: !!fromToken && !!walletAddress && !!amount,
    },
  });

  // Check if approval is needed
  useEffect(() => {
    if (allowanceData && fromToken && amount) {
      const amountBigInt = parseUnits(amount, fromToken.decimals);
      const currentAllowance = allowanceData as bigint;
      setNeedsApproval(currentAllowance < amountBigInt);
      setStep(currentAllowance < amountBigInt ? 'approve' : 'swap');
    }
  }, [allowanceData, amount, fromToken]);

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

  // Fetch quote with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && fromToken && targetToken && isAmountValid()) {
        fetchQuote();
      } else {
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, slippage]);

  const fetchQuote = async () => {
    if (!fromToken || !targetToken) return;

    setIsLoadingQuote(true);
    try {
      const quoteData = await SwapService.getQuote(fromToken, targetToken, amount, slippage);
      setQuote(quoteData);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to fetch swap quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!fromToken || !walletAddress || !amount) return;

    try {
      const amountBigInt = parseUnits(amount, fromToken.decimals);

      toast.loading('Approving token...', { id: 'approve' });

      writeContract({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V3_ROUTER as `0x${string}`, amountBigInt],
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error?.message || 'Failed to approve token', { id: 'approve' });
    }
  };

  // Handle swap
  const handleSwap = async () => {
    if (!quote || !walletAddress || !fromToken || !targetToken) {
      toast.error('Missing required data for swap');
      return;
    }

    if (!isAmountValid()) {
      toast.error(getBalanceError() || 'Invalid amount');
      return;
    }

    if (needsApproval && step === 'approve') {
      await handleApprove();
      return;
    }

    try {
      const amountIn = parseUnits(amount, fromToken.decimals);
      const minAmountOut = UniswapSwapService.calculateMinOutput(
        quote.toAmount,
        slippage,
        targetToken.decimals
      );

      toast.loading('Executing swap...', { id: 'swap' });

      // REAL UNISWAP SWAP
      writeContract({
        address: UNISWAP_V3_ROUTER as `0x${string}`,
        abi: UNISWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [
          {
            tokenIn: fromToken.address as `0x${string}`,
            tokenOut: targetToken.address as `0x${string}`,
            fee: UniswapSwapService.getFeeTier(),
            recipient: walletAddress as `0x${string}`,
            deadline: UniswapSwapService.getDeadline(),
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      });
    } catch (error: any) {
      console.error('Swap error:', error);
      toast.error(error?.message || 'Failed to execute swap', { id: 'swap' });
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      if (step === 'approve') {
        toast.success('Token approved! Now you can swap.', { id: 'approve' });
        setNeedsApproval(false);
        setStep('swap');
      } else {
        toast.success(`${swapType === 'convert' ? 'Conversion' : 'Sale'} completed successfully!`, { id: 'swap' });
        onClose();
        setAmount('');
        setQuote(null);
      }
    }
  }, [isSuccess, step, swapType, onClose]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      const errorMsg = error.message.includes('User rejected') 
        ? 'Transaction rejected by user'
        : `Transaction failed: ${error.message}`;
      toast.error(errorMsg, { id: step === 'approve' ? 'approve' : 'swap' });
    }
  }, [error, step]);

  if (!isOpen || !fromToken) return null;

  const balanceError = getBalanceError();
  const modalTitle = swapType === 'convert' ? 'Convert to PYUSD' : 'Sell Token';
  const modalIcon = swapType === 'convert' 
    ? <Repeat className="w-6 h-6 text-neon-blue" /> 
    : <DollarSign className="w-6 h-6 text-green-400" />;

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
                <h2 className="text-2xl font-space-grotesk font-bold">{modalTitle}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            {needsApproval && (
              <div className="mb-4 flex items-center justify-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  step === 'approve' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-green-500/20 text-green-400'
                }`}>
                  {step === 'swap' ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-full" />}
                  <span className="text-sm font-medium">1. Approve</span>
                </div>
                <div className="w-8 h-0.5 bg-white/20" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  step === 'swap' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/10 text-gray-400'
                }`}>
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
                      onClick={() => setAmount(fromToken.balanceFormatted.toString())}
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
                        <img src={fromToken.logo} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{fromToken.symbol[0]}</span>
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
                  <div className="mt-2 text-xs text-red-400">{balanceError}</div>
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
                    {swapType === 'convert' ? 'Stablecoin' : 'USD Coin'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {targetToken && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{targetToken.symbol[0]}</span>
                      </div>
                      <span className="font-semibold">{targetToken.symbol}</span>
                    </div>
                  )}
                  <div className="flex-1 text-right text-2xl font-bold">
                    {isLoadingQuote ? (
                      <Loader2 className="w-6 h-6 animate-spin ml-auto" />
                    ) : quote ? (
                      quote.toAmount
                    ) : (
                      '0.0'
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              {quote && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact</span>
                    <span className={quote.priceImpact > 1 ? 'text-red-400' : 'text-green-400'}>
                      {quote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Estimate</span>
                    <span>{quote.gasEstimate} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slippage Tolerance</span>
                    <div className="flex items-center gap-2">
                      {[0.5, 1, 2].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSlippage(val)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            slippage === val ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-400 hover:text-white'
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

              {/* Action Button */}
              <button
                onClick={handleSwap}
                disabled={!quote || isPending || isConfirming || !walletAddress || !isAmountValid() || !!balanceError}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {isPending 
                        ? `Confirm ${step === 'approve' ? 'Approval' : 'Swap'} in Wallet...` 
                        : 'Processing...'}
                    </span>
                  </div>
                ) : !walletAddress ? (
                  'Connect Wallet'
                ) : balanceError ? (
                  'Insufficient Balance'
                ) : !quote ? (
                  'Enter Amount'
                ) : needsApproval && step === 'approve' ? (
                  `Approve ${fromToken.symbol}`
                ) : (
                  `${swapType === 'convert' ? 'Convert' : 'Sell'} ${fromToken.symbol}`
                )}
              </button>

              {/* Notice */}
              <div className="text-xs text-center space-y-1 mt-2">
                <div className="text-gray-400">
                  🔒 Real on-chain {swapType === 'convert' ? 'conversion' : 'sale'} via Uniswap V3
                </div>
                {needsApproval && step === 'approve' && (
                  <div className="text-yellow-400/70">
                    ⚠️ Step 1: Approve token spending first
                  </div>
                )}
                <div className="text-gray-500 text-[10px]">
                  Network: {chainId === 1 ? 'Ethereum Mainnet' : chainId === 11155111 ? 'Sepolia Testnet' : `Chain ${chainId}`}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

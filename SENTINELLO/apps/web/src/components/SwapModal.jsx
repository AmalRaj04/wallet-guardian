import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDown, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/types/token';
import { TOKEN_ADDRESSES, getEthereumProvider } from '@/lib/web3';
import { toast } from 'sonner';

export default function SwapModal({ isOpen, onClose, token, swapType }) {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const targetToken = swapType === 'pyusd' ? 'PYUSD' : 'USDC';
  const targetAddress = swapType === 'pyusd' ? TOKEN_ADDRESSES.PYUSD : TOKEN_ADDRESSES.USDC;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setQuote(null);
      setError(null);
      setTxHash(null);
      setIsSwapping(false);
    }
  }, [isOpen]);

  // Get quote from 0x API (or similar DEX aggregator)
  const getSwapQuote = async (sellAmount) => {
    if (!token || !sellAmount || parseFloat(sellAmount) <= 0) return;

    setIsLoadingQuote(true);
    setError(null);

    try {
      // Using 0x API for real quotes (you'll need to implement this with actual API)
      // For demo purposes, we'll simulate a quote
      const sellAmountWei = (parseFloat(sellAmount) * Math.pow(10, token.decimals)).toString();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock quote calculation (in production, use real 0x API)
      const mockPrice = swapType === 'pyusd' ? 0.998 : 0.999; // Slightly less due to slippage
      const buyAmount = parseFloat(sellAmount) * token.price * mockPrice;
      const gasEstimate = 150000; // Estimated gas units
      const gasPrice = 20; // Gwei
      const gasCostUSD = (gasEstimate * gasPrice * 1e-9) * 3000; // Assuming ETH = $3000

      setQuote({
        sellAmount: sellAmount,
        sellToken: token.symbol,
        buyAmount: buyAmount.toFixed(6),
        buyToken: targetToken,
        price: mockPrice,
        gasEstimate,
        gasCostUSD,
        slippage: 0.5, // 0.5%
        priceImpact: 0.1, // 0.1%
        route: `${token.symbol} → ${targetToken}`,
        // In production, this would come from 0x API
        data: '0x...' // Transaction data
      });
    } catch (err) {
      console.error('Error getting quote:', err);
      setError('Failed to get swap quote. Please try again.');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Execute the swap
  const executeSwap = async () => {
    if (!quote || !token) return;

    setIsSwapping(true);
    setError(null);

    try {
      const provider = getEthereumProvider();
      if (!provider) {
        throw new Error('No wallet provider found');
      }

      // In production, you would:
      // 1. Check token allowance
      // 2. Approve token spending if needed
      // 3. Execute the swap transaction

      // For demo, we'll simulate the transaction
      toast.info('Preparing swap transaction...');
      
      // Simulate approval if needed
      if (token.address !== 'ETH') {
        toast.info('Approving token spending...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Simulate swap transaction
      toast.info('Executing swap...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock transaction hash
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockTxHash);

      toast.success(`Successfully swapped ${quote.sellAmount} ${token.symbol} for ${quote.buyAmount} ${targetToken}!`);
      
      // In production, you would refresh the wallet balances here
      
    } catch (err) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed. Please try again.');
      toast.error('Swap failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSwapping(false);
    }
  };

  // Handle amount input change
  const handleAmountChange = (value) => {
    setAmount(value);
    if (value && parseFloat(value) > 0) {
      // Debounce quote requests
      const timeoutId = setTimeout(() => {
        getSwapQuote(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setQuote(null);
    }
  };

  const maxAmount = token?.balanceFormatted || 0;
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-space-grotesk font-semibold">
              {swapType === 'pyusd' ? 'Convert to PYUSD' : 'Sell Token'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {txHash ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Swap Successful!</h3>
              <p className="text-gray-400 mb-4">
                Your transaction has been submitted to the blockchain.
              </p>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <>
              {/* From Token */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">From</span>
                    <span className="text-sm text-gray-400">
                      Balance: {maxAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {token?.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {token?.symbol?.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-500 outline-none"
                        step="any"
                        min="0"
                        max={maxAmount}
                      />
                      <div className="text-sm text-gray-400">{token?.symbol}</div>
                    </div>
                    <button
                      onClick={() => handleAmountChange(maxAmount.toString())}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="p-2 bg-white/10 rounded-full">
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* To Token */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">To</span>
                    {quote && (
                      <span className="text-sm text-gray-400">
                        ≈ {formatCurrency(parseFloat(quote.buyAmount))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {targetToken.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-white">
                        {isLoadingQuote ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Getting quote...</span>
                          </div>
                        ) : quote ? (
                          quote.buyAmount
                        ) : (
                          '0.0'
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{targetToken}</div>
                    </div>
                  </div>
                </div>

                {/* Quote Details */}
                {quote && (
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white">1 {token.symbol} = {quote.price.toFixed(6)} {targetToken}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Slippage</span>
                      <span className="text-white">{quote.slippage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Gas Fee</span>
                      <span className="text-white">{formatCurrency(quote.gasCostUSD)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Route</span>
                      <span className="text-white">{quote.route}</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={executeSwap}
                  disabled={!isValidAmount || !quote || isSwapping}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                >
                  {isSwapping ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Swapping...</span>
                    </div>
                  ) : !isValidAmount ? (
                    'Enter Amount'
                  ) : !quote ? (
                    'Getting Quote...'
                  ) : (
                    `Swap ${amount} ${token?.symbol} for ${targetToken}`
                  )}
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center">
                  By proceeding, you agree to the terms and acknowledge the risks of DeFi trading.
                  Always verify transaction details before confirming.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
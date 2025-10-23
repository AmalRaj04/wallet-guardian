import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDown, Loader2, AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';

// Mock formatCurrency for demo
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Mock TOKEN_ADDRESSES
const TOKEN_ADDRESSES = {
  PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

// ERC20 ABI (minimal for approve and allowance)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
];

export default function SwapModal({ 
  isOpen = true, 
  onClose = () => {}, 
  token = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    balanceFormatted: 100.50,
    price: 1.00,
    logo: null
  }, 
  swapType = 'pyusd',
  onSwapSuccess = () => {}
}) {
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const quoteTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const targetToken = swapType === 'pyusd' ? 'PYUSD' : 'USDC';
  const targetAddress = swapType === 'pyusd' ? TOKEN_ADDRESSES.PYUSD : TOKEN_ADDRESSES.USDC;

  // Reset state when modal opens/closes or token changes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setQuote(null);
      setError(null);
      setTxHash(null);
      setIsSwapping(false);
      setNeedsApproval(false);
      setIsApproving(false);
    } else {
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isOpen, token?.address]);

  // Check if wallet is connected
  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('Please connect your wallet first.');
      }
      return true;
    } catch (err) {
      throw new Error('Failed to connect to wallet: ' + err.message);
    }
  };

  // Check token allowance
  const checkAllowance = async (tokenAddress, ownerAddress, spenderAddress, amountWei) => {
    try {
      // Use ethers v6 syntax
      const { ethers } = await import('https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm');
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      
      return allowance >= amountWei;
    } catch (err) {
      console.error('Error checking allowance:', err);
      return false;
    }
  };

  // Get swap quote from 0x API
  const getSwapQuote = useCallback(async (sellAmount) => {
    if (!token || !sellAmount || parseFloat(sellAmount) <= 0) {
      setQuote(null);
      return;
    }

    if (parseFloat(sellAmount) > (token.balanceFormatted || 0)) {
      setError('Amount exceeds balance');
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const { ethers } = await import('https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm');
      
      const sellAmountWei = ethers.parseUnits(
        sellAmount, 
        token.decimals
      ).toString();

      const sellTokenAddress = token.address === 'ETH' 
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : token.address;

      // Get user address for takerAddress parameter
      let userAddress = '';
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        userAddress = await signer.getAddress();
      } catch (err) {
        console.warn('Could not get user address for quote:', err);
      }

      // Fetch quote from 0x API
      const params = new URLSearchParams({
        sellToken: sellTokenAddress,
        buyToken: targetAddress,
        sellAmount: sellAmountWei,
        slippagePercentage: '0.005',
        skipValidation: 'false'
      });

      // Add takerAddress if available
      if (userAddress) {
        params.append('takerAddress', userAddress);
      }

      const response = await fetch(
        `https://api.0x.org/swap/v1/quote?${params}`,
        {
          headers: {
            '0x-api-key': 'demo-key' // Replace with your actual API key
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reason || 'Failed to fetch quote from 0x API');
      }

      const data = await response.json();

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Parse the quote data
      const buyAmount = ethers.formatUnits(data.buyAmount, 6);
      const gasEstimate = parseInt(data.estimatedGas || data.gas || '200000');
      const gasPrice = parseInt(data.gasPrice || '30000000000');
      const ethPrice = 3000;
      const gasCostUSD = (gasEstimate * gasPrice * 1e-9) * ethPrice;

      const quoteData = {
        sellAmount: sellAmount,
        sellToken: token.symbol,
        sellTokenAddress: token.address,
        buyAmount: buyAmount,
        buyToken: targetToken,
        buyTokenAddress: targetAddress,
        price: data.price,
        guaranteedPrice: data.guaranteedPrice,
        rate: (parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(6),
        gasEstimate,
        gasCostUSD,
        slippage: '0.50',
        priceImpact: (parseFloat(data.estimatedPriceImpact || 0) * 100).toFixed(2),
        route: data.sources?.[0]?.name || `${token.symbol} → ${targetToken}`,
        minimumReceived: ethers.formatUnits(data.guaranteedBuyAmount || data.buyAmount, 6),
        timestamp: Date.now(),
        // Store transaction data
        to: data.to,
        data: data.data,
        value: data.value || '0',
        allowanceTarget: data.allowanceTarget
      };

      setQuote(quoteData);
      
      // Check if approval is needed (only for ERC-20 tokens, not ETH)
      if (token.address !== 'ETH' && userAddress) {
        const hasAllowance = await checkAllowance(
          token.address,
          userAddress,
          data.allowanceTarget,
          sellAmountWei
        );
        
        setNeedsApproval(!hasAllowance);
      } else {
        setNeedsApproval(false);
      }
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error getting quote:', err);
        setError(err.message || 'Failed to get swap quote. Please try again.');
        setQuote(null);
      }
    } finally {
      setIsLoadingQuote(false);
    }
  }, [token, targetToken, targetAddress]);

  // Handle amount input change with debouncing
  const handleAmountChange = useCallback((value) => {
    setError(null);
    
    if (value && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setAmount(value);
    
    if (quoteTimeoutRef.current) {
      clearTimeout(quoteTimeoutRef.current);
    }

    if (value && parseFloat(value) > 0) {
      quoteTimeoutRef.current = setTimeout(() => {
        getSwapQuote(value);
      }, 500);
    } else {
      setQuote(null);
      setNeedsApproval(false);
    }
  }, [getSwapQuote]);

  // Approve token spending
  const approveToken = async () => {
    if (!token || token.address === 'ETH' || !quote) return true;

    setIsApproving(true);
    setError(null);

    try {
      await checkWalletConnection();

      const { ethers } = await import('https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tokenContract = new ethers.Contract(
        token.address,
        ERC20_ABI,
        signer
      );

      const spenderAddress = quote.allowanceTarget;
      const amountToApprove = ethers.parseUnits(amount, token.decimals);

      console.log('🔓 Requesting token approval...');
      console.log('Token:', token.symbol);
      console.log('Spender:', spenderAddress);
      console.log('Amount:', ethers.formatUnits(amountToApprove, token.decimals));
      
      // This will open MetaMask for approval
      const tx = await tokenContract.approve(spenderAddress, amountToApprove);
      
      console.log('⏳ Waiting for approval confirmation...');
      console.log('TX Hash:', tx.hash);
      
      await tx.wait();

      console.log('✅ Token approved successfully!');
      setNeedsApproval(false);
      return true;
      
    } catch (err) {
      console.error('❌ Approval error:', err);
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Approval rejected by user');
      } else {
        const errorMsg = err.reason || err.message || 'Token approval failed';
        setError(errorMsg);
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  // Execute the swap
  const executeSwap = async () => {
    if (!quote || !token || !amount) return;

    // If approval is needed, do that first
    if (needsApproval) {
      const approved = await approveToken();
      if (!approved) return;
      // After approval, refresh quote and check allowance again
      await getSwapQuote(amount);
      return;
    }

    setIsSwapping(true);
    setError(null);

    try {
      await checkWalletConnection();

      // Check quote freshness (2 minutes instead of 30 seconds)
      const quoteAge = Date.now() - quote.timestamp;
      if (quoteAge > 120000) {
        setError('Quote expired. Refreshing...');
        await getSwapQuote(amount);
        setIsSwapping(false);
        return;
      }

      const { ethers } = await import('https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log('🔄 Preparing swap transaction...');
      console.log('From:', userAddress);
      console.log('Selling:', quote.sellAmount, quote.sellToken);
      console.log('Buying:', quote.buyAmount, quote.buyToken);
      
      // Build transaction - this is what gets sent to the user's wallet
      const txParams = {
        from: userAddress,
        to: quote.to,
        data: quote.data,
        value: quote.value,
        gasLimit: Math.floor(quote.gasEstimate * 1.3) // 30% buffer for safety
      };

      console.log('📤 Sending transaction to wallet for approval...');
      console.log('Transaction details:', {
        to: txParams.to,
        value: ethers.formatEther(txParams.value || '0') + ' ETH',
        gasLimit: txParams.gasLimit
      });

      // THIS is where MetaMask/wallet opens for the user to confirm
      const tx = await signer.sendTransaction(txParams);
      
      console.log('⏳ Transaction submitted! Hash:', tx.hash);
      console.log('Waiting for confirmation...');
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      console.log('✅ Swap confirmed in block:', receipt.blockNumber);
      
      setTxHash(receipt.hash);

      // Trigger balance refresh after a delay
      if (onSwapSuccess) {
        setTimeout(() => onSwapSuccess(), 2000);
      }
      
    } catch (err) {
      console.error('❌ Swap error:', err);
      
      // Handle user rejection
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Transaction rejected by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient funds for gas + transaction');
      } else {
        const errorMsg = err.reason || err.message || 'Swap failed. Please try again.';
        setError(errorMsg);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  // Set max amount
  const handleSetMax = useCallback(() => {
    const maxAmount = token?.balanceFormatted || 0;
    if (maxAmount > 0) {
      const adjustedMax = token?.address === 'ETH' 
        ? Math.max(0, maxAmount - 0.01).toFixed(6)
        : maxAmount.toString();
      handleAmountChange(adjustedMax);
    }
  }, [token, handleAmountChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const maxAmount = token?.balanceFormatted || 0;
  const isValidAmount = amount && 
    parseFloat(amount) > 0 && 
    parseFloat(amount) <= maxAmount;
  
  const canSwap = isValidAmount && quote && !isSwapping && !isApproving;

  if (!isOpen || !token) return null;

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
            <h2 className="text-xl font-semibold text-white">
              {swapType === 'pyusd' ? 'Convert to PYUSD' : 'Sell Token'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {txHash ? (
            /* Success State */
            <div className="text-center py-8">
              <motion.div 
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">Swap Successful!</h3>
              <p className="text-gray-400 mb-6">
                Your transaction has been confirmed on the blockchain.
              </p>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* From Token */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">From</span>
                    <span className="text-sm text-gray-400">
                      Balance: {maxAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {token?.symbol?.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      <div className="text-sm text-gray-400 flex items-center space-x-2">
                        <span>{token?.symbol}</span>
                        {amount && token?.price && (
                          <span className="text-gray-500">
                            ≈ {formatCurrency(parseFloat(amount) * token.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSetMax}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex-shrink-0"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="p-2 bg-gray-800 border border-white/10 rounded-full">
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* To Token */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">To (estimated)</span>
                    {quote && (
                      <span className="text-sm text-green-400">
                        ≈ {formatCurrency(parseFloat(quote.buyAmount))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {targetToken.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-semibold text-white">
                        {isLoadingQuote ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-lg">Getting quote...</span>
                          </div>
                        ) : quote ? (
                          <span>{parseFloat(quote.buyAmount).toFixed(6)}</span>
                        ) : (
                          <span className="text-gray-500">0.0</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{targetToken}</div>
                    </div>
                  </div>
                </div>

                {/* Quote Details */}
                {quote && !isLoadingQuote && (
                  <motion.div 
                    className="bg-white/5 rounded-xl p-4 space-y-2.5 border border-white/10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white font-medium">
                        1 {token.symbol} ≈ {quote.rate} {targetToken}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Minimum Received</span>
                      <span className="text-white font-medium">{parseFloat(quote.minimumReceived).toFixed(6)} {targetToken}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price Impact</span>
                      <span className={`font-medium ${parseFloat(quote.priceImpact) > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {quote.priceImpact}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Slippage Tolerance</span>
                      <span className="text-white font-medium">{quote.slippage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Est. Gas Fee</span>
                      <span className="text-white font-medium">{formatCurrency(quote.gasCostUSD)}</span>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div 
                    className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </motion.div>
                )}

                {/* High Price Impact Warning */}
                {quote && parseFloat(quote.priceImpact) > 1 && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-yellow-400 text-sm">
                      High price impact detected. Consider splitting into smaller trades.
                    </span>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={executeSwap}
                  disabled={!canSwap}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {isSwapping ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Swapping...</span>
                    </div>
                  ) : isApproving ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Approving...</span>
                    </div>
                  ) : !amount || parseFloat(amount) <= 0 ? (
                    'Enter Amount'
                  ) : parseFloat(amount) > maxAmount ? (
                    'Insufficient Balance'
                  ) : !quote ? (
                    isLoadingQuote ? 'Getting Quote...' : 'Enter Amount'
                  ) : needsApproval ? (
                    `Approve ${token.symbol}`
                  ) : (
                    `Swap for ${parseFloat(quote.buyAmount).toFixed(4)} ${targetToken}`
                  )}
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Transaction will be sent to your wallet for approval. 
                  Always verify details before confirming in your wallet.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
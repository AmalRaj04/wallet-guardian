// DEX Swap Integration (Uniswap/0x)
import { Token, SwapQuote } from '@/types';

const UNISWAP_API_URL = 'https://api.uniswap.org/v2';
const ZEROX_API_URL = 'https://api.0x.org';

// PYUSD token address on Ethereum mainnet
export const PYUSD_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8';

export class SwapService {
  // Get a quote for swapping tokens
  static async getQuote(
    fromToken: Token,
    toToken: Token | string, // Can be Token object or address
    amount: string,
    slippage: number = 0.5
  ): Promise<SwapQuote | null> {
    try {
      const toTokenObj = typeof toToken === 'string' 
        ? { address: toToken, symbol: 'PYUSD', name: 'PayPal USD', decimals: 6, balance: '0', balanceFormatted: 0, price: 1.0 }
        : toToken;
      
      // Calculate output based on real token prices
      const inputAmount = parseFloat(amount);
      const fromPrice = fromToken.price || 0;
      const toPrice = toTokenObj.price || 1.0;
      
      // Calculate output: (input amount * from price) / to price
      const outputValue = (inputAmount * fromPrice) / toPrice;
      
      // Apply 0.3% Uniswap fee
      const outputWithFee = outputValue * 0.997;
      
      // Calculate price impact (simplified - real calculation would use liquidity pools)
      const tradeSize = inputAmount * fromPrice;
      let priceImpact = 0.1; // Base 0.1%
      if (tradeSize > 100000) priceImpact = 5.0; // Large trades
      else if (tradeSize > 50000) priceImpact = 2.0;
      else if (tradeSize > 10000) priceImpact = 0.5;
      
      const quote: SwapQuote = {
        fromToken,
        toToken: toTokenObj,
        fromAmount: amount,
        toAmount: outputWithFee.toFixed(toTokenObj.decimals || 6),
        gasEstimate: '0.003',
        priceImpact,
        slippage,
      };

      return quote;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  // Prepare swap transaction (USER-INITIATED)
  static async prepareSwapTransaction(
    quote: SwapQuote,
    walletAddress: string
  ): Promise<{
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    riskScore: number;
  }> {
    try {
      // Prepare transaction data for user to confirm in wallet
      console.log('Preparing user-initiated swap:', {
        from: quote.fromToken.symbol,
        to: quote.toToken.symbol,
        amount: quote.fromAmount,
        wallet: walletAddress,
      });

      // Calculate risk score based on price impact
      const riskScore = quote.priceImpact > 5 ? 75 : quote.priceImpact > 1 ? 40 : 10;

      // Return transaction data for wallet confirmation
      return {
        to: '0x1111111254EEB25477B68fb85Ed929f73A960582', // 1inch router
        data: '0x', // Would be actual swap calldata
        value: '0',
        gasLimit: '300000',
        riskScore,
      };
    } catch (error) {
      console.error('Error preparing swap:', error);
      throw error;
    }
  }

  // Execute a swap (DEPRECATED - Use prepareSwapTransaction instead)
  static async executeSwap(
    quote: SwapQuote,
    walletAddress: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ): Promise<string | null> {
    console.warn('executeSwap is deprecated. Use prepareSwapTransaction for user-initiated transactions.');
    
    try {
      const txData = await this.prepareSwapTransaction(quote, walletAddress);
      
      // User must confirm in wallet
      console.log('Transaction prepared for user confirmation:', txData);
      
      if (onSuccess) {
        onSuccess();
      }

      return null; // No auto-execution
    } catch (error) {
      console.error('Error preparing swap:', error);
      if (onError) {
        onError(error as Error);
      }
      return null;
    }
  }

  // Get PYUSD token info
  static getPYUSDToken(): Token {
    return {
      address: PYUSD_ADDRESS,
      symbol: 'PYUSD',
      name: 'PayPal USD',
      decimals: 6,
      balance: '0',
      balanceFormatted: 0,
      price: 1.0, // Stablecoin
    };
  }

  // Calculate estimated gas for swap
  static async estimateGas(
    fromToken: Token,
    toToken: Token | string,
    amount: string
  ): Promise<string> {
    // Mock gas estimation
    // In production, this would call the DEX router to estimate gas
    return '0.003'; // ETH
  }

  // Check if swap is available
  static isAvailable(): boolean {
    return true; // Always available for demo
  }

  // Helper: Calculate mock output amount
  private static calculateMockOutput(inputAmount: string, inputPrice: number): string {
    const input = parseFloat(inputAmount);
    const outputValue = input * inputPrice;
    // Assume 0.3% fee
    const outputWithFee = outputValue * 0.997;
    return outputWithFee.toFixed(6);
  }

  // Get popular token pairs for swapping
  static getPopularPairs(): Array<{ symbol: string; address: string; name: string }> {
    return [
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin' },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD' },
      { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin' },
      { symbol: 'PYUSD', address: PYUSD_ADDRESS, name: 'PayPal USD' },
      { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether' },
    ];
  }
}

export default SwapService;
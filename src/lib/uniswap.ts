// Professional Uniswap V3 Integration for Non-Custodial Swaps
import { ethers } from 'ethers';
import { Token as UniswapToken, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter } from '@uniswap/smart-order-router';
import { Token } from '@/types';
import { BlockscoutAPI } from './blockscout';
import toast from 'react-hot-toast';

const UNISWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 Router
const CHAIN_ID = 1; // Ethereum Mainnet

// PYUSD token on Ethereum
const PYUSD_TOKEN = {
  address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
  decimals: 6,
  symbol: 'PYUSD',
  name: 'PayPal USD',
};

// Common tokens for swapping
const WETH_TOKEN = {
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  decimals: 18,
  symbol: 'WETH',
  name: 'Wrapped Ether',
};

const USDC_TOKEN = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
};

export class UniswapService {
  private static provider: ethers.providers.Web3Provider | null = null;
  private static router: AlphaRouter | null = null;

  // Initialize with wallet provider
  static async initialize(provider: any) {
    try {
      this.provider = new ethers.providers.Web3Provider(provider);
      
      // Initialize AlphaRouter for best route finding
      this.router = new AlphaRouter({
        chainId: CHAIN_ID,
        provider: this.provider,
      });

      return true;
    } catch (error) {
      console.error('Error initializing Uniswap:', error);
      return false;
    }
  }

  // Verify contract before allowing swap (using Transaction Safety Gate)
  static async verifyContractSafety(tokenAddress: string): Promise<{
    isVerified: boolean;
    isSafe: boolean;
    risks: string[];
  }> {
    try {
      const { TransactionSafetyGate } = await import('./transaction-safety');
      
      const validation = await TransactionSafetyGate.validateTransaction({
        to: tokenAddress,
        type: 'swap',
        tokenAddress,
      });

      return {
        isVerified: validation.risk !== 'critical',
        isSafe: validation.allowed,
        risks: validation.blockingReasons || validation.reasons,
      };
    } catch (error) {
      console.error('Error verifying contract:', error);
      return {
        isVerified: false,
        isSafe: false,
        risks: ['Unable to verify contract safety'],
      };
    }
  }

  // Get swap quote with route
  static async getSwapQuote(
    fromToken: Token,
    toTokenAddress: string,
    amount: string,
    slippageTolerance: number = 0.5
  ): Promise<{
    quote: string;
    route: any;
    gasEstimate: string;
    priceImpact: number;
  } | null> {
    if (!this.router || !this.provider) {
      throw new Error('Uniswap not initialized');
    }

    try {
      // Create Uniswap token objects
      const inputToken = new UniswapToken(
        CHAIN_ID,
        fromToken.address,
        fromToken.decimals,
        fromToken.symbol,
        fromToken.name
      );

      // Determine output token
      let outputToken: UniswapToken;
      if (toTokenAddress === PYUSD_TOKEN.address) {
        outputToken = new UniswapToken(
          CHAIN_ID,
          PYUSD_TOKEN.address,
          PYUSD_TOKEN.decimals,
          PYUSD_TOKEN.symbol,
          PYUSD_TOKEN.name
        );
      } else if (toTokenAddress === USDC_TOKEN.address) {
        outputToken = new UniswapToken(
          CHAIN_ID,
          USDC_TOKEN.address,
          USDC_TOKEN.decimals,
          USDC_TOKEN.symbol,
          USDC_TOKEN.name
        );
      } else {
        throw new Error('Unsupported output token');
      }

      // Parse amount
      const amountIn = ethers.utils.parseUnits(amount, fromToken.decimals);
      const currencyAmount = CurrencyAmount.fromRawAmount(
        inputToken,
        amountIn.toString()
      );

      // Get best route
      const route = await this.router.route(
        currencyAmount,
        outputToken,
        TradeType.EXACT_INPUT,
        {
          recipient: await this.provider.getSigner().getAddress(),
          slippageTolerance: new Percent(slippageTolerance * 100, 10000),
          deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
        }
      );

      if (!route) {
        throw new Error('No route found for swap');
      }

      // Calculate price impact
      const priceImpact = parseFloat(route.trade.priceImpact.toFixed(2));

      return {
        quote: route.quote.toFixed(6),
        route: route,
        gasEstimate: route.estimatedGasUsed.toString(),
        priceImpact,
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  // Execute swap (non-custodial - user signs)
  static async executeSwap(
    fromToken: Token,
    toTokenAddress: string,
    amount: string,
    slippageTolerance: number = 0.5,
    onSuccess?: (txHash: string) => void,
    onError?: (error: Error) => void
  ): Promise<string | null> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = this.provider.getSigner();
      const userAddress = await signer.getAddress();

      // Step 1: Verify contract safety
      toast.loading('Verifying contract safety...', { id: 'swap-verify' });
      
      const fromSafety = await this.verifyContractSafety(fromToken.address);
      const toSafety = await this.verifyContractSafety(toTokenAddress);

      if (!fromSafety.isSafe || !toSafety.isSafe) {
        const risks = [...fromSafety.risks, ...toSafety.risks];
        toast.error(
          `⚠️ Security Risk Detected:\n${risks.join('\n')}`,
          { id: 'swap-verify', duration: 8000 }
        );
        
        if (onError) {
          onError(new Error('Contract safety verification failed'));
        }
        return null;
      }

      toast.success('✅ Contracts verified safe', { id: 'swap-verify' });

      // Step 2: Check token allowance
      toast.loading('Checking token allowance...', { id: 'swap-allowance' });
      
      const tokenContract = new ethers.Contract(
        fromToken.address,
        ['function allowance(address owner, address spender) view returns (uint256)'],
        this.provider
      );

      const currentAllowance = await tokenContract.allowance(
        userAddress,
        UNISWAP_ROUTER_ADDRESS
      );

      const amountToSwap = ethers.utils.parseUnits(amount, fromToken.decimals);

      // Step 3: Approve if needed
      if (currentAllowance.lt(amountToSwap)) {
        toast.loading('Requesting token approval...', { id: 'swap-allowance' });
        
        const tokenContractWithSigner = new ethers.Contract(
          fromToken.address,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          signer
        );

        const approveTx = await tokenContractWithSigner.approve(
          UNISWAP_ROUTER_ADDRESS,
          amountToSwap
        );

        toast.loading('Waiting for approval confirmation...', { id: 'swap-allowance' });
        await approveTx.wait();
        
        toast.success('✅ Token approved', { id: 'swap-allowance' });
      } else {
        toast.success('✅ Token already approved', { id: 'swap-allowance' });
      }

      // Step 4: Get swap route
      toast.loading('Finding best swap route...', { id: 'swap-route' });
      
      const quote = await this.getSwapQuote(
        fromToken,
        toTokenAddress,
        amount,
        slippageTolerance
      );

      if (!quote) {
        throw new Error('Unable to find swap route');
      }

      // Check price impact
      if (quote.priceImpact > 5) {
        toast.error(
          `⚠️ High price impact: ${quote.priceImpact}%\nConsider reducing swap amount`,
          { id: 'swap-route', duration: 6000 }
        );
      } else {
        toast.success(`✅ Route found (${quote.priceImpact}% impact)`, { id: 'swap-route' });
      }

      // Step 5: Execute swap
      toast.loading('Preparing swap transaction...', { id: 'swap-execute' });

      // Build swap transaction
      const swapTx = {
        to: UNISWAP_ROUTER_ADDRESS,
        data: quote.route.methodParameters?.calldata,
        value: fromToken.symbol === 'ETH' ? amountToSwap : '0',
        gasLimit: ethers.BigNumber.from(quote.gasEstimate).mul(120).div(100), // 20% buffer
      };

      // User signs transaction
      toast.loading('Please confirm transaction in your wallet...', { id: 'swap-execute' });
      
      const tx = await signer.sendTransaction(swapTx);
      
      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'swap-execute' });
      
      const receipt = await tx.wait();

      toast.success(
        `✅ Swap successful!\nTx: ${receipt.transactionHash.slice(0, 10)}...`,
        { id: 'swap-execute', duration: 6000 }
      );

      if (onSuccess) {
        onSuccess(receipt.transactionHash);
      }

      return receipt.transactionHash;
    } catch (error: any) {
      console.error('Swap error:', error);
      
      const errorMessage = error.message || 'Swap failed';
      toast.error(`❌ ${errorMessage}`, { id: 'swap-execute', duration: 6000 });

      if (onError) {
        onError(error);
      }

      return null;
    }
  }

  // Get PYUSD token info
  static getPYUSDToken(): typeof PYUSD_TOKEN {
    return PYUSD_TOKEN;
  }

  // Check if service is initialized
  static isInitialized(): boolean {
    return !!this.provider && !!this.router;
  }
}

export default UniswapService;
// PYUSD Safe Migration Service
import { Token } from '@/types';
import { LitProtocolService } from './lit-protocol';
import { UniswapService } from './uniswap';
import toast from 'react-hot-toast';

const PYUSD_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8';
const ONEINCH_API_URL = 'https://api.1inch.dev/swap/v5.2/1';

export interface MigrationPreview {
  tokensToMigrate: Token[];
  totalValueUSD: number;
  estimatedPYUSD: number;
  estimatedGas: string;
  estimatedSlippage: number;
  steps: string[];
}

export class PYUSDMigrationService {
  // Check if migration is recommended
  static shouldMigrate(
    portfolio: Token[],
    riskScores: Map<string, number>
  ): {
    shouldMigrate: boolean;
    reason: string;
    highRiskTokens: Token[];
  } {
    const highRiskTokens = portfolio.filter(token => {
      const risk = riskScores.get(token.address) || 0;
      return risk > 70;
    });

    const totalValue = portfolio.reduce((sum, t) => sum + (t.value || 0), 0);
    const highRiskValue = highRiskTokens.reduce((sum, t) => sum + (t.value || 0), 0);
    const highRiskPercentage = totalValue > 0 ? (highRiskValue / totalValue) * 100 : 0;

    const shouldMigrate = highRiskPercentage > 40 || highRiskTokens.length > 3;

    return {
      shouldMigrate,
      reason: shouldMigrate
        ? `${highRiskPercentage.toFixed(1)}% of your portfolio is in high-risk tokens`
        : 'Your portfolio risk is acceptable',
      highRiskTokens,
    };
  }

  // Calculate migration preview
  static async calculateMigration(
    tokens: Token[]
  ): Promise<MigrationPreview> {
    try {
      const totalValueUSD = tokens.reduce((sum, t) => sum + (t.value || 0), 0);
      
      // Estimate PYUSD output (accounting for slippage and fees)
      const estimatedSlippage = 0.5; // 0.5%
      const estimatedPYUSD = totalValueUSD * (1 - estimatedSlippage / 100);

      // Calculate gas estimate
      const gasPerSwap = 0.003; // ETH per swap
      const totalGas = gasPerSwap * tokens.length;

      const steps = [
        '1. Approve tokens for swapping',
        '2. Swap high-risk tokens to USDC',
        '3. Swap USDC to PYUSD',
        '4. Revoke old token approvals',
        '5. Verify PYUSD balance',
      ];

      return {
        tokensToMigrate: tokens,
        totalValueUSD,
        estimatedPYUSD,
        estimatedGas: totalGas.toFixed(4),
        estimatedSlippage,
        steps,
      };
    } catch (error) {
      console.error('Error calculating migration:', error);
      throw error;
    }
  }

  // Prepare migration transactions (USER-INITIATED)
  static async prepareMigrationTransactions(
    tokens: Token[],
    walletAddress: string
  ): Promise<{
    transactions: Array<{
      to: string;
      data: string;
      value: string;
      description: string;
      riskScore: number;
    }>;
    totalSteps: number;
    estimatedGas: string;
  }> {
    const transactions: Array<{
      to: string;
      data: string;
      value: string;
      description: string;
      riskScore: number;
    }> = [];

    try {
      // Prepare each swap transaction for user confirmation
      for (const token of tokens) {
        // Get swap route via 1inch
        const route = await this.get1inchRoute(
          token.address,
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          token.balance
        );

        transactions.push({
          to: route.tx.to,
          data: route.tx.data,
          value: route.tx.value,
          description: `Swap ${token.symbol} to USDC`,
          riskScore: 10, // Low risk - safe migration
        });
      }

      // Add USDC to PYUSD conversion
      const usdcToPyusdRoute = await this.get1inchRoute(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        PYUSD_ADDRESS,
        '0' // Would be actual USDC balance
      );

      transactions.push({
        to: usdcToPyusdRoute.tx.to,
        data: usdcToPyusdRoute.tx.data,
        value: usdcToPyusdRoute.tx.value,
        description: 'Convert USDC to PYUSD',
        riskScore: 5, // Very low risk - stablecoin swap
      });

      const gasPerTx = 0.003;
      const totalGas = (gasPerTx * transactions.length).toFixed(4);

      return {
        transactions,
        totalSteps: transactions.length,
        estimatedGas: totalGas,
      };
    } catch (error) {
      console.error('Error preparing migration:', error);
      throw error;
    }
  }

  // Execute migration (USER-INITIATED - DEPRECATED)
  static async executeMigration(
    tokens: Token[],
    walletAddress: string,
    onProgress?: (step: number, total: number, message: string) => void
  ): Promise<{
    success: boolean;
    txHashes: string[];
    finalPYUSDBalance: number;
  }> {
    console.warn('executeMigration is deprecated. Use prepareMigrationTransactions for user-initiated flow.');

    try {
      toast.loading('🔄 Preparing PYUSD migration...', { id: 'migration' });

      // Prepare transactions for user to confirm
      const { transactions, totalSteps, estimatedGas } = await this.prepareMigrationTransactions(
        tokens,
        walletAddress
      );

      // Show user the transaction details
      toast.success(
        `Migration prepared! ${totalSteps} transactions ready. Estimated gas: ${estimatedGas} ETH. Please confirm each transaction in your wallet.`,
        { id: 'migration', duration: 8000 }
      );

      // Log for reference
      console.log('User-initiated migration prepared:', {
        tokens: tokens.map(t => t.symbol),
        totalSteps,
        estimatedGas,
        transactions,
      });

      return {
        success: true,
        txHashes: [],
        finalPYUSDBalance: 0,
      };
    } catch (error) {
      console.error('Error preparing migration:', error);
      toast.error('❌ Failed to prepare migration', { id: 'migration' });
      throw error;
    }
  }

  // Get 1inch swap route
  private static async get1inchRoute(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<any> {
    try {
      // This would call 1inch API
      // For now, return mock route
      return {
        tx: {
          to: '0x1111111254EEB25477B68fb85Ed929f73A960582', // 1inch router
          data: '0x',
          value: '0',
        },
        toAmount: amount,
      };
    } catch (error) {
      console.error('Error getting 1inch route:', error);
      throw error;
    }
  }

  // Get PYUSD benefits
  static getPYUSDBenefits(): string[] {
    return [
      '✅ Regulated stablecoin by PayPal',
      '✅ 1:1 USD redeemability',
      '✅ Low transfer costs',
      '✅ Trusted issuer',
      '✅ Widely accepted',
      '✅ Transparent reserves',
    ];
  }

  // Check if service is available
  static isAvailable(): boolean {
    return true; // Always available for demo
  }
}

export default PYUSDMigrationService;
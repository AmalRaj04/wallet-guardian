// Real Uniswap V3 Swap Integration
import { parseUnits } from 'viem';

// Uniswap V3 Router Address (Same on Mainnet & Sepolia)
export const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Uniswap V3 SwapRouter ABI (minimal for exactInputSingle)
export const UNISWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenIn', type: 'address' },
          { internalType: 'address', name: 'tokenOut', type: 'address' },
          { internalType: 'uint24', name: 'fee', type: 'uint24' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' },
          { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// ERC20 ABI (minimal for approve and allowance)
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class UniswapSwapService {
  // Calculate minimum output with slippage protection
  static calculateMinOutput(
    expectedOutput: string,
    slippagePercent: number,
    decimals: number
  ): bigint {
    try {
      const outputAmount = parseFloat(expectedOutput);
      const slippageMultiplier = (100 - slippagePercent) / 100;
      const minOutput = outputAmount * slippageMultiplier;
      return parseUnits(minOutput.toFixed(decimals), decimals);
    } catch (error) {
      console.error('Error calculating min output:', error);
      return BigInt(0);
    }
  }

  // Get deadline (20 minutes from now)
  static getDeadline(): bigint {
    return BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
  }

  // Get fee tier (0.3% = 3000)
  static getFeeTier(): number {
    return 3000; // 0.3% fee tier (most common)
  }
}

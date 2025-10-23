# 🔄 Real DEX Swap Implementation Guide

## ⚠️ Important Note

The current test transaction (sending 0.0001 ETH to yourself) was just to demonstrate that wallet interaction works. For **real token swaps**, we need to integrate with actual DEX protocols like Uniswap or 1inch.

---

## 🎯 What You Need for Real Swaps

### 1. DEX Integration Options

#### Option A: Uniswap V3 (Recommended)
- Direct integration with Uniswap contracts
- Best for Ethereum mainnet and testnets
- Lower fees, more control

#### Option B: 1inch Aggregator (Best Rates)
- Aggregates multiple DEXes
- Finds best rates automatically
- Requires 1inch API key

#### Option C: 0x Protocol
- Professional-grade DEX aggregator
- Good for production apps
- Requires 0x API key

---

## 🛠️ Implementation Steps

### Step 1: Install Required Packages

```bash
npm install @uniswap/v3-sdk @uniswap/sdk-core
npm install @uniswap/smart-order-router
```

### Step 2: Add Sepolia Support ✅ (Already Done!)

```typescript
// src/app/providers.tsx
import { mainnet, sepolia } from 'wagmi/chains';

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia], // Both networks supported!
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
```

### Step 3: Real Swap Flow

A real token swap requires **2 transactions**:

#### Transaction 1: Approve Token Spending
```typescript
// User must approve the DEX router to spend their tokens
await writeContract({
  address: fromToken.address as `0x${string}`,
  abi: ERC20_ABI,
  functionName: 'approve',
  args: [
    UNISWAP_ROUTER_ADDRESS, // DEX router address
    parseUnits(amount, fromToken.decimals), // Amount to approve
  ],
});
```

#### Transaction 2: Execute Swap
```typescript
// After approval, execute the actual swap
await writeContract({
  address: UNISWAP_ROUTER_ADDRESS,
  abi: UNISWAP_ROUTER_ABI,
  functionName: 'exactInputSingle',
  args: [{
    tokenIn: fromToken.address,
    tokenOut: toToken.address,
    fee: 3000, // 0.3% fee tier
    recipient: walletAddress,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
    amountIn: parseUnits(amount, fromToken.decimals),
    amountOutMinimum: minOutputAmount, // Slippage protection
    sqrtPriceLimitX96: 0,
  }],
});
```

---

## 📝 Complete Implementation Example

### File: `src/lib/uniswap-swap.ts`

```typescript
import { parseUnits, formatUnits } from 'viem';
import { Token } from '@/types';

// Uniswap V3 Router Address (Mainnet & Sepolia)
export const UNISWAP_V3_ROUTER = {
  mainnet: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  sepolia: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
};

// ERC20 ABI (minimal for approve)
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Uniswap V3 Router ABI (minimal for swap)
export const UNISWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

export class UniswapSwapService {
  // Check if token needs approval
  static async needsApproval(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: bigint,
    readContract: any
  ): Promise<boolean> {
    try {
      const allowance = await readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
      });

      return allowance < amount;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return true; // Assume approval needed if check fails
    }
  }

  // Calculate minimum output with slippage
  static calculateMinOutput(
    expectedOutput: string,
    slippagePercent: number
  ): bigint {
    const slippageMultiplier = (100 - slippagePercent) / 100;
    const minOutput = parseFloat(expectedOutput) * slippageMultiplier;
    return BigInt(Math.floor(minOutput));
  }

  // Get router address for current chain
  static getRouterAddress(chainId: number): string {
    if (chainId === 1) return UNISWAP_V3_ROUTER.mainnet;
    if (chainId === 11155111) return UNISWAP_V3_ROUTER.sepolia;
    return UNISWAP_V3_ROUTER.mainnet; // Default to mainnet
  }
}
```

### Updated SwapModal with Real Swaps

```typescript
// src/components/SwapModal.tsx

import { useWriteContract, useReadContract, useChainId } from 'wagmi';
import { UniswapSwapService, ERC20_ABI, UNISWAP_ROUTER_ABI } from '@/lib/uniswap-swap';

export default function SwapModal({ ... }) {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Check if approval is needed
  useEffect(() => {
    if (fromToken && amount && walletAddress) {
      checkApproval();
    }
  }, [fromToken, amount, walletAddress]);

  const checkApproval = async () => {
    const routerAddress = UniswapSwapService.getRouterAddress(chainId);
    const amountBigInt = parseUnits(amount, fromToken.decimals);
    
    const needs = await UniswapSwapService.needsApproval(
      fromToken.address,
      walletAddress,
      routerAddress,
      amountBigInt,
      readContract
    );
    
    setNeedsApproval(needs);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const routerAddress = UniswapSwapService.getRouterAddress(chainId);
      
      await writeContract({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [
          routerAddress as `0x${string}`,
          parseUnits(amount, fromToken.decimals),
        ],
      });

      toast.success('Approval confirmed! Now you can swap.');
      setNeedsApproval(false);
    } catch (error) {
      toast.error('Approval failed');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (needsApproval) {
      await handleApprove();
      return;
    }

    try {
      const routerAddress = UniswapSwapService.getRouterAddress(chainId);
      const amountIn = parseUnits(amount, fromToken.decimals);
      const minAmountOut = UniswapSwapService.calculateMinOutput(
        quote.toAmount,
        slippage
      );

      // REAL SWAP TRANSACTION
      await writeContract({
        address: routerAddress as `0x${string}`,
        abi: UNISWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: fromToken.address as `0x${string}`,
          tokenOut: targetToken.address as `0x${string}`,
          fee: 3000, // 0.3% fee tier
          recipient: walletAddress as `0x${string}`,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
          amountIn: amountIn,
          amountOutMinimum: minAmountOut,
          sqrtPriceLimitX96: BigInt(0),
        }],
      });

      toast.success('Swap initiated! Check your wallet.');
    } catch (error) {
      toast.error('Swap failed: ' + error.message);
    }
  };

  return (
    // ... modal UI
    <button onClick={handleSwap}>
      {needsApproval ? 'Approve Token' : 'Swap Token'}
    </button>
  );
}
```

---

## 🌐 Network Support

### ✅ Mainnet (Chain ID: 1)
- Real swaps with real tokens
- Real gas fees
- Permanent transactions

### ✅ Sepolia Testnet (Chain ID: 11155111)
- Test swaps with test tokens
- Test ETH for gas (free from faucets)
- Safe testing environment

### How to Switch Networks:
1. User clicks network switcher in wallet
2. Or use RainbowKit's built-in network switcher
3. App automatically detects and uses correct router

---

## 🧪 Testing on Sepolia

### 1. Get Sepolia ETH (for gas)
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 2. Get Test Tokens
- Uniswap Sepolia tokens
- Or deploy your own test ERC20

### 3. Test the Swap
- Connect wallet to Sepolia
- Enter amount
- Approve token (Transaction 1)
- Execute swap (Transaction 2)
- Verify on Sepolia Etherscan

---

## 💰 Real Token Addresses

### Mainnet:
```typescript
const TOKENS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
};
```

### Sepolia:
```typescript
const SEPOLIA_TOKENS = {
  WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  // Add more Sepolia test tokens as needed
};
```

---

## ⚠️ Important Considerations

### Gas Fees:
- Approval: ~50,000 gas (~$2-5 on mainnet)
- Swap: ~150,000 gas (~$5-15 on mainnet)
- Total: ~$7-20 per swap on mainnet
- Sepolia: FREE (test ETH)

### Slippage:
- 0.5% = Low slippage, may fail in volatile markets
- 1% = Balanced
- 2%+ = High slippage, more likely to succeed

### Price Impact:
- <1% = Good
- 1-3% = Acceptable
- 3-5% = High (warn user)
- >5% = Very high (strongly warn user)

---

## 🚀 Next Steps

1. ✅ **Sepolia Support Added** - Users can now test on Sepolia!

2. **Implement Real Swaps:**
   - Install Uniswap SDK packages
   - Add the code from this guide
   - Test on Sepolia first
   - Deploy to mainnet

3. **Add 1inch Integration (Optional):**
   - Better rates by aggregating DEXes
   - Requires 1inch API key
   - More complex but better UX

4. **Add Safety Features:**
   - Price impact warnings
   - Slippage protection
   - MEV protection
   - Transaction simulation

---

## 📝 Summary

**Current State:**
- ✅ Sepolia testnet support added
- ✅ Wallet interaction works
- ⚠️ Test transaction (not real swap)

**To Enable Real Swaps:**
1. Install Uniswap SDK
2. Add approval transaction
3. Add swap transaction
4. Test on Sepolia
5. Deploy to mainnet

**The infrastructure is ready - just need to add the Uniswap integration!**

---

## 🔗 Useful Resources

- [Uniswap V3 SDK](https://docs.uniswap.org/sdk/v3/overview)
- [1inch API](https://docs.1inch.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)


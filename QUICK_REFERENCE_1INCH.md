# 1inch Integration - Quick Reference

## 🚀 Quick Start

### Import What You Need

```typescript
import { OneInchService, TOKEN_ADDRESSES } from "@/lib/oneinch";
import { useOneInchSwap } from "@/hooks/useOneInchSwap";
```

## 📦 Using the Hook (Recommended)

```typescript
const {
  quote, // Current quote with price info
  isLoadingQuote, // Loading state
  needsApproval, // Does token need approval?
  getApprovalTx, // Get approval transaction
  prepareSwap, // Get swap transaction
  error, // Any errors
} = useOneInchSwap(
  fromToken, // Token object
  toTokenAddress, // Target token address
  amount, // Amount as string
  slippage // Slippage % (default: 1)
);
```

## 🔧 Direct API Usage

### Get Quote (Price Info)

```typescript
const quote = await OneInchService.getQuote(
  chainId, // 1 for Ethereum
  fromToken, // Token object
  toAddress, // Target token address
  amount, // Amount as string
  slippage // Slippage %
);
// Returns: { toAmount, fromAmount, protocols, estimatedGas }
```

### Check Approval

```typescript
const needsApproval = await OneInchService.needsApproval(
  chainId,
  tokenAddress,
  walletAddress,
  amount,
  decimals
);
// Returns: boolean
```

### Get Approval Transaction

```typescript
const approvalTx = await OneInchService.getApprovalTransaction(
  chainId,
  tokenAddress
);
// Returns: { to, data, value }
// Send this transaction to approve
```

### Get Swap Transaction

```typescript
const swapData = await OneInchService.getSwap(
  chainId,
  fromToken,
  toTokenAddress,
  amount,
  walletAddress,
  slippage
);
// Returns: { tx: { to, data, value, gas, gasPrice }, toAmount, fromAmount }
// Send tx to execute swap
```

## 🪙 Token Addresses

```typescript
TOKEN_ADDRESSES.ETH; // Native ETH
TOKEN_ADDRESSES.USDC; // USD Coin
TOKEN_ADDRESSES.USDT; // Tether
TOKEN_ADDRESSES.DAI; // Dai Stablecoin
TOKEN_ADDRESSES.PYUSD; // PayPal USD
TOKEN_ADDRESSES.WETH; // Wrapped ETH
```

## ✅ Helper Functions

### Check PYUSD Support

```typescript
const supported = OneInchService.supportsPYUSD(chainId);
// Returns: true only for Ethereum Mainnet (chainId === 1)
```

### Get Token Info

```typescript
const pyusd = OneInchService.getPYUSDToken();
const usdc = OneInchService.getUSDCToken();
```

## 🎯 Common Patterns

### Pattern 1: Simple Sell to USDC

```typescript
const { quote, prepareSwap } = useOneInchSwap(
  myToken,
  TOKEN_ADDRESSES.USDC,
  "100",
  1
);

const handleSell = async () => {
  const swapData = await prepareSwap();
  await sendTransaction({
    to: swapData.tx.to,
    data: swapData.tx.data,
    value: swapData.tx.value,
  });
};
```

### Pattern 2: Convert to PYUSD with Approval

```typescript
const { needsApproval, getApprovalTx, prepareSwap } = useOneInchSwap(
  myToken,
  TOKEN_ADDRESSES.PYUSD,
  "100",
  1
);

const handleConvert = async () => {
  if (needsApproval) {
    const approvalTx = await getApprovalTx();
    await sendTransaction(approvalTx);
    // Wait for approval, then call again
  } else {
    const swapData = await prepareSwap();
    await sendTransaction(swapData.tx);
  }
};
```

### Pattern 3: Show Quote Before Swap

```typescript
const { quote, isLoadingQuote } = useOneInchSwap(
  myToken,
  TOKEN_ADDRESSES.USDC,
  amount,
  1
);

return (
  <div>
    {isLoadingQuote ? (
      <div>Loading...</div>
    ) : quote ? (
      <div>
        <div>You'll receive: {quote.toAmount} USDC</div>
        <div>Price Impact: {quote.priceImpact}%</div>
        <div>Route: {quote.protocols.join(' → ')}</div>
      </div>
    ) : null}
  </div>
);
```

## ⚠️ Important Notes

1. **Always check approval first** - Most ERC-20 tokens need approval before swapping
2. **Native ETH doesn't need approval** - Only ERC-20 tokens do
3. **PYUSD only on Ethereum** - Check with `supportsPYUSD(chainId)`
4. **Quotes update automatically** - Hook debounces by 500ms
5. **Handle errors** - Always wrap in try/catch

## 🔐 Security Checklist

- ✅ Validate amount doesn't exceed balance
- ✅ Check price impact (warn if > 5%)
- ✅ Set reasonable slippage (0.5% - 2%)
- ✅ Show transaction details before confirming
- ✅ Handle user rejection gracefully
- ✅ Verify chain ID matches expected network

## 📊 Quote Object Structure

```typescript
{
  toAmount: string;        // Amount user will receive
  estimatedGas: string;    // Gas estimate in Gwei
  protocols: string[];     // DEXs used (e.g., ['Uniswap', 'Curve'])
  priceImpact: number;     // Price impact percentage
}
```

## 🌐 Supported Chains

- ✅ Ethereum Mainnet (1)
- ✅ Polygon (137)
- ✅ BSC (56)
- ✅ Arbitrum (42161)
- ✅ Optimism (10)
- ✅ Base (8453)
- ⚠️ PYUSD only on Ethereum Mainnet

## 🐛 Common Errors

| Error                    | Cause                           | Solution                             |
| ------------------------ | ------------------------------- | ------------------------------------ |
| "Insufficient liquidity" | Not enough liquidity for swap   | Reduce amount or try different token |
| "Insufficient allowance" | Token not approved              | Call `getApprovalTx()` first         |
| "Insufficient balance"   | User doesn't have enough tokens | Validate balance before swap         |
| "1inch API error: 401"   | Invalid API key                 | Check `.env.local`                   |
| "1inch API error: 429"   | Rate limit exceeded             | Add debouncing/throttling            |

## 📞 Need Help?

- Check `ONEINCH_INTEGRATION_GUIDE.md` for detailed docs
- See `src/examples/OneInchExample.tsx` for more examples
- 1inch Docs: https://portal.1inch.dev/documentation
- Your implementation: `src/components/SwapModal.tsx`

## 🎉 You're Ready!

Your app now has production-ready swap functionality. Test it out:

1. Connect wallet
2. Click "Sell" or "Convert to PYUSD" on any token
3. Enter amount
4. Approve (if needed)
5. Execute swap
6. Done! 🚀

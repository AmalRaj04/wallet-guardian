# 1inch Integration - Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Issue 1: "1inch API key not configured"

**Symptoms:**

- Error when trying to get quote
- Console shows "1inch API key not configured"

**Solution:**

```bash
# Check .env.local has:
NEXT_PUBLIC_1INCH_API_KEY=JZZbNxyRDpiYGC7lg6pQsFjg9cKZ7ZWo

# Restart dev server:
npm run dev
```

---

### Issue 2: Quote Not Loading

**Symptoms:**

- Spinner keeps spinning
- No quote appears after entering amount

**Possible Causes & Solutions:**

**A. Amount too small**

```typescript
// Minimum amounts vary by token
// Try at least $10 worth
setAmount("10");
```

**B. No liquidity for token pair**

```typescript
// Check if token has liquidity
const quote = await OneInchService.getQuote(...);
// If fails, try different target token
```

**C. Network issues**

```typescript
// Check browser console for errors
// Verify API key is valid
// Check 1inch API status: https://status.1inch.io/
```

---

### Issue 3: "Insufficient Liquidity"

**Symptoms:**

- Error: "Insufficient liquidity"
- Swap fails to prepare

**Solutions:**

**A. Reduce amount**

```typescript
// Try smaller amount
const smallerAmount = (parseFloat(amount) * 0.5).toString();
```

**B. Try different target token**

```typescript
// Instead of PYUSD, try USDC
const targetToken = TOKEN_ADDRESSES.USDC;
```

**C. Check if token is tradeable**

```typescript
// Some tokens have trading restrictions
// Verify on Etherscan
```

---

### Issue 4: Approval Transaction Fails

**Symptoms:**

- Approval transaction reverts
- "Transaction failed" error

**Solutions:**

**A. Check gas price**

```typescript
// Increase gas limit
const approvalTx = await getApprovalTx();
// Add 20% buffer
approvalTx.gas = Math.floor(approvalTx.gas * 1.2);
```

**B. Check token contract**

```typescript
// Some tokens have special approval logic
// Try approving unlimited amount
const approvalTx = await OneInchService.getApprovalTransaction(
  chainId,
  tokenAddress,
  "115792089237316195423570985008687907853269984665640564039457584007913129639935" // Max uint256
);
```

**C. Reset approval first**

```typescript
// Some tokens (like USDT) require resetting to 0 first
// 1. Approve 0
// 2. Then approve desired amount
```

---

### Issue 5: Swap Transaction Fails

**Symptoms:**

- Swap transaction reverts
- "Execution reverted" error

**Solutions:**

**A. Increase slippage**

```typescript
// Price moved during transaction
// Try higher slippage
setSlippage(2); // 2% instead of 1%
```

**B. Check deadline**

```typescript
// Transaction took too long
// 1inch sets deadline automatically
// Try again with fresh quote
```

**C. Verify balance**

```typescript
// Make sure balance hasn't changed
if (parseFloat(amount) > fromToken.balanceFormatted) {
  console.error("Insufficient balance");
}
```

---

### Issue 6: High Price Impact Warning

**Symptoms:**

- Warning: "High price impact!"
- Price impact > 5%

**Solutions:**

**A. Reduce amount**

```typescript
// Large trades have higher impact
// Split into multiple smaller trades
const halfAmount = (parseFloat(amount) / 2).toString();
```

**B. Wait for better liquidity**

```typescript
// Try during high-volume hours
// Check liquidity on DEX directly
```

**C. Use different route**

```typescript
// 1inch automatically finds best route
// But you can try different target token
// USDC usually has better liquidity than PYUSD
```

---

### Issue 7: PYUSD Not Available

**Symptoms:**

- Warning: "PYUSD Not Available"
- Can't convert to PYUSD

**Solution:**

```typescript
// PYUSD only on Ethereum Mainnet
const chainId = useChainId();

if (chainId !== 1) {
  // Switch to Ethereum Mainnet
  await switchChain({ chainId: 1 });
}

// Or use USDC instead
const targetToken = TOKEN_ADDRESSES.USDC;
```

---

### Issue 8: Transaction Stuck Pending

**Symptoms:**

- Transaction shows "Pending" forever
- No confirmation

**Solutions:**

**A. Check Etherscan**

```typescript
// View transaction on Etherscan
const txUrl = `https://etherscan.io/tx/${hash}`;
// Check if it's actually pending or failed
```

**B. Speed up transaction**

```typescript
// Use wallet's "Speed Up" feature
// Or wait for it to complete
// Typical wait: 15 seconds - 5 minutes
```

**C. Cancel if needed**

```typescript
// Use wallet's "Cancel" feature
// Sends transaction with same nonce but higher gas
```

---

### Issue 9: Wrong Amount Received

**Symptoms:**

- Received less than quoted
- Price impact higher than expected

**Explanations:**

**A. Slippage**

```typescript
// Normal - price moved during transaction
// Increase slippage tolerance if needed
setSlippage(2);
```

**B. Gas fees**

```typescript
// Gas is paid separately in ETH
// Doesn't affect token amounts
```

**C. Token taxes**

```typescript
// Some tokens have transfer fees
// Check token contract on Etherscan
```

---

### Issue 10: Rate Limit Errors

**Symptoms:**

- Error: "1inch API error: 429"
- "Too many requests"

**Solutions:**

**A. Add debouncing**

```typescript
// Already implemented in useOneInchSwap
// Waits 500ms before fetching quote
// Don't call API directly in rapid succession
```

**B. Cache quotes**

```typescript
// Store recent quotes
const [cachedQuote, setCachedQuote] = useState(null);
// Reuse if amount hasn't changed much
```

**C. Upgrade API plan**

```typescript
// Free tier: 1 request/second
// Check 1inch portal for limits
// Consider paid plan for production
```

---

## 🧪 Testing Checklist

### Before Going Live

- [ ] Test with small amounts first ($1-10)
- [ ] Test approval flow
- [ ] Test swap flow
- [ ] Test error handling (insufficient balance)
- [ ] Test on correct network (Ethereum for PYUSD)
- [ ] Test with different tokens
- [ ] Test with different slippage values
- [ ] Verify transaction on Etherscan
- [ ] Check received amounts match quotes
- [ ] Test wallet rejection flow

### Network-Specific Tests

**Ethereum Mainnet:**

- [ ] PYUSD conversion works
- [ ] USDC swap works
- [ ] ETH swap works

**Other Networks:**

- [ ] PYUSD shows warning
- [ ] USDC swap works
- [ ] Native token swap works

---

## 🔧 Debug Mode

Enable detailed logging:

```typescript
// In src/lib/oneinch.ts
private static async request<T>(...) {
  console.log('1inch API Request:', { chainId, endpoint, params });

  const response = await fetch(url, ...);
  const data = await response.json();

  console.log('1inch API Response:', data);
  return data;
}
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Success Rate**
   - Approvals completed / Approvals attempted
   - Swaps completed / Swaps attempted

2. **Average Price Impact**
   - Should be < 1% for most trades
   - Alert if > 5%

3. **Average Gas Cost**
   - Track gas used per swap
   - Compare with direct Uniswap

4. **API Response Time**
   - Quote fetch time
   - Should be < 1 second

5. **Error Rate**
   - Track error types
   - Most common errors

---

## 🆘 Still Having Issues?

### Check These Files

1. **Environment Variables**

   ```bash
   cat .env.local | grep 1INCH
   ```

2. **API Service**

   ```bash
   cat src/lib/oneinch.ts
   ```

3. **Hook Implementation**

   ```bash
   cat src/hooks/useOneInchSwap.ts
   ```

4. **Modal Component**
   ```bash
   cat src/components/SwapModal.tsx
   ```

### Get Help

- 1inch Discord: https://discord.gg/1inch
- 1inch Support: https://help.1inch.io/
- 1inch Docs: https://portal.1inch.dev/documentation
- GitHub Issues: Check for similar issues

### Contact 1inch Support

Include:

- Chain ID
- Token addresses (from & to)
- Amount
- Error message
- Transaction hash (if available)
- API request/response (from console)

---

## ✅ Quick Fixes

### Reset Everything

```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall
npm install

# Restart
npm run dev
```

### Verify Setup

```typescript
// Test API connection
const test = async () => {
  try {
    const quote = await OneInchService.getQuote(
      1, // Ethereum
      {
        address: TOKEN_ADDRESSES.USDC,
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
        balance: "0",
        balanceFormatted: 0,
      },
      TOKEN_ADDRESSES.PYUSD,
      "100",
      1
    );
    console.log("✅ 1inch API working:", quote);
  } catch (error) {
    console.error("❌ 1inch API error:", error);
  }
};
test();
```

---

## 📝 Logging Best Practices

```typescript
// Good logging
console.log("Fetching quote for", {
  from: fromToken.symbol,
  to: targetToken.symbol,
  amount,
  slippage,
});

// Bad logging
console.log("Getting quote"); // Not helpful
```

---

## 🎯 Performance Tips

1. **Debounce user input** - Already done in hook
2. **Cache quotes** - For same amount/tokens
3. **Batch requests** - If checking multiple pairs
4. **Use quote endpoint** - Before swap endpoint
5. **Optimize re-renders** - Use React.memo where needed

---

## 🚀 Ready to Deploy?

Final checklist:

- [ ] All tests passing
- [ ] Error handling complete
- [ ] Loading states working
- [ ] Tested on mainnet (small amounts)
- [ ] API key secured
- [ ] Rate limiting handled
- [ ] User feedback clear
- [ ] Transaction tracking working
- [ ] Documentation updated

**You're good to go!** 🎉

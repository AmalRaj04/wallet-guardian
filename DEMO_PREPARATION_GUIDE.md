# 🎬 Demo Preparation Guide - Get Real Data Showing

## Problem: Everything Shows Zero

You're seeing:

- ❌ 0 Total Approvals
- ❌ 0 High Risk
- ❌ 0 Unlimited
- ❌ "No Active Approvals"
- ❌ "Monitoring Paused"
- ❌ 0 transactions in mempool

## Solution: Create Real Activity

---

## 🎯 Step 1: Get Test Tokens (5 minutes)

### On Sepolia Testnet:

1. **Get Sepolia ETH**

   ```
   https://sepoliafaucet.com/
   - Enter your wallet address
   - Get 0.5 Sepolia ETH
   ```

2. **Get Sepolia LINK**

   ```
   https://faucets.chain.link/sepolia
   - Enter your wallet address
   - Get 10 LINK tokens
   ```

3. **Get Sepolia USDC** (if available)
   ```
   Contract: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   - Use a faucet or swap some ETH
   ```

---

## 🎯 Step 2: Create Token Approvals (10 minutes)

### Why: This will make the "Token Approvals" section show data

### Method 1: Approve via Uniswap (Easiest)

```bash
1. Go to: https://app.uniswap.org/
2. Connect your wallet (Sepolia network)
3. Try to swap LINK → ETH
4. Click "Approve LINK"
5. Confirm in MetaMask
6. Wait for confirmation
7. ✅ Now you have 1 approval!
```

### Method 2: Approve via Your App

```bash
1. Go to your app's Swap page
2. Select LINK → USDC
3. Enter amount: 1 LINK
4. Click "Get Quote"
5. Click "Approve LINK"
6. Confirm transaction
7. ✅ Approval created!
```

### Method 3: Approve Multiple Tokens

```bash
# Create 3-4 approvals for demo:
1. Approve LINK on Uniswap
2. Approve USDC on Uniswap
3. Approve LINK on 1inch (if available)
4. Approve any other token you have
```

---

## 🎯 Step 3: Make Some Transactions (5 minutes)

### Why: This will populate transaction history and mempool

### Create Activity:

```bash
1. Send 0.01 ETH to another address
2. Swap 0.1 LINK → ETH on Uniswap
3. Transfer some LINK to another wallet
4. Interact with a contract (any DeFi protocol)
```

### Quick Transactions:

```bash
# Self-transfer (creates activity):
1. Send 0.001 ETH to your own address
2. Transfer 1 LINK to your own address
3. These show up in transaction history!
```

---

## 🎯 Step 4: Fix Monitoring Status

### Why Monitoring is Paused:

The monitoring needs tokens to track. Let's fix it:

### Check Current Code:

The issue is likely in `useRealTimeMonitoring.ts` - it needs tokens to start.

### Quick Fix:

```typescript
// The monitoring should auto-start when you have tokens
// If it doesn't, we need to check the hook
```

Let me check your monitoring hook...

````

---

## 🎯 Step 5: Use Mainnet for Demo (Recommended)

### Why: Mainnet has real activity and approvals

If you already use DeFi on mainnet:

```bash
1. Switch to Ethereum Mainnet
2. Connect your real wallet
3. Your app will show:
   ✅ Real token approvals (Uniswap, 1inch, etc.)
   ✅ Real transaction history
   ✅ Real token balances
   ✅ Real mempool activity
````

### Safety:

- Your app only READS data
- It doesn't execute transactions automatically
- Safe to connect mainnet wallet

---

## 🎯 Step 6: Create Unlimited Approval (For Demo)

### Why: Shows the "High Risk" warning

### How to Create Unlimited Approval:

```bash
1. Go to Uniswap
2. When approving, click "Advanced"
3. Select "Unlimited approval"
4. Confirm transaction
5. ✅ Now you'll see "Unlimited" in your app!
```

### Or Use Etherscan:

```bash
1. Go to token contract on Etherscan
2. Click "Write Contract"
3. Connect wallet
4. Call approve() with:
   - spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564 (Uniswap)
   - amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
5. ✅ Unlimited approval created!
```

---

## 🎯 Step 7: Test Each Feature

### Token Approvals:

```bash
✅ Should show: Number of approvals
✅ Should show: Unlimited vs Limited
✅ Should show: Spender names (Uniswap, 1inch, etc.)
✅ Should show: Risk levels
✅ Should have: "Revoke" button
```

### Mempool Monitoring:

```bash
✅ Should show: "Monitoring Active" (not paused)
✅ Should show: Transaction count
✅ Should show: Recent transactions
✅ Should show: Risk levels
```

### Transaction History:

```bash
✅ Should show: Recent transactions
✅ Should show: From/To addresses
✅ Should show: Values and timestamps
✅ Should show: Success/Failed status
```

---

## 🎯 Quick Demo Scenario (15 minutes)

### Preparation:

```bash
1. Get Sepolia ETH (2 min)
2. Get Sepolia LINK (2 min)
3. Approve LINK on Uniswap (3 min)
4. Make 2-3 test transactions (5 min)
5. Refresh your app (1 min)
6. ✅ Everything shows data!
```

### For Video Demo:

```bash
1. Show empty state first
2. Go to Uniswap, create approval
3. Come back to your app
4. Click "Refresh"
5. Show approval appearing
6. Show risk analysis
7. Click "Revoke" to demonstrate
8. Show it being revoked
```

---

## 🎯 Alternative: Use Mainnet with Existing Activity

### If You Already Use DeFi:

```bash
1. Switch to Mainnet
2. Connect your wallet
3. Instant data:
   ✅ All your existing approvals
   ✅ All your transaction history
   ✅ Real token balances
   ✅ Real risk scores
```

### Recommended for Demo:

- More impressive (real data)
- Shows actual use case
- No setup needed
- Just READ-ONLY, safe

---

## 🔧 Troubleshooting

### Issue: Approvals Not Showing

**Check:**

```bash
1. Are you on the right network?
2. Did transaction confirm?
3. Did you refresh the page?
4. Check browser console for errors
```

**Fix:**

```bash
1. Wait 30 seconds after approval
2. Hard refresh (Ctrl+Shift+R)
3. Disconnect and reconnect wallet
```

### Issue: Monitoring Still Paused

**Check:**

```bash
1. Do you have any tokens?
2. Is wallet connected?
3. Check console for errors
```

**Fix:**

```bash
1. Make sure you have tokens
2. Refresh page
3. Reconnect wallet
```

### Issue: No Transactions Showing

**Check:**

```bash
1. Have you made any transactions?
2. Are you on the right network?
3. Is Blockscout API working?
```

**Fix:**

```bash
1. Make a test transaction
2. Wait 1 minute
3. Refresh page
```

---

## 📹 Perfect Demo Script

### Scene 1: Problem (30 seconds)

```
"Users don't know what they've approved"
- Show Etherscan with many approvals
- Show risk of unlimited approvals
```

### Scene 2: Solution (1 minute)

```
"Wallet Guardian shows all approvals"
- Connect wallet
- Show approval list
- Highlight unlimited approvals
- Show risk scores
```

### Scene 3: Action (1 minute)

```
"One-click revoke dangerous approvals"
- Click "Revoke" on unlimited approval
- Show transaction
- Show approval removed
- Show improved security score
```

### Scene 4: Monitoring (1 minute)

```
"Real-time threat detection"
- Show mempool monitor
- Show transaction detection
- Show risk analysis
- Show alerts
```

### Scene 5: Envio (30 seconds)

```
"Powered by Envio HyperSync"
- Show Envio demo page
- Show fast analysis
- Show performance metrics
```

---

## ✅ Checklist Before Recording

- [ ] Wallet has Sepolia ETH
- [ ] Wallet has test tokens (LINK, USDC)
- [ ] Created 2-3 token approvals
- [ ] Made 3-5 test transactions
- [ ] App shows approvals (not 0)
- [ ] App shows transactions
- [ ] Monitoring is active (not paused)
- [ ] Tested revoke function
- [ ] Tested Envio demo page
- [ ] Browser console is clean (no errors)

---

## 🚀 Ready to Record!

Once you have:

- ✅ Real token approvals showing
- ✅ Real transactions showing
- ✅ Monitoring active
- ✅ All features working

You're ready to record an impressive demo! 🎬

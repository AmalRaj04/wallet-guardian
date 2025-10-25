# 🎬 Mempool & Security Demo Guide

## Get Real Data Showing for Your Demo Video

This guide shows you how to trigger REAL mempool monitoring, threats blocked, and funds protected metrics using actual blockchain transactions.

---

## 🎯 What You Need to Show

1. **Live Mempool Monitor** - Real pending transactions
2. **Threats Blocked** - Actual suspicious transactions detected
3. **Funds Protected** - Real value calculations from blocked threats

---

## 📋 Prerequisites

✅ Wallet connected to Sepolia testnet
✅ Some Sepolia ETH (~0.1 ETH)
✅ Some test tokens (LINK, USDC, etc.)
✅ Monitoring must be ACTIVE (not paused)

---

## 🚀 STEP 1: Activate Monitoring

### Start the Monitoring System

1. **Connect your wallet** to the app
2. **Click "Start Monitoring"** button in the Security Dashboard
3. **Verify status shows "Active"** (not "Paused")

The monitoring system will now:

- Watch the Sepolia mempool for transactions
- Scan for suspicious patterns
- Calculate risk scores in real-time

---

## 🎭 STEP 2: Generate Mempool Activity

### Option A: Make Token Swaps (Easiest)

This generates legitimate mempool activity that will show up:

```bash
1. Go to your app's Swap feature
2. Initiate a swap (e.g., 0.01 ETH → LINK)
3. DON'T confirm immediately in MetaMask
4. Wait 5-10 seconds
5. Your pending transaction appears in mempool monitor
6. Then confirm or reject
```

**What happens:**

- Transaction enters mempool → Shows in "Live Mempool Monitor"
- System analyzes it → Shows transaction details
- If confirmed → Transaction count increases

### Option B: Create Multiple Approvals

Generate approval transactions:

```bash
1. Go to Etherscan Sepolia
2. Navigate to LINK token:
   https://sepolia.etherscan.io/address/0x779877A7B0D9E8603169DdbD7836e478b4624789
3. Click "Contract" → "Write Contract" → "Connect to Web3"
4. Use "approve" function:
   - spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564
   - amount: 1000000000000000000
5. Click "Write" but DON'T confirm yet
6. Wait 10 seconds → Shows in mempool
7. Confirm transaction
```

Repeat with different tokens to generate more activity.

---

## 🚨 STEP 3: Trigger Threat Detection

### Create Suspicious Patterns

The system detects threats based on patterns. Here's how to trigger them:

#### A. Unlimited Approval (HIGH RISK)

```bash
1. Go to any ERC20 token on Etherscan Sepolia
2. Use "approve" function with:
   - spender: Random address (not a known DEX)
   - amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
     (This is max uint256 = unlimited approval)
3. Submit transaction
```

**Result:**

- ⚠️ Threat detected: "Unlimited Approval to Unknown Contract"
- Severity: HIGH or CRITICAL
- Threats Blocked: +1
- Funds Protected: +[token value]

#### B. Multiple Rapid Approvals (MEDIUM RISK)

```bash
1. Create 3+ approvals within 60 seconds
2. Use different tokens or same token
3. System detects pattern
```

**Result:**

- ⚠️ Threat detected: "Suspicious Approval Pattern"
- Severity: MEDIUM
- Threats Blocked: +1

#### C. Approval to Unverified Contract

```bash
1. Deploy a simple contract (or use unverified address)
2. Approve tokens to that address
3. System checks contract verification
```

**Result:**

- ⚠️ Threat detected: "Approval to Unverified Contract"
- Severity: HIGH
- Threats Blocked: +1

---

## 💰 STEP 4: Accumulate "Funds Protected"

The "Funds Protected" metric calculates the USD value of tokens that would have been at risk.

### How It Calculates:

```typescript
Funds Protected = Sum of:
- Token balance × Token price (for unlimited approvals)
- Approval amount × Token price (for limited approvals)
- Estimated loss from detected attacks
```

### To Increase This Number:

1. **Hold valuable tokens** in your wallet
   - Get testnet USDC, LINK, DAI
   - More tokens = higher protection value

2. **Create high-value approvals**
   - Approve larger amounts
   - Use tokens with higher test values

3. **Revoke risky approvals**
   - Each revocation counts as "funds protected"
   - Value = what WOULD have been at risk

---

## 🎥 DEMO SCRIPT FOR VIDEO

### Perfect Demo Flow (5 minutes):

```
SCENE 1: Dashboard Overview (30 sec)
- Show clean dashboard
- Point out: "Currently 0 threats, $0 protected"
- Click "Start Monitoring"
- Status changes to "Active"

SCENE 2: Create Approval (1 min)
- Go to Etherscan
- Create unlimited approval to random address
- Show transaction pending in mempool
- "Watch this - the system is analyzing..."

SCENE 3: Threat Detected (1 min)
- Alert pops up: "🚨 CRITICAL: Unlimited Approval Detected"
- Threats Blocked: 0 → 1
- Funds Protected: $0 → $X.XX
- Show alert details
- Click "Revoke Approval"

SCENE 4: Create Multiple Approvals (1 min)
- Create 2-3 more approvals quickly
- Show mempool filling up
- Multiple alerts appear
- Threats Blocked increases
- Funds Protected increases

SCENE 5: Review & Explain (1.5 min)
- Show final stats:
  - "5 transactions monitored"
  - "3 threats blocked"
  - "$XXX funds protected"
- Explain: "This is real-time protection"
- Show alert history
- Demonstrate revoke functionality
```

---

## 🔧 Troubleshooting

### Monitoring Shows "Paused"

```bash
Solution: Click "Start Monitoring" button
Make sure wallet is connected
```

### No Transactions Showing

```bash
Check:
1. Is monitoring active?
2. Is wallet connected?
3. Are you on Sepolia network?
4. Check browser console for errors
```

### Threats Not Being Detected

```bash
The system looks for:
- Unlimited approvals (max uint256)
- Approvals to unverified contracts
- Rapid approval patterns
- Suspicious transaction patterns

Make sure you're creating these patterns!
```

### Funds Protected Shows $0

```bash
This happens when:
- No token prices available
- Tokens have no value
- No risky approvals detected

Solution: Use well-known testnet tokens (LINK, USDC)
```

---

## 📊 Expected Results

After following this guide, you should see:

```
✅ Monitoring Status: Active
✅ Live Mempool: 5-10 transactions
✅ Threats Blocked: 2-5
✅ Funds Protected: $50-500 (testnet value)
✅ Multiple alerts in history
✅ Real-time updates working
```

---

## 🎯 Pro Tips for Best Demo

1. **Prepare tokens beforehand**
   - Get LINK, USDC, DAI on Sepolia
   - Have some balance to show value

2. **Create variety**
   - Mix low, medium, high risk approvals
   - Show different threat types

3. **Timing matters**
   - Wait for mempool to show transaction
   - Let alerts appear naturally
   - Don't rush through

4. **Explain as you go**
   - "Here's a suspicious approval..."
   - "Watch the system detect it..."
   - "Now it's protecting my funds..."

5. **Show the revoke feature**
   - Actually revoke an approval
   - Show it disappear from active list
   - Explain the protection

---

## 🚀 Quick Start Checklist

- [ ] Wallet connected to Sepolia
- [ ] Have 0.1 Sepolia ETH
- [ ] Have some test tokens (LINK, USDC)
- [ ] Monitoring is ACTIVE
- [ ] Browser console open (to verify no errors)
- [ ] Ready to create approvals
- [ ] Screen recording software ready

---

## 📝 What Makes This REAL (Not Mock Data)

✅ **Real blockchain transactions** - Actual Sepolia network
✅ **Real mempool monitoring** - Via Alchemy/Envio APIs
✅ **Real contract analysis** - Bytecode verification
✅ **Real risk calculations** - Based on actual patterns
✅ **Real token prices** - From price feeds
✅ **Real revocations** - Actual blockchain transactions

**NO MOCK DATA** - Everything is live and verifiable on Sepolia Etherscan!

---

## 🎬 Ready to Record?

Follow the demo script above and you'll have:

- Real mempool activity
- Real threat detection
- Real funds protected metrics
- Real-time monitoring in action

Perfect for your demo video! 🚀

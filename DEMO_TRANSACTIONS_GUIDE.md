# 🎬 Demo Transactions Guide - See Live Monitoring in Action

## Prerequisites

✅ Dev server restarted with new Alchemy key
✅ Browser refreshed
✅ Wallet connected to Sepolia
✅ Have some Sepolia ETH (~0.1 ETH)
✅ Monitoring shows "Active" status

---

## 🎯 Transaction Scenarios for Demo

### Scenario 1: Low Risk Approval (Safe) ✅

**What it shows:** System detects safe, limited approval

**Steps:**

1. Go to Etherscan Sepolia: https://sepolia.etherscan.io/address/0x779877A7B0D9E8603169DdbD7836e478b4624789
2. Click "Contract" → "Write Contract" → "Connect to Web3"
3. Find "approve" function
4. Enter:
   ```
   spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564
   amount: 1000000000000000000
   ```
   (This is 1 LINK - a reasonable amount)
5. Click "Write" → Confirm in MetaMask
6. Wait 10-20 seconds
7. **Check your app:**
   - Should appear in Token Allowances
   - Risk level: LOW ✅
   - Shows as safe approval

---

### Scenario 2: Unlimited Approval (HIGH RISK) 🚨

**What it shows:** System detects dangerous unlimited approval

**Steps:**

1. Same LINK token on Etherscan
2. Use "approve" function again
3. Enter:
   ```
   spender: 0x1234567890123456789012345678901234567890
   amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
   ```
   (This is max uint256 = UNLIMITED)
4. Click "Write" → Confirm
5. Wait 10-20 seconds
6. **Check your app:**
   - Appears in Token Allowances
   - Risk level: CRITICAL 🚨
   - Shows "Unlimited Approval" warning
   - Recommends revoke

---

### Scenario 3: Multiple Rapid Approvals (SUSPICIOUS) ⚠️

**What it shows:** System detects suspicious pattern

**Steps:**

1. Create 3 approvals within 2 minutes:

   **Approval 1:**

   ```
   Token: LINK
   Spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564
   Amount: 1000000000000000000
   ```

   **Approval 2:**

   ```
   Token: LINK
   Spender: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
   Amount: 2000000000000000000
   ```

   **Approval 3:**

   ```
   Token: LINK
   Spender: 0x1111111254fb6c44bAC0beD2854e76F90643097d
   Amount: 3000000000000000000
   ```

2. **Check your app:**
   - All 3 appear in Token Allowances
   - System may flag suspicious pattern
   - Shows multiple active approvals

---

### Scenario 4: Token Transfer (ACTIVITY) 📊

**What it shows:** System tracks token movements

**Steps:**

1. Go to LINK token on Etherscan
2. Click "Write Contract"
3. Find "transfer" function
4. Enter:
   ```
   recipient: 0x0000000000000000000000000000000000000001
   amount: 100000000000000000
   ```
   (0.1 LINK to burn address)
5. Confirm transaction
6. **Check your app:**
   - Transaction appears in history
   - Shows token movement
   - Updates balance

---

### Scenario 5: Revoke Approval (PROTECTION) 🛡️

**What it shows:** System helps you revoke dangerous approvals

**Steps:**

1. In your app, go to Token Allowances section
2. Find the UNLIMITED approval (red/critical)
3. Click "Revoke" button
4. Confirm in MetaMask
5. Wait for confirmation
6. **Check your app:**
   - Approval disappears from list
   - "Funds Protected" metric increases
   - "Threats Blocked" increases
   - Shows successful protection

---

## 🎥 Perfect Demo Script (5 minutes)

### Act 1: Setup (30 seconds)

```
"Here's Wallet Guardian - a real-time security monitoring system"
- Show dashboard
- Point out monitoring is "Active"
- Show current stats (0 threats, $0 protected)
```

### Act 2: Safe Approval (1 minute)

```
"Let's create a normal, safe token approval"
- Go to Etherscan
- Create 1 LINK approval
- Come back to app
- "See? It detected it and marked it as LOW risk"
- Point out the details
```

### Act 3: Dangerous Approval (1.5 minutes)

```
"Now watch what happens with an UNLIMITED approval"
- Go to Etherscan
- Create unlimited approval
- Come back to app
- "CRITICAL alert! The system detected this is dangerous"
- Show the warning
- Point out "Unlimited" badge
- Explain the risk
```

### Act 4: Protection (1.5 minutes)

```
"The system helps me protect my funds"
- Click "Revoke" on the unlimited approval
- Confirm transaction
- "See the metrics update?"
- Point out:
  - Threats Blocked: +1
  - Funds Protected: $XXX
  - Approval removed from list
```

### Act 5: Wrap Up (30 seconds)

```
"This is real-time blockchain security monitoring"
- Show final stats
- Highlight key features:
  - Real transactions ✅
  - Risk detection ✅
  - One-click revoke ✅
  - Funds protected ✅
```

---

## 💡 Pro Tips for Best Demo

### 1. Prepare Beforehand

- Have Etherscan tabs open
- Have test amounts ready to copy/paste
- Practice the flow once

### 2. Timing

- Wait 10-20 seconds after each transaction
- Don't rush - let the system detect
- Explain what's happening during waits

### 3. Narration

- Explain each step clearly
- Point out the security features
- Highlight the real-time aspect
- Emphasize it's real blockchain data

### 4. Show the Details

- Click on approvals to show details
- Hover over risk badges
- Show the revoke functionality
- Demonstrate the metrics updating

### 5. Handle Delays

If transaction doesn't appear immediately:

- "The system polls every 10 seconds"
- "This is real blockchain data, not mock"
- Check Token Allowances section
- Refresh if needed

---

## 🎯 What Each Transaction Demonstrates

### Low Risk Approval:

- ✅ System detects transactions
- ✅ Risk analysis works
- ✅ Shows safe approvals
- ✅ Provides details

### Unlimited Approval:

- ✅ Detects dangerous patterns
- ✅ Shows critical warnings
- ✅ Calculates risk correctly
- ✅ Recommends action

### Multiple Approvals:

- ✅ Tracks multiple transactions
- ✅ Shows all active approvals
- ✅ Compares risk levels
- ✅ Comprehensive monitoring

### Revoke:

- ✅ One-click protection
- ✅ Metrics update
- ✅ Funds protected calculation
- ✅ Threat mitigation

---

## 📊 Expected Results

After completing all scenarios:

**Token Allowances Section:**

- 3-4 active approvals showing
- Mix of risk levels (Low, High, Critical)
- Details for each approval
- Revoke buttons available

**Metrics:**

- Threats Blocked: 1-2
- Funds Protected: $50-500 (testnet value)
- Active Approvals: 2-3 (after revoking one)

**Live Monitoring:**

- Shows recent transactions
- Updates in real-time
- Professional appearance

---

## 🚨 Troubleshooting

### Transactions not appearing?

1. Wait 20 seconds (full poll cycle)
2. Check Token Allowances section
3. Refresh browser
4. Check console for errors

### Risk levels not showing?

- This is normal - basic detection works
- Focus on showing the approvals
- Demonstrate revoke functionality

### Metrics not updating?

- Refresh page
- Check if monitoring is "Active"
- Restart if needed

---

## 🎬 Alternative: Use Existing Approvals

If you already have approvals from earlier:

1. **Go to Token Allowances section**
2. **Show existing approvals**
3. **Demonstrate revoke on one**
4. **Show metrics update**
5. **Explain the protection**

This works great and is actually more reliable!

---

## 📝 Quick Reference

**LINK Token (Sepolia):**

```
0x779877A7B0D9E8603169DdbD7836e478b4624789
```

**Common Spenders:**

```
Uniswap Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
1inch Router: 0x1111111254fb6c44bAC0beD2854e76F90643097d
Random (for demo): 0x1234567890123456789012345678901234567890
```

**Amounts:**

```
1 LINK: 1000000000000000000
Unlimited: 115792089237316195423570985008687907853269984665640564039457584007913129639935
```

---

## 🚀 Ready to Record!

Follow the demo script above and you'll have a professional, impressive demo showing:

- ✅ Real blockchain transactions
- ✅ Real-time security monitoring
- ✅ Risk detection
- ✅ Protection features
- ✅ Professional UI

Good luck with your demo! 🎥

# 🚨 Create UNLIMITED Approval - High Risk Demo

## Goal: Create High-Risk Unlimited Approval

This will show:

- ⚠️ **High Risk** badge
- 🔴 **Unlimited** amount
- 📊 **Higher risk score**
- 🎯 **Perfect for demo video**

---

## Method 1: Via Etherscan (EASIEST)

### Step-by-Step:

```bash
1. Go to Sepolia LINK Token:
   https://sepolia.etherscan.io/address/0x779877A7B0D9E8603169DdbD7836e478b4624789

2. Click "Contract" tab

3. Click "Write Contract"

4. Click "Connect to Web3" (connect MetaMask)

5. Find function "1. approve"

6. Enter these EXACT values:

   spender (address):
   0xE592427A0AEce92De3Edee1F18E0157C05861564

   amount (uint256):
   115792089237316195423570985008687907853269984665640564039457584007913129639935

7. Click "Write"

8. Confirm in MetaMask

9. Wait 30 seconds

10. Refresh your app

11. ✅ You'll see "UNLIMITED" approval with HIGH RISK!
```

### What That Number Means:

```
115792089237316195423570985008687907853269984665640564039457584007913129639935

= 2^256 - 1
= Maximum possible uint256 value
= "UNLIMITED" in your app
= Highest risk level
```

---

## Method 2: Via Uniswap (EASIER)

### Step-by-Step:

```bash
1. Go to: https://app.uniswap.org/

2. Switch to Sepolia network

3. Select: LINK → ETH

4. Enter amount: 1 LINK

5. Click "Approve LINK"

6. In MetaMask popup:
   - Click "Edit Permission" or "Custom Spending Cap"
   - Select "Max" or "Unlimited"
   - Or enter: 115792089237316195423570985008687907853269984665640564039457584007913129639935

7. Confirm transaction

8. Wait 30 seconds

9. Refresh your app

10. ✅ Unlimited approval appears!
```

---

## Method 3: Multiple Unlimited Approvals (BEST FOR DEMO)

### Create 3-4 Unlimited Approvals:

```bash
# Approval 1: LINK → Uniswap (Unlimited)
Spender: 0xE592427A0AEce92De3Edee1F18E0157C05861564
Amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935

# Approval 2: LINK → 1inch (Unlimited)
Spender: 0x1111111254EEB25477B68fb85Ed929f73A960582
Amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935

# Approval 3: LINK → Random Contract (Unlimited) - VERY HIGH RISK
Spender: 0x0000000000000000000000000000000000000001
Amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
```

### Result in Your App:

```
┌─────────────────────────────────────┐
│ Token Approvals                     │
├─────────────────────────────────────┤
│ Total: 3                            │
│ High Risk: 3 🔴                     │
│ Unlimited: 3 ⚠️                     │
│ Risk Score: 85/100 🚨               │
├─────────────────────────────────────┤
│ LINK → Uniswap Router               │
│ Amount: Unlimited                   │
│ Risk: 🔴 HIGH                       │
│ [Revoke]                            │
├─────────────────────────────────────┤
│ LINK → 1inch Router                 │
│ Amount: Unlimited                   │
│ Risk: 🔴 HIGH                       │
│ [Revoke]                            │
├─────────────────────────────────────┤
│ LINK → Unknown Contract             │
│ Amount: Unlimited                   │
│ Risk: 🔴 CRITICAL                   │
│ [Revoke]                            │
└─────────────────────────────────────┘
```

---

## Quick Copy-Paste Values

### For Etherscan "approve" function:

**Spender (Uniswap Router):**

```
0xE592427A0AEce92De3Edee1F18E0157C05861564
```

**Amount (Unlimited):**

```
115792089237316195423570985008687907853269984665640564039457584007913129639935
```

### Alternative Spenders (for multiple approvals):

**1inch Router:**

```
0x1111111254EEB25477B68fb85Ed929f73A960582
```

**SushiSwap Router:**

```
0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F
```

**Curve Router:**

```
0x99a58482BD75cbab83b27EC03CA68fF489b5788f
```

---

## What Makes It "High Risk"?

### Your App's Risk Calculation:

```typescript
// From src/lib/allowances.ts

function calculateAllowanceRiskScore(allowances) {
  let score = 0;

  for (const allowance of allowances) {
    // Unlimited approvals are risky
    if (allowance.isUnlimited) {
      score += 3; // +3 points per unlimited
      warnings.push(`Unlimited approval for ${token} to ${spender}`);
    }

    // High USD value approvals
    if (allowance.usdValue > 10000) {
      score += 2; // +2 points if > $10k
    }

    // Unknown/unverified spenders
    if (allowance.spenderInfo.type === "unknown") {
      score += 2; // +2 points for unknown
    }
  }

  // Determine risk level
  if (score > 10) return "Critical";
  if (score > 6) return "High";
  if (score > 3) return "Medium";
  return "Low";
}
```

### How to Get "Critical" Risk:

```bash
Create 4+ unlimited approvals
OR
Create 1 unlimited approval to unknown contract
OR
Create unlimited approval worth > $10k
```

---

## Perfect Demo Scenario

### Setup (10 minutes):

```bash
1. Create 3 unlimited approvals:
   - LINK → Uniswap (unlimited)
   - LINK → 1inch (unlimited)
   - LINK → Unknown contract (unlimited)

2. Create 1 limited approval:
   - LINK → Curve (1 LINK only)

3. Result:
   - Total: 4 approvals
   - High Risk: 3
   - Low Risk: 1
   - Unlimited: 3
   - Risk Score: 75-85/100
```

### Demo Script:

```bash
Scene 1: Show the Problem (30s)
"Look at all these unlimited approvals"
[Point to 3 unlimited approvals]
"Each one is a security risk"
[Show risk score: 85/100]

Scene 2: Explain the Risk (30s)
"If any of these contracts get hacked..."
"The hacker can drain ALL my LINK tokens"
"Without me signing anything"
[Point to unlimited amounts]

Scene 3: Take Action (60s)
"Wallet Guardian makes it easy to fix"
[Click Revoke on first unlimited]
"One click - approval removed"
[Show risk score drop to 70]
[Click Revoke on second unlimited]
"Another one gone"
[Show risk score drop to 55]
[Click Revoke on third unlimited]
"All high-risk approvals removed"
[Show risk score drop to 25]

Scene 4: Result (30s)
"Now I only have safe, limited approvals"
[Show final state: 1 approval, low risk]
"My tokens are protected"
[Show improved security score]
```

---

## Verification

### How to Check It Worked:

```bash
1. Go to your app's Security page

2. Look for:
   ✅ "Unlimited" text (not a number)
   ✅ Red/Orange risk indicator
   ✅ "High Risk" or "Critical" label
   ✅ Higher risk score (60+)

3. If you see these, it worked!
```

### Troubleshooting:

**Issue: Still shows as limited**

```bash
Check:
1. Did you use the EXACT unlimited number?
2. Did transaction confirm? (check Etherscan)
3. Did you refresh the app?

Fix:
1. Copy-paste the exact number from above
2. Wait 1 minute after transaction
3. Hard refresh (Ctrl+Shift+R)
```

**Issue: Not showing as "High Risk"**

```bash
Check:
1. Is it marked as "Unlimited"?
2. Do you have multiple unlimited approvals?

Fix:
1. Create 2-3 unlimited approvals
2. Risk score increases with each one
3. 3+ unlimited = High/Critical risk
```

---

## Advanced: Create CRITICAL Risk

### For Maximum Impact Demo:

```bash
1. Create 5 unlimited approvals
2. Include 1-2 to unknown contracts
3. Use tokens worth > $100

Result:
- Risk Score: 90-100/100
- Level: CRITICAL 🚨
- Multiple red warnings
- Very dramatic for demo!
```

### Unknown Contract Addresses (for testing):

```
0x0000000000000000000000000000000000000001
0x0000000000000000000000000000000000000002
0x1234567890123456789012345678901234567890
```

**Warning:** These are test addresses. Never approve real tokens to unknown contracts on mainnet!

---

## Quick Reference Card

### Copy This for Quick Setup:

```
Token: LINK (Sepolia)
Contract: 0x779877A7B0D9E8603169DdbD7836e478b4624789

Unlimited Amount:
115792089237316195423570985008687907853269984665640564039457584007913129639935

Spenders:
- Uniswap: 0xE592427A0AEce92De3Edee1F18E0157C05861564
- 1inch: 0x1111111254EEB25477B68fb85Ed929f73A960582
- Test: 0x0000000000000000000000000000000000000001

Steps:
1. Etherscan → Contract → Write
2. Connect wallet
3. approve(spender, unlimited_amount)
4. Confirm
5. Wait 30s
6. Refresh app
7. ✅ Unlimited approval appears!
```

---

## ✅ Checklist

Before demo:

- [ ] Created 2-3 unlimited approvals
- [ ] App shows "Unlimited" (not numbers)
- [ ] Risk indicators are red/orange
- [ ] Risk score is 60+ (High/Critical)
- [ ] Tested revoke function
- [ ] Practiced demo script
- [ ] Ready to record!

---

**Now you'll have impressive high-risk approvals to demonstrate!** 🎬

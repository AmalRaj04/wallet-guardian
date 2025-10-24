# 1inch Integration - Flow Diagrams

## 🔄 Complete Swap Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. User Views Portfolio
   │
   ├─> Sees token list with balances
   │
   └─> Hovers over token row
       │
       ├─> "Sell" button appears (green)
       └─> "Convert to PYUSD" button appears (blue)


2. User Clicks Button
   │
   ├─> SwapModal opens
   │   │
   │   ├─> Shows token info
   │   ├─> Shows balance
   │   └─> Input field for amount
   │
   └─> 1inch API called in background


3. User Enters Amount
   │
   ├─> Input debounced (500ms)
   │
   ├─> useOneInchSwap hook triggered
   │   │
   │   ├─> Fetches quote from 1inch
   │   ├─> Checks approval status
   │   └─> Updates UI with quote
   │
   └─> Quote displayed
       │
       ├─> Output amount
       ├─> Price impact
       ├─> Gas estimate
       └─> DEX routing


4. User Confirms
   │
   ├─> If approval needed:
   │   │
   │   ├─> Step 1: Approve Token
   │   │   │
   │   │   ├─> Get approval tx from 1inch
   │   │   ├─> Send to wallet
   │   │   ├─> User confirms in wallet
   │   │   ├─> Wait for confirmation
   │   │   └─> Move to Step 2
   │   │
   │   └─> Step 2: Execute Swap
   │       │
   │       ├─> Get swap tx from 1inch
   │       ├─> Send to wallet
   │       ├─> User confirms in wallet
   │       ├─> Wait for confirmation
   │       └─> Success! 🎉
   │
   └─> If no approval needed:
       │
       └─> Execute Swap directly
           │
           ├─> Get swap tx from 1inch
           ├─> Send to wallet
           ├─> User confirms in wallet
           ├─> Wait for confirmation
           └─> Success! 🎉
```

---

## 🔧 Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

App
 │
 ├─> Portfolio Page
 │    │
 │    └─> TokenList Component
 │         │
 │         ├─> Token Row (for each token)
 │         │    │
 │         │    ├─> Token Info
 │         │    ├─> Balance
 │         │    ├─> Price
 │         │    ├─> 24h Change
 │         │    ├─> Risk Score
 │         │    │
 │         │    └─> Action Buttons
 │         │         │
 │         │         ├─> "Sell" Button
 │         │         │    └─> onClick: openSwap(token, 'sell')
 │         │         │
 │         │         └─> "Convert to PYUSD" Button
 │         │              └─> onClick: openSwap(token, 'pyusd')
 │         │
 │         └─> SwapModal Component
 │              │
 │              ├─> Uses: useOneInchSwap hook
 │              ├─> Uses: useSendTransaction (wagmi)
 │              ├─> Uses: useWaitForTransactionReceipt (wagmi)
 │              │
 │              └─> Renders:
 │                   ├─> Token inputs
 │                   ├─> Quote display
 │                   ├─> Step indicator
 │                   ├─> Action button
 │                   └─> Transaction status
 │
 └─> Providers
      │
      ├─> WagmiProvider (wallet connection)
      └─> QueryClientProvider (data fetching)
```

---

## 📡 API Call Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        1INCH API FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User Input
   │
   ├─> amount: "100"
   ├─> fromToken: SHIB
   └─> toToken: PYUSD
   │
   ▼
useOneInchSwap Hook
   │
   ├─> Debounce 500ms
   │
   ├─> Call: fetchQuote()
   │    │
   │    └─> OneInchService.getQuote()
   │         │
   │         ├─> POST https://api.1inch.dev/swap/v6.0/1/quote
   │         │    Headers: { Authorization: "Bearer API_KEY" }
   │         │    Params: {
   │         │      src: "0x...",
   │         │      dst: "0x...",
   │         │      amount: "100000000000000000000"
   │         │    }
   │         │
   │         └─> Response: {
   │              toAmount: "95.5",
   │              protocols: [["Uniswap"], ["Curve"]],
   │              estimatedGas: 150000
   │            }
   │
   ├─> Call: checkApproval()
   │    │
   │    └─> OneInchService.getAllowance()
   │         │
   │         ├─> GET https://api.1inch.dev/swap/v6.0/1/approve/allowance
   │         │    Params: {
   │         │      tokenAddress: "0x...",
   │         │      walletAddress: "0x..."
   │         │    }
   │         │
   │         └─> Response: {
   │              allowance: "0"
   │            }
   │
   └─> Update State
        │
        ├─> quote: { toAmount, priceImpact, protocols, ... }
        ├─> needsApproval: true
        └─> isLoadingQuote: false


User Clicks "Approve"
   │
   ▼
getApprovalTx()
   │
   └─> OneInchService.getApprovalTransaction()
        │
        ├─> GET https://api.1inch.dev/swap/v6.0/1/approve/transaction
        │    Params: { tokenAddress: "0x..." }
        │
        └─> Response: {
             to: "0x...",
             data: "0x095ea7b3...",
             value: "0"
           }
        │
        ▼
   sendTransaction(approvalTx)
        │
        ├─> Wallet popup
        ├─> User confirms
        └─> Transaction sent
             │
             ▼
   Wait for confirmation
        │
        └─> needsApproval: false


User Clicks "Swap"
   │
   ▼
prepareSwap()
   │
   └─> OneInchService.getSwap()
        │
        ├─> GET https://api.1inch.dev/swap/v6.0/1/swap
        │    Params: {
        │      src: "0x...",
        │      dst: "0x...",
        │      amount: "100000000000000000000",
        │      from: "0x...",
        │      slippage: 1
        │    }
        │
        └─> Response: {
             tx: {
               to: "0x1111111254EEB25477B68fb85Ed929f73A960582",
               data: "0x12aa3caf...",
               value: "0",
               gas: 200000,
               gasPrice: "30000000000"
             },
             toAmount: "95.5",
             fromAmount: "100"
           }
        │
        ▼
   sendTransaction(swapData.tx)
        │
        ├─> Wallet popup
        ├─> User confirms
        └─> Transaction sent
             │
             ▼
   Wait for confirmation
        │
        └─> Success! 🎉
```

---

## 🎯 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         STATE FLOW                               │
└─────────────────────────────────────────────────────────────────┘

SwapModal Component State:
   │
   ├─> amount: string
   ├─> slippage: number
   └─> step: 'approve' | 'swap'


useOneInchSwap Hook State:
   │
   ├─> quote: SwapQuoteDisplay | null
   ├─> swapData: OneInchSwapData | null
   ├─> isLoadingQuote: boolean
   ├─> isLoadingSwap: boolean
   ├─> needsApproval: boolean
   ├─> isCheckingApproval: boolean
   └─> error: string | null


Wagmi Hooks State:
   │
   ├─> useSendTransaction
   │    ├─> sendTransaction: function
   │    ├─> data: hash
   │    ├─> isPending: boolean
   │    └─> error: Error | null
   │
   └─> useWaitForTransactionReceipt
        ├─> isLoading: boolean
        └─> isSuccess: boolean


State Updates:
   │
   ├─> User types amount
   │    └─> amount state updates
   │         └─> useOneInchSwap re-runs
   │              └─> quote updates
   │
   ├─> User clicks approve
   │    └─> sendTransaction called
   │         └─> isPending: true
   │              └─> isSuccess: true
   │                   └─> step: 'swap'
   │
   └─> User clicks swap
        └─> sendTransaction called
             └─> isPending: true
                  └─> isSuccess: true
                       └─> Modal closes
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY CHECKS                             │
└─────────────────────────────────────────────────────────────────┘

Before Swap:
   │
   ├─> 1. Validate Amount
   │    │
   │    ├─> amount > 0?
   │    ├─> amount <= balance?
   │    └─> amount is number?
   │
   ├─> 2. Check Approval
   │    │
   │    ├─> Is ERC-20? (not native ETH)
   │    ├─> Current allowance >= amount?
   │    └─> If not, require approval first
   │
   ├─> 3. Validate Quote
   │    │
   │    ├─> Quote exists?
   │    ├─> Quote not expired?
   │    └─> Price impact acceptable?
   │
   ├─> 4. Check Network
   │    │
   │    ├─> Correct chain?
   │    ├─> PYUSD available on chain?
   │    └─> Wallet connected?
   │
   └─> 5. User Confirmation
        │
        ├─> Show transaction details
        ├─> User reviews in wallet
        └─> User explicitly confirms


During Transaction:
   │
   ├─> 1. Transaction Simulation
   │    │
   │    └─> 1inch simulates before sending
   │
   ├─> 2. Slippage Protection
   │    │
   │    └─> Transaction reverts if price moves too much
   │
   └─> 3. Deadline Protection
        │
        └─> Transaction expires if not mined in time


After Transaction:
   │
   ├─> 1. Verify Success
   │    │
   │    └─> Check transaction receipt
   │
   ├─> 2. Update Balances
   │    │
   │    └─> Refresh token balances
   │
   └─> 3. Show Confirmation
        │
        └─> Link to Etherscan
```

---

## 🎨 UI State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI STATES                                │
└─────────────────────────────────────────────────────────────────┘

Initial State:
   │
   ├─> Modal closed
   └─> Buttons visible on hover


User Clicks Button:
   │
   ├─> Modal opens
   ├─> Shows: Token info, balance, input
   └─> State: Waiting for input


User Types Amount:
   │
   ├─> Shows: Loading spinner
   ├─> State: Loading quote
   └─> After 500ms:
        │
        ├─> Shows: Quote details
        ├─> Shows: Price impact
        ├─> Shows: Gas estimate
        └─> State: Ready to swap


If Approval Needed:
   │
   ├─> Shows: Step indicator (1/2)
   ├─> Button: "Approve TOKEN"
   └─> State: Waiting for approval


User Clicks Approve:
   │
   ├─> Shows: Loading spinner
   ├─> Button: "Confirm in Wallet..."
   └─> State: Pending approval
        │
        └─> After confirmation:
             │
             ├─> Shows: Success checkmark
             ├─> Shows: Step indicator (2/2)
             ├─> Button: "Swap TOKEN"
             └─> State: Ready to swap


User Clicks Swap:
   │
   ├─> Shows: Loading spinner
   ├─> Button: "Confirm in Wallet..."
   └─> State: Pending swap
        │
        └─> After confirmation:
             │
             ├─> Shows: Success message
             ├─> Shows: Etherscan link
             ├─> Modal closes
             └─> State: Complete


Error States:
   │
   ├─> Insufficient balance
   │    └─> Shows: Red error message
   │         Button: Disabled
   │
   ├─> High price impact
   │    └─> Shows: Yellow warning
   │         Button: Enabled (user choice)
   │
   ├─> Network error
   │    └─> Shows: Red error message
   │         Button: Disabled
   │
   └─> User rejection
        └─> Shows: Toast notification
             Modal: Stays open
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

Blockchain
   ↕
Wallet (MetaMask, etc.)
   ↕
Wagmi Hooks
   ↕
SwapModal Component
   ↕
useOneInchSwap Hook
   ↕
OneInchService
   ↕
1inch API
   ↕
Multiple DEXs (Uniswap, Curve, etc.)
   ↕
Liquidity Pools
```

---

## 🔄 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING                               │
└─────────────────────────────────────────────────────────────────┘

API Error:
   │
   ├─> Caught in OneInchService
   ├─> Logged to console
   ├─> Returned as error state
   ├─> Displayed in UI
   └─> User can retry


Transaction Error:
   │
   ├─> Caught in SwapModal
   ├─> Check error type:
   │    │
   │    ├─> User rejection
   │    │    └─> Show: "Transaction rejected"
   │    │         Action: Stay on modal
   │    │
   │    ├─> Insufficient gas
   │    │    └─> Show: "Insufficient gas"
   │    │         Action: Suggest adding ETH
   │    │
   │    ├─> Transaction reverted
   │    │    └─> Show: "Transaction failed"
   │    │         Action: Check Etherscan link
   │    │
   │    └─> Network error
   │         └─> Show: "Network error"
   │              Action: Retry
   │
   └─> Toast notification shown


Validation Error:
   │
   ├─> Caught before API call
   ├─> Shown inline in UI
   ├─> Button disabled
   └─> User must fix input
```

---

**Visual guide to understanding the 1inch integration flow**

_Last Updated: October 24, 2025_

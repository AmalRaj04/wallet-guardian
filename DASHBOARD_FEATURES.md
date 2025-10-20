# Wallet Guardian Dashboard

## Features Implemented

### 🎨 **Dashboard UI** (Like Screenshot)

A beautiful, dark-themed dashboard inspired by your provided screenshot with:

- **Card-based layout** with glassmorphism effects
- **Smooth animations** using Framer Motion
- **Responsive design** that works on all devices
- **Dark gradient background** (slate/gray tones)

### 📊 **Key Metrics Display**

1. **Total Value Card**

   - Shows total portfolio value in USD
   - Weekly percentage change indicator
   - Green/red color coding for gains/losses
   - Real-time ETH price from CoinGecko API

2. **Active Approvals Card**

   - Number of active token approvals
   - Warning count for approvals requiring review
   - Orange alert icon

3. **Risk Score Card**
   - Security risk assessment (Low, Medium, High)
   - Based on number of active approvals
   - Green shield icon for safety

### 💼 **Wallet Portfolio Section**

Three interactive tabs:

#### 1. **Tokens Tab**

- Lists all ERC-20 tokens held in the wallet
- Shows token name, symbol, and logo
- Displays USD value and percentage change
- Fetched from Blockscout API

#### 2. **NFTs Tab**

- Grid display of NFT collections
- Shows NFT images or placeholder icons
- Collection name and token ID
- Supports ERC-721, ERC-1155, and ERC-404

#### 3. **Approvals Tab**

- Lists all active token approvals
- Shows which contracts can spend your tokens
- "Revoke" button for each approval (UI ready)
- Security-focused design with warnings

### 📝 **Recent Transactions**

- Last 10 transactions displayed
- Incoming/outgoing transaction indicators
- Transaction value in ETH and USD
- Relative timestamps ("2 mins ago", "1 hour ago")
- Transaction status indicators
- Links to Blockscout explorer for details
- Clean hover effects

### 🔗 **Blockscout API Integration**

The dashboard fetches real data from Blockscout:

1. **Address Info**: `/api/v2/addresses/{address}`

   - ETH balance
   - Contract status
   - Address metadata

2. **Token Balances**: `/api/v2/addresses/{address}/token-balances`

   - All ERC-20 tokens
   - Token metadata (name, symbol, decimals)
   - Balance amounts

3. **Transactions**: `/api/v2/addresses/{address}/transactions`

   - Recent transaction history
   - Transaction details (from, to, value, timestamp)
   - Transaction status

4. **NFTs**: `/api/v2/addresses/{address}/nft`
   - All NFT holdings
   - NFT metadata and images
   - Supports multiple NFT standards

### 🌐 **Multi-Chain Support**

- **Ethereum Mainnet**: Uses mainnet Blockscout
- **Sepolia Testnet**: Uses Sepolia Blockscout
- Automatically detects connected chain
- Can be configured via environment variables

### 🎭 **User Experience Features**

- **Loading states** with animated spinner
- **Error handling** for API failures
- **Responsive navigation** back to home
- **Wallet connection check** (redirects if not connected)
- **Smooth page transitions** with Framer Motion
- **Hover effects** on all interactive elements
- **External links** to Blockscout explorer

### 🛠️ **Technical Stack**

- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for beautiful icons
- **RainbowKit** for wallet connection
- **Wagmi** for Ethereum interactions
- **React Query** for data fetching
- **Blockscout API** for blockchain data
- **CoinGecko API** for token prices

## Getting Started

1. **Connect your wallet** on the landing page
2. **Click "View Dashboard"** button
3. **Dashboard loads** with your wallet data from Blockscout
4. **Explore** tokens, NFTs, and transactions
5. **Switch tabs** to view different asset types

## Environment Variables

Create a `.env.local` file:

```env
# Blockscout API URL (optional, defaults to Sepolia)
NEXT_PUBLIC_BLOCKSCOUT_API_URL=https://eth-sepolia.blockscout.com/api/v2

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## API Endpoints Used

All endpoints are from Blockscout v2 API:

- `GET /addresses/{address}` - Address overview
- `GET /addresses/{address}/token-balances` - Token holdings
- `GET /addresses/{address}/transactions` - Transaction history
- `GET /addresses/{address}/nft` - NFT collections
- External: CoinGecko API for ETH/USD price

## Features Matching Screenshot

✅ Total Value card with weekly change  
✅ Active Approvals count with warnings  
✅ Risk Score indicator  
✅ Wallet Portfolio with tabs (Tokens, NFTs, Approvals)  
✅ Token list with USD values and percentages  
✅ Recent Transactions section  
✅ Transaction status and amounts  
✅ Relative timestamps  
✅ Dark theme with gradient background  
✅ Card-based layout with borders  
✅ Smooth animations and transitions

## Next Steps (Optional Enhancements)

- [ ] Implement token price fetching from DeFi APIs
- [ ] Add real approval revocation functionality
- [ ] Charts and graphs for portfolio history
- [ ] Filter and sort options for transactions
- [ ] Search functionality for tokens/NFTs
- [ ] Export transaction history
- [ ] Multi-wallet management
- [ ] Price alerts and notifications
- [ ] DeFi protocol integrations

## Running the Project

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and connect your wallet!

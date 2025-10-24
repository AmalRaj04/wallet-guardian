# 🚀 Quick Start - 100% Complete Implementation

## Prerequisites

- Node.js 18+ installed
- Redis (optional, will use in-memory fallback)
- MetaMask or compatible wallet

## Installation

```bash
# Install dependencies
npm install

# Install additional dev dependencies
npm install -D concurrently tsx ts-node @types/express @types/ws cors
```

## Environment Setup

Your `.env.local` is already configured with all required API keys:

- ✅ Groq AI
- ✅ Alchemy
- ✅ CoinGecko
- ✅ WalletConnect
- ✅ Blockscout
- ✅ Envio
- ✅ Lit Protocol

## Running the Application

### Option 1: Full Stack (Recommended)

```bash
# Start all services (Frontend + Backend + WebSocket)
npm run dev:all
```

This starts:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:8080

### Option 2: Frontend Only

```bash
# Start just the Next.js frontend
npm run dev
```

### Option 3: Individual Services

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend API
npm run dev:backend

# Terminal 3: WebSocket Server
npm run dev:ws
```

## Optional: Redis Cache

For production-grade caching:

```bash
# Start Redis
npm run redis:start

# Stop Redis
npm run redis:stop
```

If Redis is not running, the app automatically uses in-memory caching.

## Testing the Features

### 1. Connect Wallet

- Open http://localhost:3000
- Click "Connect Wallet"
- Approve connection in MetaMask

### 2. View Dashboard

- Navigate to `/dashboard` or click "Dashboard"
- See comprehensive security overview
- Real-time monitoring starts automatically

### 3. Test Real-Time Monitoring

- Watch for mempool transactions
- See live alerts appear
- Check WebSocket connection status (green dot = connected)

### 4. Analyze Smart Contracts

- Go to "Security" → "Bytecode Analyzer"
- Enter any contract address
- Click "Analyze" to see security report

### 5. Check Portfolio Risk

- View your token holdings
- See risk scores for each token
- Check overall portfolio risk

### 6. Test Alerts

- High-risk tokens trigger automatic alerts
- Browser notifications (if permitted)
- Toast notifications appear

## API Endpoints

Backend API (http://localhost:3001):

```bash
# Get portfolio
GET /api/portfolio/:address?chainId=1

# Calculate risk scores
POST /api/risk-scores
Body: { "tokens": [...], "provider": {...} }

# Get transaction history
GET /api/transactions/:address?page=1

# Get gas prices
GET /api/gas-prices

# Clear cache
POST /api/cache/clear/:address

# Health check
GET /health
```

## WebSocket Events

Connect to ws://localhost:8080:

```javascript
const ws = new WebSocket("ws://localhost:8080");

// Subscribe to address
ws.send(
  JSON.stringify({
    type: "subscribe",
    address: "0x...",
  })
);

// Receive alerts
ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log("Alert:", alert);
};
```

## Troubleshooting

### WebSocket Connection Failed

- Check if WebSocket server is running on port 8080
- Firewall may be blocking the connection
- App will use fallback monitoring automatically

### Redis Connection Failed

- Redis is optional
- App automatically uses in-memory cache
- No action needed

### API Rate Limits

- All APIs have built-in rate limiting
- Caching reduces API calls
- Fallback systems in place

### Wallet Connection Issues

- Make sure MetaMask is installed
- Check network (Mainnet or Sepolia)
- Clear browser cache if needed

## Development Tips

### Hot Reload

All services support hot reload:

- Frontend: Automatic with Next.js
- Backend: Using tsx/ts-node
- WebSocket: Restart on file changes

### Debugging

```bash
# Enable debug mode
NEXT_PUBLIC_DEBUG=true npm run dev

# Check logs
# Frontend: Browser console
# Backend: Terminal output
# WebSocket: Terminal output
```

### Testing Different Networks

```bash
# Mainnet
NEXT_PUBLIC_NETWORK=mainnet npm run dev

# Sepolia testnet
NEXT_PUBLIC_NETWORK=sepolia npm run dev
```

## Production Build

```bash
# Build frontend
npm run build

# Build backend
npm run build:backend

# Start production
npm start
npm run start:backend
```

## Next Steps

1. ✅ Connect your wallet
2. ✅ Explore the dashboard
3. ✅ Test contract analysis
4. ✅ Monitor real-time threats
5. ✅ Check portfolio risk
6. ✅ Set up alerts

## Support

- Check COMPLETE_IMPLEMENTATION_100.md for full feature list
- See ARCHITECTURE_INTEGRATION.md for system design
- Review individual component files for detailed docs

---

**Everything is ready to go! Start with `npm run dev:all` and open http://localhost:3000** 🚀

# 🛡️ Wallet Guardian

**Proactive Wallet Security with Real-Time Risk Detection**

A next-generation Web3 security platform that protects your crypto assets before threats materialize. Powered by AI, real-time mempool monitoring, and conditional cryptographic signing.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Core Philosophy

**Proactive, not reactive.** Wallet Guardian detects and prevents threats before transactions are mined, using:
- 🤖 **AI-powered risk analysis** (Groq AI)
- 🔍 **Real-time mempool monitoring** (Envio HyperSync)
- 🔒 **Conditional cryptographic signing** (Lit Protocol)
- 🛡️ **Smart contract bytecode analysis** (Hardhat 3)
- 📊 **Comprehensive blockchain data** (Blockscout SDK)
- 💵 **Safe asset migration** (PYUSD)

---

## ✨ Key Features

### 🔐 Real-Time Threat Detection
- **Mempool Monitoring:** Detect sandwich attacks, rug pulls, and suspicious activity before they happen
- **Smart Contract Analysis:** Automated bytecode scanning for vulnerabilities
- **Creator Tracking:** Monitor token creator wallets for dumps and suspicious transfers
- **Liquidity Analysis:** Track DEX liquidity depth and concentration

### 🤖 AI-Powered Security
- **Groq AI Integration:** Plain-English risk explanations using llama-3.1-70b-versatile
- **Risk Scoring:** 0-100 score based on 5 key factors
- **Trust Badges:** Visual indicators for verified contracts, audits, and safety
- **Actionable Recommendations:** Clear next steps for every risk level

### 🎨 Beautiful Dashboard
- **Color-Coded Risk System:** 🟢 Safe / 🟡 Medium / 🟠 High / 🔴 Critical
- **Real-Time Updates:** Portfolio values and risk scores update automatically
- **Interactive Charts:** Portfolio composition, risk distribution, and trends
- **Responsive Design:** Works perfectly on mobile, tablet, and desktop

### 🔒 Conditional Signing (Lit Protocol)
- **Risk Assessment:** Real-time risk scoring for all transactions
- **User-Initiated:** All transactions require wallet confirmation
- **Smart Blocking:** Critical-risk transactions blocked for safety
- **Transaction Preview:** See risk score before confirming
- **Emergency Actions:** Instant approval revocation and asset migration

### 💵 PYUSD Safe Migration
- **One-Click Safety:** Migrate high-risk assets to PYUSD stablecoin
- **Optimal Routing:** Best swap rates via 1inch API
- **Multi-Step Execution:** Automated approval, swap, and revocation
- **Gas Optimization:** Minimize transaction costs

---

## 🏆 Sponsor Integrations

### ✅ All 6 Sponsors Fully Integrated

1. **Groq AI** (AI/ML Track) - FREE
   - llama-3.1-70b-versatile model
   - Security analysis & recommendations
   - Plain-English explanations

2. **Blockscout SDK** ($2,000 Prize)
   - Portfolio fetching with metadata
   - Contract verification
   - Transaction history
   - 5-minute caching layer

3. **Envio HyperSync** ($750 + Best Dashboard)
   - Real-time mempool monitoring
   - WebSocket connection
   - Threat detection (sandwich, rug pull, flash loan)
   - Historical event indexing

4. **Lit Protocol** ($2,000+ Prize)
   - PKP generation
   - Conditional signing rules
   - Automatic safety actions
   - Multi-step batch transactions

5. **PYUSD** ($2,000 Prize)
   - Risk-based migration
   - 1inch swap routing
   - Multi-step transaction flow
   - Approval management

6. **Hardhat 3** ($2,500 Prize)
   - Bytecode analysis
   - 10+ vulnerability patterns
   - Security scoring (0-100)
   - Honeypot detection

---

## 🚀 Quick Start

See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Configure API keys
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Required API Keys:
- WalletConnect Project ID (FREE)
- Groq API Key (FREE)
- Alchemy API Key (FREE tier)
- CoinGecko API Key (FREE tier)

See `.env.example` for complete configuration.

---

## 📊 How It Works

### 1. Connect Wallet
Use RainbowKit to connect MetaMask, WalletConnect, Coinbase Wallet, or Rainbow.

### 2. Automatic Scanning
- Portfolio loaded via Blockscout SDK
- Risk analysis runs for all tokens
- Mempool monitoring starts automatically

### 3. Real-Time Protection
- Threats detected before transactions mine
- Alerts appear instantly
- AI explains risks in plain English

### 4. Take Action (User-Initiated)
- **Low Risk:** Review and confirm in wallet
- **Medium Risk:** Carefully review before confirming
- **High Risk:** Consider revoking approvals (confirm in wallet)
- **Critical Risk:** Blocked for safety or migrate to PYUSD (confirm in wallet)

---

## 🏗️ Architecture

```
src/
├── lib/                    # Core services
│   ├── groq.ts            # Groq AI integration
│   ├── blockscout.ts      # Blockscout SDK
│   ├── envio.ts           # Envio HyperSync
│   ├── lit-protocol.ts    # Lit Protocol
│   ├── pyusd-migration.ts # PYUSD migration
│   ├── hardhat-analyzer.ts # Hardhat 3 analysis
│   └── risk-engine.ts     # Risk calculation
├── hooks/                  # React hooks
│   ├── useWallet.ts       # Wallet management
│   ├── usePortfolioRisk.ts # Risk calculation
│   └── useRealTimeMonitoring.ts # Threat monitoring
├── modules/                # Feature modules
│   ├── portfolio/         # Portfolio management
│   ├── security/          # Security features
│   └── explore/           # Market exploration
└── components/             # UI components
    ├── charts/            # Visualizations
    └── ui/                # Reusable UI
```

---

## 🔒 Security

- **No Private Keys:** Never stores or transmits private keys
- **Encrypted Connections:** All API calls use HTTPS/WSS
- **Environment Variables:** Sensitive data in .env files
- **CORS Protection:** Proper CORS configuration
- **Testnet First:** Always test on testnet before mainnet

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### Test Wallets:
- **Safe Wallet:** Only verified tokens, low risk
- **Medium Risk:** Mix of verified/unverified
- **Critical Risk:** High-risk tokens, suspicious activity

---

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md)
- [Implementation Summary](IMPLEMENTATION_COMPLETE_SUMMARY.md)
- [Complete Status](COMPLETE_IMPLEMENTATION_STATUS.md)
- [Integration Plan](FINAL_INTEGRATION_PLAN.md)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.3
- **Web3:** Wagmi, Viem, RainbowKit
- **Charts:** Chart.js, D3.js
- **AI:** Groq SDK
- **State:** React Query
- **Notifications:** React Hot Toast

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with support from:
- Groq AI
- Blockscout
- Envio
- Lit Protocol
- PayPal (PYUSD)
- Hardhat

---

## 📞 Support

For questions or issues, please open a GitHub issue.

---

**Protect your crypto assets with Wallet Guardian. Security before it's too late. 🛡️**

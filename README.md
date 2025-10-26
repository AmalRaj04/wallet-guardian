# 🛡️ AuraGuard - AI-Powered Crypto Security Platform

<div align="center">

![AuraGuard Logo](public/sponsors/logo.png)

**Your Crypto's Aura Protected by Intelligence**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

[Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## 🌟 Overview

**AuraGuard** is a comprehensive Web3 security platform that combines AI-powered threat detection with real-time portfolio management. Built for the modern crypto user, AuraGuard provides enterprise-grade security features with an intuitive, interactive interface.

### Why AuraGuard?

- 🤖 **AI-Powered Analysis** - Intelligent risk assessment using Groq AI and Gemini
- ⚡ **Real-Time Protection** - Instant threat detection and mempool monitoring
- 🎨 **Interactive UI** - Beautiful glassmorphism design with MagicBento effects
- 🔒 **Smart Contract Security** - Comprehensive bytecode analysis and verification
- 📊 **Portfolio Management** - Track assets with color-coded risk indicators
- 🔐 **Conditional Signing** - Lit Protocol integration for secure transactions

---

## ✨ Features

### 🔍 Security & Threat Detection

**Real-Time Monitoring**
- Mempool transaction monitoring via Envio HyperSync
- Sandwich attack detection
- Flash loan vulnerability alerts
- Rug pull pattern recognition
- Creator dump warnings
- Browser notifications for critical threats

**Smart Contract Analysis**
- Bytecode analysis using Hardhat 3
- Contract verification via Blockscout & Etherscan
- Honeypot detection
- Dangerous opcode identification
- Security scoring (A-F grades)
- 10+ vulnerability pattern checks

**AI-Powered Risk Assessment**
- Groq AI (llama-3.3-70b-versatile) integration
- Google Gemini API backup
- Risk scores (0-100 scale)
- Plain-English security insights
- Smart recommendations with confidence scoring

### 💼 Portfolio Management

**Asset Tracking**
- Real-time token balance monitoring
- Multi-chain support (Ethereum, Sepolia)
- CoinGecko price integration
- Portfolio composition charts
- Historical performance tracking
- NFT collection display

**Risk Management**
- Weighted risk calculation across portfolio
- Color-coded risk indicators (🟢 Safe → 🔴 Critical)
- Interactive risk timeline charts
- Token-level risk analysis
- Automated risk alerts

### 🔐 Advanced Security Features

**Token Allowance Management**
- Scan all active token approvals
- Unlimited approval detection
- One-click revocation
- Risk-based warnings
- Spender reputation tracking

**Conditional Transaction Safety**
- Lit Protocol PKP integration
- Risk-based transaction signing
- Session signature management
- Emergency action execution
- Multi-step batch transactions

**Trust & Verification**
- Avail Network integration
- Contract verification badges
- Creator reputation system
- Audit report storage
- Trust score calculation

### 🎨 User Experience

**Interactive Interface**
- MagicBento card effects (particles, tilt, glow)
- Glassmorphism design language
- Dark mode optimized
- Responsive mobile layout
- Smooth GSAP animations
- Real-time WebSocket updates

**Three Core Modules**
1. **Portfolio** - Asset tracking and management
2. **Security** - Threat monitoring and analysis
3. **Explore** - Market discovery and research

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
```
Next.js 15 (App Router)
React 19
TypeScript 5
Tailwind CSS 3
Framer Motion
GSAP Animations
```

**Blockchain**
```
Wagmi + Viem
RainbowKit
Ethers.js v5
Hardhat 3
Lit Protocol SDK
```

**Backend & APIs**
```
Express.js API Server
WebSocket Server (ws://)
PostgreSQL Database
Redis Caching
```

**Integrations**
```
Groq AI (llama-3.3-70b)
Google Gemini
Blockscout API & SDK
Envio HyperSync
Etherscan API
CoinGecko API
Alchemy SDK
Avail Network
```

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Portfolio │  │ Security │  │ Explore  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   REST   │  │WebSocket │  │  Cache   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Blockchain  │  │   AI APIs    │  │   Database   │
│              │  │              │  │              │
│ • Blockscout │  │ • Groq AI    │  │ • PostgreSQL │
│ • Envio      │  │ • Gemini     │  │ • Redis      │
│ • Etherscan  │  │              │  │              │
│ • Lit        │  │              │  │              │
│ • Avail      │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (optional, has in-memory fallback)
- Redis (optional, has in-memory fallback)
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/auraguard.git
cd auraguard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional (for full functionality)
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_BLOCKSCOUT_API_URL=https://eth-sepolia.blockscout.com/api/v2
ETHERSCAN_API_KEY=your_etherscan_key
ALCHEMY_API_KEY=your_alchemy_key

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/auraguard
REDIS_URL=redis://localhost:6379
```

4. **Start the development server**
```bash
# Frontend only
npm run dev

# All services (frontend + backend + WebSocket)
npm run dev:all
```

5. **Open your browser**
```
http://localhost:3000
```

### Quick Start Commands

```bash
# Development
npm run dev              # Frontend only
npm run dev:backend      # Backend API only
npm run dev:ws           # WebSocket only
npm run dev:all          # All services (recommended)

# Production
npm run build            # Build for production
npm start                # Start production server

# Utilities
npm run type-check       # TypeScript validation
npm run lint             # Code linting
```

---

## 📖 Usage Guide

### Connecting Your Wallet

1. Click "Connect Wallet" in the header
2. Select your preferred wallet provider
3. Approve the connection request
4. Choose Ethereum Mainnet or Sepolia testnet

### Monitoring Your Portfolio

1. Navigate to the **Portfolio** module
2. View your total portfolio value and 24h change
3. Check individual token balances and prices
4. Review the risk score for your holdings
5. Set up price alerts for specific tokens

### Security Analysis

1. Go to the **Security** module
2. View your overall security score
3. Check active threats in real-time
4. Review token allowances and revoke suspicious ones
5. Analyze smart contracts before interacting

### Exploring Tokens

1. Open the **Explore** module
2. Browse trending coins and top performers
3. Search for specific tokens
4. View detailed token information
5. Check security scores before investing

---

## 🎨 Interactive Features

### MagicBento Effects

AuraGuard features interactive card animations powered by GSAP:

- **✨ Particles** - Floating particles on hover
- **🌟 Border Glow** - Dynamic glowing borders
- **🎯 3D Tilt** - Subtle 3D perspective effects
- **💥 Click Ripple** - Satisfying click animations
- **🎨 Purple Gradient** - Signature AuraGuard colors

### Customization

Effects can be customized per component:
```typescript
<InteractiveGlassCard
  enableParticles={true}
  enableTilt={true}
  enableBorderGlow={true}
  clickEffect={true}
  particleCount={12}
  tiltIntensity={0.3}
  glowColor="132, 0, 255"
/>
```

---

## 🔧 Configuration

### Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Sepolia Testnet (Chain ID: 11155111)

### API Rate Limits

- Blockscout: 5 requests/second
- CoinGecko: 10-50 calls/minute (free tier)
- Etherscan: 5 calls/second (free tier)
- Groq AI: 30 requests/minute

### Caching Strategy

- Token prices: 5 minutes
- Contract data: 1 hour
- Risk scores: 15 minutes
- Portfolio data: 30 seconds

---

## 🛠️ Development

### Project Structure

```
auraguard/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   └── Header.tsx        # Navigation
│   ├── modules/              # Feature modules
│   │   ├── portfolio/        # Portfolio module
│   │   ├── security/         # Security module
│   │   └── explore/          # Explore module
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities & integrations
│   ├── server/               # Backend services
│   └── types/                # TypeScript types
├── public/                   # Static assets
└── package.json
```

### Adding New Features

1. Create component in appropriate module
2. Add types to `src/types/index.ts`
3. Implement business logic in `src/lib/`
4. Add API endpoint if needed in `src/app/api/`
5. Update documentation

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Tailwind CSS for styling
- Component-first architecture
- Custom hooks for logic reuse

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check if the bug is already reported in [Issues](../../issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Open a new [Feature Request](../../issues/new)
2. Describe the feature and its benefits
3. Provide use cases and examples
4. Discuss implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add TypeScript types for new code
- Write clear commit messages
- Update documentation
- Test on multiple browsers
- Ensure mobile responsiveness

---

## 📊 Sponsor Integrations

AuraGuard is powered by industry-leading Web3 infrastructure:

| Sponsor | Integration | Purpose |
|---------|-------------|---------|
| **Groq AI** | llama-3.3-70b-versatile | AI-powered security analysis |
| **Blockscout** | API & SDK | Portfolio tracking & verification |
| **Envio HyperSync** | WebSocket | Real-time mempool monitoring |
| **Lit Protocol** | PKP & Actions | Conditional transaction signing |
| **PYUSD** | Stablecoin | Safe asset migration |
| **Hardhat** | v3 | Smart contract bytecode analysis |

---

## 🔒 Security

### Best Practices

- ✅ No private keys stored locally
- ✅ All transactions require user confirmation
- ✅ HTTPS/WSS only in production
- ✅ Input validation on all endpoints
- ✅ CORS protection enabled
- ✅ Rate limiting configured
- ✅ Secure database connections

### Reporting Security Issues

If you discover a security vulnerability, please email security@auraguard.io instead of using the issue tracker.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for lightning-fast AI inference
- **Blockscout** for comprehensive blockchain data
- **Envio** for real-time indexing
- **Lit Protocol** for decentralized key management
- **Hardhat** for smart contract tooling
- **PYUSD** for stablecoin infrastructure

---

## 📞 Support

- **Documentation**: [Read the docs](#features)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Twitter**: [@AuraGuard](#)
- **Discord**: [Join our community](#)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Multi-chain support (Polygon, Arbitrum, Optimism)
- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analytics
- [ ] Social trading features

### Q2 2025
- [ ] DeFi protocol integration
- [ ] Automated trading strategies
- [ ] Enhanced AI models
- [ ] Community governance

### Q3 2025
- [ ] Cross-chain bridge monitoring
- [ ] NFT security analysis
- [ ] Institutional features
- [ ] API for developers

---

<div align="center">

**Built with ❤️ by the AuraGuard Team**

[Website](#) • [Twitter](#) • [Discord](#) • [GitHub](../../)

⭐ Star us on GitHub — it helps!

</div>

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/auraguard?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/auraguard?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/auraguard)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/auraguard)

---

**Protect your crypto assets with intelligence. Welcome to AuraGuard.** 🛡️✨

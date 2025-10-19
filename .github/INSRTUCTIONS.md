# Wallet Guardian – AI-Powered Security Co-Pilot

## Comprehensive Developer Instructions for GitHub Copilot & Contributors

### 🔒 Project Overview

Wallet Guardian is an **AI-driven cryptocurrency security dashboard** that acts as a proactive “crypto bodyguard.”  
It monitors wallets in real-time, predicts on-chain risks, explains threats in plain English, and enforces safe conditional transactions using Lit Protocol.

**This is NOT a portfolio tracker** — it’s an intelligent defense system that prevents losses through predictive analysis, automated safety actions, and explainable AI.

---

## 🏗️ Core Tech Stack

| Layer                   | Technology                                        | Purpose                                            |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------- |
| Frontend                | **Next.js 14+ (App Router)** + **TypeScript**     | Modern React framework with strong typing          |
| Styling                 | **Tailwind CSS**                                  | Utility-first responsive design, dark mode default |
| Wallet Integration      | **RainbowKit**, **Wagmi**, **ethers.js**          | Beautiful wallet UI and blockchain interactions    |
| Data Layer              | **Blockscout SDK**, **Envio HyperSync WebSocket** | On-chain and mempool data feeds                    |
| AI Engine               | **OpenAI GPT-4 API**                              | Explainable risk assessments                       |
| Security Layer          | **Lit Protocol (PKP + Lit Actions)**              | Conditional transaction signing                    |
| Swaps                   | **1inch API**                                     | DEX aggregator for PYUSD migration                 |
| Smart Contract Analysis | **Hardhat 3**                                     | Bytecode security scanning                         |
| Visualization           | **Chart.js / Recharts / D3.js**                   | Graphs, donut charts, and network visualizations   |

---

## 🎯 Copilot Goals

When suggesting or generating code, **always align with the project’s mission**:

> “Transform passive wallet monitoring into an active, intelligent security layer that predicts, explains, and prevents crypto threats.”

### ✅ Copilot Should:

- Follow **Next.js App Router** folder conventions (`/app`, `/components`, `/lib`, `/hooks`).
- Use **TypeScript** everywhere.
- Use **Tailwind CSS** with dark mode and glassmorphism effects.
- Maintain a **crypto-native UI** (minimalist, animated, dark).
- Always include **type safety**, **error handling**, and **real-time updates**.
- Keep code modular and commented for readability.

### ❌ Copilot Should NOT:

- Generate unrelated boilerplate or unneeded backends.
- Suggest using **create-react-app**, **Vue**, or **Angular**.
- Write raw SQL or off-topic server code unrelated to blockchain or AI risk analysis.
- Hardcode API keys or sensitive data.
- Include Web2 authentication flows (login/signup) unless explicitly required.

---

## 🧠 AI/Backend Integration Summary

- **GPT-4 API:** Used for semantic risk explanations only. Use OpenAI SDK with prompt templates.
- **Blockscout SDK:** Used for verified on-chain data (balances, contract metadata).
- **Envio HyperSync:** WebSocket for real-time mempool monitoring.
- **Lit Protocol:** Handles conditional signing based on risk score.
- **Hardhat 3:** Static analysis and bytecode scanning.

---

## 🧩 Folder Structure

/app
/dashboard
/portfolio
/settings
/components
/cards
/charts
/alerts
/lib
blockscout.ts
hypersync.ts
riskEngine.ts
/hooks
useWallet.ts
useAlerts.ts
useRiskScore.ts
/utils
formatters.ts
constants.ts
scoring.ts
/contracts
hardhat.config.ts
analysis/

## 🎨 UI Guidelines

- Default **dark mode** with neon accents.
- **Color-coded risk system:** 🟢 Safe | 🟡 Medium | 🔴 Critical.
- Smooth **animated transitions** for state changes.
- Use **glassmorphism** for cards and modals.
- Implement **toast notifications** for real-time alerts.

---

## ⚙️ Developer Workflow

1. **Branch Naming:**  
   `feature/<feature-name>` or `fix/<issue-name>`
2. **Commit Style (Conventional Commits):**  
   `feat(ui): add portfolio donut chart`  
   `fix(risk): handle missing contract metadata`
3. **Pull Requests:**  
   Must include a short description of logic + screenshots for UI changes.
4. **Environment Variables:**  
    Store in `.env.local`  
    5. **Testing:**  
   Use Sepolia testnet for wallet testing.  
   Use Hardhat local network for bytecode testing.

---

## 🧩 Sponsors and Integrations

| Partner            | Purpose                      |
| ------------------ | ---------------------------- |
| **Blockscout**     | Contract data + verification |
| **Envio**          | Real-time mempool tracking   |
| **Lit Protocol**   | Conditional signing logic    |
| **1inch**          | DEX routing for PYUSD swaps  |
| **PayPal (PYUSD)** | Stablecoin safety migration  |

## 🧰 Copilot Prompt Behavior

When Copilot is prompted:

- If the task is **UI-related**, prioritize `Tailwind + Next.js component patterns`.
- If **logic-related**, refer to `/lib/riskEngine.ts` or `/lib/blockscout.ts` for function design.
- If **AI-related**, format prompts as JSON objects for GPT-4 API requests.
- When confused — generate **placeholder TODO comments** instead of unrelated code.

---

## 🧩 Example Component Naming

- `WalletConnectButton.tsx`
- `RiskGauge.tsx`
- `AlertsFeed.tsx`
- `PortfolioCard.tsx`
- `ApprovalTable.tsx`

---

## ✅ Quality Standards

- Maintain **95%+ TypeScript coverage**
- Ensure **no console errors/warnings**
- Use **async/await** for async calls
- Include **comments explaining security logic**
- Keep performance optimized: minimal re-renders and memoized components

---

_End of Developer Instructions_

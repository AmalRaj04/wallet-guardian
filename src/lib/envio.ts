// Envio HyperSync Integration - REST API for Historical Blockchain Data
// Note: Envio HyperSync is a REST API, NOT a WebSocket service
// It's designed for fast historical data queries, not real-time mempool monitoring
import { MempoolTransaction } from "@/types";
import axios from "axios";

const ENVIO_API_KEY = process.env.NEXT_PUBLIC_ENVIO_API_KEY;
const ENVIO_API_URL = "https://sepolia.hypersync.xyz"; // Sepolia endpoint

export interface MempoolAlert {
  id: string;
  type:
    | "creator_dump"
    | "liquidity_removal"
    | "suspicious_approval"
    | "flash_loan"
    | "ownership_transfer"
    | "sandwich_attack";
  severity: "low" | "medium" | "high" | "critical";
  transaction: MempoolTransaction;
  token?: string;
  description: string;
  recommendation: string;
  estimatedLoss?: number;
  timestamp: Date;
}

export class EnvioHyperSync {
  private monitoredAddresses: Set<string> = new Set();
  private monitoredContracts: Set<string> = new Set();
  private alertCallbacks: ((alert: MempoolAlert) => void)[] = [];
  private transactionCallbacks: ((tx: MempoolTransaction) => void)[] = [];
  private fallbackIntervalId: NodeJS.Timeout | null = null;

  /**
   * Start real-time mempool monitoring
   */
  startMonitoring(
    addresses: string[],
    contracts: string[],
    onTransaction: (tx: MempoolTransaction) => void,
    onAlert: (alert: MempoolAlert) => void
  ): void {
    addresses.forEach((addr) =>
      this.monitoredAddresses.add(addr.toLowerCase())
    );
    contracts.forEach((addr) =>
      this.monitoredContracts.add(addr.toLowerCase())
    );
    this.transactionCallbacks.push(onTransaction);
    this.alertCallbacks.push(onAlert);

    // Start monitoring using Alchemy (primary) and Envio (supplementary historical data)
    // Note: Envio HyperSync is a REST API for historical queries, not real-time monitoring
    this.startFallbackMonitoring();
  }

  /**
   * Stop mempool monitoring
   */
  stopMonitoring(): void {
    // Clear monitoring interval
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }

    this.monitoredAddresses.clear();
    this.monitoredContracts.clear();
    this.alertCallbacks = [];
    this.transactionCallbacks = [];

    console.log("⏸️ Monitoring stopped");
  }

  /**
   * Query Envio HyperSync for historical transactions (REST API)
   * This is the CORRECT way to use Envio - it's a REST API for historical data
   */
  private async queryEnvioHistoricalData(
    address: string,
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    if (!ENVIO_API_KEY || ENVIO_API_KEY === "your_envio_api_key_here") {
      return [];
    }

    try {
      // Envio HyperSync REST API query
      const response = await axios.post(
        `${ENVIO_API_URL}/query`,
        {
          from_block: fromBlock,
          to_block: toBlock,
          logs: [
            {
              address: [address],
            },
          ],
          transactions: [
            {
              from: [address],
            },
            {
              to: [address],
            },
          ],
          include_all_blocks: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ENVIO_API_KEY}`,
          },
          timeout: 10000,
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      // Silently handle - Envio is optional
      if (error.response?.status === 401) {
        console.warn("Envio API key invalid or expired");
      }
      return [];
    }
  }

  /**
   * Analyze transaction for threats
   */
  private analyzeForThreats(tx: MempoolTransaction): void {
    // Detect sandwich attacks
    if (this.detectSandwichAttack(tx)) {
      this.emitAlert({
        id: `sandwich-${tx.hash}`,
        type: "sandwich_attack",
        severity: "high",
        transaction: tx,
        description:
          "🥪 Sandwich attack detected - Your transaction may be front-run",
        recommendation: "Increase slippage tolerance or cancel transaction",
        timestamp: new Date(),
      });
    }

    // Detect creator dumps
    if (this.detectCreatorDump(tx)) {
      this.emitAlert({
        id: `dump-${tx.hash}`,
        type: "creator_dump",
        severity: "critical",
        transaction: tx,
        description:
          "🚨 Large transfer from creator wallet to exchange detected",
        recommendation:
          "URGENT: Consider selling or migrating to PYUSD immediately",
        estimatedLoss: parseFloat(tx.value) / 1e18,
        timestamp: new Date(),
      });
    }

    // Detect suspicious approvals
    if (this.detectSuspiciousApproval(tx)) {
      this.emitAlert({
        id: `approval-${tx.hash}`,
        type: "suspicious_approval",
        severity: "high",
        transaction: tx,
        description: "⚠️ Unlimited token approval detected",
        recommendation: "Revoke this approval immediately using Lit Protocol",
        timestamp: new Date(),
      });
    }

    // Detect liquidity removal
    if (this.detectLiquidityRemoval(tx)) {
      this.emitAlert({
        id: `liquidity-${tx.hash}`,
        type: "liquidity_removal",
        severity: "critical",
        transaction: tx,
        description: "💧 Large liquidity removal detected",
        recommendation: "Token may become illiquid - consider exiting position",
        timestamp: new Date(),
      });
    }

    // Detect flash loan attacks
    if (this.detectFlashLoan(tx)) {
      this.emitAlert({
        id: `flashloan-${tx.hash}`,
        type: "flash_loan",
        severity: "high",
        transaction: tx,
        description: "⚡ Flash loan transaction detected",
        recommendation:
          "Potential price manipulation - wait for market to stabilize",
        timestamp: new Date(),
      });
    }
  }

  /**
   * Detect sandwich attack patterns
   */
  private detectSandwichAttack(tx: MempoolTransaction): boolean {
    const gasPrice = parseInt(tx.gasPrice, 16);
    const avgGasPrice = 50 * 1e9; // 50 gwei
    const highGasPrice = gasPrice > avgGasPrice * 2;

    // Check for swap function signatures
    const swapSignatures = [
      "0x38ed1739", // swapExactTokensForTokens
      "0x8803dbee", // swapTokensForExactTokens
      "0x7ff36ab5", // swapExactETHForTokens
      "0xfb3bdb41", // swapETHForExactTokens
    ];

    const isSwap = swapSignatures.some((sig) => tx.data.startsWith(sig));

    return highGasPrice && isSwap;
  }

  /**
   * Detect creator dump patterns
   */
  private detectCreatorDump(tx: MempoolTransaction): boolean {
    // Known exchange addresses
    const knownExchanges = [
      "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be", // Binance
      "0x28c6c06298d514db089934071355e5743bf21d60", // Binance 2
      "0x21a31ee1afc51d94c2efccaa2092ad1028285549", // Binance 3
      "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", // Binance 4
      "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", // Binance 5
    ];

    const isToExchange = knownExchanges.some(
      (ex) => tx.to?.toLowerCase() === ex.toLowerCase()
    );
    const isLargeAmount = parseFloat(tx.value) > 10e18; // > 10 ETH

    return isToExchange && isLargeAmount;
  }

  /**
   * Detect suspicious approval patterns
   */
  private detectSuspiciousApproval(tx: MempoolTransaction): boolean {
    const APPROVE_SELECTOR = "0x095ea7b3";
    const MAX_UINT256 =
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    return (
      tx.data.startsWith(APPROVE_SELECTOR) && tx.data.includes(MAX_UINT256)
    );
  }

  /**
   * Detect liquidity removal
   */
  private detectLiquidityRemoval(tx: MempoolTransaction): boolean {
    const REMOVE_LIQUIDITY_SIGNATURES = [
      "0xbaa2abde", // removeLiquidity
      "0x02751cec", // removeLiquidityETH
      "0xaf2979eb", // removeLiquidityETHSupportingFeeOnTransferTokens
    ];

    return REMOVE_LIQUIDITY_SIGNATURES.some((sig) => tx.data.startsWith(sig));
  }

  /**
   * Detect flash loan patterns
   */
  private detectFlashLoan(tx: MempoolTransaction): boolean {
    const FLASH_LOAN_SIGNATURES = [
      "0xab9c4b5d", // flashLoan (Aave)
      "0x5cffe9de", // flashLoan (dYdX)
    ];

    return FLASH_LOAN_SIGNATURES.some((sig) => tx.data.startsWith(sig));
  }

  /**
   * Analyze threat level
   */
  private analyzeThreatLevel(tx: any): "low" | "medium" | "high" {
    const gasPrice = parseInt(tx.gasPrice, 16);
    const avgGasPrice = 50 * 1e9; // 50 gwei

    if (gasPrice > avgGasPrice * 3) return "high";
    if (gasPrice > avgGasPrice * 1.5) return "medium";
    if (tx.data && tx.data.length > 1000) return "medium";

    return "low";
  }

  /**
   * Detect threat type
   */
  private detectThreatType(
    tx: any
  ): "frontrun" | "sandwich" | "mev" | "suspicious" | undefined {
    const gasPrice = parseInt(tx.gasPrice, 16);
    const avgGasPrice = 50 * 1e9;

    if (gasPrice > avgGasPrice * 2) return "frontrun";
    if (tx.data && tx.data.length > 500) return "mev";
    if (tx.value === "0x0" && tx.data && tx.data.length > 100)
      return "suspicious";

    return undefined;
  }

  /**
   * Emit alert to all callbacks
   */
  private emitAlert(alert: MempoolAlert): void {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        console.error("Error in alert callback:", error);
      }
    });
  }

  /**
   * Fallback monitoring using Alchemy for real-time transaction detection
   */
  private startFallbackMonitoring(): void {
    // Prevent multiple fallback instances
    if (this.fallbackIntervalId) {
      return;
    }

    console.log("🔍 Starting real-time transaction monitoring...");

    // Track last seen block to avoid duplicates
    let lastSeenBlock = 0;
    let seenTransactions = new Set<string>();

    // Poll for recent transactions every 10 seconds
    const pollInterval = 10000;

    const pollRecentTransactions = async () => {
      try {
        const { AlchemyAPI } = await import("./alchemy");

        if (!AlchemyAPI.isConfigured()) {
          console.warn("Alchemy not configured - monitoring limited");
          return;
        }

        for (const address of this.monitoredAddresses) {
          // Get recent transactions - simplified to avoid API errors
          // Alchemy's getAssetTransfers works best with simple parameters
          const transfers = await AlchemyAPI.getTransactionHistory(
            address,
            "0x0", // Start from block 0 (Alchemy returns recent ones anyway)
            "latest", // To latest block
            11155111 // Sepolia chain ID
          );

          transfers.forEach((transfer: any) => {
            // Skip if we've already seen this transaction
            if (seenTransactions.has(transfer.hash)) {
              return;
            }

            seenTransactions.add(transfer.hash);

            // Update last seen block
            if (transfer.blockNum) {
              const blockNum = parseInt(transfer.blockNum, 16);
              if (blockNum > lastSeenBlock) {
                lastSeenBlock = blockNum;
              }
            }

            // Convert to mempool transaction format
            const mempoolTx: MempoolTransaction = {
              hash: transfer.hash,
              from: transfer.from,
              to: transfer.to || transfer.rawContract?.address || "",
              value: transfer.value
                ? `0x${(parseFloat(transfer.value) * 1e18).toString(16)}`
                : "0x0",
              gasPrice: "0x0",
              gasLimit: "0x0",
              data: transfer.rawContract?.value || "0x",
              timestamp: new Date(),
              riskLevel: "low",
              threatType: undefined,
            };

            console.log("📊 New transaction detected:", {
              hash: mempoolTx.hash.slice(0, 10) + "...",
              from: mempoolTx.from.slice(0, 8) + "...",
              to: mempoolTx.to.slice(0, 8) + "...",
            });

            // Emit to callbacks
            this.transactionCallbacks.forEach((callback) =>
              callback(mempoolTx)
            );

            // Analyze for threats
            this.analyzeForThreats(mempoolTx);
          });
        }

        // Clean up old seen transactions (keep last 1000)
        if (seenTransactions.size > 1000) {
          const txArray = Array.from(seenTransactions);
          seenTransactions = new Set(txArray.slice(-1000));
        }
      } catch (error) {
        console.error("Error polling transactions:", error);
      }
    };

    // Start polling immediately and then every interval
    pollRecentTransactions();
    this.fallbackIntervalId = setInterval(pollRecentTransactions, pollInterval);

    console.log("✅ Real-time monitoring active - watching for transactions");
  }

  /**
   * Generate demo transaction for testing - DISABLED
   * We only want REAL blockchain data, no mock data
   */
  private generateDemoTransaction(riskLevel: "low" | "medium" | "high"): void {
    // DISABLED: No mock data for production demos
    // All data should come from real blockchain sources
    console.log("Demo transaction generation disabled - using real data only");
  }

  /**
   * Check if Envio is available
   */
  static isAvailable(): boolean {
    return !!ENVIO_API_KEY;
  }

  /**
   * Get historical transaction data
   */
  async getHistoricalTransactions(
    address: string,
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    // Implementation for historical data fetching
    // This would use Envio's REST API
    return [];
  }

  /**
   * Get DeFi protocol events
   */
  async getDeFiEvents(
    protocolAddress: string,
    eventTypes: string[],
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    // Implementation for DeFi event fetching
    return [];
  }
}

export default new EnvioHyperSync();

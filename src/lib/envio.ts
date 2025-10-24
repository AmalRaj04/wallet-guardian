// Envio HyperSync Integration for Real-time Mempool Monitoring & Historical Data
import { MempoolTransaction, Alert } from "@/types";

const ENVIO_API_KEY = process.env.NEXT_PUBLIC_ENVIO_API_KEY;
const ENVIO_WS_URL = "wss://hypersync.envio.dev";

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
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private monitoredAddresses: Set<string> = new Set();
  private monitoredContracts: Set<string> = new Set();
  private alertCallbacks: ((alert: MempoolAlert) => void)[] = [];
  private transactionCallbacks: ((tx: MempoolTransaction) => void)[] = [];

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

    if (!ENVIO_API_KEY) {
      console.warn("Envio API key not configured. Using fallback monitoring.");
      this.startFallbackMonitoring();
      return;
    }

    this.connectWebSocket();
  }

  /**
   * Stop mempool monitoring
   */
  stopMonitoring(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear fallback interval if exists
    if ((this as any).fallbackIntervalId) {
      clearInterval((this as any).fallbackIntervalId);
      (this as any).fallbackIntervalId = null;
    }

    this.monitoredAddresses.clear();
    this.monitoredContracts.clear();
    this.alertCallbacks = [];
    this.transactionCallbacks = [];
  }

  /**
   * Connect to Envio WebSocket
   */
  private connectWebSocket(): void {
    // Skip WebSocket if no API key or invalid key
    if (
      !ENVIO_API_KEY ||
      ENVIO_API_KEY === "your_envio_api_key_here" ||
      ENVIO_API_KEY.length < 20
    ) {
      console.log("Envio: Using fallback monitoring (WebSocket optional)");
      this.startFallbackMonitoring();
      return;
    }

    try {
      this.ws = new WebSocket(`${ENVIO_WS_URL}?apiKey=${ENVIO_API_KEY}`);

      this.ws.onopen = () => {
        console.log("✅ Connected to Envio HyperSync");
        this.reconnectAttempts = 0;

        // Subscribe to monitored addresses
        this.monitoredAddresses.forEach((address) => {
          this.ws?.send(
            JSON.stringify({
              type: "subscribe",
              address,
              includeMempool: true,
            })
          );
        });

        // Subscribe to monitored contracts
        this.monitoredContracts.forEach((contract) => {
          this.ws?.send(
            JSON.stringify({
              type: "subscribe",
              contract,
              includeMempool: true,
              includeEvents: true,
            })
          );
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMempoolData(data);
        } catch (error) {
          console.error("Error parsing mempool data:", error);
        }
      };

      this.ws.onerror = (error) => {
        // Silently handle WebSocket errors - this is an optional service
        console.log("Envio WebSocket unavailable - using fallback monitoring");
      };

      this.ws.onclose = () => {
        console.log("Envio WebSocket closed - using fallback monitoring");
        this.startFallbackMonitoring();
      };
    } catch (error) {
      console.error("Failed to connect to Envio:", error);
      this.startFallbackMonitoring();
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    // Skip reconnection in development, use fallback immediately
    if (process.env.NODE_ENV === "development") {
      this.startFallbackMonitoring();
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(
        `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connectWebSocket(), delay);
    } else {
      console.warn(
        "Max reconnection attempts reached. Using fallback monitoring."
      );
      this.startFallbackMonitoring();
    }
  }

  /**
   * Handle incoming mempool data
   */
  private handleMempoolData(data: any): void {
    if (data.type === "mempool_transaction") {
      const tx: MempoolTransaction = {
        hash: data.hash,
        from: data.from,
        to: data.to,
        value: data.value,
        gasPrice: data.gasPrice,
        gasLimit: data.gasLimit,
        data: data.data,
        timestamp: new Date(data.timestamp),
        riskLevel: this.analyzeThreatLevel(data),
        threatType: this.detectThreatType(data),
      };

      // Emit to transaction callbacks
      this.transactionCallbacks.forEach((callback) => callback(tx));

      // Analyze for threats and emit alerts
      this.analyzeForThreats(tx);
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
   * Fallback monitoring using Etherscan polling
   */
  private startFallbackMonitoring(): void {
    console.log("✅ Fallback mempool monitoring active (using Etherscan)");

    // Use Etherscan as backup for mempool monitoring
    const pollInterval = 10000; // Poll every 10 seconds

    const pollEtherscan = async () => {
      try {
        const { EtherscanAPI } = await import("./etherscan");

        for (const address of this.monitoredAddresses) {
          const pendingTxs = await EtherscanAPI.getPendingTransactions(address);

          pendingTxs.forEach((tx: any) => {
            const mempoolTx: MempoolTransaction = {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              gasPrice: tx.gasPrice,
              gasLimit: tx.gas,
              data: tx.input,
              timestamp: new Date(parseInt(tx.timeStamp) * 1000),
              riskLevel: this.analyzeThreatLevel(tx),
              threatType: this.detectThreatType(tx),
            };

            this.transactionCallbacks.forEach((callback) =>
              callback(mempoolTx)
            );
            this.analyzeForThreats(mempoolTx);
          });
        }
      } catch (error) {
        console.error("Error in Etherscan fallback monitoring:", error);
      }
    };

    // Start polling
    const intervalId = setInterval(pollEtherscan, pollInterval);

    // Store interval ID for cleanup
    (this as any).fallbackIntervalId = intervalId;

    // Generate demo transactions for testing (in development)
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => this.generateDemoTransaction("low"), 5000);
      setTimeout(() => this.generateDemoTransaction("medium"), 10000);
      setTimeout(() => this.generateDemoTransaction("high"), 15000);
    }
  }

  /**
   * Generate demo transaction for testing
   */
  private generateDemoTransaction(riskLevel: "low" | "medium" | "high"): void {
    const demoTx: MempoolTransaction = {
      hash: "0x" + Math.random().toString(16).substring(2, 66),
      from: "0x" + Math.random().toString(16).substring(2, 42),
      to:
        Array.from(this.monitoredContracts)[0] ||
        "0x" + Math.random().toString(16).substring(2, 42),
      value: "0x" + (Math.random() * 1e18).toString(16),
      gasPrice:
        "0x" +
        (
          50 *
          1e9 *
          (riskLevel === "high" ? 3 : riskLevel === "medium" ? 1.5 : 1)
        ).toString(16),
      gasLimit: "0x5208",
      data: "0x",
      timestamp: new Date(),
      riskLevel,
      threatType:
        riskLevel === "high"
          ? "frontrun"
          : riskLevel === "medium"
            ? "mev"
            : undefined,
    };

    // Emit to callbacks
    this.transactionCallbacks.forEach((callback) => {
      try {
        callback(demoTx);
      } catch (error) {
        console.error("Error in transaction callback:", error);
      }
    });
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

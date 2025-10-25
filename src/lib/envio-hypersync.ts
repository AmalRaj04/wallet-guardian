/**
 * Envio HyperSync Integration - CORRECT IMPLEMENTATION
 * For hackathon/partner prize eligibility
 *
 * Envio HyperSync provides ultra-fast historical blockchain data access
 * via their HyperRPC and indexing infrastructure
 */

import { Token, Alert } from "@/types";

const ENVIO_API_KEY = process.env.NEXT_PUBLIC_ENVIO_API_KEY;

// Envio HyperSync endpoints
const HYPERSYNC_ENDPOINTS = {
  ethereum: "https://eth.hypersync.xyz",
  sepolia: "https://sepolia.hypersync.xyz",
  polygon: "https://polygon.hypersync.xyz",
  arbitrum: "https://arbitrum.hypersync.xyz",
  optimism: "https://optimism.hypersync.xyz",
};

export interface EnvioTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  gasPrice: string;
  gasUsed: string;
  input: string;
  status: number;
}

export interface EnvioTokenTransfer {
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
  blockNumber: number;
  timestamp: number;
}

export interface EnvioLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export class EnvioHyperSync {
  private baseUrl: string;
  private apiKey: string;

  constructor(chainId: number = 1) {
    this.apiKey = ENVIO_API_KEY || "";
    this.baseUrl = this.getEndpoint(chainId);
  }

  /**
   * Get HyperSync endpoint for chain
   */
  private getEndpoint(chainId: number): string {
    switch (chainId) {
      case 1:
        return HYPERSYNC_ENDPOINTS.ethereum;
      case 11155111:
        return HYPERSYNC_ENDPOINTS.sepolia;
      case 137:
        return HYPERSYNC_ENDPOINTS.polygon;
      case 42161:
        return HYPERSYNC_ENDPOINTS.arbitrum;
      case 10:
        return HYPERSYNC_ENDPOINTS.optimism;
      default:
        return HYPERSYNC_ENDPOINTS.ethereum;
    }
  }

  /**
   * Make request to HyperSync API
   */
  private async request<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Envio HyperSync error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get transaction history for an address
   * Ultra-fast historical data retrieval
   */
  async getTransactionHistory(
    address: string,
    fromBlock: number = 0,
    toBlock?: number,
    limit: number = 100
  ): Promise<EnvioTransaction[]> {
    try {
      const query = {
        from_block: fromBlock,
        to_block: toBlock || "latest",
        transactions: [
          {
            from: [address.toLowerCase()],
          },
          {
            to: [address.toLowerCase()],
          },
        ],
        field_selection: {
          transaction: [
            "hash",
            "from",
            "to",
            "value",
            "block_number",
            "gas_price",
            "gas_used",
            "input",
            "status",
          ],
        },
        max_num_transactions: limit,
      };

      const response = await this.request<any>("/query", query);

      return this.parseTransactions(response);
    } catch (error) {
      console.error("Error fetching transaction history from Envio:", error);
      return [];
    }
  }

  /**
   * Get ERC-20 token transfers for an address
   * Fast token transfer history
   */
  async getTokenTransfers(
    address: string,
    tokenAddress?: string,
    fromBlock: number = 0,
    toBlock?: number,
    limit: number = 100
  ): Promise<EnvioTokenTransfer[]> {
    try {
      const query = {
        from_block: fromBlock,
        to_block: toBlock || "latest",
        logs: [
          {
            address: tokenAddress ? [tokenAddress.toLowerCase()] : undefined,
            topics: [
              [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              ], // Transfer event
            ],
          },
        ],
        field_selection: {
          log: [
            "address",
            "topics",
            "data",
            "block_number",
            "transaction_hash",
          ],
        },
        max_num_logs: limit,
      };

      const response = await this.request<any>("/query", query);

      return this.parseTokenTransfers(response, address);
    } catch (error) {
      console.error("Error fetching token transfers from Envio:", error);
      return [];
    }
  }

  /**
   * Get contract events/logs
   * Fast event indexing
   */
  async getContractEvents(
    contractAddress: string,
    eventSignature: string,
    fromBlock: number = 0,
    toBlock?: number,
    limit: number = 100
  ): Promise<EnvioLog[]> {
    try {
      const query = {
        from_block: fromBlock,
        to_block: toBlock || "latest",
        logs: [
          {
            address: [contractAddress.toLowerCase()],
            topics: [[eventSignature]],
          },
        ],
        field_selection: {
          log: [
            "address",
            "topics",
            "data",
            "block_number",
            "transaction_hash",
            "log_index",
          ],
        },
        max_num_logs: limit,
      };

      const response = await this.request<any>("/query", query);

      return this.parseLogs(response);
    } catch (error) {
      console.error("Error fetching contract events from Envio:", error);
      return [];
    }
  }

  /**
   * Analyze wallet activity patterns
   * Use HyperSync's speed to analyze large datasets
   */
  async analyzeWalletActivity(
    address: string,
    daysBack: number = 30
  ): Promise<{
    totalTransactions: number;
    totalValue: string;
    uniqueContracts: number;
    mostActiveContract: string;
    riskScore: number;
  }> {
    try {
      const currentBlock = await this.getCurrentBlock();
      const blocksPerDay = 7200; // ~12 second blocks
      const fromBlock = currentBlock - daysBack * blocksPerDay;

      const transactions = await this.getTransactionHistory(
        address,
        fromBlock,
        currentBlock,
        1000 // Analyze up to 1000 transactions
      );

      // Analyze patterns
      const uniqueContracts = new Set(
        transactions.map((tx) => tx.to).filter((to) => to !== null)
      );

      const totalValue = transactions.reduce(
        (sum, tx) => sum + BigInt(tx.value),
        BigInt(0)
      );

      // Calculate risk score based on activity
      let riskScore = 0;

      // High transaction frequency = higher risk
      if (transactions.length > 100) riskScore += 20;
      else if (transactions.length > 50) riskScore += 10;

      // Many unique contracts = higher risk
      if (uniqueContracts.size > 20) riskScore += 20;
      else if (uniqueContracts.size > 10) riskScore += 10;

      // Large value transfers = higher risk
      const avgValue = Number(totalValue) / transactions.length;
      if (avgValue > 1e18)
        riskScore += 20; // > 1 ETH average
      else if (avgValue > 0.1e18) riskScore += 10; // > 0.1 ETH average

      // Find most active contract
      const contractCounts = new Map<string, number>();
      transactions.forEach((tx) => {
        if (tx.to) {
          contractCounts.set(tx.to, (contractCounts.get(tx.to) || 0) + 1);
        }
      });

      const mostActiveContract =
        Array.from(contractCounts.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] || "";

      return {
        totalTransactions: transactions.length,
        totalValue: totalValue.toString(),
        uniqueContracts: uniqueContracts.size,
        mostActiveContract,
        riskScore: Math.min(riskScore, 100),
      };
    } catch (error) {
      console.error("Error analyzing wallet activity:", error);
      return {
        totalTransactions: 0,
        totalValue: "0",
        uniqueContracts: 0,
        mostActiveContract: "",
        riskScore: 0,
      };
    }
  }

  /**
   * Track token holder changes
   * Monitor token distribution over time
   */
  async trackTokenHolders(
    tokenAddress: string,
    fromBlock: number,
    toBlock?: number
  ): Promise<Map<string, bigint>> {
    try {
      const transfers = await this.getTokenTransfers(
        "", // All addresses
        tokenAddress,
        fromBlock,
        toBlock,
        10000 // Large dataset
      );

      const balances = new Map<string, bigint>();

      transfers.forEach((transfer) => {
        const value = BigInt(transfer.value);

        // Subtract from sender
        if (transfer.from !== "0x0000000000000000000000000000000000000000") {
          const fromBalance = balances.get(transfer.from) || BigInt(0);
          balances.set(transfer.from, fromBalance - value);
        }

        // Add to receiver
        const toBalance = balances.get(transfer.to) || BigInt(0);
        balances.set(transfer.to, toBalance + value);
      });

      return balances;
    } catch (error) {
      console.error("Error tracking token holders:", error);
      return new Map();
    }
  }

  /**
   * Get current block number
   */
  private async getCurrentBlock(): Promise<number> {
    try {
      const query = {
        from_block: 0,
        to_block: "latest",
        field_selection: {
          block: ["number"],
        },
        max_num_blocks: 1,
      };

      const response = await this.request<any>("/query", query);
      return response.data?.blocks?.[0]?.number || 0;
    } catch (error) {
      console.error("Error getting current block:", error);
      return 0;
    }
  }

  /**
   * Parse transaction response
   */
  private parseTransactions(response: any): EnvioTransaction[] {
    if (!response.data?.transactions) return [];

    return response.data.transactions.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      blockNumber: tx.block_number,
      timestamp: tx.timestamp || 0,
      gasPrice: tx.gas_price,
      gasUsed: tx.gas_used,
      input: tx.input,
      status: tx.status,
    }));
  }

  /**
   * Parse token transfer logs
   */
  private parseTokenTransfers(
    response: any,
    filterAddress?: string
  ): EnvioTokenTransfer[] {
    if (!response.data?.logs) return [];

    return response.data.logs
      .map((log: any) => {
        try {
          // Decode Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
          const from = "0x" + log.topics[1].slice(26);
          const to = "0x" + log.topics[2].slice(26);
          const value = log.data;

          // Filter by address if specified
          if (filterAddress) {
            const addr = filterAddress.toLowerCase();
            if (from.toLowerCase() !== addr && to.toLowerCase() !== addr) {
              return null;
            }
          }

          return {
            transactionHash: log.transaction_hash,
            from,
            to,
            value,
            tokenAddress: log.address,
            blockNumber: log.block_number,
            timestamp: 0, // Would need block data for timestamp
          };
        } catch (error) {
          return null;
        }
      })
      .filter((transfer: any) => transfer !== null);
  }

  /**
   * Parse logs
   */
  private parseLogs(response: any): EnvioLog[] {
    if (!response.data?.logs) return [];

    return response.data.logs.map((log: any) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: log.block_number,
      transactionHash: log.transaction_hash,
      logIndex: log.log_index,
    }));
  }

  /**
   * Check if Envio is available
   */
  static isAvailable(): boolean {
    return !!ENVIO_API_KEY && ENVIO_API_KEY.length > 20;
  }
}

export default EnvioHyperSync;

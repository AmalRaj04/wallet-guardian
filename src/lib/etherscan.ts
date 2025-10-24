// Etherscan API Integration - Backup for Envio & Additional Data
import axios from "axios";

const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const ETHERSCAN_BASE_URL = "https://api.etherscan.io/api";

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  input: string;
}

export class EtherscanAPI {
  private static api = axios.create({
    baseURL: ETHERSCAN_BASE_URL,
    timeout: 15000,
  });

  // Get pending transactions (mempool backup)
  static async getPendingTransactions(
    address: string
  ): Promise<EtherscanTransaction[]> {
    if (!ETHERSCAN_API_KEY) {
      console.warn("Etherscan API key not configured");
      return [];
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "account",
          action: "txlistpending",
          address,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result || [];
      }

      return [];
    } catch (error) {
      console.error(
        "Error fetching pending transactions from Etherscan:",
        error
      );
      return [];
    }
  }

  // Get normal transactions
  static async getTransactions(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999,
    page: number = 1,
    offset: number = 100
  ): Promise<EtherscanTransaction[]> {
    if (!ETHERSCAN_API_KEY) {
      console.warn("Etherscan API key not configured");
      return [];
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "account",
          action: "txlist",
          address,
          startblock: startBlock,
          endblock: endBlock,
          page,
          offset,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching transactions from Etherscan:", error);
      return [];
    }
  }

  // Get internal transactions
  static async getInternalTransactions(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999
  ): Promise<any[]> {
    if (!ETHERSCAN_API_KEY) {
      return [];
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "account",
          action: "txlistinternal",
          address,
          startblock: startBlock,
          endblock: endBlock,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching internal transactions:", error);
      return [];
    }
  }

  // Get ERC-20 token transfers
  static async getTokenTransfers(
    address: string,
    contractAddress?: string,
    startBlock: number = 0,
    endBlock: number = 99999999
  ): Promise<any[]> {
    if (!ETHERSCAN_API_KEY) {
      return [];
    }

    try {
      const params: any = {
        module: "account",
        action: "tokentx",
        address,
        startblock: startBlock,
        endblock: endBlock,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      };

      if (contractAddress) {
        params.contractaddress = contractAddress;
      }

      const response = await this.api.get("", { params });

      if (response.data.status === "1") {
        return response.data.result || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching token transfers:", error);
      return [];
    }
  }

  // Get contract source code
  static async getContractSource(contractAddress: string): Promise<any> {
    if (!ETHERSCAN_API_KEY) {
      throw new Error("Etherscan API key required");
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "contract",
          action: "getsourcecode",
          address: contractAddress,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1" && response.data.result.length > 0) {
        return response.data.result[0];
      }

      throw new Error("Contract not found or not verified");
    } catch (error) {
      console.error("Error fetching contract source:", error);
      throw error;
    }
  }

  // Check if contract is verified
  static async isContractVerified(contractAddress: string): Promise<boolean> {
    try {
      const source = await this.getContractSource(contractAddress);
      return !!(source.SourceCode && source.SourceCode.length > 0);
    } catch (error) {
      return false;
    }
  }

  // Get contract ABI
  static async getContractABI(contractAddress: string): Promise<any> {
    if (!ETHERSCAN_API_KEY) {
      throw new Error("Etherscan API key required");
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "contract",
          action: "getabi",
          address: contractAddress,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return JSON.parse(response.data.result);
      }

      throw new Error("ABI not found");
    } catch (error) {
      console.error("Error fetching contract ABI:", error);
      throw error;
    }
  }

  // Get ETH balance
  static async getBalance(address: string): Promise<string> {
    if (!ETHERSCAN_API_KEY) {
      return "0";
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "account",
          action: "balance",
          address,
          tag: "latest",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }

      return "0";
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  }

  // Get multiple balances
  static async getBalances(addresses: string[]): Promise<Map<string, string>> {
    if (!ETHERSCAN_API_KEY) {
      return new Map();
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "account",
          action: "balancemulti",
          address: addresses.join(","),
          tag: "latest",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      const balances = new Map<string, string>();

      if (response.data.status === "1" && response.data.result) {
        response.data.result.forEach((item: any) => {
          balances.set(item.account.toLowerCase(), item.balance);
        });
      }

      return balances;
    } catch (error) {
      console.error("Error fetching multiple balances:", error);
      return new Map();
    }
  }

  // Get gas oracle (current gas prices)
  static async getGasOracle(): Promise<{
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  }> {
    if (!ETHERSCAN_API_KEY) {
      return {
        SafeGasPrice: "20",
        ProposeGasPrice: "25",
        FastGasPrice: "30",
      };
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "gastracker",
          action: "gasoracle",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }

      return {
        SafeGasPrice: "20",
        ProposeGasPrice: "25",
        FastGasPrice: "30",
      };
    } catch (error) {
      console.error("Error fetching gas oracle:", error);
      return {
        SafeGasPrice: "20",
        ProposeGasPrice: "25",
        FastGasPrice: "30",
      };
    }
  }

  // Get transaction receipt status
  static async getTransactionStatus(txHash: string): Promise<{
    isError: string;
    errDescription: string;
  }> {
    if (!ETHERSCAN_API_KEY) {
      throw new Error("Etherscan API key required");
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "transaction",
          action: "getstatus",
          txhash: txHash,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }

      throw new Error("Transaction not found");
    } catch (error) {
      console.error("Error fetching transaction status:", error);
      throw error;
    }
  }

  // Get transaction receipt
  static async getTransactionReceipt(txHash: string): Promise<any> {
    if (!ETHERSCAN_API_KEY) {
      throw new Error("Etherscan API key required");
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "proxy",
          action: "eth_getTransactionReceipt",
          txhash: txHash,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.result) {
        return response.data.result;
      }

      throw new Error("Receipt not found");
    } catch (error) {
      console.error("Error fetching transaction receipt:", error);
      throw error;
    }
  }

  // Get block number by timestamp
  static async getBlockNumberByTimestamp(
    timestamp: number,
    closest: "before" | "after" = "before"
  ): Promise<number> {
    if (!ETHERSCAN_API_KEY) {
      return 0;
    }

    try {
      const response = await this.api.get("", {
        params: {
          module: "block",
          action: "getblocknobytime",
          timestamp,
          closest,
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (response.data.status === "1") {
        return parseInt(response.data.result);
      }

      return 0;
    } catch (error) {
      console.error("Error fetching block number:", error);
      return 0;
    }
  }

  // Check if API key is configured
  static isConfigured(): boolean {
    return !!ETHERSCAN_API_KEY && ETHERSCAN_API_KEY.length > 10;
  }

  // Get API key status
  static async checkAPIKeyStatus(): Promise<{
    valid: boolean;
    rateLimit: number;
    remaining: number;
  }> {
    if (!ETHERSCAN_API_KEY) {
      return { valid: false, rateLimit: 0, remaining: 0 };
    }

    try {
      // Make a simple API call to check status
      const response = await this.api.get("", {
        params: {
          module: "stats",
          action: "ethsupply",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      return {
        valid: response.data.status === "1",
        rateLimit: 5, // Free tier: 5 calls/second
        remaining: 5,
      };
    } catch (error) {
      return { valid: false, rateLimit: 0, remaining: 0 };
    }
  }
}

export default EtherscanAPI;

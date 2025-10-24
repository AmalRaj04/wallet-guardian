// Alchemy API Integration for Real Blockchain Data
import axios from "axios";
import { Token } from "@/types";

const ALCHEMY_API_KEY =
  process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Helper to get Alchemy network URL based on chain ID
function getAlchemyUrl(chainId?: number): string {
  const network = chainId === 11155111 ? "eth-sepolia" : "eth-mainnet";
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: string;
}

interface AlchemyTokenMetadata {
  decimals: number;
  logo: string;
  name: string;
  symbol: string;
}

export class AlchemyAPI {
  private static createApi(chainId?: number) {
    return axios.create({
      baseURL: getAlchemyUrl(chainId),
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }

  // Get ETH balance for an address
  static async getEthBalance(
    address: string,
    chainId?: number
  ): Promise<string> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      throw error;
    }
  }

  // Get all ERC-20 token balances for an address
  static async getTokenBalances(
    address: string,
    chainId?: number
  ): Promise<AlchemyTokenBalance[]> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [address, "erc20"],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result.tokenBalances.filter(
        (token: AlchemyTokenBalance) =>
          token.tokenBalance !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    } catch (error) {
      console.error("Error fetching token balances:", error);
      throw error;
    }
  }

  // Get token metadata (name, symbol, decimals, logo)
  static async getTokenMetadata(
    contractAddress: string,
    chainId?: number
  ): Promise<AlchemyTokenMetadata> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenMetadata",
        params: [contractAddress],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      throw error;
    }
  }

  // Get complete portfolio with balances and metadata
  static async getCompletePortfolio(
    address: string,
    chainId?: number
  ): Promise<Token[]> {
    if (!ALCHEMY_API_KEY) {
      console.warn("Alchemy API key not configured. Using mock data.");
      return [];
    }

    try {
      // Get all token balances
      const tokenBalances = await this.getTokenBalances(address, chainId);

      // Fetch metadata for each token in parallel
      const tokensWithMetadata = await Promise.all(
        tokenBalances.map(async (balance) => {
          try {
            const metadata = await this.getTokenMetadata(
              balance.contractAddress,
              chainId
            );

            const balanceFormatted =
              parseInt(balance.tokenBalance, 16) /
              Math.pow(10, metadata.decimals);

            const token: Token = {
              address: balance.contractAddress,
              symbol: metadata.symbol,
              name: metadata.name,
              decimals: metadata.decimals,
              balance: balance.tokenBalance,
              balanceFormatted,
              logo: metadata.logo,
            };

            return token;
          } catch (error) {
            console.error(
              `Error fetching metadata for ${balance.contractAddress}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out failed requests
      return tokensWithMetadata.filter(
        (token): token is Token => token !== null
      );
    } catch (error) {
      console.error("Error fetching complete portfolio:", error);
      throw error;
    }
  }

  // Get token allowances for an address
  static async getTokenAllowances(
    ownerAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    chainId?: number
  ): Promise<string> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      // ERC-20 allowance function signature
      const functionSignature = "0xdd62ed3e"; // allowance(address,address)
      const paddedOwner = ownerAddress.slice(2).padStart(64, "0");
      const paddedSpender = spenderAddress.slice(2).padStart(64, "0");
      const data = functionSignature + paddedOwner + paddedSpender;

      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data,
          },
          "latest",
        ],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error("Error fetching token allowance:", error);
      throw error;
    }
  }

  // Get transaction history
  static async getTransactionHistory(
    address: string,
    fromBlock: string = "0x0",
    toBlock: string = "latest",
    chainId?: number
  ): Promise<any[]> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock,
            toBlock,
            fromAddress: address,
            category: ["external", "erc20", "erc721", "erc1155"],
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: "0x64", // 100 transactions
          },
        ],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result.transfers || [];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  }

  // Get current gas prices
  static async getGasPrice(chainId?: number): Promise<{
    slow: string;
    standard: string;
    fast: string;
  }> {
    if (!ALCHEMY_API_KEY) {
      throw new Error("Alchemy API key not configured");
    }

    try {
      const api = this.createApi(chainId);
      const response = await api.post("", {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_gasPrice",
        params: [],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const gasPrice = parseInt(response.data.result, 16);

      return {
        slow: (gasPrice * 0.8).toString(),
        standard: gasPrice.toString(),
        fast: (gasPrice * 1.2).toString(),
      };
    } catch (error) {
      console.error("Error fetching gas price:", error);
      throw error;
    }
  }

  // Check if API key is configured
  static isConfigured(): boolean {
    return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY !== "demo_key";
  }

  // Convert hex to decimal
  static hexToDecimal(hex: string): number {
    return parseInt(hex, 16);
  }

  // Convert wei to ETH
  static weiToEth(wei: string): number {
    return parseInt(wei, 16) / 1e18;
  }
}

export default AlchemyAPI;

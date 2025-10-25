/**
 * 1inch API Integration
 * Provides best swap rates across multiple DEXs
 * Docs: https://portal.1inch.dev/documentation/apis/swap/introduction
 */

import { parseUnits, formatUnits } from "viem";
import { Token } from "@/types";

const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;
// Use our Next.js API proxy to avoid CORS issues
const ONEINCH_API_BASE = "/api/oneinch";

// Token addresses
export const TOKEN_ADDRESSES = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  PYUSD: "0x6c3ea9036406852006290770bedfcaba0e23a0e8", // PayPal USD
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

export interface OneInchQuote {
  toAmount: string;
  fromAmount: string;
  protocols: any[];
  estimatedGas: number;
}

export interface OneInchSwapData {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
  toAmount: string;
  fromAmount: string;
}

export interface OneInchAllowance {
  allowance: string;
}

export class OneInchService {
  private static baseUrl = ONEINCH_API_BASE;
  private static apiKey = ONEINCH_API_KEY;

  /**
   * Make authenticated request to 1inch API via our proxy
   */
  private static async request<T>(
    chainId: number,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("1inch API key not configured");
    }

    // Add chainId and endpoint to params for our proxy
    const queryParams = new URLSearchParams({
      chainId: chainId.toString(),
      endpoint: endpoint,
      ...params,
    });

    // Remove undefined/null values
    Array.from(queryParams.keys()).forEach((key) => {
      if (
        queryParams.get(key) === "undefined" ||
        queryParams.get(key) === "null"
      ) {
        queryParams.delete(key);
      }
    });

    const url = `${this.baseUrl}?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `1inch API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get swap quote (no gas cost, just price info)
   */
  static async getQuote(
    chainId: number,
    fromToken: Token,
    toTokenAddress: string,
    amount: string,
    slippage: number = 1
  ): Promise<OneInchQuote> {
    const amountInWei = parseUnits(amount, fromToken.decimals).toString();

    return this.request<OneInchQuote>(chainId, "/quote", {
      src: fromToken.address,
      dst: toTokenAddress,
      amount: amountInWei,
      includeProtocols: true,
      includeGas: true,
    });
  }

  /**
   * Get swap transaction data (ready to send)
   */
  static async getSwap(
    chainId: number,
    fromToken: Token,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ): Promise<OneInchSwapData> {
    const amountInWei = parseUnits(amount, fromToken.decimals).toString();

    return this.request<OneInchSwapData>(chainId, "/swap", {
      src: fromToken.address,
      dst: toTokenAddress,
      amount: amountInWei,
      from: fromAddress,
      slippage: slippage,
      disableEstimate: false,
      allowPartialFill: false,
    });
  }

  /**
   * Check if token approval is needed
   */
  static async getAllowance(
    chainId: number,
    tokenAddress: string,
    walletAddress: string
  ): Promise<string> {
    const data = await this.request<OneInchAllowance>(
      chainId,
      "/approve/allowance",
      {
        tokenAddress,
        walletAddress,
      }
    );
    return data.allowance;
  }

  /**
   * Get approval transaction data
   */
  static async getApprovalTransaction(
    chainId: number,
    tokenAddress: string,
    amount?: string
  ): Promise<{ data: string; to: string; value: string }> {
    return this.request(chainId, "/approve/transaction", {
      tokenAddress,
      amount,
    });
  }

  /**
   * Get 1inch router address for approvals
   */
  static async getSpenderAddress(chainId: number): Promise<string> {
    const data = await this.request<{ address: string }>(
      chainId,
      "/approve/spender",
      {}
    );
    return data.address;
  }

  /**
   * Helper: Check if approval is needed
   */
  static async needsApproval(
    chainId: number,
    tokenAddress: string,
    walletAddress: string,
    amount: string,
    decimals: number
  ): Promise<boolean> {
    // Native ETH doesn't need approval
    if (tokenAddress.toLowerCase() === TOKEN_ADDRESSES.ETH.toLowerCase()) {
      return false;
    }

    const allowance = await this.getAllowance(
      chainId,
      tokenAddress,
      walletAddress
    );
    const amountInWei = parseUnits(amount, decimals);
    return BigInt(allowance) < amountInWei;
  }

  /**
   * Helper: Format quote for display
   */
  static formatQuote(quote: OneInchQuote, toTokenDecimals: number) {
    const toAmount = formatUnits(BigInt(quote.toAmount), toTokenDecimals);
    const estimatedGas = quote.estimatedGas;

    return {
      toAmount: parseFloat(toAmount).toFixed(6),
      estimatedGas: estimatedGas.toString(),
      protocols: quote.protocols,
    };
  }

  /**
   * Get PYUSD token info
   */
  static getPYUSDToken(): Token {
    return {
      address: TOKEN_ADDRESSES.PYUSD,
      symbol: "PYUSD",
      name: "PayPal USD",
      decimals: 6,
      balance: "0",
      balanceFormatted: 0,
      price: 1.0,
    };
  }

  /**
   * Get USDC token info
   */
  static getUSDCToken(): Token {
    return {
      address: TOKEN_ADDRESSES.USDC,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      balance: "0",
      balanceFormatted: 0,
      price: 1.0,
    };
  }

  /**
   * Check if chain supports PYUSD
   */
  static supportsPYUSD(chainId: number): boolean {
    // PYUSD is only on Ethereum mainnet (1) and Solana
    return chainId === 1;
  }
}

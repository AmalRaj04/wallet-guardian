// Blockscout API Integration for Wallet Guardian Module
import axios from 'axios';
import { Token, TokenAllowance, SecurityRisk } from '@/types';

const BLOCKSCOUT_BASE_URL = 'https://eth.blockscout.com/api';
const API_KEY = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY;

// Caching layer with 5-minute TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new Cache();

// Rate limiting with exponential backoff
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 5;
  private timeWindow = 1000; // 1 second
  private backoffDelay = 0;

  async throttle(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      this.backoffDelay = Math.min(this.backoffDelay + 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, this.backoffDelay));
    } else {
      this.backoffDelay = Math.max(this.backoffDelay - 500, 0);
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

const api = axios.create({
  baseURL: BLOCKSCOUT_BASE_URL,
  timeout: 15000,
  params: API_KEY ? { apikey: API_KEY } : {},
});

export class BlockscoutAPI {
  // Get ERC-20 token balances for an address
  static async getTokenBalances(address: string): Promise<Token[]> {
    try {
      const response = await api.get('', {
        params: {
          module: 'account',
          action: 'tokenlist',
          address,
        },
      });

      if (response.data.status !== '1') {
        throw new Error(response.data.message || 'Failed to fetch token balances');
      }

      return response.data.result.map((token: any) => ({
        address: token.contractAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: parseInt(token.decimals),
        balance: token.balance,
        balanceFormatted: parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals)),
        logo: token.logo || undefined,
      }));
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw new Error('Failed to fetch token balances from Blockscout');
    }
  }

  // Get ETH balance for an address
  static async getEthBalance(address: string): Promise<number> {
    try {
      const response = await api.get('', {
        params: {
          module: 'account',
          action: 'balance',
          address,
          tag: 'latest',
        },
      });

      if (response.data.status !== '1') {
        throw new Error(response.data.message || 'Failed to fetch ETH balance');
      }

      // Convert from wei to ETH
      return parseFloat(response.data.result) / 1e18;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      throw new Error('Failed to fetch ETH balance');
    }
  }

  // Get token allowances for an address
  static async getTokenAllowances(
    ownerAddress: string,
    tokenAddress?: string
  ): Promise<TokenAllowance[]> {
    try {
      // This is a simplified implementation
      // In a real scenario, you'd need to query multiple token contracts
      // or use a specialized service like Zapper or DeBank
      
      const allowances: TokenAllowance[] = [];
      
      // For demo purposes, we'll return mock data
      // In production, you'd iterate through known tokens and check allowances
      
      return allowances;
    } catch (error) {
      console.error('Error fetching token allowances:', error);
      return [];
    }
  }

  // Check if a contract is verified
  static async isContractVerified(contractAddress: string): Promise<boolean> {
    try {
      const response = await api.get('', {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: contractAddress,
        },
      });

      if (response.data.status !== '1') {
        return false;
      }

      const result = response.data.result[0];
      return !!(result.SourceCode && result.SourceCode.length > 0);
    } catch (error) {
      console.error('Error checking contract verification:', error);
      return false;
    }
  }

  // Get contract source code
  static async getContractSource(contractAddress: string): Promise<any> {
    try {
      const response = await api.get('', {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: contractAddress,
        },
      });

      if (response.data.status !== '1') {
        throw new Error('Contract not found or not verified');
      }

      return response.data.result[0];
    } catch (error) {
      console.error('Error fetching contract source:', error);
      throw new Error('Failed to fetch contract source code');
    }
  }

  // Get transaction history for an address
  static async getTransactionHistory(
    address: string,
    page: number = 1,
    offset: number = 100
  ): Promise<any[]> {
    try {
      const response = await api.get('', {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page,
          offset,
          sort: 'desc',
        },
      });

      if (response.data.status !== '1') {
        return [];
      }

      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get internal transactions
  static async getInternalTransactions(
    address: string,
    page: number = 1,
    offset: number = 100
  ): Promise<any[]> {
    try {
      const response = await api.get('', {
        params: {
          module: 'account',
          action: 'txlistinternal',
          address,
          startblock: 0,
          endblock: 99999999,
          page,
          offset,
          sort: 'desc',
        },
      });

      if (response.data.status !== '1') {
        return [];
      }

      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching internal transactions:', error);
      return [];
    }
  }

  // Get ERC-20 token transfers
  static async getTokenTransfers(
    address: string,
    contractAddress?: string,
    page: number = 1,
    offset: number = 100
  ): Promise<any[]> {
    try {
      const params: any = {
        module: 'account',
        action: 'tokentx',
        address,
        startblock: 0,
        endblock: 99999999,
        page,
        offset,
        sort: 'desc',
      };

      if (contractAddress) {
        params.contractaddress = contractAddress;
      }

      const response = await api.get('', { params });

      if (response.data.status !== '1') {
        return [];
      }

      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  // Analyze contract for security risks
  static async analyzeContractSecurity(contractAddress: string): Promise<SecurityRisk[]> {
    try {
      const risks: SecurityRisk[] = [];
      
      // Check if contract is verified
      const isVerified = await this.isContractVerified(contractAddress);
      
      if (!isVerified) {
        risks.push({
          id: `unverified-${contractAddress}`,
          type: 'unverified_contract',
          severity: 'medium',
          contractAddress,
          description: 'Contract source code is not verified on Blockscout',
          recommendation: 'Exercise caution when interacting with unverified contracts',
          timestamp: new Date(),
        });
      }

      // If verified, analyze source code for common patterns
      if (isVerified) {
        try {
          const sourceCode = await this.getContractSource(contractAddress);
          const code = sourceCode.SourceCode.toLowerCase();

          // Check for selfdestruct
          if (code.includes('selfdestruct') || code.includes('suicide')) {
            risks.push({
              id: `selfdestruct-${contractAddress}`,
              type: 'malicious_code',
              severity: 'high',
              contractAddress,
              description: 'Contract contains selfdestruct functionality',
              recommendation: 'Contract can be destroyed, potentially locking funds',
              timestamp: new Date(),
            });
          }

          // Check for delegatecall
          if (code.includes('delegatecall')) {
            risks.push({
              id: `delegatecall-${contractAddress}`,
              type: 'malicious_code',
              severity: 'medium',
              contractAddress,
              description: 'Contract uses delegatecall which can be risky',
              recommendation: 'Review delegatecall usage for potential vulnerabilities',
              timestamp: new Date(),
            });
          }

          // Check for assembly usage
          if (code.includes('assembly')) {
            risks.push({
              id: `assembly-${contractAddress}`,
              type: 'malicious_code',
              severity: 'low',
              contractAddress,
              description: 'Contract uses inline assembly',
              recommendation: 'Assembly code requires careful review',
              timestamp: new Date(),
            });
          }
        } catch (sourceError) {
          console.error('Error analyzing contract source:', sourceError);
        }
      }

      return risks;
    } catch (error) {
      console.error('Error analyzing contract security:', error);
      return [];
    }
  }

  // Get gas price estimation
  static async getGasPrice(): Promise<number> {
    try {
      const response = await api.get('', {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
        },
      });

      if (response.data.status === '1') {
        return parseInt(response.data.result.SafeGasPrice);
      }

      return 20; // Fallback gas price in gwei
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return 20;
    }
  }

  // Validate Ethereum address
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Format address for display
  static formatAddress(address: string, length: number = 6): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  }
}

// Helper functions for security analysis
export function calculateRiskScore(
  allowances: TokenAllowance[],
  securityRisks: SecurityRisk[],
  transactionCount: number
): number {
  let score = 0;

  // Factor in allowances
  const highRiskAllowances = allowances.filter(a => a.riskLevel === 'high').length;
  const unlimitedAllowances = allowances.filter(a => a.isUnlimited).length;
  
  score += highRiskAllowances * 15;
  score += unlimitedAllowances * 10;
  score += allowances.length * 2;

  // Factor in security risks
  securityRisks.forEach(risk => {
    switch (risk.severity) {
      case 'critical':
        score += 25;
        break;
      case 'high':
        score += 15;
        break;
      case 'medium':
        score += 8;
        break;
      case 'low':
        score += 3;
        break;
    }
  });

  // Factor in transaction activity (more activity = potentially more exposure)
  if (transactionCount > 1000) score += 10;
  else if (transactionCount > 100) score += 5;

  return Math.min(score, 100);
}

export default BlockscoutAPI;
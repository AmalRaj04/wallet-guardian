// Professional Contract Verification System
import axios from 'axios';
import { BlockscoutAPI } from './blockscout';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api';

interface VerificationResult {
  isVerified: boolean;
  contractName?: string;
  compilerVersion?: string;
  licenseType?: string;
  sourceCode?: string;
  abi?: string;
  optimizationUsed?: boolean;
  runs?: number;
  constructorArguments?: string;
  evmVersion?: string;
  library?: string;
  swarmSource?: string;
}

interface VerificationBadge {
  status: 'verified' | 'unverified' | 'pending' | 'unknown';
  color: 'green' | 'red' | 'yellow' | 'gray';
  icon: '✅' | '⚠️' | '🔍' | '❓';
  label: string;
  description: string;
}

export class ContractVerificationService {
  private static cache = new Map<string, { result: VerificationResult; timestamp: number }>();
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Check contract verification via Etherscan
  static async checkEtherscan(address: string): Promise<VerificationResult> {
    if (!ETHERSCAN_API_KEY || ETHERSCAN_API_KEY === 'demo_key') {
      console.warn('Etherscan API key not configured');
      return { isVerified: false };
    }

    try {
      const response = await axios.get(ETHERSCAN_BASE_URL, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address,
          apikey: ETHERSCAN_API_KEY,
        },
        timeout: 10000,
      });

      if (response.data.status !== '1' || !response.data.result || response.data.result.length === 0) {
        return { isVerified: false };
      }

      const result = response.data.result[0];

      // Check if contract is verified (has source code)
      if (!result.SourceCode || result.SourceCode === '') {
        return { isVerified: false };
      }

      return {
        isVerified: true,
        contractName: result.ContractName,
        compilerVersion: result.CompilerVersion,
        licenseType: result.LicenseType,
        sourceCode: result.SourceCode,
        abi: result.ABI,
        optimizationUsed: result.OptimizationUsed === '1',
        runs: parseInt(result.Runs) || 0,
        constructorArguments: result.ConstructorArguments,
        evmVersion: result.EVMVersion,
        library: result.Library,
        swarmSource: result.SwarmSource,
      };
    } catch (error) {
      console.error('Error checking Etherscan verification:', error);
      return { isVerified: false };
    }
  }

  // Check contract verification via Blockscout (backup)
  static async checkBlockscout(address: string): Promise<VerificationResult> {
    try {
      const isVerified = await BlockscoutAPI.isContractVerified(address);

      if (!isVerified) {
        return { isVerified: false };
      }

      const sourceData = await BlockscoutAPI.getContractSource(address);

      return {
        isVerified: true,
        contractName: sourceData.ContractName,
        compilerVersion: sourceData.CompilerVersion,
        sourceCode: sourceData.SourceCode,
        abi: sourceData.ABI,
      };
    } catch (error) {
      console.error('Error checking Blockscout verification:', error);
      return { isVerified: false };
    }
  }

  // Main verification check with caching
  static async checkContractVerification(address: string): Promise<VerificationResult> {
    // Normalize address
    const normalizedAddress = address.toLowerCase();

    // Check cache first
    const cached = this.cache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    // Try Etherscan first
    let result = await this.checkEtherscan(address);

    // If Etherscan fails, try Blockscout
    if (!result.isVerified) {
      result = await this.checkBlockscout(address);
    }

    // Cache the result
    this.cache.set(normalizedAddress, {
      result,
      timestamp: Date.now(),
    });

    return result;
  }

  // Get verification badge info
  static getVerificationBadge(isVerified: boolean, isPending: boolean = false): VerificationBadge {
    if (isPending) {
      return {
        status: 'pending',
        color: 'yellow',
        icon: '🔍',
        label: 'Verification Pending',
        description: 'Contract verification is in progress',
      };
    }

    if (isVerified) {
      return {
        status: 'verified',
        color: 'green',
        icon: '✅',
        label: 'Verified Contract',
        description: 'Source code has been verified on Etherscan/Blockscout',
      };
    }

    return {
      status: 'unverified',
      color: 'red',
      icon: '⚠️',
      label: 'Unverified Contract',
      description: 'Source code has not been verified. Exercise caution.',
    };
  }

  // Batch verification check
  static async checkMultipleContracts(addresses: string[]): Promise<Map<string, VerificationResult>> {
    const results = new Map<string, VerificationResult>();

    // Check in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(address => this.checkContractVerification(address))
      );

      batch.forEach((address, index) => {
        results.set(address.toLowerCase(), batchResults[index]);
      });

      // Rate limiting delay
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  // Clear cache
  static clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([address, data]) => ({
        address,
        isVerified: data.result.isVerified,
        age: Date.now() - data.timestamp,
      })),
    };
  }

  // Check if service is configured
  static isConfigured(): boolean {
    return !!ETHERSCAN_API_KEY && ETHERSCAN_API_KEY !== 'demo_key';
  }
}

export default ContractVerificationService;
// Avail Network Integration for Decentralized Data Availability
import axios from "axios";

const AVAIL_API_URL = process.env.AVAIL_API_URL || "https://api.avail.so";
const AVAIL_API_KEY = process.env.AVAIL_API_KEY;

export interface AvailProof {
  dataHash: string;
  blockNumber: number;
  timestamp: Date;
  verified: boolean;
}

export interface ContractMetadata {
  address: string;
  name: string;
  symbol?: string;
  verified: boolean;
  auditReports: string[];
  creatorReputation: number;
  deploymentDate: Date;
  availProof?: AvailProof;
}

export class AvailNetwork {
  // Store contract metadata on Avail
  static async storeMetadata(
    contractAddress: string,
    metadata: any
  ): Promise<string> {
    if (!AVAIL_API_KEY) {
      console.warn("Avail API key not configured, using local storage");
      return this.storeLocally(contractAddress, metadata);
    }

    try {
      const response = await axios.post(
        `${AVAIL_API_URL}/submit`,
        {
          data: JSON.stringify(metadata),
          contractAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${AVAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.dataHash;
    } catch (error) {
      console.error("Error storing on Avail:", error);
      return this.storeLocally(contractAddress, metadata);
    }
  }

  // Retrieve contract metadata from Avail
  static async getMetadata(
    contractAddress: string
  ): Promise<ContractMetadata | null> {
    if (!AVAIL_API_KEY) {
      return this.getLocally(contractAddress);
    }

    try {
      const response = await axios.get(
        `${AVAIL_API_URL}/retrieve/${contractAddress}`,
        {
          headers: {
            Authorization: `Bearer ${AVAIL_API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error retrieving from Avail:", error);
      return this.getLocally(contractAddress);
    }
  }

  // Verify data availability proof
  static async verifyProof(dataHash: string): Promise<boolean> {
    if (!AVAIL_API_KEY) {
      return true; // Assume valid for local storage
    }

    try {
      const response = await axios.get(`${AVAIL_API_URL}/verify/${dataHash}`, {
        headers: {
          Authorization: `Bearer ${AVAIL_API_KEY}`,
        },
      });

      return response.data.verified;
    } catch (error) {
      console.error("Error verifying proof:", error);
      return false;
    }
  }

  // Get creator reputation from Avail
  static async getCreatorReputation(creatorAddress: string): Promise<{
    score: number;
    totalContracts: number;
    verifiedContracts: number;
    rugPulls: number;
    successfulProjects: number;
  }> {
    const cacheKey = `creator:${creatorAddress}`;

    try {
      // Check local cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      if (!AVAIL_API_KEY) {
        return this.calculateLocalReputation(creatorAddress);
      }

      const response = await axios.get(
        `${AVAIL_API_URL}/reputation/${creatorAddress}`,
        {
          headers: {
            Authorization: `Bearer ${AVAIL_API_KEY}`,
          },
        }
      );

      const reputation = response.data;
      this.setCache(cacheKey, reputation, 3600); // Cache for 1 hour
      return reputation;
    } catch (error) {
      console.error("Error getting creator reputation:", error);
      return this.calculateLocalReputation(creatorAddress);
    }
  }

  // Store audit report on Avail
  static async storeAuditReport(
    contractAddress: string,
    report: {
      auditor: string;
      date: Date;
      findings: any[];
      score: number;
    }
  ): Promise<string> {
    if (!AVAIL_API_KEY) {
      return this.storeLocally(`audit:${contractAddress}`, report);
    }

    try {
      const response = await axios.post(
        `${AVAIL_API_URL}/audit`,
        {
          contractAddress,
          report,
        },
        {
          headers: {
            Authorization: `Bearer ${AVAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.reportHash;
    } catch (error) {
      console.error("Error storing audit report:", error);
      return this.storeLocally(`audit:${contractAddress}`, report);
    }
  }

  // Get trust badges for contract
  static async getTrustBadges(contractAddress: string): Promise<{
    verified: boolean;
    audited: boolean;
    active: boolean;
    established: boolean;
    safeCreator: boolean;
  }> {
    try {
      const metadata = await this.getMetadata(contractAddress);

      if (!metadata) {
        return {
          verified: false,
          audited: false,
          active: false,
          established: false,
          safeCreator: false,
        };
      }

      const now = new Date();
      const deploymentAge = now.getTime() - metadata.deploymentDate.getTime();
      const daysOld = deploymentAge / (1000 * 60 * 60 * 24);

      return {
        verified: metadata.verified,
        audited: metadata.auditReports.length > 0,
        active: true, // Would check recent transactions
        established: daysOld > 90, // 90+ days old
        safeCreator: metadata.creatorReputation > 70,
      };
    } catch (error) {
      console.error("Error getting trust badges:", error);
      return {
        verified: false,
        audited: false,
        active: false,
        established: false,
        safeCreator: false,
      };
    }
  }

  // Local storage fallback
  private static localStorage = new Map<string, any>();

  private static storeLocally(key: string, data: any): string {
    const hash = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.localStorage.set(key, { data, hash, timestamp: Date.now() });
    return hash;
  }

  private static getLocally(key: string): any {
    const item = this.localStorage.get(key);
    return item ? item.data : null;
  }

  private static cache = new Map<string, { data: any; expiry: number }>();

  private static getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  private static setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl * 1000,
    });
  }

  private static async calculateLocalReputation(
    creatorAddress: string
  ): Promise<any> {
    // Fallback reputation calculation
    return {
      score: 50,
      totalContracts: 0,
      verifiedContracts: 0,
      rugPulls: 0,
      successfulProjects: 0,
    };
  }

  static isAvailable(): boolean {
    return !!AVAIL_API_KEY;
  }
}

export default AvailNetwork;

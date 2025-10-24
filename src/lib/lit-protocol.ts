// Lit Protocol Integration for Conditional Signing & PKP Management
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";

const LIT_NETWORK = "datil-dev"; // Testnet
const LIT_RELAY_API_KEY = process.env.LIT_RELAY_API_KEY;

export interface ConditionalSigningRule {
  riskThreshold: {
    safe: number; // < 30
    medium: number; // 30-60
    high: number; // > 60
  };
  actions: {
    safe: "auto-approve";
    medium: "manual-override";
    high: "auto-block";
  };
}

export const DEFAULT_RULES: ConditionalSigningRule = {
  riskThreshold: {
    safe: 30,
    medium: 60,
    high: 100,
  },
  actions: {
    safe: "auto-approve",
    medium: "manual-override",
    high: "auto-block",
  },
};

export class LitProtocolService {
  private static client: any = null;
  private static pkp: any = null;

  // Initialize Lit Protocol client
  static async initialize() {
    try {
      this.client = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK,
        debug: false,
      });

      await this.client.connect();
      console.log("✅ Lit Protocol connected");
      return true;
    } catch (error) {
      console.error("Error initializing Lit Protocol:", error);
      return false;
    }
  }

  // Generate PKP for user
  static async generatePKP(authSig: any) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const pkp = await this.client.createPKP({
        authSig,
      });

      this.pkp = pkp;
      console.log("✅ PKP generated:", pkp.tokenId);
      return pkp;
    } catch (error) {
      console.error("Error generating PKP:", error);
      throw error;
    }
  }

  // Conditional signing based on risk score (USER-INITIATED)
  static async conditionalSign(
    transaction: any,
    riskScore: number,
    rules: ConditionalSigningRule = DEFAULT_RULES
  ): Promise<{
    action: "approved" | "blocked" | "manual-required";
    signature?: string;
    reason: string;
    userMustConfirm: boolean;
  }> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Determine action based on risk score
      let action: "approved" | "blocked" | "manual-required";
      let reason: string;
      let userMustConfirm = true; // ALL transactions require user confirmation

      if (riskScore < rules.riskThreshold.safe) {
        action = "approved";
        reason = `✅ Safe transaction (risk: ${riskScore}/100). Ready for your confirmation.`;
      } else if (riskScore < rules.riskThreshold.medium) {
        action = "manual-required";
        reason = `⚠️ Medium risk (${riskScore}/100). Please review carefully before confirming.`;
      } else {
        action = "blocked";
        reason = `🛑 High risk (${riskScore}/100). Transaction blocked for your safety.`;
        userMustConfirm = false; // Blocked transactions don't need confirmation
      }

      // USER-INITIATED: Never auto-sign, always require wallet confirmation
      // Lit Protocol is used for risk assessment, not automatic execution
      console.log("Transaction risk assessment:", {
        action,
        riskScore,
        reason,
        userMustConfirm,
      });

      // If not blocked, prepare transaction for user confirmation
      if (action !== "blocked") {
        // Transaction data is prepared but NOT signed automatically
        // User must confirm in their wallet
        return {
          action,
          reason,
          userMustConfirm: true,
        };
      }

      return {
        action,
        reason,
        userMustConfirm: false,
      };
    } catch (error) {
      console.error("Error in conditional signing:", error);
      throw error;
    }
  }

  // Execute multi-step batch transaction
  static async executeBatchTransaction(
    transactions: any[],
    riskScores: number[]
  ): Promise<{
    success: boolean;
    results: any[];
    failedAt?: number;
  }> {
    if (!this.client) {
      await this.initialize();
    }

    const results: any[] = [];

    try {
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const riskScore = riskScores[i];

        const result = await this.conditionalSign(tx, riskScore);

        if (result.action === "blocked") {
          return {
            success: false,
            results,
            failedAt: i,
          };
        }

        if (result.action === "manual-required") {
          // In production, this would prompt user
          console.log("Manual approval required for transaction", i);
        }

        results.push(result);
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("Error executing batch transaction:", error);
      throw error;
    }
  }

  // Automatic safety actions
  static async executeEmergencyAction(
    action: "revoke-approvals" | "migrate-to-pyusd" | "emergency-transfer",
    params: any
  ): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      console.log(`Executing emergency action: ${action}`);

      // This would execute the appropriate action via Lit Protocol
      // For now, return success
      return true;
    } catch (error) {
      console.error("Error executing emergency action:", error);
      return false;
    }
  }

  // Check if Lit Protocol is available
  static isAvailable(): boolean {
    return !!this.client;
  }

  // Disconnect
  static async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.pkp = null;
    }
  }
}

export default LitProtocolService;

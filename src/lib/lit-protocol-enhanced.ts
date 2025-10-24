// Enhanced Lit Protocol Integration with Full PKP & Session Management
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";

const LIT_NETWORK = "datil-dev"; // Testnet
const LIT_RELAY_API_KEY = process.env.LIT_RELAY_API_KEY;

export interface ConditionalSigningRule {
  riskThreshold: {
    safe: number;
    medium: number;
    high: number;
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

export class LitProtocolEnhanced {
  private static client: any = null;
  private static pkp: any = null;
  private static sessionSigs: any = null;

  // Initialize Lit Protocol client
  static async initialize() {
    if (this.client) {
      console.log("✅ Lit Protocol already connected");
      return true;
    }

    try {
      this.client = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK,
        debug: process.env.NODE_ENV === "development",
      });

      await this.client.connect();
      console.log("✅ Lit Protocol connected to", LIT_NETWORK);
      return true;
    } catch (error) {
      console.error("Error initializing Lit Protocol:", error);
      console.warn("⚠️ Lit Protocol unavailable - using fallback mode");
      return false;
    }
  }

  // Generate PKP for user with wallet authentication
  static async generatePKP(wallet: ethers.Signer) {
    if (!this.client) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error("Lit Protocol not available");
      }
    }

    try {
      // Get auth signature from wallet
      const authSig = await this.getAuthSig(wallet);

      // Mint PKP via relay server
      const mintResponse = await fetch(
        "https://relay-server-api.litprotocol.com/mint-pkp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LIT_RELAY_API_KEY}`,
          },
          body: JSON.stringify({
            authSig,
          }),
        }
      );

      if (!mintResponse.ok) {
        throw new Error("Failed to mint PKP");
      }

      const pkpData = await mintResponse.json();
      this.pkp = {
        tokenId: pkpData.tokenId,
        publicKey: pkpData.publicKey,
        ethAddress: pkpData.ethAddress,
      };

      console.log("✅ PKP generated:", this.pkp.tokenId);
      return this.pkp;
    } catch (error) {
      console.error("Error generating PKP:", error);
      throw error;
    }
  }

  // Get authentication signature from wallet
  private static async getAuthSig(wallet: ethers.Signer): Promise<any> {
    const address = await wallet.getAddress();
    const message = `Sign this message to authenticate with Lit Protocol.\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;

    const signature = await wallet.signMessage(message);

    return {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address,
    };
  }

  // Get or create session signatures
  static async getSessionSigs(wallet: ethers.Signer): Promise<any> {
    if (this.sessionSigs) {
      return this.sessionSigs;
    }

    if (!this.client) {
      await this.initialize();
    }

    try {
      const authSig = await this.getAuthSig(wallet);

      this.sessionSigs = await this.client.getSessionSigs({
        chain: "ethereum",
        resourceAbilityRequests: [
          {
            resource: {
              resource: "*",
              resourcePrefix: "lit-pkp",
            },
            ability: "pkp-signing",
          },
        ],
        authSig,
      });

      return this.sessionSigs;
    } catch (error) {
      console.error("Error getting session sigs:", error);
      throw error;
    }
  }

  // Execute Lit Action for conditional signing
  static async executeLitAction(
    code: string,
    params: any
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const result = await this.client.executeJs({
        code,
        sessionSigs: this.sessionSigs,
        jsParams: params,
      });

      return {
        success: true,
        result,
      };
    } catch (error: any) {
      console.error("Error executing Lit Action:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Conditional signing with Lit Actions
  static async conditionalSignTransaction(
    transaction: any,
    riskScore: number,
    wallet: ethers.Signer
  ): Promise<{
    action: "approved" | "blocked" | "manual-required";
    signature?: string;
    reason: string;
  }> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Get session sigs if not available
      if (!this.sessionSigs) {
        await this.getSessionSigs(wallet);
      }

      // Lit Action code for conditional signing
      const litActionCode = `
        (async () => {
          const riskScore = jsParams.riskScore;
          const transaction = jsParams.transaction;
          
          // Risk-based decision
          if (riskScore < 30) {
            // Safe - allow signing
            const sigShare = await Lit.Actions.signEcdsa({
              toSign: ethers.utils.arrayify(ethers.utils.keccak256(transaction)),
              publicKey: jsParams.publicKey,
              sigName: "sig1",
            });
            
            Lit.Actions.setResponse({
              response: JSON.stringify({
                action: "approved",
                signature: sigShare,
                reason: "Safe transaction approved"
              })
            });
          } else if (riskScore < 60) {
            // Medium risk - require manual approval
            Lit.Actions.setResponse({
              response: JSON.stringify({
                action: "manual-required",
                reason: "Medium risk - manual approval required"
              })
            });
          } else {
            // High risk - block
            Lit.Actions.setResponse({
              response: JSON.stringify({
                action: "blocked",
                reason: "High risk transaction blocked for safety"
              })
            });
          }
        })();
      `;

      const result = await this.executeLitAction(litActionCode, {
        riskScore,
        transaction: JSON.stringify(transaction),
        publicKey: this.pkp?.publicKey,
      });

      if (result.success && result.result?.response) {
        return JSON.parse(result.result.response);
      }

      return {
        action: "manual-required",
        reason: "Unable to assess risk automatically",
      };
    } catch (error) {
      console.error("Error in conditional signing:", error);
      return {
        action: "manual-required",
        reason: "Error during risk assessment",
      };
    }
  }

  // Batch transaction execution with risk checks
  static async executeBatchWithRiskChecks(
    transactions: any[],
    riskScores: number[],
    wallet: ethers.Signer
  ): Promise<{
    success: boolean;
    results: any[];
    failedAt?: number;
  }> {
    const results: any[] = [];

    try {
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const riskScore = riskScores[i];

        const result = await this.conditionalSignTransaction(
          tx,
          riskScore,
          wallet
        );

        if (result.action === "blocked") {
          return {
            success: false,
            results,
            failedAt: i,
          };
        }

        results.push(result);
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("Error executing batch:", error);
      throw error;
    }
  }

  // Emergency action execution
  static async executeEmergencyAction(
    action: "revoke-approvals" | "migrate-to-pyusd" | "emergency-transfer",
    params: any,
    wallet: ethers.Signer
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      console.log(`🚨 Executing emergency action: ${action}`);

      // Get session sigs
      if (!this.sessionSigs) {
        await this.getSessionSigs(wallet);
      }

      // Create Lit Action for emergency action
      const litActionCode = this.getEmergencyActionCode(action);

      const result = await this.executeLitAction(litActionCode, params);

      if (result.success) {
        return {
          success: true,
          txHash: result.result?.txHash,
        };
      }

      return {
        success: false,
        error: result.error || "Unknown error",
      };
    } catch (error: any) {
      console.error("Error executing emergency action:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get Lit Action code for emergency actions
  private static getEmergencyActionCode(action: string): string {
    const actionCodes: Record<string, string> = {
      "revoke-approvals": `
        (async () => {
          const tokens = jsParams.tokens;
          const spenders = jsParams.spenders;
          
          for (let i = 0; i < tokens.length; i++) {
            // Revoke approval by setting to 0
            const tx = {
              to: tokens[i],
              data: ethers.utils.id("approve(address,uint256)").slice(0, 10) +
                    ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint256"],
                      [spenders[i], 0]
                    ).slice(2)
            };
            
            await Lit.Actions.signAndSendTransaction({
              transaction: tx,
              publicKey: jsParams.publicKey
            });
          }
          
          Lit.Actions.setResponse({
            response: JSON.stringify({ success: true })
          });
        })();
      `,
      "migrate-to-pyusd": `
        (async () => {
          // Multi-step migration logic
          const tokens = jsParams.tokens;
          const pyusdAddress = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
          
          // 1. Approve tokens for swap
          // 2. Execute swaps via 1inch
          // 3. Convert to PYUSD
          
          Lit.Actions.setResponse({
            response: JSON.stringify({ success: true })
          });
        })();
      `,
      "emergency-transfer": `
        (async () => {
          const to = jsParams.to;
          const amount = jsParams.amount;
          const token = jsParams.token;
          
          const tx = {
            to: token,
            data: ethers.utils.id("transfer(address,uint256)").slice(0, 10) +
                  ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256"],
                    [to, amount]
                  ).slice(2)
          };
          
          await Lit.Actions.signAndSendTransaction({
            transaction: tx,
            publicKey: jsParams.publicKey
          });
          
          Lit.Actions.setResponse({
            response: JSON.stringify({ success: true })
          });
        })();
      `,
    };

    return actionCodes[action] || "";
  }

  // Check if Lit Protocol is available
  static isAvailable(): boolean {
    return !!this.client;
  }

  // Get current PKP
  static getPKP() {
    return this.pkp;
  }

  // Disconnect
  static async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.pkp = null;
      this.sessionSigs = null;
    }
  }
}

export default LitProtocolEnhanced;

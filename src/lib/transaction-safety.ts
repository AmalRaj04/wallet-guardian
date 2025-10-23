// Professional Transaction Safety Gate
import { ContractVerificationService } from './contract-verification';
import { WhitelistService } from './whitelist';
import { BlockscoutAPI } from './blockscout';
import { GeminiAI } from './gemini';

export type TransactionType = 'swap' | 'approval' | 'transfer' | 'other';
export type RiskLevel = 'safe' | 'medium' | 'high' | 'critical';

export interface TransactionValidation {
  allowed: boolean;
  risk: RiskLevel;
  reasons: string[];
  blockingReasons?: string[];
  recommendations?: string[];
  aiAnalysis?: string;
}

export interface TransactionParams {
  to: string;
  data?: string;
  value?: bigint;
  type: TransactionType;
  tokenAddress?: string;
  spenderAddress?: string;
}

export class TransactionSafetyGate {
  // Main validation function
  static async validateTransaction(params: TransactionParams): Promise<TransactionValidation> {
    const risks: string[] = [];
    const blockingReasons: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: RiskLevel = 'safe';

    // 1. Check if contract is whitelisted (instant pass for trusted contracts)
    const isWhitelisted = WhitelistService.isWhitelisted(params.to);
    if (isWhitelisted) {
      const contractInfo = WhitelistService.getContractInfo(params.to);
      return {
        allowed: true,
        risk: 'safe',
        reasons: [
          `✅ Trusted Protocol: ${contractInfo?.name}`,
          `✅ Verified and whitelisted contract`,
          `✅ Category: ${contractInfo?.category}`,
        ],
        recommendations: ['This is a trusted protocol. Transaction is safe to proceed.'],
      };
    }

    // 2. Check contract verification
    const verification = await ContractVerificationService.checkContractVerification(params.to);
    
    if (!verification.isVerified) {
      blockingReasons.push('⛔ Contract is not verified on Etherscan/Blockscout');
      blockingReasons.push('⛔ Source code cannot be audited');
      riskLevel = 'critical';
      
      return {
        allowed: false,
        risk: 'critical',
        reasons: risks,
        blockingReasons,
        recommendations: [
          '🚫 DO NOT PROCEED with this transaction',
          '⚠️ Unverified contracts can contain malicious code',
          '💡 Only interact with verified contracts',
          '🔍 Check contract on Etherscan before proceeding',
        ],
      };
    }

    // Contract is verified, continue with risk assessment
    risks.push(`✅ Contract verified: ${verification.contractName}`);

    // 3. Analyze contract security
    try {
      const securityRisks = await BlockscoutAPI.analyzeContractSecurity(params.to);
      
      const criticalRisks = securityRisks.filter(r => r.severity === 'critical');
      const highRisks = securityRisks.filter(r => r.severity === 'high');
      const mediumRisks = securityRisks.filter(r => r.severity === 'medium');

      if (criticalRisks.length > 0) {
        criticalRisks.forEach(risk => {
          blockingReasons.push(`⛔ ${risk.description}`);
        });
        riskLevel = 'critical';
        
        return {
          allowed: false,
          risk: 'critical',
          reasons: risks,
          blockingReasons,
          recommendations: [
            '🚫 CRITICAL SECURITY RISKS DETECTED',
            '⚠️ This contract contains dangerous code patterns',
            '💡 Do not interact with this contract',
          ],
        };
      }

      if (highRisks.length > 0) {
        highRisks.forEach(risk => {
          risks.push(`⚠️ ${risk.description}`);
        });
        riskLevel = 'high';
        recommendations.push('⚠️ High-risk patterns detected in contract code');
        recommendations.push('💡 Proceed with extreme caution');
      }

      if (mediumRisks.length > 0) {
        mediumRisks.forEach(risk => {
          risks.push(`⚡ ${risk.description}`);
        });
        if (riskLevel === 'safe') {
          riskLevel = 'medium';
        }
        recommendations.push('⚡ Some security concerns detected');
        recommendations.push('💡 Review contract carefully before proceeding');
      }
    } catch (error) {
      console.error('Error analyzing contract security:', error);
      risks.push('⚠️ Unable to complete full security analysis');
      if (riskLevel === 'safe') {
        riskLevel = 'medium';
      }
    }

    // 4. Transaction-specific checks
    if (params.type === 'approval') {
      if (params.tokenAddress && params.spenderAddress) {
        // Check if approving to verified contract
        const spenderVerification = await ContractVerificationService.checkContractVerification(
          params.spenderAddress
        );
        
        if (!spenderVerification.isVerified) {
          blockingReasons.push('⛔ Approval spender contract is not verified');
          riskLevel = 'critical';
          
          return {
            allowed: false,
            risk: 'critical',
            reasons: risks,
            blockingReasons,
            recommendations: [
              '🚫 DO NOT APPROVE unverified contracts',
              '⚠️ This could allow the contract to steal your tokens',
              '💡 Only approve verified and trusted contracts',
            ],
          };
        }

        risks.push(`✅ Approval spender verified: ${spenderVerification.contractName}`);
        
        // Check if unlimited approval
        if (params.value && params.value > BigInt('0xffffffffffffffffffffffffffffffff')) {
          risks.push('⚠️ Unlimited approval detected');
          recommendations.push('💡 Consider using limited approval amounts');
          if (riskLevel === 'safe') {
            riskLevel = 'medium';
          }
        }
      }
    }

    // 5. Get AI analysis for medium/high risk transactions
    let aiAnalysis: string | undefined;
    if (riskLevel === 'medium' || riskLevel === 'high') {
      try {
        const analysis = await GeminiAI.analyzeSecurityRisk(
          {
            id: 'tx-validation',
            type: 'malicious_code',
            severity: riskLevel === 'high' ? 'high' : 'medium',
            contractAddress: params.to,
            description: risks.join('; '),
            recommendation: 'Evaluate transaction safety',
            timestamp: new Date(),
          },
          {
            transactionType: params.type,
            contractVerified: verification.isVerified,
            contractName: verification.contractName,
          }
        );
        
        aiAnalysis = analysis.reason;
        recommendations.push(`🤖 AI Analysis: ${analysis.summary}`);
      } catch (error) {
        console.error('Error getting AI analysis:', error);
      }
    }

    // 6. Final decision
    const allowed = riskLevel !== 'critical';

    return {
      allowed,
      risk: riskLevel,
      reasons: risks,
      blockingReasons: blockingReasons.length > 0 ? blockingReasons : undefined,
      recommendations,
      aiAnalysis,
    };
  }

  // Quick check for swap safety
  static async validateSwap(
    fromToken: string,
    toToken: string,
    router: string
  ): Promise<TransactionValidation> {
    return this.validateTransaction({
      to: router,
      type: 'swap',
      tokenAddress: fromToken,
    });
  }

  // Quick check for approval safety
  static async validateApproval(
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint
  ): Promise<TransactionValidation> {
    return this.validateTransaction({
      to: tokenAddress,
      type: 'approval',
      value: amount,
      tokenAddress,
      spenderAddress,
    });
  }

  // Get risk color for UI
  static getRiskColor(risk: RiskLevel): string {
    switch (risk) {
      case 'safe':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  }

  // Get risk icon for UI
  static getRiskIcon(risk: RiskLevel): string {
    switch (risk) {
      case 'safe':
        return '✅';
      case 'medium':
        return '⚡';
      case 'high':
        return '⚠️';
      case 'critical':
        return '⛔';
    }
  }

  // Get risk label
  static getRiskLabel(risk: RiskLevel): string {
    switch (risk) {
      case 'safe':
        return 'Safe';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      case 'critical':
        return 'Critical Risk - Blocked';
    }
  }
}

export default TransactionSafetyGate;
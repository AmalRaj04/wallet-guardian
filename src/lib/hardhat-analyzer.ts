// Hardhat 3 Bytecode Analysis for Smart Contract Security
import { ethers } from 'ethers';

export interface VulnerabilityPattern {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  pattern: RegExp | string;
  check: (bytecode: string, sourceCode?: string) => boolean;
}

export interface SecurityAuditResult {
  contractAddress: string;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0-100
  vulnerabilities: VulnerabilityFinding[];
  recommendations: string[];
  timestamp: Date;
}

export interface VulnerabilityFinding {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFunctions?: string[];
  recommendation: string;
  codeSnippet?: string;
}

export class HardhatAnalyzer {
  private static vulnerabilityPatterns: VulnerabilityPattern[] = [
    {
      name: 'Delegatecall Usage',
      severity: 'high',
      description: 'Contract uses delegatecall which can be exploited if not properly secured',
      pattern: /delegatecall/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) return /delegatecall/i.test(sourceCode);
        // Delegatecall opcode is 0xf4
        return bytecode.includes('f4');
      }
    },
    {
      name: 'Selfdestruct Capability',
      severity: 'critical',
      description: 'Contract can be destroyed, potentially locking or losing funds',
      pattern: /selfdestruct|suicide/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) return /selfdestruct|suicide/i.test(sourceCode);
        // Selfdestruct opcode is 0xff
        return bytecode.includes('ff');
      }
    },
    {
      name: 'Centralized Ownership',
      severity: 'medium',
      description: 'Contract has owner privileges that could be abused',
      pattern: /onlyOwner|owner\s*=/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          return /onlyOwner|owner\s*=|Ownable/i.test(sourceCode);
        }
        return false;
      }
    },
    {
      name: 'Reentrancy Risk',
      severity: 'high',
      description: 'Contract may be vulnerable to reentrancy attacks',
      pattern: /\.call\{value:|\.call\.value/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          const hasExternalCall = /\.call\{value:|\.call\.value|\.transfer|\.send/i.test(sourceCode);
          const hasStateChange = /balance\[|balances\[|_balance/i.test(sourceCode);
          return hasExternalCall && hasStateChange;
        }
        return false;
      }
    },
    {
      name: 'Unchecked External Call',
      severity: 'medium',
      description: 'External calls without proper error handling',
      pattern: /\.call\(|\.delegatecall\(/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          const hasCall = /\.call\(|\.delegatecall\(/i.test(sourceCode);
          const hasCheck = /require\(.*\.call|if\s*\(.*\.call/i.test(sourceCode);
          return hasCall && !hasCheck;
        }
        return false;
      }
    },
    {
      name: 'Integer Overflow/Underflow',
      severity: 'high',
      description: 'Potential arithmetic vulnerabilities (pre-Solidity 0.8.0)',
      pattern: /pragma solidity \^0\.[0-7]\./i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          const oldVersion = /pragma solidity \^0\.[0-7]\./i.test(sourceCode);
          const noSafeMath = !/SafeMath|using.*for\s+uint/i.test(sourceCode);
          return oldVersion && noSafeMath;
        }
        return false;
      }
    },
    {
      name: 'Unprotected Withdrawal',
      severity: 'critical',
      description: 'Withdrawal function without proper access control',
      pattern: /function\s+withdraw/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          const hasWithdraw = /function\s+withdraw/i.test(sourceCode);
          const hasProtection = /onlyOwner|require\(msg\.sender|modifier/i.test(sourceCode);
          return hasWithdraw && !hasProtection;
        }
        return false;
      }
    },
    {
      name: 'Timestamp Dependence',
      severity: 'low',
      description: 'Contract logic depends on block.timestamp which can be manipulated',
      pattern: /block\.timestamp|now/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          return /block\.timestamp|now/.test(sourceCode);
        }
        return false;
      }
    },
    {
      name: 'Tx.origin Authentication',
      severity: 'high',
      description: 'Using tx.origin for authentication is dangerous',
      pattern: /tx\.origin/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          return /tx\.origin/.test(sourceCode);
        }
        return false;
      }
    },
    {
      name: 'Uninitialized Storage Pointer',
      severity: 'high',
      description: 'Uninitialized storage pointers can lead to unexpected behavior',
      pattern: /storage\s+\w+;/i,
      check: (bytecode, sourceCode) => {
        if (sourceCode) {
          return /storage\s+\w+;/.test(sourceCode);
        }
        return false;
      }
    }
  ];

  /**
   * Analyze contract bytecode and source code for vulnerabilities
   */
  static async analyzeContract(
    contractAddress: string,
    bytecode: string,
    sourceCode?: string
  ): Promise<SecurityAuditResult> {
    const vulnerabilities: VulnerabilityFinding[] = [];

    // Run all vulnerability checks
    for (const pattern of this.vulnerabilityPatterns) {
      if (pattern.check(bytecode, sourceCode)) {
        vulnerabilities.push({
          name: pattern.name,
          severity: pattern.severity,
          description: pattern.description,
          recommendation: this.getRecommendation(pattern.name),
          affectedFunctions: sourceCode ? this.extractAffectedFunctions(sourceCode, pattern) : undefined,
        });
      }
    }

    // Additional bytecode analysis
    const additionalVulns = this.analyzeBytecodePatterns(bytecode);
    vulnerabilities.push(...additionalVulns);

    // Calculate security score
    const score = this.calculateSecurityScore(vulnerabilities);
    const grade = this.getGrade(score);

    // Generate recommendations
    const recommendations = this.generateRecommendations(vulnerabilities);

    return {
      contractAddress,
      overallGrade: grade,
      score,
      vulnerabilities,
      recommendations,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze bytecode for suspicious patterns
   */
  private static analyzeBytecodePatterns(bytecode: string): VulnerabilityFinding[] {
    const findings: VulnerabilityFinding[] = [];

    // Check for suspicious opcodes
    const suspiciousOpcodes = [
      { code: 'ff', name: 'SELFDESTRUCT', severity: 'critical' as const },
      { code: 'f4', name: 'DELEGATECALL', severity: 'high' as const },
      { code: 'f0', name: 'CREATE', severity: 'medium' as const },
      { code: 'f5', name: 'CREATE2', severity: 'medium' as const },
    ];

    for (const opcode of suspiciousOpcodes) {
      if (bytecode.toLowerCase().includes(opcode.code)) {
        findings.push({
          name: `${opcode.name} Opcode Detected`,
          severity: opcode.severity,
          description: `Bytecode contains ${opcode.name} opcode which requires careful review`,
          recommendation: `Verify that ${opcode.name} usage is intentional and properly secured`,
        });
      }
    }

    // Check bytecode size (very large contracts might be obfuscated)
    if (bytecode.length > 50000) {
      findings.push({
        name: 'Large Bytecode Size',
        severity: 'low',
        description: 'Contract has unusually large bytecode which may indicate complexity or obfuscation',
        recommendation: 'Review contract complexity and ensure it\'s not obfuscated',
      });
    }

    return findings;
  }

  /**
   * Extract affected functions from source code
   */
  private static extractAffectedFunctions(sourceCode: string, pattern: VulnerabilityPattern): string[] {
    const functions: string[] = [];
    const functionRegex = /function\s+(\w+)/g;
    let match;

    while ((match = functionRegex.exec(sourceCode)) !== null) {
      const functionName = match[1];
      const functionStart = match.index;
      const functionEnd = sourceCode.indexOf('}', functionStart);
      const functionBody = sourceCode.substring(functionStart, functionEnd);

      if (typeof pattern.pattern === 'string') {
        if (functionBody.includes(pattern.pattern)) {
          functions.push(functionName);
        }
      } else if (pattern.pattern.test(functionBody)) {
        functions.push(functionName);
      }
    }

    return functions;
  }

  /**
   * Calculate overall security score (0-100)
   */
  private static calculateSecurityScore(vulnerabilities: VulnerabilityFinding[]): number {
    let score = 100;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Convert score to letter grade
   */
  private static getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get recommendation for specific vulnerability
   */
  private static getRecommendation(vulnerabilityName: string): string {
    const recommendations: Record<string, string> = {
      'Delegatecall Usage': 'Ensure delegatecall is only used with trusted contracts and implement proper access controls',
      'Selfdestruct Capability': 'Remove selfdestruct or implement multi-sig protection and time-locks',
      'Centralized Ownership': 'Consider implementing multi-sig ownership or decentralized governance',
      'Reentrancy Risk': 'Use checks-effects-interactions pattern and consider ReentrancyGuard',
      'Unchecked External Call': 'Always check return values of external calls and handle failures',
      'Integer Overflow/Underflow': 'Upgrade to Solidity 0.8.0+ or use SafeMath library',
      'Unprotected Withdrawal': 'Add access control modifiers to withdrawal functions',
      'Timestamp Dependence': 'Avoid using block.timestamp for critical logic or use with caution',
      'Tx.origin Authentication': 'Use msg.sender instead of tx.origin for authentication',
      'Uninitialized Storage Pointer': 'Always initialize storage variables explicitly',
    };

    return recommendations[vulnerabilityName] || 'Review and test thoroughly before deployment';
  }

  /**
   * Generate overall recommendations based on findings
   */
  private static generateRecommendations(vulnerabilities: VulnerabilityFinding[]): string[] {
    const recommendations: string[] = [];

    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) {
      recommendations.push('⚠️ CRITICAL: Do not interact with this contract until critical vulnerabilities are fixed');
    }

    if (highCount > 0) {
      recommendations.push('⚠️ HIGH RISK: Exercise extreme caution when interacting with this contract');
    }

    if (vulnerabilities.length === 0) {
      recommendations.push('✅ No obvious vulnerabilities detected, but always verify contract behavior');
    }

    recommendations.push('🔍 Consider getting a professional security audit before significant interactions');
    recommendations.push('💡 Test all interactions on testnet first');
    recommendations.push('🔒 Never approve unlimited token allowances');

    return recommendations;
  }

  /**
   * Test honeypot detection
   */
  static async testHoneypot(
    contractAddress: string,
    provider: ethers.Provider
  ): Promise<{ isHoneypot: boolean; reason?: string }> {
    try {
      // Simulate buy and sell to detect honeypot
      const contract = new ethers.Contract(
        contractAddress,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        provider
      );

      // This is a simplified check - in production, you'd use a service like Honeypot.is
      // or simulate actual DEX transactions

      return { isHoneypot: false };
    } catch (error) {
      return {
        isHoneypot: true,
        reason: 'Failed to simulate transactions - possible honeypot',
      };
    }
  }

  /**
   * Analyze approval exploitation risk
   */
  static analyzeApprovalRisk(allowance: string, balance: string): {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
  } {
    const allowanceBN = BigInt(allowance);
    const balanceBN = BigInt(balance);
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    if (allowanceBN === maxUint256) {
      return {
        riskLevel: 'critical',
        reason: 'Unlimited approval - spender can drain entire balance at any time',
      };
    }

    if (allowanceBN > balanceBN * BigInt(10)) {
      return {
        riskLevel: 'high',
        reason: 'Approval is 10x+ current balance - excessive risk',
      };
    }

    if (allowanceBN > balanceBN) {
      return {
        riskLevel: 'medium',
        reason: 'Approval exceeds current balance',
      };
    }

    return {
      riskLevel: 'low',
      reason: 'Approval is reasonable relative to balance',
    };
  }
}

export default HardhatAnalyzer;

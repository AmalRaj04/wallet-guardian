// Portfolio Risk Analysis Hook - Real-time risk calculation for all tokens
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Token } from '@/types';
import { RiskEngine, RiskScore } from '@/lib/risk-engine';

export interface PortfolioRiskData {
  overallRisk: number; // 0-100
  category: 'safe' | 'medium' | 'high' | 'critical';
  color: 'green' | 'yellow' | 'orange' | 'red';
  tokenRisks: Map<string, RiskScore>;
  highRiskTokens: Token[];
  safeTokens: Token[];
  isCalculating: boolean;
  lastUpdated: Date | null;
}

export function usePortfolioRisk(tokens: Token[]) {
  const { isConnected } = useAccount();
  const [riskData, setRiskData] = useState<PortfolioRiskData>({
    overallRisk: 0,
    category: 'safe',
    color: 'green',
    tokenRisks: new Map(),
    highRiskTokens: [],
    safeTokens: [],
    isCalculating: false,
    lastUpdated: null,
  });

  useEffect(() => {
    if (!isConnected || tokens.length === 0) {
      return;
    }

    calculatePortfolioRisk();

    // Recalculate every 5 minutes
    const interval = setInterval(calculatePortfolioRisk, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected, tokens]);

  const calculatePortfolioRisk = async () => {
    if (tokens.length === 0) return;

    setRiskData(prev => ({ ...prev, isCalculating: true }));

    try {
      // Use ethers v5 syntax
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const tokenRisks = new Map<string, RiskScore>();
      const highRiskTokens: Token[] = [];
      const safeTokens: Token[] = [];
      let totalRisk = 0;
      let totalValue = 0;

      // Calculate risk for each token
      for (const token of tokens) {
        try {
          const riskScore = await RiskEngine.calculateTokenRisk(
            token,
            token.address,
            provider as any
          );

          tokenRisks.set(token.address, riskScore);

          // Weight risk by token value
          const tokenValue = token.value || 0;
          totalRisk += riskScore.overall * tokenValue;
          totalValue += tokenValue;

          // Categorize tokens
          if (riskScore.overall > 55) {
            highRiskTokens.push(token);
          } else if (riskScore.overall <= 25) {
            safeTokens.push(token);
          }
        } catch (error) {
          console.error(`Error calculating risk for ${token.symbol}:`, error);
        }
      }

      // Calculate weighted average risk
      const overallRisk = totalValue > 0 ? totalRisk / totalValue : 0;

      // Determine category and color
      let category: 'safe' | 'medium' | 'high' | 'critical';
      let color: 'green' | 'yellow' | 'orange' | 'red';

      if (overallRisk <= 25) {
        category = 'safe';
        color = 'green';
      } else if (overallRisk <= 55) {
        category = 'medium';
        color = 'yellow';
      } else if (overallRisk <= 80) {
        category = 'high';
        color = 'orange';
      } else {
        category = 'critical';
        color = 'red';
      }

      setRiskData({
        overallRisk,
        category,
        color,
        tokenRisks,
        highRiskTokens,
        safeTokens,
        isCalculating: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error calculating portfolio risk:', error);
      setRiskData(prev => ({ ...prev, isCalculating: false }));
    }
  };

  const getTokenRisk = (tokenAddress: string): RiskScore | undefined => {
    return riskData.tokenRisks.get(tokenAddress);
  };

  const refreshRisk = () => {
    calculatePortfolioRisk();
  };

  return {
    ...riskData,
    getTokenRisk,
    refreshRisk,
  };
}

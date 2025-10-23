import { ethers } from "ethers";
import {
  multicall,
  encodeAllowanceCall,
  decodeAllowanceResult,
  type Call,
} from "./multicall";
import {
  getDefaultSpenderList,
  getSpenderInfo,
  type SpenderInfo,
} from "./spenders";
import { getTokenPrice } from "./prices";

export interface TokenAllowance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  spender: string;
  spenderInfo: SpenderInfo;
  allowance: bigint;
  allowanceFormatted: string;
  isUnlimited: boolean;
  usdValue?: number;
}

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
const UNLIMITED_THRESHOLD = MAX_UINT256 / BigInt(2); // Consider > 50% of max as unlimited

/**
 * Scan ERC-20 allowances for a wallet
 */
export async function scanAllowances(
  provider: ethers.Provider,
  ownerAddress: string,
  tokens: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }>,
  chainId: number,
  spenderList?: string[]
): Promise<TokenAllowance[]> {
  const spenders = spenderList || getDefaultSpenderList();
  const allowances: TokenAllowance[] = [];

  // Build multicall array
  const calls: Call[] = [];
  const callMetadata: Array<{
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
    spender: string;
  }> = [];

  for (const token of tokens) {
    for (const spender of spenders) {
      calls.push({
        target: token.address,
        callData: encodeAllowanceCall(ownerAddress, spender),
        allowFailure: true,
      });
      callMetadata.push({
        tokenAddress: token.address,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenDecimals: token.decimals,
        spender,
      });
    }
  }

  if (calls.length === 0) {
    return [];
  }

  try {
    // Execute multicall
    const results = await multicall(provider, calls);

    // Process results
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const metadata = callMetadata[i];

      if (!result.success) continue;

      const allowance = decodeAllowanceResult(result.returnData);

      // Only include non-zero allowances
      if (allowance > BigInt(0)) {
        const isUnlimited = allowance >= UNLIMITED_THRESHOLD;
        const formatted = isUnlimited
          ? "Unlimited"
          : ethers.formatUnits(allowance, metadata.tokenDecimals);

        allowances.push({
          tokenAddress: metadata.tokenAddress,
          tokenName: metadata.tokenName,
          tokenSymbol: metadata.tokenSymbol,
          tokenDecimals: metadata.tokenDecimals,
          spender: metadata.spender,
          spenderInfo: getSpenderInfo(metadata.spender),
          allowance,
          allowanceFormatted: formatted,
          isUnlimited,
        });
      }
    }

    // Fetch USD values for allowances
    await enrichWithUsdValues(allowances, chainId);

    return allowances;
  } catch (error) {
    console.error("Failed to scan allowances:", error);
    return [];
  }
}

/**
 * Enrich allowances with USD value estimates
 */
async function enrichWithUsdValues(
  allowances: TokenAllowance[],
  chainId: number
): Promise<void> {
  try {
    // For each token, fetch price individually (can be optimized with batch)
    for (const allowance of allowances) {
      const price = await getTokenPrice(allowance.tokenAddress, chainId);
      if (price && !allowance.isUnlimited) {
        const amount = Number(
          ethers.formatUnits(allowance.allowance, allowance.tokenDecimals)
        );
        allowance.usdValue = amount * price.usd;
      } else if (allowance.isUnlimited) {
        allowance.usdValue = Infinity;
      }
    }
  } catch (error) {
    console.error("Failed to enrich allowances with USD values:", error);
  }
}

/**
 * Calculate risk score based on allowances
 */
export function calculateAllowanceRiskScore(allowances: TokenAllowance[]): {
  score: number;
  level: "Very Low" | "Low" | "Medium" | "High" | "Critical";
  warnings: string[];
} {
  let score = 0;
  const warnings: string[] = [];

  for (const allowance of allowances) {
    // Unlimited approvals are risky
    if (allowance.isUnlimited) {
      score += 3;
      warnings.push(
        `Unlimited approval for ${allowance.tokenSymbol} to ${allowance.spenderInfo.name}`
      );
    }

    // High USD value approvals
    if (allowance.usdValue && allowance.usdValue > 10000) {
      score += 2;
      warnings.push(
        `High value approval: $${allowance.usdValue.toFixed(0)} of ${
          allowance.tokenSymbol
        } to ${allowance.spenderInfo.name}`
      );
    } else if (allowance.usdValue && allowance.usdValue > 1000) {
      score += 1;
    }

    // Unknown/unverified spenders are more risky
    if (allowance.spenderInfo.type === "unknown") {
      score += 2;
      warnings.push(
        `Approval to unknown contract: ${allowance.spenderInfo.name}`
      );
    }
  }

  // Determine risk level
  let level: "Very Low" | "Low" | "Medium" | "High" | "Critical";
  if (score === 0) {
    level = "Very Low";
  } else if (score <= 3) {
    level = "Low";
  } else if (score <= 6) {
    level = "Medium";
  } else if (score <= 10) {
    level = "High";
  } else {
    level = "Critical";
  }

  return { score, level, warnings };
}

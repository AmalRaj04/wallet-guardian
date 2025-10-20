import { ethers } from "ethers";

// Multicall3 is deployed at this address on most networks
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)",
];

export interface Call {
  target: string;
  callData: string;
  allowFailure?: boolean;
}

export interface Result {
  success: boolean;
  returnData: string;
}

/**
 * Execute multiple calls in a single transaction using Multicall3
 */
export async function multicall(
  provider: ethers.Provider,
  calls: Call[]
): Promise<Result[]> {
  const multicall = new ethers.Contract(
    MULTICALL3_ADDRESS,
    MULTICALL3_ABI,
    provider
  );

  // Validate & normalize targets. Skip invalid/null targets to avoid provider errors.
  const formattedCalls = [];
  for (const call of calls) {
    try {
      if (!call?.target) {
        console.warn("Skipping multicall entry with missing target", call);
        continue;
      }
      // normalize / validate address
      const normalized = ethers.getAddress(call.target);
      formattedCalls.push({
        target: normalized,
        allowFailure: call.allowFailure ?? true,
        callData: call.callData,
      });
    } catch (err) {
      console.warn(
        "Skipping multicall entry with invalid target:",
        call?.target,
        err
      );
      continue;
    }
  }

  if (formattedCalls.length === 0) return [];

  try {
    // Try normal contract call first
    let results: any;
    try {
      results = await multicall.aggregate3(formattedCalls);
    } catch (err: any) {
      // Fallback for runners that don't support sending txs (e.g. BrowserProvider)
      if (
        err?.code === "UNSUPPORTED_OPERATION" ||
        /sendTransaction/i.test(err?.message)
      ) {
        // encode the call and use a provider.call (read-only)
        const data = multicall.interface.encodeFunctionData("aggregate3", [
          formattedCalls,
        ]);
        const raw = await provider.call({ to: MULTICALL3_ADDRESS, data });
        const decoded = multicall.interface.decodeFunctionResult(
          "aggregate3",
          raw
        );
        results = decoded[0]; // ABI returns the array as the first tuple element
      } else {
        throw err;
      }
    }

    return results.map((result: { success: boolean; returnData: string }) => ({
      success: result.success,
      returnData: result.returnData,
    }));
  } catch (error) {
    console.error("Multicall failed:", error);
    throw error;
  }
}

/**
 * Helper to create ERC-20 allowance call data
 */
export function encodeAllowanceCall(owner: string, spender: string): string {
  const iface = new ethers.Interface([
    "function allowance(address owner, address spender) view returns (uint256)",
  ]);
  return iface.encodeFunctionData("allowance", [owner, spender]);
}

/**
 * Helper to decode allowance result
 */
export function decodeAllowanceResult(data: string): bigint {
  if (data === "0x" || !data) return BigInt(0);
  try {
    const iface = new ethers.Interface([
      "function allowance(address owner, address spender) view returns (uint256)",
    ]);
    const decoded = iface.decodeFunctionResult("allowance", data);
    return decoded[0];
  } catch {
    return BigInt(0);
  }
}

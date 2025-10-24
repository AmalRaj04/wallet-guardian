/**
 * Example: How to use 1inch integration in your components
 * This file shows various use cases and patterns
 */

"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { OneInchService, TOKEN_ADDRESSES } from "@/lib/oneinch";
import { useOneInchSwap } from "@/hooks/useOneInchSwap";
import { Token } from "@/types";

/**
 * Example 1: Simple Sell Button
 * Converts any token to USDC
 */
export function SimpleSellButton({ token }: { token: Token }) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { quote, isLoadingQuote, prepareSwap } = useOneInchSwap(
    token,
    TOKEN_ADDRESSES.USDC,
    amount,
    1 // 1% slippage
  );

  const handleSell = async () => {
    if (!address) return;

    try {
      const swapData = await prepareSwap();
      // Send transaction using wagmi's useSendTransaction
      console.log("Swap data:", swapData);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handleSell} disabled={!quote || isLoadingQuote}>
        Sell {token.symbol} for USDC
      </button>
      {quote && <div>You'll receive: {quote.toAmount} USDC</div>}
    </div>
  );
}

/**
 * Example 2: Convert to PYUSD with Chain Check
 */
export function ConvertToPYUSDButton({ token }: { token: Token }) {
  const chainId = useChainId();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  // Check if PYUSD is supported on current chain
  const isPYUSDSupported = OneInchService.supportsPYUSD(chainId);

  const { quote, needsApproval, getApprovalTx, prepareSwap } = useOneInchSwap(
    token,
    TOKEN_ADDRESSES.PYUSD,
    amount,
    1
  );

  const handleConvert = async () => {
    if (!address || !isPYUSDSupported) return;

    try {
      // Step 1: Approve if needed
      if (needsApproval) {
        const approvalTx = await getApprovalTx();
        console.log("Approve first:", approvalTx);
        return;
      }

      // Step 2: Execute swap
      const swapData = await prepareSwap();
      console.log("Execute swap:", swapData);
    } catch (error) {
      console.error("Conversion failed:", error);
    }
  };

  if (!isPYUSDSupported) {
    return (
      <div className="text-yellow-400">
        PYUSD is only available on Ethereum Mainnet. Please switch networks.
      </div>
    );
  }

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handleConvert} disabled={!quote}>
        {needsApproval ? "Approve" : "Convert"} to PYUSD
      </button>
      {quote && <div>You'll receive: {quote.toAmount} PYUSD</div>}
    </div>
  );
}

/**
 * Example 3: Direct API Usage (without hook)
 */
export async function directAPIExample(
  token: Token,
  amount: string,
  walletAddress: string
) {
  const chainId = 1; // Ethereum Mainnet

  try {
    // Step 1: Get a quote (no gas cost)
    const quote = await OneInchService.getQuote(
      chainId,
      token,
      TOKEN_ADDRESSES.PYUSD,
      amount,
      1 // 1% slippage
    );
    console.log("Quote:", quote);

    // Step 2: Check if approval is needed
    const needsApproval = await OneInchService.needsApproval(
      chainId,
      token.address,
      walletAddress,
      amount,
      token.decimals
    );

    if (needsApproval) {
      // Step 3a: Get approval transaction
      const approvalTx = await OneInchService.getApprovalTransaction(
        chainId,
        token.address
      );
      console.log("Send this approval tx:", approvalTx);
      // User must send this transaction first
      return;
    }

    // Step 3b: Get swap transaction
    const swapData = await OneInchService.getSwap(
      chainId,
      token,
      TOKEN_ADDRESSES.PYUSD,
      amount,
      walletAddress,
      1
    );
    console.log("Send this swap tx:", swapData.tx);
    // User sends this transaction to execute the swap
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example 4: Multi-Token Selector
 * Let user choose what to swap to
 */
export function MultiTargetSwap({ token }: { token: Token }) {
  const [amount, setAmount] = useState("");
  const [targetToken, setTargetToken] = useState<string>(TOKEN_ADDRESSES.USDC);

  const { quote, isLoadingQuote } = useOneInchSwap(
    token,
    targetToken,
    amount,
    1
  );

  const targets = [
    { address: TOKEN_ADDRESSES.USDC, symbol: "USDC", name: "USD Coin" },
    { address: TOKEN_ADDRESSES.USDT, symbol: "USDT", name: "Tether" },
    { address: TOKEN_ADDRESSES.DAI, symbol: "DAI", name: "Dai" },
    { address: TOKEN_ADDRESSES.PYUSD, symbol: "PYUSD", name: "PayPal USD" },
    { address: TOKEN_ADDRESSES.ETH, symbol: "ETH", name: "Ethereum" },
  ];

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />

      <select
        value={targetToken}
        onChange={(e) => setTargetToken(e.target.value)}
      >
        {targets.map((t) => (
          <option key={t.address} value={t.address}>
            {t.symbol} - {t.name}
          </option>
        ))}
      </select>

      {isLoadingQuote && <div>Loading quote...</div>}
      {quote && (
        <div>
          <div>You'll receive: {quote.toAmount}</div>
          <div>Price Impact: {quote.priceImpact.toFixed(2)}%</div>
          <div>Route: {quote.protocols.join(" → ")}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Check Allowance Before Showing UI
 */
export async function checkAllowanceExample(
  tokenAddress: string,
  walletAddress: string,
  chainId: number
) {
  try {
    const allowance = await OneInchService.getAllowance(
      chainId,
      tokenAddress,
      walletAddress
    );

    console.log("Current allowance:", allowance);

    // Check if specific amount is approved
    const amount = "100"; // 100 tokens
    const decimals = 18;
    const needsApproval = await OneInchService.needsApproval(
      chainId,
      tokenAddress,
      walletAddress,
      amount,
      decimals
    );

    if (needsApproval) {
      console.log("User needs to approve token first");
    } else {
      console.log("Token already approved, can swap directly");
    }
  } catch (error) {
    console.error("Error checking allowance:", error);
  }
}

/**
 * Example 6: Get Best Rate Comparison
 */
export async function compareRates(token: Token, amount: string) {
  const chainId = 1;

  const targets = [
    { address: TOKEN_ADDRESSES.USDC, name: "USDC" },
    { address: TOKEN_ADDRESSES.USDT, name: "USDT" },
    { address: TOKEN_ADDRESSES.DAI, name: "DAI" },
  ];

  const quotes = await Promise.all(
    targets.map(async (target) => {
      try {
        const quote = await OneInchService.getQuote(
          chainId,
          token,
          target.address,
          amount,
          1
        );
        return {
          target: target.name,
          amount: quote.toAmount,
          gas: quote.estimatedGas,
        };
      } catch (error) {
        return { target: target.name, amount: "0", gas: 0 };
      }
    })
  );

  console.log("Rate comparison:", quotes);
  return quotes;
}

/**
 * Example 7: Custom Slippage Tolerance
 */
export function CustomSlippageSwap({ token }: { token: Token }) {
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1); // Default 1%

  const { quote } = useOneInchSwap(
    token,
    TOKEN_ADDRESSES.USDC,
    amount,
    slippage
  );

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />

      <div>
        <label>Slippage Tolerance:</label>
        <button onClick={() => setSlippage(0.5)}>0.5%</button>
        <button onClick={() => setSlippage(1)}>1%</button>
        <button onClick={() => setSlippage(2)}>2%</button>
        <button onClick={() => setSlippage(5)}>5%</button>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          step="0.1"
          min="0.1"
          max="50"
        />
      </div>

      {quote && (
        <div>
          <div>Output: {quote.toAmount} USDC</div>
          <div>With {slippage}% slippage tolerance</div>
        </div>
      )}
    </div>
  );
}

export default {
  SimpleSellButton,
  ConvertToPYUSDButton,
  MultiTargetSwap,
  CustomSlippageSwap,
};

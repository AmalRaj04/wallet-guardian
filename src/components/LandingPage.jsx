"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-slate-900 dark:text-white">
          Wallet Guardian
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <ConnectButton />

          {mounted && isConnected && address && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg w-full">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Connected Address
              </p>
              <p className="text-sm font-mono break-all text-slate-900 dark:text-white">
                {address}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import WalletGuardianDashboard from "@/components/WalletGuardianDashboard";
import EnhancedLandingPage from "@/components/EnhancedLandingPage";

export default function HomePage() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show landing page if wallet not connected
  if (!isConnected) {
    return <EnhancedLandingPage />;
  }

  // Show main dashboard if wallet is connected
  return <WalletGuardianDashboard />;
}

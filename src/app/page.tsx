'use client';
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { useAccount } from 'wagmi';
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import WalletGuardianDashboard from "@/components/WalletGuardianDashboard";

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
    return <LandingPage />;
  }

  // Show main dashboard if wallet is connected
  return <WalletGuardianDashboard />;
}
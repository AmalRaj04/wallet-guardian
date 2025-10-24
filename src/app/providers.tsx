"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/hooks/useTheme";

import "@rainbow-me/rainbowkit/styles.css";

// Configure wallets
const { connectors } = getDefaultWallets({
  appName: "Crypto Sentinel X",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
});

// Create wagmi config with Mainnet and Sepolia support
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00D4FF",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                },
                success: {
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "white",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
              }}
            />
          </ThemeProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

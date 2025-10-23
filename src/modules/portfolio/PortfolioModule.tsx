'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/useWallet';
import { usePriceMonitor } from '@/hooks/usePriceMonitor';
import PortfolioOverview from './components/PortfolioOverview';
import TokenList from './components/TokenList';
import AlertsPanel from './components/AlertsPanel';
import GlassCard from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/LoadingState';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function PortfolioModule() {
  const { isConnected } = useAccount();
  const { portfolio, isLoadingPortfolio, refreshPortfolio } = useWallet();
  const { isMonitoring } = usePriceMonitor(portfolio?.tokens || [], {
    enabled: isConnected && !!portfolio,
    priceDropThreshold: 10,
    volumeSpikeThreshold: 2,
    checkInterval: 60000, // 1 minute
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <GlassCard className="p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl">👛</span>
            </div>
            <h2 className="text-2xl font-space-grotesk font-bold mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mb-8">
              Connect your Web3 wallet to track your portfolio, receive AI-powered alerts, and manage your investments.
            </p>
            <ConnectButton />
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (isLoadingPortfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading your portfolio..." size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-space-grotesk font-bold text-gradient mb-4">
            Portfolio Tracker
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor your investments with real-time data and AI-powered insights
          </p>
          
          {/* Monitoring Status */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isMonitoring
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isMonitoring ? '🟢 Real-Time Protection Active' : '⚫ Connecting...'}
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PortfolioOverview portfolio={portfolio} />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Token List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2"
          >
            <TokenList 
              tokens={portfolio?.tokens || []} 
              onRefresh={refreshPortfolio}
              isLoading={isLoadingPortfolio}
            />
          </motion.div>

          {/* Alerts Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AlertsPanel />
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
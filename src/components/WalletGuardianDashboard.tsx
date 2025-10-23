'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Shield, TrendingUp, Search, Menu, X } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PortfolioModule from '@/modules/portfolio/PortfolioModule';
import SecurityModule from '@/modules/security/SecurityModule';
import ExploreModule from '@/modules/explore/ExploreModule';
import { useWallet } from '@/hooks/useWallet';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { Toaster } from 'react-hot-toast';

type ActiveModule = 'portfolio' | 'security' | 'explore';

export default function WalletGuardianDashboard() {
  const { isConnected } = useAccount();
  const { portfolio } = useWallet();
  const { startMonitoring, isMonitoring } = useRealTimeMonitoring();
  const [activeModule, setActiveModule] = useState<ActiveModule>('portfolio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-start monitoring when portfolio loads
  useEffect(() => {
    if (portfolio?.tokens && portfolio.tokens.length > 0 && !isMonitoring) {
      startMonitoring(portfolio.tokens);
    }
  }, [portfolio?.tokens, isMonitoring, startMonitoring]);

  if (!isConnected) {
    return null; // This should not happen as parent handles this
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'portfolio':
        return <PortfolioModule />;
      case 'security':
        return <SecurityModule />;
      case 'explore':
        return <ExploreModule />;
      default:
        return <PortfolioModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main text-white">
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeModule={activeModule}
          onModuleChange={(module) => {
            setActiveModule(module);
            setSidebarOpen(false);
          }}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveModule()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}
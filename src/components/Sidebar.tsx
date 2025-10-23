'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, TrendingUp, Shield, Activity, Bell, Settings } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: 'portfolio' | 'security' | 'explore';
  onModuleChange: (module: 'portfolio' | 'security' | 'explore') => void;
}

export default function Sidebar({ isOpen, onClose, activeModule, onModuleChange }: SidebarProps) {
  const menuItems = [
    { id: 'portfolio' as const, label: 'Portfolio Dashboard', icon: TrendingUp, description: 'Monitor your assets and risk' },
    { id: 'security' as const, label: 'Security Center', icon: Shield, description: 'Threat monitoring and protection' },
    { id: 'explore' as const, label: 'Crypto Explorer', icon: Search, description: 'Discover and analyze cryptocurrencies' },
  ];

  const quickActions = [
    { label: 'Market Activity', icon: Activity },
    { label: 'Alerts', icon: Bell },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-md border-r border-white/10 z-50 lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-space-grotesk font-bold text-gradient">
                  Navigation
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation */}
              <nav className="space-y-3 mb-8">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onModuleChange(item.id);
                        onClose();
                      }}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-neon-blue/20 border border-neon-blue/30 shadow-neon-blue' 
                          : 'hover:bg-white/10 border border-transparent'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 mt-1 ${isActive ? 'text-neon-blue' : 'text-gray-400'}`} />
                        <div>
                          <h3 className={`font-semibold ${isActive ? 'text-neon-blue' : 'text-white'}`}>
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
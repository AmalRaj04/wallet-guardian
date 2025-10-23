'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Menu, 
  Search, 
  Shield, 
  TrendingUp, 
  Wallet,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick?: () => void;
  activeModule?: 'portfolio' | 'security' | 'explore';
  onModuleChange?: (module: 'portfolio' | 'security' | 'explore') => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (isDarkMode: boolean) => void;
}

export default function Header({ onMenuClick, activeModule, onModuleChange, isDarkMode, setIsDarkMode }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const modules = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: TrendingUp },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'explore' as const, label: 'Explore', icon: Search },
  ];

  const handleThemeToggle = () => {
    if (setIsDarkMode) {
      setIsDarkMode(!isDarkMode);
    }
    toggleTheme();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold text-white font-[family-name:Space_Grotesk]">
                  CoinScope
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Center Section - Module Navigation */}
          {activeModule && onModuleChange && (
            <div className="hidden md:flex items-center space-x-1">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <motion.button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`
                      relative px-4 py-2 rounded-lg font-medium transition-all duration-300
                      ${isActive 
                        ? 'text-neon-blue bg-neon-blue/10 shadow-neon-blue' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{module.label}</span>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeModule"
                        className="absolute inset-0 bg-neon-blue/20 rounded-lg border border-neon-blue/30"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
            </button>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64"
                >
                  <GlassCard className="p-4">
                    <h3 className="font-semibold mb-3">Settings</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Theme</span>
                        <button
                          onClick={handleThemeToggle}
                          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications</span>
                        <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors">
                          On
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            {/* Wallet Guardian Link */}
            <Link href="/dashboard" className="hidden sm:block text-gray-300 hover:text-white transition-colors">
              Wallet Guardian
            </Link>

            {/* Wallet Connection */}
            <div className="hidden sm:block">
              <ConnectButton 
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Module Navigation */}
        {activeModule && onModuleChange && (
          <div className="md:hidden border-t border-white/10">
            <div className="flex items-center justify-around py-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`
                      flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'text-neon-blue bg-neon-blue/10' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{module.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </header>
  );
}

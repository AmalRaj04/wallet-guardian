'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Zap, Lock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-main text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-pink/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-20 h-20 text-neon-blue" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Wallet Guardian
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Proactive Wallet Security with Real-Time Risk Detection
            </p>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <GlassCard className="p-6">
              <Zap className="w-12 h-12 text-neon-blue mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Real-Time Protection</h3>
              <p className="text-gray-400">
                Detect threats before transactions are mined with mempool monitoring
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <Lock className="w-12 h-12 text-neon-purple mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-400">
                Plain-English risk explanations powered by Groq AI
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <TrendingUp className="w-12 h-12 text-neon-pink mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Smart Protection</h3>
              <p className="text-gray-400">
                Conditional signing and automatic safety actions
              </p>
            </GlassCard>
          </motion.div>

          {/* Connect Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex justify-center">
              <div className="transform hover:scale-105 transition-transform">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="px-12 py-6 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold text-xl hover:shadow-neon-blue transition-all duration-300 flex items-center gap-3"
                              >
                                <Shield className="w-6 h-6" />
                                Connect Wallet to Start
                              </button>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              Supports MetaMask, WalletConnect, Coinbase Wallet, and Rainbow
            </p>
          </motion.div>

          {/* Risk Categories */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Color-Coded Risk System</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-green-400">Safe</h4>
                <p className="text-sm text-gray-400">0-25 Risk</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-yellow-400">Medium</h4>
                <p className="text-sm text-gray-400">26-55 Risk</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-orange-400">High</h4>
                <p className="text-sm text-gray-400">56-80 Risk</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-red-400">Critical</h4>
                <p className="text-sm text-gray-400">81-100 Risk</p>
              </GlassCard>
            </div>
          </motion.div>

          {/* Sponsor Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <p className="text-gray-400 mb-4">Powered by</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <span>Groq AI</span>
              <span>•</span>
              <span>Blockscout SDK</span>
              <span>•</span>
              <span>Envio HyperSync</span>
              <span>•</span>
              <span>Lit Protocol</span>
              <span>•</span>
              <span>PYUSD</span>
              <span>•</span>
              <span>Hardhat 3</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Security Suite
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to protect your crypto assets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-neon-blue" />
                  Real-Time Threat Detection
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Mempool monitoring for sandwich attacks and rug pulls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Smart contract bytecode analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Creator wallet monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Liquidity depth analysis</span>
                  </li>
                </ul>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Lock className="w-8 h-8 text-neon-purple" />
                  Automatic Protection
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Conditional signing with Lit Protocol</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Auto-block high-risk transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>One-click PYUSD migration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>Emergency approval revocation</span>
                  </li>
                </ul>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

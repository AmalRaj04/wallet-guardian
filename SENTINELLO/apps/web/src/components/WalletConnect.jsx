import { motion } from 'motion/react';
import { Wallet, Shield, Zap } from 'lucide-react';
import { isMetaMaskInstalled } from '@/lib/web3';

export default function WalletConnect({ onConnect }) {
  const hasMetaMask = isMetaMaskInstalled();

  const features = [
    {
      icon: Shield,
      title: 'Secure & Non-Custodial',
      description: 'Your keys, your crypto. We never touch your funds.'
    },
    {
      icon: Zap,
      title: 'Real-Time Monitoring',
      description: 'Live price alerts and AI-powered market analysis.'
    },
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Connect with MetaMask, WalletConnect, and more.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Connect Button */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={onConnect}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6" />
            <span>Connect Wallet</span>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
        </motion.button>

        {!hasMetaMask && (
          <motion.p 
            className="mt-4 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Don't have MetaMask?{' '}
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Install it here
            </a>
          </motion.p>
        )}
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-4">
              <feature.icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Supported Wallets */}
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-gray-400 text-sm mb-4">Supported Wallets</p>
        <div className="flex justify-center items-center space-x-6 opacity-60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-sm">MetaMask</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="text-sm">WalletConnect</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-sm">Coinbase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
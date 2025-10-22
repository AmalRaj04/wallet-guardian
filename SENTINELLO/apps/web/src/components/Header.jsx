import { motion } from 'motion/react';
import { Shield, Wallet, Settings, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/web3';

export default function Header() {
  const { isConnected, address, disconnect, chainId } = useWallet();

  return (
    <motion.header 
      className="border-b border-white/10 bg-white/5 backdrop-blur-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-space-grotesk font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sentinel
              </h1>
              <p className="text-xs text-gray-400">AI Portfolio Tracker</p>
            </div>
          </motion.div>

          {/* Navigation & Wallet Info */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                {/* Network Indicator */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${chainId === 1 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-sm text-gray-300">
                    {chainId === 1 ? 'Ethereum' : `Chain ${chainId}`}
                  </span>
                </div>

                {/* Wallet Address */}
                <motion.div 
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-mono text-gray-300">
                    {shortenAddress(address)}
                  </span>
                </motion.div>

                {/* Settings & Disconnect */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={disconnect}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                Connect your wallet to get started
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
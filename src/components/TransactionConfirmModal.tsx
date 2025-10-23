'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Shield, Info, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';

interface TransactionDetails {
  to: string;
  data?: string;
  value?: string;
  description: string;
  riskScore: number;
  gasEstimate?: string;
  warnings?: string[];
  recommendations?: string[];
}

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetails;
  onConfirm: () => void;
}

export default function TransactionConfirmModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: TransactionConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const getRiskLevel = () => {
    if (transaction.riskScore < 30) return { level: 'Safe', color: 'green', icon: CheckCircle };
    if (transaction.riskScore < 60) return { level: 'Medium', color: 'yellow', icon: Info };
    if (transaction.riskScore < 80) return { level: 'High', color: 'orange', icon: AlertTriangle };
    return { level: 'Critical', color: 'red', icon: AlertTriangle };
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      toast.loading('Please confirm in your wallet...', { id: 'tx-confirm' });
      
      // Call the confirmation handler
      await onConfirm();
      
      toast.success('Transaction confirmed! Check your wallet for status.', { id: 'tx-confirm' });
      onClose();
    } catch (error) {
      console.error('Transaction confirmation error:', error);
      toast.error('Transaction cancelled or failed', { id: 'tx-confirm' });
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-space-grotesk font-bold">Confirm Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Score */}
            <div className={`p-4 rounded-lg border-2 mb-6 ${
              risk.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
              risk.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
              risk.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <RiskIcon className={`w-6 h-6 ${
                  risk.color === 'green' ? 'text-green-400' :
                  risk.color === 'yellow' ? 'text-yellow-400' :
                  risk.color === 'orange' ? 'text-orange-400' :
                  'text-red-400'
                }`} />
                <div>
                  <div className="font-bold text-lg">{risk.level} Risk</div>
                  <div className="text-sm text-gray-400">Risk Score: {transaction.riskScore}/100</div>
                </div>
              </div>
              
              {/* Risk Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    risk.color === 'green' ? 'bg-green-500' :
                    risk.color === 'yellow' ? 'bg-yellow-500' :
                    risk.color === 'orange' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${transaction.riskScore}%` }}
                />
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Action</div>
                <div className="font-semibold">{transaction.description}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Contract Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white/5 px-2 py-1 rounded">
                    {transaction.to.slice(0, 10)}...{transaction.to.slice(-8)}
                  </code>
                  <a
                    href={`https://etherscan.io/address/${transaction.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-blue hover:text-neon-blue/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {transaction.gasEstimate && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Estimated Gas</div>
                  <div className="font-semibold">{transaction.gasEstimate} ETH</div>
                </div>
              )}
            </div>

            {/* Warnings */}
            {transaction.warnings && transaction.warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {transaction.warnings.map((warning, i) => (
                      <div key={i} className="text-sm text-yellow-400">{warning}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {transaction.recommendations && transaction.recommendations.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {transaction.recommendations.map((rec, i) => (
                      <div key={i} className="text-sm text-blue-400">{rec}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Secured by Lit Protocol Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Secured by Lit Protocol</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirming || transaction.riskScore >= 80}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors font-semibold ${
                  transaction.riskScore >= 80
                    ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isConfirming ? 'Confirming...' : transaction.riskScore >= 80 ? 'Blocked' : 'Confirm in Wallet'}
              </button>
            </div>

            {/* User Notice */}
            <div className="mt-4 text-xs text-center text-gray-500">
              🔒 You will be prompted to sign this transaction in your connected wallet
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

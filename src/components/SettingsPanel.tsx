'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, DollarSign, Lock, Save } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  // Risk Tolerance
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  
  // Transaction Limits
  const [dailyLimit, setDailyLimit] = useState('10000');
  const [singleTxLimit, setSingleTxLimit] = useState('5000');
  
  // Notifications
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [discordNotifications, setDiscordNotifications] = useState(false);
  
  // Alert Preferences
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [mempoolAlerts, setMempoolAlerts] = useState(true);
  
  // Privacy
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(true);
  const [gdprCompliance, setGdprCompliance] = useState(true);

  const handleSave = () => {
    // Save settings to localStorage or backend
    const settings = {
      riskTolerance,
      dailyLimit,
      singleTxLimit,
      notifications: {
        browser: browserNotifications,
        email: emailNotifications,
        telegram: telegramNotifications,
        discord: discordNotifications,
      },
      alerts: {
        priceDrops: priceDropAlerts,
        security: securityAlerts,
        mempool: mempoolAlerts,
      },
      privacy: {
        anonymousAnalytics,
        gdprCompliance,
      },
    };

    localStorage.setItem('walletGuardianSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-neon-blue" />
            <h2 className="text-2xl font-space-grotesk font-bold">Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Risk Tolerance */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-neon-purple" />
                <h3 className="text-lg font-bold">Risk Tolerance</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setRiskTolerance('conservative')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    riskTolerance === 'conservative'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold mb-1">Conservative</div>
                  <div className="text-xs text-gray-400">Maximum security</div>
                </button>
                <button
                  onClick={() => setRiskTolerance('balanced')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    riskTolerance === 'balanced'
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold mb-1">Balanced</div>
                  <div className="text-xs text-gray-400">Recommended</div>
                </button>
                <button
                  onClick={() => setRiskTolerance('aggressive')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    riskTolerance === 'aggressive'
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold mb-1">Aggressive</div>
                  <div className="text-xs text-gray-400">Higher risk</div>
                </button>
              </div>
            </div>

            {/* Transaction Limits */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-neon-green" />
                <h3 className="text-lg font-bold">Transaction Limits (USD)</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Daily Limit</label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Single Transaction Limit</label>
                  <input
                    type="number"
                    value={singleTxLimit}
                    onChange={(e) => setSingleTxLimit(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-neon-blue focus:outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-bold">Notifications</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Browser Notifications</span>
                  <input
                    type="checkbox"
                    checked={browserNotifications}
                    onChange={(e) => setBrowserNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Email Alerts</span>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Telegram Notifications</span>
                  <input
                    type="checkbox"
                    checked={telegramNotifications}
                    onChange={(e) => setTelegramNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Discord Webhooks</span>
                  <input
                    type="checkbox"
                    checked={discordNotifications}
                    onChange={(e) => setDiscordNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Alert Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold">Alert Types</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Price Drop Alerts</span>
                  <input
                    type="checkbox"
                    checked={priceDropAlerts}
                    onChange={(e) => setPriceDropAlerts(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Security Alerts</span>
                  <input
                    type="checkbox"
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <span>Mempool Alerts</span>
                  <input
                    type="checkbox"
                    checked={mempoolAlerts}
                    onChange={(e) => setMempoolAlerts(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-neon-purple" />
                <h3 className="text-lg font-bold">Privacy & Security</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-semibold">Anonymous Analytics</div>
                    <div className="text-xs text-gray-400">Help improve the platform</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={anonymousAnalytics}
                    onChange={(e) => setAnonymousAnalytics(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-semibold">GDPR Compliance</div>
                    <div className="text-xs text-gray-400">EU data protection</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gdprCompliance}
                    onChange={(e) => setGdprCompliance(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

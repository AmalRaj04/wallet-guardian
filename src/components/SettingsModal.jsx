import { useState, useEffect } from 'react';
import { X, Moon, Sun, Bell, BellOff, Globe } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  // Initialize state from localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });
  
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved ? parseInt(saved) : 30;
  });
  
  const [slippage, setSlippage] = useState(() => {
    const saved = localStorage.getItem('slippage');
    return saved ? parseFloat(saved) : 0.5;
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', JSON.stringify(newValue));
    
    // Request notification permissions if enabling
    if (newValue && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleRefreshIntervalChange = (e) => {
    const value = parseInt(e.target.value) || 30;
    setRefreshInterval(value);
    localStorage.setItem('refreshInterval', value.toString());
  };

  const handleSlippageChange = (e) => {
    const value = parseFloat(e.target.value) || 0.5;
    setSlippage(value);
    localStorage.setItem('slippage', value.toString());
  };

  const handleSave = () => {
    // Show success notification if notifications are enabled
    if (notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Settings Saved', {
        body: 'Your preferences have been updated successfully.',
        icon: '/favicon.ico'
      });
    }
    
    // Dispatch custom event for other components to react to settings changes
    window.dispatchEvent(new CustomEvent('settingsUpdated', {
      detail: { theme, notifications, language, refreshInterval, slippage }
    }));
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Options */}
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-white font-medium">Theme</span>
            </div>
            <button
              onClick={handleThemeToggle}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-all duration-200 text-white"
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {notifications ? (
                <Bell className="w-5 h-5 text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-white font-medium">Notifications</span>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                notifications 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {notifications ? 'On' : 'Off'}
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Language</span>
            </div>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors text-white border-none outline-none cursor-pointer"
            >
              <option value="en" className="bg-gray-800">English</option>
              <option value="es" className="bg-gray-800">Español</option>
              <option value="fr" className="bg-gray-800">Français</option>
              <option value="de" className="bg-gray-800">Deutsch</option>
            </select>
          </div>

          {/* Advanced Settings */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Advanced</h3>
            <div className="space-y-4">
              {/* Auto-refresh interval */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Auto-refresh interval</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="10"
                    max="300"
                    step="10"
                    value={refreshInterval}
                    onChange={handleRefreshIntervalChange}
                    className="w-20 px-3 py-1 bg-white/10 rounded-lg text-white text-sm text-center border-none outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-gray-400 text-sm">sec</span>
                </div>
              </div>
              
              {/* Slippage tolerance */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Slippage tolerance</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={slippage}
                    onChange={handleSlippageChange}
                    className="w-20 px-3 py-1 bg-white/10 rounded-lg text-white text-sm text-center border-none outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coinGeckoAPI } from '@/lib/coingecko';
import { toast } from 'sonner';

// Alert thresholds
const ALERT_THRESHOLDS = {
  PRICE_DROP_MINOR: -5,    // 5% drop
  PRICE_DROP_MAJOR: -10,   // 10% drop
  PRICE_DROP_CRITICAL: -20, // 20% drop
  VOLUME_SPIKE: 200,       // 200% volume increase
};

export function usePriceMonitor(tokens = []) {
  const [alerts, setAlerts] = useState([]);
  const [priceHistory, setPriceHistory] = useState(new Map());
  const previousPricesRef = useRef(new Map());
  const alertCooldownRef = useRef(new Map());

  // Monitor prices every 30 seconds
  const { data: currentPrices } = useQuery({
    queryKey: ['price-monitor', tokens.map(t => t.address).join(',')],
    queryFn: async () => {
      if (!tokens || tokens.length === 0) return {};
      
      const tokenAddresses = tokens
        .filter(token => token.address !== 'ETH')
        .map(token => token.address);
      
      if (tokenAddresses.length === 0) return {};
      
      try {
        const prices = await coinGeckoAPI.getTokenPrices(tokenAddresses);
        
        // Add ETH price
        const ethPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
        );
        const ethPriceData = await ethPriceResponse.json();
        
        return {
          ...prices,
          'ETH': {
            usd: ethPriceData.ethereum?.usd || 0,
            usd_24h_change: ethPriceData.ethereum?.usd_24h_change || 0
          }
        };
      } catch (error) {
        console.error('Error fetching prices for monitoring:', error);
        return {};
      }
    },
    enabled: tokens.length > 0,
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000,
  });

  // Analyze price changes and generate alerts
  const analyzeTokenPrice = useCallback((token, currentPrice, previousPrice) => {
    if (!currentPrice || !previousPrice || currentPrice === previousPrice) {
      return null;
    }

    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    const now = Date.now();
    const cooldownKey = `${token.address}_${Math.floor(now / 300000)}`; // 5-minute cooldown

    // Check if we're in cooldown for this token
    if (alertCooldownRef.current.has(cooldownKey)) {
      return null;
    }

    let alertType = null;
    let severity = 'low';
    let message = '';

    if (priceChange <= ALERT_THRESHOLDS.PRICE_DROP_CRITICAL) {
      alertType = 'price_drop_critical';
      severity = 'critical';
      message = `${token.symbol} has dropped ${Math.abs(priceChange).toFixed(2)}% in the last monitoring period!`;
    } else if (priceChange <= ALERT_THRESHOLDS.PRICE_DROP_MAJOR) {
      alertType = 'price_drop_major';
      severity = 'high';
      message = `${token.symbol} has dropped ${Math.abs(priceChange).toFixed(2)}% - consider reviewing your position.`;
    } else if (priceChange <= ALERT_THRESHOLDS.PRICE_DROP_MINOR) {
      alertType = 'price_drop_minor';
      severity = 'medium';
      message = `${token.symbol} has dropped ${Math.abs(priceChange).toFixed(2)}%.`;
    }

    if (alertType) {
      // Set cooldown
      alertCooldownRef.current.set(cooldownKey, now);
      
      return {
        token,
        type: alertType,
        message,
        severity,
        timestamp: now,
        priceChange,
        currentPrice,
        previousPrice
      };
    }

    return null;
  }, []);

  // Process price updates and generate alerts
  useEffect(() => {
    if (!currentPrices || !tokens || tokens.length === 0) return;

    const newAlerts = [];

    tokens.forEach(token => {
      const tokenKey = token.address === 'ETH' ? 'ETH' : token.address.toLowerCase();
      const currentPriceData = currentPrices[tokenKey];
      
      if (!currentPriceData) return;

      const currentPrice = currentPriceData.usd;
      const previousPrice = previousPricesRef.current.get(token.address);

      if (previousPrice && currentPrice !== previousPrice) {
        const alert = analyzeTokenPrice(token, currentPrice, previousPrice);
        if (alert) {
          newAlerts.push(alert);
        }
      }

      // Update price history
      setPriceHistory(prev => {
        const newHistory = new Map(prev);
        const tokenHistory = newHistory.get(token.address) || [];
        const updatedHistory = [
          ...tokenHistory.slice(-50), // Keep last 50 price points
          {
            price: currentPrice,
            timestamp: Date.now(),
            change24h: currentPriceData.usd_24h_change || 0
          }
        ];
        newHistory.set(token.address, updatedHistory);
        return newHistory;
      });

      // Update previous prices
      previousPricesRef.current.set(token.address, currentPrice);
    });

    // Add new alerts and show toasts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      
      newAlerts.forEach(alert => {
        const toastOptions = {
          duration: alert.severity === 'critical' ? 10000 : 5000,
        };

        switch (alert.severity) {
          case 'critical':
            toast.error(alert.message, toastOptions);
            break;
          case 'high':
            toast.warning(alert.message, toastOptions);
            break;
          case 'medium':
            toast.warning(alert.message, toastOptions);
            break;
          default:
            toast.info(alert.message, toastOptions);
        }
      });
    }
  }, [currentPrices, tokens, analyzeTokenPrice]);

  // Initialize previous prices on first load
  useEffect(() => {
    if (!currentPrices || !tokens) return;

    tokens.forEach(token => {
      const tokenKey = token.address === 'ETH' ? 'ETH' : token.address.toLowerCase();
      const priceData = currentPrices[tokenKey];
      
      if (priceData && !previousPricesRef.current.has(token.address)) {
        previousPricesRef.current.set(token.address, priceData.usd);
      }
    });
  }, [currentPrices, tokens]);

  // Clear specific alert
  const clearAlert = useCallback((tokenAddress) => {
    setAlerts(prev => prev.filter(alert => alert.token.address !== tokenAddress));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get price history for a specific token
  const getTokenPriceHistory = useCallback((tokenAddress) => {
    return priceHistory.get(tokenAddress) || [];
  }, [priceHistory]);

  // Get current price trend for a token
  const getTokenTrend = useCallback((tokenAddress) => {
    const history = getTokenPriceHistory(tokenAddress);
    if (history.length < 2) return 'neutral';

    const recent = history.slice(-5); // Last 5 data points
    const trend = recent.reduce((acc, point, index) => {
      if (index === 0) return acc;
      const prev = recent[index - 1];
      return acc + (point.price > prev.price ? 1 : -1);
    }, 0);

    if (trend > 2) return 'bullish';
    if (trend < -2) return 'bearish';
    return 'neutral';
  }, [getTokenPriceHistory]);

  // Clean up old cooldowns periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const fiveMinutesAgo = now - 300000;
      
      for (const [key, timestamp] of alertCooldownRef.current.entries()) {
        if (timestamp < fiveMinutesAgo) {
          alertCooldownRef.current.delete(key);
        }
      }
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    alerts,
    priceHistory,
    currentPrices,
    clearAlert,
    clearAllAlerts,
    getTokenPriceHistory,
    getTokenTrend,
    isMonitoring: tokens.length > 0
  };
}
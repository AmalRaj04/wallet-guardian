import { useState, useEffect, useRef } from 'react';
import { Token, Alert } from '@/types';
import { CoinGeckoAPI } from '@/lib/coingecko';
import { GroqAI } from '@/lib/groq';
import toast from 'react-hot-toast';

interface PriceMonitorOptions {
  enabled?: boolean;
  priceDropThreshold?: number; // Percentage drop to trigger alert
  volumeSpikeThreshold?: number; // Volume multiplier to trigger alert
  checkInterval?: number; // Milliseconds between checks
}

interface PriceMonitorState {
  isMonitoring: boolean;
  alerts: Alert[];
  lastPrices: Map<string, number>;
  lastVolumes: Map<string, number>;
}

export function usePriceMonitor(
  tokens: Token[],
  options: PriceMonitorOptions = {}
) {
  const {
    enabled = true,
    priceDropThreshold = 10,
    volumeSpikeThreshold = 2,
    checkInterval = 60000, // 1 minute
  } = options;

  const [state, setState] = useState<PriceMonitorState>({
    isMonitoring: false,
    alerts: [],
    lastPrices: new Map(),
    lastVolumes: new Map(),
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokensRef = useRef<Token[]>([]);

  // Update tokens reference
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  // Start/stop monitoring based on enabled flag
  useEffect(() => {
    if (enabled && tokens.length > 0) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [enabled, tokens.length]);

  const startMonitoring = () => {
    if (state.isMonitoring || !enabled) return;

    console.log('🔍 Starting price monitoring for', tokens.length, 'tokens');

    setState(prev => ({ ...prev, isMonitoring: true }));

    // Initial price fetch
    fetchPricesAndCheck();

    // Set up interval
    intervalRef.current = setInterval(fetchPricesAndCheck, checkInterval);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({ ...prev, isMonitoring: false }));
  };

  const fetchPricesAndCheck = async () => {
    try {
      const currentTokens = tokensRef.current;
      if (currentTokens.length === 0) return;

      // Get coin IDs for CoinGecko API
      const coinIds: string[] = [];
      const tokenToCoinId = new Map<string, string>();

      for (const token of currentTokens) {
        try {
          // Search for coin ID by symbol
          const searchResults = await CoinGeckoAPI.searchCoins(token.symbol);
          if (searchResults.length > 0) {
            const coinId = searchResults[0].id;
            coinIds.push(coinId);
            tokenToCoinId.set(token.address, coinId);
          }
        } catch (error) {
          console.error(`Error searching for ${token.symbol}:`, error);
        }
      }

      if (coinIds.length === 0) return;

      // Fetch current prices
      const priceData = await CoinGeckoAPI.getCoinPrices(coinIds);

      // Check for alerts
      for (const token of currentTokens) {
        const coinId = tokenToCoinId.get(token.address);
        if (!coinId || !priceData[coinId]) continue;

        const currentPrice = priceData[coinId].usd;
        const currentVolume = priceData[coinId].usd_24h_vol || 0;
        const priceChange24h = priceData[coinId].usd_24h_change || 0;

        const lastPrice = state.lastPrices.get(token.address);
        const lastVolume = state.lastVolumes.get(token.address);

        // Check for price drop alert
        if (lastPrice && currentPrice < lastPrice) {
          const dropPercentage = ((lastPrice - currentPrice) / lastPrice) * 100;
          
          if (dropPercentage >= priceDropThreshold) {
            await createPriceDropAlert(token, dropPercentage, currentPrice);
          }
        }

        // Check for volume spike alert
        if (lastVolume && currentVolume > lastVolume * volumeSpikeThreshold) {
          const volumeIncrease = ((currentVolume - lastVolume) / lastVolume) * 100;
          await createVolumeSpikeAlert(token, volumeIncrease, currentVolume);
        }

        // Check for significant 24h change
        if (Math.abs(priceChange24h) >= priceDropThreshold) {
          await createPriceChangeAlert(token, priceChange24h, currentPrice);
        }

        // Update stored prices and volumes
        setState(prev => ({
          ...prev,
          lastPrices: new Map(prev.lastPrices).set(token.address, currentPrice),
          lastVolumes: new Map(prev.lastVolumes).set(token.address, currentVolume),
        }));
      }
    } catch (error) {
      console.error('Error monitoring prices:', error);
    }
  };

  const createPriceDropAlert = async (
    token: Token,
    dropPercentage: number,
    currentPrice: number
  ) => {
    const severity = dropPercentage >= 20 ? 'critical' : dropPercentage >= 15 ? 'high' : 'medium';
    
    try {
      // Get AI analysis for the price drop
      const aiAnalysis = await GroqAI.explainMarketAlert(
        token,
        'price_drop',
        { dropPercentage, currentPrice }
      );

      const alert: Alert = {
        id: `price-drop-${token.address}-${Date.now()}`,
        type: 'price_drop',
        severity,
        token,
        title: `📉 Price Drop Alert: ${token.symbol}`,
        message: `${token.symbol} dropped ${dropPercentage.toFixed(1)}% to $${currentPrice.toFixed(4)}`,
        recommendation: severity === 'critical' ? 'Consider selling or converting to PYUSD' : 'Monitor closely',
        aiAnalysis,
        timestamp: new Date(),
        isRead: false,
        actions: [
          {
            id: 'sell',
            label: 'Sell Token',
            type: 'sell',
            data: { token },
          },
          {
            id: 'convert',
            label: 'Convert to PYUSD',
            type: 'convert',
            data: { token },
          },
        ],
      };

      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts],
      }));

      // Show toast notification
      toast.error(`📉 ${token.symbol} dropped ${dropPercentage.toFixed(1)}%`, {
        duration: 5000,
      });
    } catch (error) {
      console.error('Error creating price drop alert:', error);
    }
  };

  const createVolumeSpikeAlert = async (
    token: Token,
    volumeIncrease: number,
    currentVolume: number
  ) => {
    try {
      const aiAnalysis = await GroqAI.explainMarketAlert(
        token,
        'volume_spike',
        { volumeIncrease, currentVolume }
      );

      const alert: Alert = {
        id: `volume-spike-${token.address}-${Date.now()}`,
        type: 'volume_spike',
        severity: 'medium',
        token,
        title: `📊 Volume Spike: ${token.symbol}`,
        message: `${token.symbol} volume increased ${volumeIncrease.toFixed(1)}%`,
        recommendation: 'Unusual activity detected - monitor for potential price movement',
        aiAnalysis,
        timestamp: new Date(),
        isRead: false,
      };

      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts],
      }));

      toast(`📊 Volume spike detected for ${token.symbol}`, {
        icon: '📊',
        duration: 4000,
      });
    } catch (error) {
      console.error('Error creating volume spike alert:', error);
    }
  };

  const createPriceChangeAlert = async (
    token: Token,
    priceChange24h: number,
    currentPrice: number
  ) => {
    const isPositive = priceChange24h > 0;
    const severity = Math.abs(priceChange24h) >= 20 ? 'high' : 'medium';

    try {
      const aiAnalysis = await GroqAI.explainMarketAlert(
        token,
        isPositive ? 'price_surge' : 'price_drop',
        { priceChange24h, currentPrice }
      );

      const alert: Alert = {
        id: `price-change-${token.address}-${Date.now()}`,
        type: 'price_drop',
        severity,
        token,
        title: `${isPositive ? '📈' : '📉'} ${token.symbol} ${isPositive ? 'Surge' : 'Drop'}`,
        message: `${token.symbol} ${isPositive ? 'gained' : 'lost'} ${Math.abs(priceChange24h).toFixed(1)}% in 24h`,
        recommendation: isPositive ? 'Consider taking profits' : 'Monitor for further decline',
        aiAnalysis,
        timestamp: new Date(),
        isRead: false,
      };

      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts],
      }));
    } catch (error) {
      console.error('Error creating price change alert:', error);
    }
  };

  const clearAlerts = () => {
    setState(prev => ({ ...prev, alerts: [] }));
  };

  const markAlertAsRead = (alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ),
    }));
  };

  return {
    isMonitoring: state.isMonitoring,
    alerts: state.alerts,
    clearAlerts,
    markAlertAsRead,
    startMonitoring,
    stopMonitoring,
  };
}
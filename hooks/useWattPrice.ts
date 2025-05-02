import { useEffect, useState, useCallback, useRef } from 'react';
import { getTodayPowerPrice, PowerEvent } from '../lib/powerPriceOracle';
import { fetchAllLeaderboardEntries } from './useLeaderboard';
import { getPowerPriceForDate, setPowerPriceForDate } from '../lib/supabasePowerPrice';

export function useWattPrice() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [yesterdayPrice, setYesterdayPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    // Try to fetch from Supabase first
    let price = await getPowerPriceForDate(today);
    if (price === null) {
      // Fetch all leaderboard entries for network stats
      const entries = await fetchAllLeaderboardEntries();
      const totalHashrate = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
      const activePlayers = entries.length;
      // TODO: Add real event logic
      const events: PowerEvent[] = ['NORMAL'];
      price = getTodayPowerPrice({ totalHashrate, activePlayers, events });
      await setPowerPriceForDate(today, price);
    }
    setYesterdayPrice((prev) => prev ?? price); // fallback for first load
    setCurrentPrice(price);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrice();
    // Auto-refresh once every 24 hours (realistic oracle update)
    intervalRef.current = setInterval(fetchPrice, 1000 * 60 * 60 * 24);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrice]);

  const refresh = () => {
    fetchPrice();
  };

  const delta =
    currentPrice !== null && yesterdayPrice !== null
      ? +(currentPrice - yesterdayPrice).toFixed(3)
      : null;

  return {
    currentPrice,
    yesterdayPrice,
    delta,
    loading,
    refresh,
  };
} 
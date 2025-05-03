import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchAllLeaderboardEntries } from './useLeaderboard';

/**
 * Calculates passive $CRROT earnings based on hashrate.
 * @param wallet Player wallet address
 * @param hashRate Total active hashrate in GH/s
 * @param watts Total power consumption in Watts
 * @param wattPrice Current CRROT/kWh rate
 */
export function useEarnings(wallet: string, hashRate: number, watts: number, wattPrice: number) {
  // All hooks must be at the top, before any logic or returns
  const [unclaimed, setUnclaimed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastEarnTimestamp, setLastEarnTimestamp] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWalletRef = useRef<string | null>(null);

  // Reset state and clear interval on wallet change
  useEffect(() => {
    if (lastWalletRef.current !== wallet) {
      setUnclaimed(0);
      setLoading(true);
      setLastEarnTimestamp(Date.now());
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastWalletRef.current = wallet;
    }
  }, [wallet]);

  // Load unclaimed and last_earn_timestamp from Supabase on mount or wallet change
  useEffect(() => {
    let cancelled = false;
    if (!wallet) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('players')
      .select('unclaimed, last_earn_timestamp')
      .eq('wallet', wallet)
      .maybeSingle()
      .then(async ({ data }) => {
        if (cancelled) return;
        let baseUnclaimed = 0;
        let lastEarn = Date.now();
        if (data) {
          if (typeof data.unclaimed === 'number') baseUnclaimed = data.unclaimed;
          if (data.last_earn_timestamp) lastEarn = new Date(data.last_earn_timestamp).getTime();
        }
        // Calculate offline earnings
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastEarn) / 1000);
        if (elapsedSeconds > 0 && hashRate > 0) {
          const entries = await fetchAllLeaderboardEntries();
          const totalNetworkHashrate = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
          const rewardRate = 0.002; // CRROT per GH/s per second
          let offlineEarnings = 0;
          if (totalNetworkHashrate > 0) {
            const playerShare = hashRate / totalNetworkHashrate;
            const gross = playerShare * rewardRate * elapsedSeconds;
            const kWhUsed = (watts * elapsedSeconds) / (1000 * 3600);
            const cost = kWhUsed * wattPrice;
            offlineEarnings = Math.max(0, gross - cost);
          }
          baseUnclaimed += offlineEarnings;
        }
        setUnclaimed(baseUnclaimed);
        setLastEarnTimestamp(now);
        setLoading(false);
        // Persist updated unclaimed and last_earn_timestamp
        supabase.from('players').update({ unclaimed: baseUnclaimed, last_earn_timestamp: new Date(now).toISOString() }).eq('wallet', wallet)
          .then(({ error }) => { if (error) console.error('Failed to persist unclaimed CRROT (load):', error); });
        // Start earning timer only after initial load
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          if (!wallet) return;
          fetchAllLeaderboardEntries().then(entries => {
            const totalNetworkHashrate = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
            setUnclaimed(prev => {
              if (totalNetworkHashrate > 0 && hashRate > 0) {
                const rewardRate = 0.002;
                const seconds = 1;
                const playerShare = hashRate / totalNetworkHashrate;
                const gross = playerShare * rewardRate * seconds;
                const kWhUsed = (watts * seconds) / (1000 * 3600);
                const cost = kWhUsed * wattPrice;
                const netGain = Math.max(0, gross - cost);
                const next = prev + netGain;
                supabase.from('players').update({ unclaimed: next }).eq('wallet', wallet)
                  .then(({ error }) => { if (error) console.error('Failed to persist unclaimed CRROT (tick):', error); });
                return next;
              }
              return prev;
            });
          });
        }, 1000);
      });
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [wallet, hashRate, watts, wattPrice]);

  // Persist on unmount
  useEffect(() => {
    return () => {
      if (wallet) {
        supabase.from('players').update({ unclaimed }).eq('wallet', wallet)
          .then(({ error }) => { if (error) console.error('Failed to persist unclaimed CRROT (unmount):', error); });
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const claim = () => {
    const claimed = unclaimed;
    setUnclaimed(0);
    const now = Date.now();
    if (wallet) {
      supabase.from('players').update({ unclaimed: 0, last_earn_timestamp: new Date(now).toISOString() }).eq('wallet', wallet)
        .then(({ error }) => { if (error) console.error('Failed to reset unclaimed CRROT (claim):', error); });
    }
    setLastEarnTimestamp(now);
    return claimed;
  };

  return { unclaimed, claim, loading };
}

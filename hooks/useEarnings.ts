import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchAllLeaderboardEntries } from './useLeaderboard';

/**
 * Calculates passive $BNANA earnings based on hashrate.
 * @param wallet Player wallet address
 * @param hashRate Total active hashrate in GH/s
 * @param watts Total power consumption in Watts
 * @param wattPrice Current BNANA/kWh rate
 */
export function useEarnings(wallet: string, hashRate: number, watts: number, wattPrice: number) {
  const [unclaimed, setUnclaimed] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastPersistRef = useRef(Date.now());
  const [lastEarnTimestamp, setLastEarnTimestamp] = useState(Date.now());

  // Load unclaimed and last_earn_timestamp from Supabase on mount
  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    supabase
      .from('players')
      .select('unclaimed, last_earn_timestamp')
      .eq('wallet', wallet)
      .single()
      .then(async ({ data }) => {
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
          // Fetch current total network hashrate
          const entries = await fetchAllLeaderboardEntries();
          const totalNetworkHashrate = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
          // Use current watt price for simplicity (can be improved for day-by-day)
          const rewardRate = 0.002; // BNANA per GH/s per second
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
          .then(({ error }) => { if (error) console.error('Failed to persist unclaimed BNANA (load):', error); });
      });
  }, [wallet, hashRate, watts, wattPrice]);

  // Simulate $BNANA rewards accumulation every second (while online)
  useEffect(() => {
    if (!wallet || loading || hashRate <= 0) return;
    const interval = setInterval(() => {
      const rewardRate = 0.002;
      const seconds = 1;
      fetchAllLeaderboardEntries().then(entries => {
        const totalNetworkHashrate = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
        setUnclaimed(prev => {
          if (totalNetworkHashrate > 0) {
            const playerShare = hashRate / totalNetworkHashrate;
            const gross = playerShare * rewardRate * seconds;
            const kWhUsed = (watts * seconds) / (1000 * 3600);
            const cost = kWhUsed * wattPrice;
            const netGain = Math.max(0, gross - cost);
            const next = prev + netGain;
            supabase.from('players').update({ unclaimed: next }).eq('wallet', wallet)
              .then(({ error }) => { if (error) console.error('Failed to persist unclaimed BNANA (tick):', error); });
            return next;
          }
          return prev;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [wallet, hashRate, watts, wattPrice, loading]);

  // Persist on unmount
  useEffect(() => {
    return () => {
      if (wallet) {
        supabase.from('players').update({ unclaimed }).eq('wallet', wallet)
          .then(({ error }) => { if (error) console.error('Failed to persist unclaimed BNANA (unmount):', error); });
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
        .then(({ error }) => { if (error) console.error('Failed to reset unclaimed BNANA (claim):', error); });
    }
    setLastEarnTimestamp(now);
    return claimed;
  };

  return { unclaimed, claim, loading };
}

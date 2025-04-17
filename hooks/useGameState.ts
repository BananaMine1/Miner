import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PlayerData {
  wallet: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  daily_streak: number;
  last_claimed: string | null;
}

interface LeaderboardData {
  wallet: string;
  total_earned: number;
  hashrate: number;
  updated_at: string;
}

interface GameState {
  player: PlayerData | null;
  leaderboard: LeaderboardData | null;
  bnanaBalance: number;
  pendingRewards: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const DEFAULT_PLAYER = (wallet: string): PlayerData => ({
  wallet,
  username: 'New Miner',
  bio: null,
  avatar_url: null,
  daily_streak: 0,
  last_claimed: null,
});

const DEFAULT_LEADERBOARD = (wallet: string): LeaderboardData => ({
  wallet,
  total_earned: 0,
  hashrate: 0,
  updated_at: new Date().toISOString(),
});

export function useGameState(wallet: string | undefined): GameState {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [bnanaBalance, setBnanaBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch player data
      let { data: playerData, error: playerErr } = await supabase
        .from('players')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();
      if (playerErr) throw playerErr;
      if (!playerData) {
        // New user: create default player row
        const { data: newPlayer, error: insertErr } = await supabase
          .from('players')
          .insert([DEFAULT_PLAYER(wallet)])
          .select()
          .maybeSingle();
        if (insertErr) throw insertErr;
        playerData = newPlayer;
      }
      setPlayer(playerData);

      // Fetch leaderboard data
      let { data: lbData, error: lbErr } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();
      if (lbErr) throw lbErr;
      if (!lbData) {
        // New user: create default leaderboard row
        const { data: newLb, error: insertLbErr } = await supabase
          .from('leaderboard')
          .insert([DEFAULT_LEADERBOARD(wallet)])
          .select()
          .maybeSingle();
        if (insertLbErr) throw insertLbErr;
        lbData = newLb;
      }
      setLeaderboard(lbData);

      // Simulate BNANA balance and pending rewards
      const balance = lbData ? Math.floor(lbData.total_earned) : 0;
      // Time-based pending rewards calculation
      let pending = 0;
      if (lbData && playerData) {
        const hashrate = lbData.hashrate || 0;
        const lastClaimed = playerData.last_claimed ? new Date(playerData.last_claimed) : null;
        const now = new Date();
        if (lastClaimed) {
          const secondsElapsed = Math.floor((now.getTime() - lastClaimed.getTime()) / 1000);
          // Example: 0.01 BNANA per hashrate per minute
          pending = hashrate * 0.01 * (secondsElapsed / 60);
        } else {
          // If never claimed, start accumulating from account creation
          pending = 0;
        }
      }
      setBnanaBalance(balance);
      setPendingRewards(pending);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game state');
      setPlayer(null);
      setLeaderboard(null);
      setBnanaBalance(0);
      setPendingRewards(0);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    player,
    leaderboard,
    bnanaBalance,
    pendingRewards,
    loading,
    error,
    refresh: fetchData,
  };
} 
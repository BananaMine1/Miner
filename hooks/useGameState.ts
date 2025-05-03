import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { roomLevels } from '../lib/gamedata';

interface PlayerData {
  wallet: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  daily_streak: number;
  last_claimed: string | null;
  room_level: number;
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
  crrotBalance: number;
  pendingRewards: number;
  roomLevel: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  upgradeRoom: () => Promise<boolean>;
}

const DEFAULT_PLAYER = (wallet: string): PlayerData => ({
  wallet,
  username: 'New Miner',
  bio: null,
  avatar_url: null,
  daily_streak: 0,
  last_claimed: null,
  room_level: 0,
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
  const [crrotBalance, setCrrotBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [roomLevel, setRoomLevel] = useState(0);
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
        .select('wallet, username, bio, avatar_url, daily_streak, last_claimed, room_level')
        .eq('wallet', wallet)
        .maybeSingle();
      if (playerErr) throw new Error(`Failed to fetch player data: ${playerErr.message}`);
      if (!playerData) {
        // New user: create default player row
        const { data: newPlayer, error: insertErr } = await supabase
          .from('players')
          .insert([DEFAULT_PLAYER(wallet)])
          .select()
          .maybeSingle();
        if (insertErr) throw new Error(`Failed to insert new player data: ${insertErr.message}`);
        playerData = newPlayer;
      }
      setPlayer(playerData);
      setRoomLevel(playerData.room_level || 0);

      // Fetch leaderboard data
      let { data: lbData, error: lbErr } = await supabase
        .from('leaderboard')
        .select('wallet, total_earned, hashrate, updated_at')
        .eq('wallet', wallet)
        .maybeSingle();
      if (lbErr) throw new Error(`Failed to fetch leaderboard data: ${lbErr.message}`);
      if (!lbData) {
        // New user: create default leaderboard row
        const { data: newLb, error: insertLbErr } = await supabase
          .from('leaderboard')
          .insert([DEFAULT_LEADERBOARD(wallet)])
          .select()
          .maybeSingle();
        if (insertLbErr) throw new Error(`Failed to insert new leaderboard data: ${insertLbErr.message}`);
        lbData = newLb;
      }
      setLeaderboard(lbData);

      // Simulate CRROT balance and pending rewards
      const balance = lbData ? Math.floor(lbData.total_earned) : 0;
      // Time-based pending rewards calculation
      let pending = 0;
      if (lbData && playerData) {
        const hashrate = lbData.hashrate || 0;
        const lastClaimed = playerData.last_claimed ? new Date(playerData.last_claimed) : null;
        const now = new Date();
        if (lastClaimed) {
          const secondsElapsed = Math.floor((now.getTime() - lastClaimed.getTime()) / 1000);
          // Example: 0.01 CRROT per hashrate per minute
          pending = hashrate * 0.01 * (secondsElapsed / 60);
        } else {
          // If never claimed, start accumulating from account creation
          pending = 0;
        }
      }
      setCrrotBalance(balance);
      setPendingRewards(pending);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game state');
      setPlayer(null);
      setLeaderboard(null);
      setCrrotBalance(0);
      setPendingRewards(0);
      setRoomLevel(0);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  // Upgrade room function
  const upgradeRoom = async (): Promise<boolean> => {
    if (!player || !wallet) return false;
    
    const currentLevel = roomLevel;
    const nextLevel = currentLevel + 1;
    
    // Check if next level exists
    if (!roomLevels[nextLevel]) return false;
    
    // Check if player has enough CRROT
    const upgradeCost = roomLevels[nextLevel].upgradeCost;
    if (crrotBalance < upgradeCost) return false;
    
    try {
      // Update player's room level
      const { error: updateErr } = await supabase
        .from('players')
        .update({ 
          room_level: nextLevel,
        })
        .eq('wallet', wallet);
      
      if (updateErr) throw new Error(`Failed to upgrade room: ${updateErr.message}`);
      
      // Deduct CRROT (in a real app, this would likely be handled by a smart contract)
      const newBalance = crrotBalance - upgradeCost;
      setCrrotBalance(newBalance);
      
      // Update local state
      setRoomLevel(nextLevel);
      setPlayer({ ...player, room_level: nextLevel });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade room');
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    player,
    leaderboard,
    crrotBalance,
    pendingRewards,
    roomLevel,
    loading,
    error,
    refresh: fetchData,
    upgradeRoom,
  };
} 
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useWallet } from './WalletContext';
import { roomLevels } from './gamedata';
import { getUpgradeCost, getXpToNext, getRepairCost, getUpgradedHash, getUpgradedWatts } from './minerUtils';

// --- Types ---
export interface PlayerProfile {
  wallet: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface Miner {
  instanceId: string;
  type: string;
  position: number;
  image: string;
  xp: number;
  level: number;
  durability: number;
  overheated: boolean;
  boosted: boolean;
  watts: number;
  price?: number;
}

export interface GameState {
  profile: PlayerProfile | null;
  bnana: number;
  unclaimed: number;
  dailyStreak: number;
  canClaimStreak: boolean;
  roomLevel: number;
  miners: Miner[];
  loading: boolean;
  error: string | null;
}

export interface GameStateActions {
  claimRewards: () => Promise<void>;
  upgradeRoom: () => Promise<void>;
  buyMiner: (miner: Miner) => Promise<void>;
  removeMiner: (instanceId: string) => Promise<void>;
  updateProfile: (profile: Partial<PlayerProfile>) => Promise<void>;
  refresh: () => Promise<void>;
  upgradeMiner: (instanceId: string) => Promise<void>;
  repairMiner: (instanceId: string) => Promise<void>;
}

interface GameStateContextType extends GameState, GameStateActions {}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within a GameStateProvider');
  return ctx;
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [bnana, setBnana] = useState(0);
  const [unclaimed, setUnclaimed] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [canClaimStreak, setCanClaimStreak] = useState(false);
  const [roomLevel, setRoomLevel] = useState(0);
  const [miners, setMiners] = useState<Miner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Load player state from Supabase ---
  const loadState = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('wallet', address)
        .single();
      if (fetchError) throw fetchError;
      setProfile({
        wallet: address,
        username: data.username || 'New Miner',
        avatarUrl: data.avatar_url || null,
        bio: data.bio || '',
      });
      setBnana(data.bnana ?? 0);
      setUnclaimed(data.unclaimed ?? 0);
      setDailyStreak(data.dailyStreak ?? 0);
      setCanClaimStreak(data.canClaimStreak ?? false);
      setRoomLevel(data.roomLevel ?? 0);
      // Filter miners to only those within the current grid
      const roomIdx = data.roomLevel ?? 0;
      const room = roomLevels[roomIdx] || roomLevels[0];
      const maxSlots = room.gridRows * room.gridCols;
      const filteredMiners = Array.isArray(data.miners)
        ? data.miners.filter(m => m.position >= 0 && m.position < maxSlots)
        : [];
      setMiners(filteredMiners);
    } catch (err: any) {
      setError(err.message || 'Failed to load game state');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // --- Actions ---
  const claimRewards = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      setBnana(b => b + unclaimed);
      setUnclaimed(0);
      await supabase
        .from('players')
        .update({ bnana: bnana + unclaimed, unclaimed: 0 })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to claim rewards');
    } finally {
      setLoading(false);
    }
  }, [address, bnana, unclaimed]);

  const upgradeRoom = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const nextLevel = roomLevel + 1;
      const newRoom = roomLevels[nextLevel];
      if (!newRoom) throw new Error('No next room level defined');
      // Migrate miners: keep positions if possible, else fill from top-left
      const maxSlots = newRoom.gridRows * newRoom.gridCols;
      let migratedMiners = miners.slice(0, maxSlots).map((miner, i) => ({
        ...miner,
        position: i
      }));
      setRoomLevel(nextLevel);
      setMiners(migratedMiners);
      await supabase
        .from('players')
        .update({ roomLevel: nextLevel, miners: migratedMiners })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade room');
    } finally {
      setLoading(false);
    }
  }, [address, roomLevel, miners]);

  const buyMiner = useCallback(async (miner: Miner) => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const price = miner.price || 0;
      if (bnana < price) throw new Error('Not enough BNANA');
      // --- On-chain integration placeholder ---
      // await contract.buyMiner(miner.id, { from: address });
      // After on-chain tx, fetch new balance and update state
      const updatedMiners = [...miners, miner];
      setMiners(updatedMiners);
      setBnana(b => b - price);
      await supabase
        .from('players')
        .update({ miners: updatedMiners, bnana: bnana - price })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to buy miner');
    } finally {
      setLoading(false);
    }
  }, [address, miners, bnana]);

  const removeMiner = useCallback(async (instanceId: string) => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const updatedMiners = miners.filter(m => m.instanceId !== instanceId);
      setMiners(updatedMiners);
      await supabase
        .from('players')
        .update({ miners: updatedMiners })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to remove miner');
    } finally {
      setLoading(false);
    }
  }, [address, miners]);

  const updateProfile = useCallback(async (profileUpdate: Partial<PlayerProfile>) => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const newProfile = { ...profile, ...profileUpdate };
      setProfile(newProfile as PlayerProfile);
      await supabase
        .from('players')
        .update({
          username: newProfile.username,
          avatar_url: newProfile.avatarUrl,
          bio: newProfile.bio,
        })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [address, profile]);

  const refresh = useCallback(async () => {
    await loadState();
  }, [loadState]);

  const upgradeMiner = useCallback(async (instanceId: string) => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const idx = miners.findIndex(m => m.instanceId === instanceId);
      if (idx === -1) throw new Error('Miner not found');
      const miner = miners[idx];
      const upgradeCost = getUpgradeCost(miner);
      const xpToNext = getXpToNext(miner);
      if (miner.level >= (miner.maxLevel ?? 99)) throw new Error('Already at max level');
      if ((miner.xp ?? 0) < xpToNext) throw new Error('Not enough XP');
      if (bnana < upgradeCost) throw new Error('Not enough BNANA');
      // Apply upgrade
      const upgradedMiner = {
        ...miner,
        level: (miner.level ?? 1) + 1,
        xp: (miner.xp ?? 0) - xpToNext,
        hash: getUpgradedHash({ ...miner, level: (miner.level ?? 1) + 1 }),
        watts: getUpgradedWatts({ ...miner, level: (miner.level ?? 1) + 1 }),
      };
      const updatedMiners = [...miners];
      updatedMiners[idx] = upgradedMiner;
      setMiners(updatedMiners);
      setBnana(b => b - upgradeCost);
      await supabase
        .from('players')
        .update({ miners: updatedMiners, bnana: bnana - upgradeCost })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade miner');
    } finally {
      setLoading(false);
    }
  }, [address, miners, bnana]);

  const repairMiner = useCallback(async (instanceId: string) => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const idx = miners.findIndex(m => m.instanceId === instanceId);
      if (idx === -1) throw new Error('Miner not found');
      const miner = miners[idx];
      const repairCost = getRepairCost(miner);
      if ((miner.durability ?? 100) >= 100) throw new Error('Already at full durability');
      if (bnana < repairCost) throw new Error('Not enough BNANA');
      // Apply repair
      const repairedMiner = {
        ...miner,
        durability: 100,
      };
      const updatedMiners = [...miners];
      updatedMiners[idx] = repairedMiner;
      setMiners(updatedMiners);
      setBnana(b => b - repairCost);
      await supabase
        .from('players')
        .update({ miners: updatedMiners, bnana: bnana - repairCost })
        .eq('wallet', address);
    } catch (err: any) {
      setError(err.message || 'Failed to repair miner');
    } finally {
      setLoading(false);
    }
  }, [address, miners, bnana]);

  const value: GameStateContextType = {
    profile,
    bnana,
    unclaimed,
    dailyStreak,
    canClaimStreak,
    roomLevel,
    miners,
    loading,
    error,
    claimRewards,
    upgradeRoom,
    buyMiner,
    removeMiner,
    updateProfile,
    refresh,
    upgradeMiner,
    repairMiner,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
} 
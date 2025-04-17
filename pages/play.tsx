// pages/play.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import TopHUD         from '../components/TopHUD';
import GameRoom       from '../components/GameRoom';
import RoomModal      from '../components/RoomModal';
import BuyMinerModal  from '../components/BuyMinerModal';
import MinerPanel     from '../components/MinerPanel';
import WalletModal    from '../components/WalletModal';

import { roomLevels, miners as allMiners } from '../lib/gamedata';
import { Miner } from '../lib/types';

import { useEarnings }     from '../hooks/useEarnings';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useMinerXP }      from '../hooks/useMinerXP';
import { useOverheat }     from '../hooks/useOverheat';
import { useWattRate }     from '../hooks/useWattRate';
import { useDurability }   from '../hooks/useDurability';
import { useLootDrops }    from '../hooks/useLootDrops';

import { supabase }        from '../lib/supabaseClient';
import { syncLeaderboard } from '../lib/syncLeaderboard';
import { useGameState } from '../hooks/useGameState';
import { useGameController } from '../hooks/useGameController';

function Play() {
  /* ---------------- wallet ---------------- */
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  /* ---------------- UI state ---------------- */
  const [showWallet, setShowWallet] = useState(false);

  /* ---------------- game state ---------------- */
  const [currentRoomLevel, setCurrentRoomLevel] = useState(0);
  const [activeMiners, setActiveMiners] = useState<Miner[]>([]);
  const [bnana, setBnana] = useState(500);

  const [dailyStreak, setDailyStreak] = useState(0);
  const [canClaimStreak, setCanClaimStreak] = useState(false);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBuyModal,  setShowBuyModal]  = useState(false);
  const [selectedMiner, setSelectedMiner] = useState<Miner | null>(null);

  const [loot, setLoot] = useState<string[]>([]);
  const [activeBoosters, setActiveBoosters] = useState<string[]>([]);

  /* ---------------- derived ---------------- */
  const room       = roomLevels[currentRoomLevel];
  const totalWatts = activeMiners.reduce((s, m) => s + m.watts, 0);
  const totalHash  = activeMiners.reduce((s, m) => s + m.hash, 0);
  const wattRate   = useWattRate();

  const { unclaimed, claim } = useEarnings(totalHash, totalWatts);
  const animatedUnclaimed    = useAnimatedNumber(unclaimed);

  /* ---------------- progression hooks ---------------- */
  useMinerXP(activeMiners, setActiveMiners);
  useOverheat(activeMiners, setActiveMiners);
  useDurability(activeMiners, setActiveMiners, setBnana);
  useLootDrops(activeMiners, setLoot);

  /* ---------------- Supabase sync ---------------- */
  useEffect(() => {
    if (!isConnected || !address) return;

    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('players')
      .select('daily_streak, last_claimed')
      .eq('wallet', address)
      .single()
      .then(({ data }) => {
        if (data) {
          setDailyStreak(data.daily_streak || 0);
          setCanClaimStreak(data.last_claimed !== today);
        } else {
          setDailyStreak(0);
          setCanClaimStreak(true);
        }
      });
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected || !address) return;
    const iv = setInterval(() => {
      syncLeaderboard(address, bnana, totalHash);
    }, 60_000);
    return () => clearInterval(iv);
  }, [isConnected, address, bnana, totalHash]);

  // Load persistent game state from Supabase on mount or wallet change
  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      const { data, error } = await supabase
        .from('players')
        .select('miners, room_level, bnana')
        .eq('wallet', address)
        .single();
      if (!error && data) {
        setActiveMiners(Array.isArray(data.miners) ? data.miners : []);
        setCurrentRoomLevel(typeof data.room_level === 'number' ? data.room_level : 0);
        setBnana(typeof data.bnana === 'number' ? data.bnana : 500);
      } else {
        // Use defaults if no data
        setActiveMiners([]);
        setCurrentRoomLevel(0);
        setBnana(500);
      }
    })();
  }, [isConnected, address]);

  /* ---------------- Game state hydration ---------------- */
  const {
    loading: gameLoading,
    error: gameError,
    refresh: refreshGameState,
  } = useGameState(isConnected ? address : undefined);

  /* ---------------- Game controller abstraction ---------------- */
  const {
    claim: gameClaim,
    repairMiner: gameRepairMiner,
    upgradeRoom: gameUpgradeRoom,
    buyMiner: gameBuyMiner,
    statuses: gameStatuses,
  } = useGameController();

  // Helper to persist game state to Supabase
  const persistGameState = async (miners: Miner[], roomLevel: number, bnanaValue: number) => {
    if (!isConnected || !address) return;
    await supabase
      .from('players')
      .update({ miners, room_level: roomLevel, bnana: bnanaValue })
      .eq('wallet', address);
  };

  const handleClaim = async () => {
    await gameClaim();
    // Add claimed BNANA to local state and persist
    setBnana(prev => {
      const newBnana = prev + unclaimed;
      persistGameState(activeMiners, currentRoomLevel, newBnana);
      return newBnana;
    });
    claim(); // Reset unclaimed earnings
    refreshGameState();
  };

  const handleRepairMiner = async () => {
    if (!selectedMiner) return;
    await gameRepairMiner(selectedMiner.id);
    setActiveMiners(prev => {
      const updated = prev.map(m =>
        m.position === selectedMiner.position
          ? { ...m, overheated: false, durability: 100 }
          : m
      );
      persistGameState(updated, currentRoomLevel, bnana - 10);
      return updated;
    });
    setBnana(prev => prev - 10);
    refreshGameState();
  };

  const handleUpgradeRoom = async () => {
    if (currentRoomLevel >= roomLevels.length - 1) return;
    const next = roomLevels[currentRoomLevel + 1];
    if (bnana < next.upgradeCost) return alert('Not enough $BNANA');
    await gameUpgradeRoom(currentRoomLevel + 1);
    setCurrentRoomLevel(lvl => {
      const newLevel = lvl + 1;
      persistGameState(activeMiners, newLevel, bnana - next.upgradeCost);
      return newLevel;
    });
    setBnana(prev => prev - next.upgradeCost);
    refreshGameState();
    setShowRoomModal(false);
  };

  const handleBuyMiner = async (id: number) => {
    await gameBuyMiner(id);
    const base = allMiners.find(m => m.id === id);
    if (!base) return;
    const openSlot = Array.from({ length: room.maxSlots }).findIndex(
      (_, i) => !activeMiners.some(m => m.position === i)
    );
    if (openSlot === -1) return alert('No available slots');
    if (totalWatts + base.watts > room.maxPower) return alert('Not enough power');

    const newMiner: Miner = {
      ...base,
      position: openSlot,
      image: `/assets/miners/miner-${id}.png`,
      xp: 0,
      overheated: false,
      durability: 100,
    };
    setActiveMiners(prev => {
      const updated = [...prev, newMiner];
      persistGameState(updated, currentRoomLevel, bnana);
      return updated;
    });
    setShowBuyModal(false);
    refreshGameState();
  };

  const handleSellMiner = () => {
    if (!selectedMiner) return;
    setActiveMiners(prev => {
      const updated = prev.filter(m => m.position !== selectedMiner.position);
      persistGameState(updated, currentRoomLevel, bnana + 10);
      return updated;
    });
    setBnana(prev => prev + 10);
    setSelectedMiner(null);
  };

  const handleRecycleMiner = () => {
    if (!selectedMiner) return;
    setBnana(prev => prev + 5);
    setActiveMiners(prev => {
      const updated = prev.filter(m => m.position !== selectedMiner.position);
      persistGameState(updated, currentRoomLevel, bnana + 5);
      return updated;
    });
    setSelectedMiner(null);
  };

  const activateBooster = (type: string) => {
    if (!loot.includes(type)) return;
    setLoot(prev => prev.filter(i => i !== type));
    setActiveBoosters(prev => [...prev, type]);
    setTimeout(
      () => setActiveBoosters(prev => prev.filter(b => b !== type)),
      10 * 60 * 1000
    );
  };

  /* ---------------- render (disconnected) ---------------- */
  if (!isConnected) {
    return (
      <>
        <Head><title>Banana Miners – Connect</title></Head>
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/backgrounds/shack.jpg')" }}
        >
          <p className="text-2xl font-bold text-white">Connect your wallet to start mining!</p>
          <button
            onClick={() => openConnectModal?.()}
            className="bg-yellow-400 text-green-900 font-bold px-6 py-3 rounded-lg shadow hover:scale-105 transition"
          >
            Connect Wallet
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-yellow-300 underline"
          >
            ← Back to Home
          </button>
        </div>
      </>
    );
  }

  /* ---------------- render (game) ---------------- */
  return (
    <>
      <Head><title>Banana Miners – Game</title></Head>

      {/* Full‑viewport wrapper with background */}
      <div
        className="min-h-screen flex flex-col bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/assets/backgrounds/shack.jpg')" }}
      >
        {/* TopHUD (transparent) */}
        <TopHUD
          bnana={bnana}
          powerUsed={totalWatts}
          maxPower={room.maxPower}
          unclaimed={animatedUnclaimed}
          wattRate={wattRate}
          dailyStreak={dailyStreak}
          canClaimStreak={canClaimStreak}
          onOpenRoomModal={() => setShowRoomModal(true)}
          onClaimRewards={handleClaim}
          onClaimStreak={() => {
            const claimed = claim();
            setBnana(prev => {
              const total = prev + claimed;
              syncLeaderboard(address!, total, totalHash);
              return total;
            });
          }}
          onOpenAccount={() => setShowWallet(true)}
        />

        {/* Game canvas flexes below the HUD */}
        <main className="flex-1 relative">
          <GameRoom
            miners={activeMiners}
            maxSlots={room.maxSlots}
            totalSlots={room.gridCols * room.gridRows}
            onTileClick={idx => {
              const miner = activeMiners.find(m => m.position === idx);
              miner ? setSelectedMiner(miner) : setShowBuyModal(true);
            }}
            setMiners={setActiveMiners}
          />

          {/* Loot & boosters */}
          {loot.length > 0 && (
            <div className="absolute top-20 right-4 z-50 text-sm bg-yellow-300 text-green-900 p-2 rounded shadow">
              🎁 Loot:
              {loot.map((item, i) => (
                <button
                  key={i}
                  className="ml-2 bg-white px-2 py-1 rounded text-xs"
                  onClick={() => activateBooster(item)}
                >
                  {item === 'haste' && '⚡ Boost'}
                  {item === 'efficiency' && '🔋 Saver'}
                  {item === 'bonus' && '💰 Bonus'}
                </button>
              ))}
            </div>
          )}

          {activeBoosters.length > 0 && (
            <div className="absolute top-36 right-4 z-50 text-sm bg-green-900 text-yellow-300 p-2 rounded shadow">
              🧪 Active Boosters:
              <ul>
                {activeBoosters.map((b, i) => (
                  <li key={i}>
                    {b === 'haste' && '⚡ +30% Hash'}
                    {b === 'efficiency' && '🔋 -20% Watts'}
                    {b === 'bonus' && '💰 Extra Claim'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modals */}
          {showRoomModal && (
            <RoomModal
              currentLevel={currentRoomLevel}
              onUpgrade={handleUpgradeRoom}
              onClose={() => setShowRoomModal(false)}
              bnana={bnana}
            />
          )}

          {showBuyModal && (
            <BuyMinerModal onBuy={handleBuyMiner} onClose={() => setShowBuyModal(false)} />
          )}

          {selectedMiner && (
            <MinerPanel
              miner={selectedMiner}
              onSell={handleSellMiner}
              onRepair={handleRepairMiner}
              onRecycle={handleRecycleMiner}
              onClose={() => setSelectedMiner(null)}
            />
          )}
        </main>

        {/* Wallet modal */}
        <WalletModal
          open={showWallet}
          onClose={() => setShowWallet(false)}
          bnana={bnana}
        />
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(Play), { ssr: false });

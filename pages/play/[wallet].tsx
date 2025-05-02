import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
// import BackgroundLayer from '../../components/BackgroundLayer';
// import GameRoomCanvas from '../../components/GameRoomCanvas';
import HUD from '../../components/HUD';
import MinerModal from '../../components/MinerModal';
import BuyMinerModal from '../../components/BuyMinerModal';
import RoomModal from '../../components/RoomModal';
import styles from '../../styles/PlayPage.module.css';
import { getWattRate } from '../../lib/economy';
import { generateInitialGrid } from '../../lib/gridUtils';
import GridConfigModal from '../../components/GameRoomCanvas/GridConfigModal';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useGameState } from '../../lib/GameStateContext';
import { roomLevels } from '../../lib/gamedata';
import { useWattPrice } from '../../hooks/useWattPrice';
import { useEarnings } from '../../hooks/useEarnings';
import { fetchAllLeaderboardEntries } from '../../hooks/useLeaderboard';

// Use the new modular GameRoomCanvas
const DynamicGameRoomCanvas = dynamic(() => import('../../components/GameRoomCanvas/index'), { ssr: false });

export async function getServerSideProps(context) {
  const { wallet } = context.params;
  
  // Initial grid config - will be overridden by room level
  const gridConfig = {
    cellSize: 96,
    rows: 2,
    cols: 4,
    topLeft: { x: 412, y: 600 },
    topRight: { x: 730, y: 478 },
    bottomLeft: { x: 567, y: 670 },
    bottomRight: { x: 880, y: 547 }
  };
  
  return { props: { wallet, gridConfig } };
}

// --- GridTile type ---
// (moved to lib/gridUtils)

export default function PlayWalletPage({ wallet, gridConfig: initialGridConfig }) {
  // Game state from context
  const {
    miners,
    roomLevel,
    loading,
    error,
    buyMiner,
    removeMiner,
    upgradeRoom,
    refresh,
  } = useGameState();
  
  // Derived state
  const roomData = roomLevels[roomLevel] || roomLevels[0];
  const gridConfig = {
    cellSize: 96,
    rows: roomData.gridRows,
    cols: roomData.gridCols,
    ...roomData.gridCorners,
  };
  
  const draggedIdRef = useRef<string | null>(null);

  const grid = useMemo(
    () => deriveGrid(miners, gridConfig.rows, gridConfig.cols),
    [miners, gridConfig.rows, gridConfig.cols]
  );
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{x: number, y: number} | null>(null);
  const [openMiner, setOpenMiner] = useState<any | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showGridConfigModal, setShowGridConfigModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [totalNetworkHashrate, setTotalNetworkHashrate] = useState<number>(0);
  const [hashPowerPercent, setHashPowerPercent] = useState<number>(0);
  const [dailyEarnings, setDailyEarnings] = useState<number>(0);

  // Close modal if openMiner no longer exists
  useEffect(() => {
    if (openMiner && !miners.some(m => m.instanceId === openMiner.instanceId)) {
      setOpenMiner(null);
    }
  }, [miners, openMiner]);

  // Add a ref to track if a miner was just added
  const justAddedRef = useRef(false);

  // --- Core grid functions ---
  function placeMiner(position: number, minerType: any) {
    const usedWatts = grid.reduce((sum, tile) => sum + (tile.miner ? tile.miner.watts : 0), 0);
    const maxWatts = roomData?.maxPower || 160;
    if (usedWatts + (minerType.watts || 10) > maxWatts) {
      alert('Room wattage limit exceeded!');
      return;
    }
    const filtered = miners.filter(m => m.position !== position);
    const newMiner = {
      ...minerType,
      id: minerType.id,
      position,
      instanceId: uuidv4(),
      image: minerType.image || '/assets/miner/miner-3.png',
      xp: 0,
      level: 1,
      durability: 100,
      overheated: false,
      boosted: false,
      watts: minerType.watts || 10,
    };
    buyMiner(newMiner);
    justAddedRef.current = true;
  }
  function handleRemoveMiner(position: number) {
    const miner = miners.find(m => m.position === position);
    if (miner) removeMiner(miner.instanceId);
  }
  function moveMiner(fromIndex: number, toIndex: number) {
    // Not implemented: would require a context action for moving
  }
  function highlightAvailableSlots() {
    const available = Array.from({ length: gridConfig.rows * gridConfig.cols }, (_, i) => i)
      .filter(idx => !miners.some(m => m.position === idx));
    return available;
  }

  // --- UI event handlers ---
  function handleTilePointerOver(index: number) {
    setHoveredTile(index);
    if (draggedIdRef.current !== null) setDragOverSlot(index);
  }
  function handleTilePointerOut() {
    setHoveredTile(null);
    if (draggedIdRef.current !== null) setDragOverSlot(null);
  }
  function handleTileClick(index: number) {
    setSelectedTile(index);
    const tile = grid.find(t => t.index === index);
    if (tile?.miner) {
      setOpenMiner(tile.miner);
      setShowBuyModal(false);
    } else {
      setOpenMiner(null);
      if (index != null) setShowBuyModal(true);
    }
  }
  function handleMinerDragStart(instanceId: string) {
    draggedIdRef.current = instanceId;
  }
  function handleMinerDrop(targetIndex: number) {
    // Not implemented: would require a context action for moving
    draggedIdRef.current = null;
    setDragPos(null);
    setDragOverSlot(null);
  }
  function handlePointerMove(e: PointerEvent) {
    setDragPos({ x: e.clientX, y: e.clientY });
  }
  function handlePointerUp() {
    draggedIdRef.current = null;
    setDragPos(null);
    setDragOverSlot(null);
  }

  // --- Wattage calculation ---
  const usedWatts = grid.reduce((sum, tile) => sum + (tile.miner ? tile.miner.watts : 0), 0);
  const maxWatts = roomData?.maxPower || 160;
  const yourHashrate = grid.reduce((sum, tile) => sum + (tile.miner ? tile.miner.hash : 0), 0);

  // --- Watt price (BNANA/kWh) ---
  const { currentPrice: wattPrice } = useWattPrice();

  // --- Earnings calculation ---
  const { unclaimed, claim, loading: loadingUnclaimed } = useEarnings(wallet, yourHashrate, usedWatts, wattPrice || 0.7);

  // Use live network hashrate for earnings per second
  const rewardRate = 0.002; // BNANA per GH/s per second (example)
  const yourEarningsPerSecond = totalNetworkHashrate > 0 ? (yourHashrate / totalNetworkHashrate) * rewardRate : 0;

  useEffect(() => {
    if (justAddedRef.current) {
      setShowBuyModal(false);
      justAddedRef.current = false;
    }
  }, [miners]);

  useEffect(() => {
    async function fetchNetworkStats() {
      const entries = await fetchAllLeaderboardEntries();
      console.log('Fetched leaderboard entries:', entries);
      const totalHash = entries.reduce((sum, p) => sum + (p.hashrate || 0), 0);
      console.log('Computed totalNetworkHashrate:', totalHash);
      setTotalNetworkHashrate(totalHash);
      if (totalHash > 0) {
        const percent = yourHashrate / totalHash;
        setHashPowerPercent(percent);
        // Daily earnings: share * rewardRate * 86400 seconds
        const gross = percent * rewardRate * 86400;
        const kWhUsed = (usedWatts * 86400) / (1000 * 3600);
        const cost = kWhUsed * (wattPrice || 0.7);
        setDailyEarnings(Math.max(0, gross - cost));
      } else {
        setHashPowerPercent(0);
        setDailyEarnings(0);
      }
    }
    fetchNetworkStats();
  }, [yourHashrate, usedWatts, wattPrice]);

  // No centering: anchor grid strictly by its four corners
  const gameLayerPosition = { x: 0, y: 0 };

  if (error) {
    return <div className="fixed top-0 left-0 w-full z-50 bg-red-900 bg-opacity-90 flex items-center justify-center text-white text-xl">{error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* <BackgroundLayer roomTier={roomTier} /> */}
      <GridConfigModal
        open={showGridConfigModal}
        onClose={() => setShowGridConfigModal(false)}
        gridConfig={gridConfig}
        onChange={() => {}}
      />
      {showRoomModal && (
        <RoomModal
          currentLevel={roomLevel}
          onUpgrade={async () => {
            setShowRoomModal(false);
            await upgradeRoom();
            refresh();
          }}
          onClose={() => setShowRoomModal(false)}
          bnana={0}
        />
      )}
      <DynamicGameRoomCanvas
        gridConfig={gridConfig}
        grid={grid}
        roomLevel={roomLevel}
        hoveredTile={dragOverSlot !== null ? dragOverSlot : hoveredTile}
        selectedTile={selectedTile}
        highlightSlots={highlightAvailableSlots()}
        onTilePointerOver={handleTilePointerOver}
        onTilePointerOut={handleTilePointerOut}
        onTileClick={handleTileClick}
        onMinerDragStart={(index: number) => {
          const miner = grid.find(t => t.index === index)?.miner;
          if (miner) handleMinerDragStart(miner.instanceId);
        }}
        onMinerDrop={handleMinerDrop}
        draggedMiner={draggedIdRef.current}
        dragPos={dragPos}
        gameLayerPosition={gameLayerPosition}
      />
      <HUD
        usedWatts={usedWatts}
        maxWatts={maxWatts}
        yourHashrate={yourHashrate}
        earningsPerSecond={yourEarningsPerSecond}
        wattPrice={wattPrice}
        unclaimed={unclaimed}
        onClaim={claim}
        loadingUnclaimed={loadingUnclaimed}
        hashPowerPercent={hashPowerPercent}
        totalNetworkHashrate={totalNetworkHashrate}
        dailyEarnings={dailyEarnings}
        onOpenRoomModal={() => setShowRoomModal(true)}
      />
      {openMiner && <MinerModal miner={openMiner} onClose={() => setOpenMiner(null)} onRemove={() => {
        handleRemoveMiner(openMiner.position);
        setOpenMiner(null);
      }} />}
      {showBuyModal && <BuyMinerModal
        onBuy={minerType => {
          if (selectedTile == null) return;
          placeMiner(selectedTile, minerType);
          setShowBuyModal(false);
        }}
        onClose={() => setShowBuyModal(false)}
        usedWatts={usedWatts}
        maxWatts={maxWatts}
      />}
      {/* AAA loading overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            textAlign: 'center',
            padding: '8px 0',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Loading game state…
        </div>
      )}
    </div>
  );
}

// Utility: deriveGrid
function deriveGrid(miners, rows, cols) {
  const sortedMiners = Array.isArray(miners) ? [...miners].sort((a, b) => a.position - b.position) : [];
  const grid = [];
  for (let i = 0; i < rows * cols; i++) {
    const miner = sortedMiners.find(m => m.position === i);
    grid.push({
      index: i,
      miner: miner || undefined,
      locked: false,
      status: miner ? {
        overheated: miner.overheated,
        boosted: miner.boosted,
        durability: miner.durability,
        xp: miner.xp,
        level: miner.level,
      } : {},
    });
  }
  return grid;
}

// Utility: saveMiners
function saveMiners(miners, wallet) {
  // Fire-and-forget save to Supabase
  supabase
    .from('players')
    .update({ miners })
    .eq('wallet', wallet)
    .then(({ error }) => {
      if (error) {
        console.error('Failed to save miners to Supabase:', error);
      }
    });
} 
import React from 'react';
import MinerTile from './MinerTile';
import { Miner } from '../lib/types';
import { useDragGrid } from '../hooks/useDragGrid';

interface GameRoomProps {
  miners: Miner[];
  maxSlots: number;
  totalSlots: number;
  onTileClick: (index: number) => void;
  setMiners: React.Dispatch<React.SetStateAction<Miner[]>>;
}

export default function GameRoom({
  miners,
  maxSlots,
  totalSlots,
  onTileClick,
  setMiners,
}: GameRoomProps) {
  const cols = 4;
  const { onDragStart, onDrop } = useDragGrid(miners, setMiners);

  const tiles = Array.from({ length: totalSlots }).map((_, index) => {
    const miner = miners.find((m) => m.position === index);
    const locked = index >= maxSlots;

    return (
      <MinerTile
      key={index}
      index={index}
      miner={miner}
      locked={locked}
      onClick={() => onTileClick(index)}
      onDrop={onDrop}
      onDragStart={onDragStart}
      />
    );
  });

  return (
    <div
      className="absolute z-20"
      style={{
        position: 'absolute',
        top: '60%',
        left: '42%',
        transform: 'translate(-35%, 48%) rotateX(66deg) rotateZ(-43deg) scale(1.9)',
        transformOrigin: 'center',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 72px)`,
        gridTemplateRows: `repeat(${Math.ceil(totalSlots / cols)}, 72px)`,
        gap: '0px',
      }}
    >
      {tiles}
    </div>
  );
}

// components/MinerTile.tsx
import React from 'react';
import { Miner } from '../lib/types';
import { getLevelInfo } from '../lib/minerStats';

interface GridTileProps {
  miner?: Miner;
  index: number;
  locked: boolean;
  onClick: () => void;
  onDrop: (index: number) => void;
  onDragStart?: (position: number) => void;
}

export default function MinerTile({
  miner,
  index,
  locked,
  onClick,
  onDrop,
  onDragStart,
}: GridTileProps) {
  if (locked) {
    return (
      <div className="w-[72px] h-[72px] bg-gray-800 opacity-40 rounded flex items-center justify-center border-2 border-gray-500">
        🔒
      </div>
    );
  }

  if (!miner) {
    return (
      <div
        className="w-[72px] h-[72px] bg-green-900 border-2 border-green-500 hover:scale-105 transition rounded"
        onClick={onClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDrop(index)}
      />
    );
  }

  const levelInfo = getLevelInfo(miner.xp || 0);
  const xpProgress = Math.min((miner.xp || 0) / levelInfo.xpToNext, 1);

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      onClick={onClick}
      className={`w-[72px] h-[72px] bg-green-950 rounded border-2 ${
        miner.overheated ? 'border-red-500' : 'border-yellow-400'
      } flex flex-col items-center justify-center relative overflow-hidden hover:scale-105 transition cursor-pointer`}
    >
      <img
        src={miner.image}
        alt={miner.name}
        className={`w-12 h-12 object-contain ${
          miner.overheated ? 'grayscale opacity-50' : ''
        }`}
      />
      {miner.overheated ? (
        <div className="text-red-400 text-xs font-bold mt-1">🔥 Overheated</div>
      ) : (
        <div className="w-full mt-1">
          <div className="text-[10px] text-yellow-300 text-center font-bold">Lv {levelInfo.level}</div>
          <div className="h-1 bg-gray-700 w-[90%] mx-auto rounded-full overflow-hidden">
            <div
              className="bg-yellow-400 h-full"
              style={{ width: `${xpProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

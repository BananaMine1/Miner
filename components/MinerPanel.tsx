// components/MinerPanel.tsx
import React from 'react';
import { Miner } from '../lib/types';
import { getLevelInfo } from '../lib/minerStats';

interface MinerPanelProps {
  miner: Miner;
  onSell: () => void;
  onRepair: () => void;
  onRecycle: () => void;
  onClose: () => void;
}

export default function MinerPanel({ miner, onSell, onRepair, onRecycle, onClose }: MinerPanelProps) {
  const levelInfo = getLevelInfo(miner.xp || 0);
  const durability = miner.durability ?? 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-green-900 rounded-xl p-6 text-white w-[320px] shadow-lg relative">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>✖</button>
        <img src={miner.image} alt={miner.name} className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-center text-xl font-bold">{miner.name}</h2>
        <p className="text-center text-yellow-300">Level {levelInfo.level}</p>
        <p className="text-center">⚡ Hash: {(miner.hash * levelInfo.hashBonus).toFixed(1)}</p>
        <p className="text-center">🔋 Watts: {(miner.watts * levelInfo.wattBonus).toFixed(1)}</p>
        <p className="text-center mt-1">XP: {miner.xp || 0}</p>
        <p className="text-center mt-1">🛠 Durability: {durability}%</p>

        {miner.overheated && (
          <div className="text-red-500 text-center font-bold mt-1">🔥 Overheated</div>
        )}

        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          <button onClick={onSell} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Sell
          </button>
          {miner.overheated && (
            <button onClick={onRepair} className="bg-yellow-400 text-green-900 hover:scale-105 px-4 py-2 rounded">
              Repair (10 $BNANA)
            </button>
          )}
          {durability < 100 && (
            <button onClick={onRepair} className="bg-yellow-300 text-green-900 hover:scale-105 px-4 py-2 rounded">
              Repair (5 $BNANA)
            </button>
          )}
          <button onClick={onRecycle} className="bg-gray-400 text-black hover:scale-105 px-4 py-2 rounded">
            Recycle (+5 $BNANA)
          </button>
        </div>
      </div>
    </div>
  );
}

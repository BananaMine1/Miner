import React from 'react';
import type { Miner } from '../lib/types';

interface MinerDetailsModalProps {
  miner: Miner;
  ownedCount: number;
  onBuy: () => void;
  onClose: () => void;
  canBuy: boolean;
  buyDisabledReason?: string;
  bnana: number;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-500',
  Rare: 'bg-blue-600',
  Epic: 'bg-purple-700',
  Legendary: 'bg-yellow-400 text-green-900',
};

function getRarity(miner: Miner): string {
  if (miner.price && miner.price >= 8000) return 'Legendary';
  if (miner.price && miner.price >= 3000) return 'Epic';
  if (miner.price && miner.price >= 1000) return 'Rare';
  return 'Common';
}

export default function MinerDetailsModal({ miner, ownedCount, onBuy, onClose, canBuy, buyDisabledReason, bnana }: MinerDetailsModalProps) {
  const rarity = getRarity(miner);
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-green-900 text-white p-8 rounded-lg w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-4 text-2xl text-yellow-300 hover:scale-110">✖</button>
        <div className="flex flex-col items-center mb-4">
          <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${rarityColors[rarity]}`}>{rarity}</span>
          <img src={miner.image} alt={miner.name} className="w-28 h-28 rounded shadow mb-2" />
          <h2 className="text-2xl font-bold text-yellow-300 mb-1">{miner.name}</h2>
          <div className="text-green-200 text-sm mb-2">Owned: {ownedCount}</div>
        </div>
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 text-yellow-200">Price</span>
            <span className="flex items-center gap-1 text-yellow-300 font-bold">
              {/* TODO: Replace with CRROT icon */}
              {/* <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-5 h-5 inline-block" /> */}
              {miner.price} $BNANA
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 text-yellow-200">Level</span>
            <span>1 / {miner.maxLevel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 text-yellow-200">Hashrate</span>
            <span>{miner.hash} GH/s</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 text-yellow-200">Power</span>
            <span>{miner.watts} W</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-20 text-yellow-200">Durability</span>
            <span>{miner.durability}/100</span>
          </div>
          {miner.specialAbility && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-20 text-blue-200">Special</span>
              <span className="italic text-blue-300">{miner.specialAbility}</span>
            </div>
          )}
        </div>
        {/* Progress bars for stats */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-yellow-200 w-16">Hashrate</span>
            <div className="w-full bg-green-700 rounded h-2">
              <div className="bg-yellow-400 h-2 rounded" style={{ width: `${Math.min(100, (miner.hash / 800000) * 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-blue-200 w-16">Power</span>
            <div className="w-full bg-green-700 rounded h-2">
              <div className="bg-blue-400 h-2 rounded" style={{ width: `${Math.min(100, (miner.watts / 4000) * 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-200 w-16">Durability</span>
            <div className="w-full bg-green-700 rounded h-2">
              <div className="bg-red-400 h-2 rounded" style={{ width: `${miner.durability}%` }} />
            </div>
          </div>
        </div>
        {/* Description/lore */}
        <div className="bg-green-800 rounded p-3 text-green-100 text-sm mb-4 min-h-[48px]">
          {miner.description || 'No lore available for this miner yet. Stay tuned!'}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-yellow-200 flex items-center gap-2">
            {/* TODO: Replace with CRROT icon */}
            {/* <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-6 h-6 inline-block" /> */}
            Your BNANA: <span className="text-yellow-300">{bnana.toFixed(2)}</span>
          </span>
          <button
            className={`px-6 py-2 rounded font-bold text-lg transition ${canBuy ? 'bg-yellow-400 text-green-900 hover:scale-105' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            onClick={canBuy ? onBuy : undefined}
            disabled={!canBuy}
            title={buyDisabledReason}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
} 
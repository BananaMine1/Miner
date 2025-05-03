import React from 'react';
import { miners } from '../lib/gamedata';
import type { Miner } from '../lib/types';
import { useGameState } from '../lib/GameStateContext';

// Infer the type of a miner template from the miners array and add optional properties
export type MinerTemplate = typeof miners[number] & {
  specialAbility?: string;
};

interface BuyMinerModalProps {
  onBuy: (miner: MinerTemplate) => void;
  onClose: () => void;
  usedWatts: number;
  maxWatts: number;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-500',
  Rare: 'bg-blue-600',
  Epic: 'bg-purple-700',
  Legendary: 'bg-yellow-400 text-green-900',
};

function getRarity(miner: MinerTemplate): string {
  // Placeholder: you can add a 'rarity' field to miner data later
  if (miner.price >= 8000) return 'Legendary';
  if (miner.price >= 3000) return 'Epic';
  if (miner.price >= 1000) return 'Rare';
  return 'Common';
}

export default function BuyMinerModal({ onBuy, onClose, usedWatts, maxWatts }: BuyMinerModalProps) {
  const { miners: ownedMiners, bnana } = useGameState();

  function ownedCount(miner: MinerTemplate) {
    return ownedMiners.filter((m) => 'id' in m && m.id === miner.id).length;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-[#FFF7E0] text-[#7C4F1D] p-6 rounded-2xl border-4 border-yellow-300 w-full max-w-3xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-4 text-2xl text-yellow-300 hover:scale-110">✖</button>
        <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">Buy Miners</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {miners.map((m: MinerTemplate) => {
              const wouldExceed = usedWatts + m.watts > maxWatts;
              const notEnoughBnana = bnana < m.price;
              const disabled = wouldExceed || notEnoughBnana;
              const rarity = getRarity(m);
              return (
                <div key={m.id} className="bg-green-800 rounded-xl p-5 flex flex-col gap-2 shadow-lg relative border border-green-700">
                  {/* Rarity badge */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rarityColors[rarity]}`}>{rarity}</span>
                  {/* Miner image */}
                  <img src={m.image} alt={m.name} className="w-20 h-20 mx-auto mb-2 rounded shadow" />
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-yellow-300 text-lg">{m.name}</h3>
                    <span className="flex items-center gap-1 text-yellow-200 font-bold text-base">
                      {/* TODO: Replace with CRROT icon */}
                      {/* <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-5 h-5 inline-block" /> */}
                      {m.price} $CRROT
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-green-200">Owned: {ownedCount(m)}</span>
                    <span className="text-green-200">Level: 1 / {m.maxLevel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>💻 {m.hash} GH/s</span>
                    <span>⚡ {m.watts}W</span>
                    <span>🛡️ {m.durability}/100</span>
                  </div>
                  {m.specialAbility && (
                    <div className="text-xs text-blue-300 italic mb-1">Special: {m.specialAbility}</div>
                  )}
                  {/* Progress bars for stats */}
                  <div className="flex flex-col gap-1 my-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-yellow-200 w-16">Hashrate</span>
                      <div className="w-full bg-green-700 rounded h-2">
                        <div className="bg-yellow-400 h-2 rounded" style={{ width: `${Math.min(100, (m.hash / 800000) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-blue-200 w-16">Power</span>
                      <div className="w-full bg-green-700 rounded h-2">
                        <div className="bg-blue-400 h-2 rounded" style={{ width: `${Math.min(100, (m.watts / 4000) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-200 w-16">Durability</span>
                      <div className="w-full bg-green-700 rounded h-2">
                        <div className="bg-red-400 h-2 rounded" style={{ width: `${m.durability}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className={`flex-1 px-4 py-2 rounded font-bold transition ${disabled ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-yellow-400 text-green-900 hover:scale-105'}`}
                      onClick={() => !disabled && onBuy(m)}
                      disabled={disabled}
                      title={wouldExceed ? 'Exceeds room wattage limit' : notEnoughBnana ? 'Not enough CRROT' : ''}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between mt-8 px-2">
          <span className="text-lg font-bold text-yellow-200 flex items-center gap-2">
            {/* TODO: Replace with CRROT icon */}
            {/* <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-6 h-6 inline-block" /> */}
            Your CRROT: <span className="text-yellow-300">{bnana.toFixed(2)}</span>
          </span>
          <button onClick={onClose} className="px-6 py-2 bg-yellow-400 text-green-900 rounded font-bold text-lg hover:scale-105 transition">Close</button>
        </div>
      </div>
    </div>
  );
}

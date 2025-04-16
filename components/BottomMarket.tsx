// components/BottomMarket.tsx
import React from 'react';
import { miners } from '../lib/gamedata';

interface BottomMarketProps {
  onBuy: (id: number) => void;
}

export default function BottomMarket({ onBuy }: BottomMarketProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Buy Miners</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {miners.map((miner) => (
          <div key={miner.id} className="bg-green-800 p-4 rounded-lg shadow border border-green-600">
            <h3 className="font-bold text-yellow-400">{miner.name}</h3>
            <p>⚡ {miner.watts}W</p>
            <p>🖥 {miner.hash} GH/s</p>
            <button
              className="mt-2 w-full bg-yellow-400 text-green-900 font-bold py-2 rounded hover:scale-105 transition"
              onClick={() => onBuy(miner.id)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { miners } from '../lib/gamedata';

interface BuyMinerModalProps {
  onBuy: (miner: Miner) => void;
  onClose: () => void;
}

export default function BuyMinerModal({ onBuy, onClose }: BuyMinerModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-green-800 text-white p-6 rounded-lg w-[600px]">
        <h2 className="text-xl font-bold mb-4">Buy Miners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {miners.map((m) => (
            <div key={m.id} className="bg-green-700 p-4 rounded">
              <h3 className="font-bold text-yellow-300">{m.name}</h3>
              <p>⚡ {m.watts}W</p>
              <p>🖥️ {m.hash} GH/s</p>
              <button
                className="mt-2 w-full bg-yellow-400 text-green-900 font-bold py-1 rounded"
                onClick={() => onBuy(m)}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 text-yellow-300 underline w-full">Close</button>
      </div>
    </div>
  );
}

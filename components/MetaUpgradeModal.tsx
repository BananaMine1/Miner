import React from 'react';
import { useGameState } from '../lib/GameStateContext';

const MetaUpgradeModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { xp, metaUpgrades, purchaseMetaUpgrade } = useGameState();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#FFF7E0] text-[#7C4F1D] rounded-2xl border-4 border-yellow-300 shadow-2xl p-6 max-w-lg w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-500 text-2xl font-bold hover:scale-110 transition"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <span role="img" aria-label="Upgrade">🛠️</span> Meta Upgrades
        </h2>
        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
          {metaUpgrades.map(upg => (
            <div
              key={upg.id}
              className={`flex items-center gap-4 p-3 rounded-lg border-2 ${upg.unlocked ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100 opacity-80'}`}
            >
              <img
                src={upg.icon}
                alt={upg.title}
                className={`w-14 h-14 rounded-lg shadow ${upg.unlocked ? '' : 'grayscale'}`}
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-blue-700 flex items-center gap-2">
                  {upg.title}
                  {upg.unlocked && <span className="text-green-600 text-base font-semibold">Unlocked!</span>}
                </div>
                <div className="text-gray-700 text-sm mb-1">{upg.description}</div>
                <div className="text-xs text-gray-500">
                  Cost: <span className="text-blue-600 font-bold">⭐ {upg.cost} XP</span>
                </div>
                {!upg.unlocked && (
                  <button
                    onClick={() => purchaseMetaUpgrade(upg.id)}
                    disabled={xp < upg.cost}
                    className={`mt-2 px-3 py-1 rounded bg-blue-500 text-white font-bold shadow hover:scale-105 transition ${xp < upg.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Unlock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetaUpgradeModal; 
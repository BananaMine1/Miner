import React from 'react';
import { useGameState } from '../lib/GameStateContext';
import { ACHIEVEMENTS } from '../lib/achievements';

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ open, onClose }) => {
  const { achievements } = useGameState();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-500 text-2xl font-bold hover:scale-110 transition"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
          <span role="img" aria-label="Trophy">🏆</span> Achievements
        </h2>
        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = achievements[ach.id]?.unlocked;
            return (
              <div
                key={ach.id}
                className={`flex items-center gap-4 p-3 rounded-lg border-2 ${unlocked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-100 opacity-60'}`}
              >
                <img
                  src={ach.icon}
                  alt={ach.title}
                  className={`w-14 h-14 rounded-lg shadow ${unlocked ? '' : 'grayscale'}`}
                />
                <div className="flex-1">
                  <div className="font-bold text-lg text-yellow-700 flex items-center gap-2">
                    {ach.title}
                    {unlocked && <span className="text-green-600 text-base font-semibold">Unlocked!</span>}
                  </div>
                  <div className="text-gray-700 text-sm mb-1">{ach.description}</div>
                  <div className="text-xs text-gray-500">
                    Reward: {ach.reward.type === 'xp' ? `⭐ ${ach.reward.value} XP` : ach.reward.type === 'cosmetic' ? `🎨 Cosmetic: ${ach.reward.value}` : 'Upgrade'}
                  </div>
                  {unlocked && achievements[ach.id]?.unlockedAt && (
                    <div className="text-xs text-green-700 mt-1">Unlocked: {new Date(achievements[ach.id].unlockedAt!).toLocaleString()}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementModal; 
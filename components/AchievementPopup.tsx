import React, { useEffect } from 'react';
import { playSFX } from '../lib/audioManager';
// @ts-ignore
import confetti from 'canvas-confetti';

interface AchievementPopupProps {
  icon: string;
  title: string;
  reward: string;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ icon, title, reward, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    playSFX('claim');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.3 },
      zIndex: 9999,
    });
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className="flex items-center gap-4 bg-yellow-100 border-4 border-yellow-400 rounded-xl shadow-2xl px-6 py-4">
        <img src={icon} alt={title} className="w-16 h-16 rounded-lg shadow-lg" />
        <div>
          <div className="font-bold text-lg text-yellow-800 flex items-center gap-2">
            <span role="img" aria-label="Trophy">🏆</span> Achievement Unlocked!
          </div>
          <div className="text-yellow-700 font-semibold text-base">{title}</div>
          <div className="text-blue-700 text-sm mt-1">Reward: {reward}</div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup; 
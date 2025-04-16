// /components/UpgradeModal.tsx
import React from 'react';
import { roomLevels } from '../lib/gamedata';

interface UpgradeModalProps {
  currentLevel: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ currentLevel, onConfirm, onCancel }) => {
  const nextRoom = roomLevels[currentLevel + 1];
  if (!nextRoom) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-green-900 p-6 rounded-lg text-white w-[320px]">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">Upgrade Room</h2>

        <div className="mb-2">🏕️ <strong>{nextRoom.name}</strong></div>
        <div className="mb-2">📦 Slots: {nextRoom.maxSlots}</div>
        <div className="mb-2">🔌 Power Limit: {nextRoom.maxPower}W</div>
        <div className="mb-2">💰 Cost: {nextRoom.upgradeCost} $BNANA</div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-400 text-green-900 font-bold px-4 py-2 rounded hover:scale-105 transition"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
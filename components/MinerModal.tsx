// /components/MinerModal.tsx
import React from 'react';
import {
  getUpgradeCost,
  getXpToNext,
  getRepairCost,
  getUpgradedHash,
  getUpgradedWatts
} from '../lib/minerUtils';

interface MinerModalProps {
  miner: any;
  onClose: () => void;
  onRemove?: () => void;
  onUpgrade?: () => void;
  onRepair?: () => void;
  canUpgrade?: boolean;
  canRepair?: boolean;
  upgradeDisabledReason?: string;
  repairDisabledReason?: string;
}

const MinerModal: React.FC<MinerModalProps> = ({ miner, onClose, onRemove, onUpgrade, onRepair, canUpgrade = true, canRepair = true, upgradeDisabledReason, repairDisabledReason }) => {
  const upgradeCost = getUpgradeCost(miner);
  const xpToNext = getXpToNext(miner);
  const repairCost = getRepairCost(miner);
  const upgradedHash = getUpgradedHash(miner);
  const upgradedWatts = getUpgradedWatts(miner);
  const atMaxLevel = miner.level >= miner.maxLevel;
  const atFullDurability = miner.durability === 100;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#FFF7E0] p-6 rounded-2xl border-4 border-yellow-300 text-[#7C4F1D] max-w-sm w-full shadow-xl">
        <h2 className="text-xl font-bold mb-2">{miner.name}</h2>
        <p>Level: {miner.level} / {miner.maxLevel}</p>
        <p>XP: {miner.xp} / {xpToNext}</p>
        <div className="w-full bg-green-700 rounded h-2 my-2">
          <div className="bg-yellow-400 h-2 rounded" style={{ width: `${Math.min(100, (miner.xp / xpToNext) * 100)}%` }} />
        </div>
        <p>Durability: {miner.durability}/100</p>
        <div className="w-full bg-green-700 rounded h-2 my-2">
          <div className="bg-red-400 h-2 rounded" style={{ width: `${miner.durability}%` }} />
        </div>
        <p>💻 Hashrate: {miner.hash} GH/s {miner.level > 1 && <span className="text-yellow-300">→ {upgradedHash} GH/s</span>}</p>
        <p>⚡ Power: {miner.watts}W {miner.level > 1 && <span className="text-yellow-300">→ {upgradedWatts}W</span>}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={onUpgrade}
            className={`px-4 py-2 rounded font-bold ${canUpgrade && !atMaxLevel ? 'bg-yellow-400 text-green-900' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            disabled={!canUpgrade || atMaxLevel}
            title={atMaxLevel ? 'Max level reached' : upgradeDisabledReason}
          >
            Upgrade (Cost: {upgradeCost} CRROT, {xpToNext} XP)
          </button>
          <button
            onClick={onRepair}
            className={`px-4 py-2 rounded font-bold ${canRepair && !atFullDurability ? 'bg-yellow-400 text-green-900' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            disabled={!canRepair || atFullDurability}
            title={atFullDurability ? 'Already at full durability' : repairDisabledReason}
          >
            Repair (Cost: {repairCost} CRROT)
          </button>
          <div className="flex gap-2 mt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-yellow-400 text-green-900 rounded font-bold">Close</button>
            {onRemove && (
              <button onClick={onRemove} className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-bold">Remove Miner</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerModal;

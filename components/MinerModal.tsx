// /components/MinerModal.tsx
import React from 'react';

interface MinerModalProps {
  miner: any;
  onClose: () => void;
  onRemove?: () => void;
}

const MinerModal: React.FC<MinerModalProps> = ({ miner, onClose, onRemove }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-green-900 p-6 rounded-lg text-white max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">{miner.name}</h2>
        <p>⚡ Power: {miner.watts}W</p>
        <p>💻 Hashrate: {miner.hash} GH/s</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-yellow-400 text-green-900 rounded font-bold">Close</button>
          {onRemove && (
            <button onClick={onRemove} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Remove Miner</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinerModal;

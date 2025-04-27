// components/RoomModal.tsx
import React, { useEffect, useRef } from 'react';
import { roomLevels } from '../lib/gamedata';

interface RoomModalProps {
  currentLevel: number;
  onUpgrade: () => void;
  onClose: () => void;
  bnana: number;
}

export default function RoomModal({ currentLevel, onUpgrade, onClose, bnana }: RoomModalProps) {
  const room = roomLevels[currentLevel];
  const nextRoom = roomLevels[currentLevel + 1];
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const canUpgrade = nextRoom && bnana >= nextRoom.upgradeCost;
  const upgradeDisabledReason = !nextRoom
    ? 'No further upgrades'
    : bnana < nextRoom.upgradeCost
    ? 'Not enough BNANA'
    : '';

  const handleUpgrade = async () => {
    if (!canUpgrade) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onUpgrade();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roomModalTitle"
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      tabIndex={-1}
      ref={modalRef}
    >
      <div
        className="relative w-full max-w-2xl h-[600px] bg-no-repeat bg-contain bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/assets/ui/room-modal-bg.png')" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl"
          aria-label="Close Room Info"
        >
          ✕
        </button>
        <h2 id="roomModalTitle" className="sr-only">Room Info</h2>
        {/* Room Comparison */}
        <div className="flex flex-col md:flex-row gap-6 w-[90%] mt-20 mb-6">
          {/* Current Room */}
          <div className="flex-1 bg-green-800 bg-opacity-80 rounded-lg p-4 flex flex-col items-center">
            <div className="font-bold text-yellow-300 mb-1">Current Room</div>
            <div className="text-lg font-bold mb-1">{room.name}</div>
            <div className="text-sm text-green-200 mb-2 text-center">{room.description}</div>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-between"><span>Power Limit:</span><span>{room.maxPower}W</span></div>
              <div className="flex justify-between"><span>Grid Slots:</span><span>{room.maxSlots}</span></div>
              <div className="flex justify-between"><span>Grid Size:</span><span>{room.gridCols} x {room.gridRows}</span></div>
            </div>
          </div>
          {/* Next Room */}
          {nextRoom && (
            <div className="flex-1 bg-green-900 bg-opacity-80 rounded-lg p-4 flex flex-col items-center border-2 border-yellow-400 shadow-lg">
              <div className="font-bold text-yellow-300 mb-1">Next Upgrade</div>
              <div className="text-lg font-bold mb-1 text-yellow-200">{nextRoom.name}</div>
              <div className="text-sm text-green-200 mb-2 text-center">{nextRoom.description}</div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between"><span>Power Limit:</span><span>{nextRoom.maxPower}W</span></div>
                <div className="flex justify-between"><span>Grid Slots:</span><span>{nextRoom.maxSlots}</span></div>
                <div className="flex justify-between"><span>Grid Size:</span><span>{nextRoom.gridCols} x {nextRoom.gridRows}</span></div>
                <div className="flex justify-between font-bold text-yellow-300 mt-2"><span>Upgrade Cost:</span><span>{nextRoom.upgradeCost} $BNANA</span></div>
              </div>
            </div>
          )}
        </div>
        {/* Feedback */}
        {loading && <div className="text-center text-yellow-300 font-bold mt-2 animate-pulse">Upgrading room…</div>}
        {error && <div className="text-center text-red-400 font-bold mt-2">{error}</div>}
        {success && <div className="text-center text-green-300 font-bold mt-2 animate-bounce">Upgrade successful!</div>}
        {/* Upgrade Button & BNANA */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <span className="text-lg font-bold text-yellow-200 flex items-center gap-2">
            <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-6 h-6 inline-block" />
            Your BNANA: <span className="text-yellow-300">{bnana.toFixed(2)}</span>
          </span>
          {nextRoom && (
            <button
              onClick={handleUpgrade}
              className={`mt-2 px-8 py-3 rounded-lg font-bold text-lg transition-all ${canUpgrade && !loading ? 'bg-yellow-400 text-green-900 hover:scale-105' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              disabled={!canUpgrade || loading}
              title={upgradeDisabledReason}
            >
              {loading ? 'Upgrading…' : 'Upgrade Room'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// components/RoomModal.tsx
import React from 'react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div
        className="relative w-[400px] h-[550px] bg-no-repeat bg-contain bg-center"
        style={{ backgroundImage: "url('/assets/ui/room-modal-bg.png')" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl"
        >
          ✕
        </button>



        {/* Room Data */}
        <div className="absolute top-44 left-1/2 transform -translate-x-1/2 text-white w-[85%] space-y- text-sm">
          <div>
            <div className="text-center font-bold">Room:</div>
            <div className="text-center text-yellow-400">{room.name}</div>
          </div>

          <div>
            <div className="text-center font-bold">Power Limit:</div>
            <div className="text-center text-green-800">{room.maxPower}W</div>
          </div>

          <div>
            <div className="text-center font-bold">Grid Slots:</div>
            <div className="text-center text-green-800">{room.maxSlots}</div>
          </div>

          {nextRoom && (
            <>
              <div>
                <div className="text-center font-bold">Next Upgrade:</div>
                <div className="text-center text-yellow-400">{nextRoom.name}</div>
              </div>

              <div>
                <div className="text-center font-bold">Cost:</div>
                <div className="text-center text-yellow-400">{nextRoom.upgradeCost} $BNANA</div>
              </div>
            </>
          )}
        </div>

        {/* Upgrade Button */}
        {nextRoom && (
          <button
            onClick={onUpgrade}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
          >
            <img
              src="/assets/ui/upgrade-button.png"
              alt="Upgrade"
              className="w-[200px] h-auto hover:scale-105 transition-transform duration-200"
            />
          </button>
        )}
      </div>
    </div>
  );
}

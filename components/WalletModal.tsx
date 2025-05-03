// components/WalletModal.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { X, LogOut } from 'lucide-react';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  wallet: string;
  onDisconnect: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ open, onClose, wallet, onDisconnect }) => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Trap scroll when modal open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#FFF7E0] text-[#7C4F1D] rounded-2xl border-4 border-yellow-300 shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Wallet Options</h2>
        <div className="mb-4">
          <div className="text-center font-medium mb-2">Connected Wallet</div>
          <div className="bg-gray-100 p-3 rounded text-center break-all">
            {wallet}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
          <button
            className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WalletModal;

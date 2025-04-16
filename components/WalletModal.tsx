// components/WalletModal.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { X, LogOut } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  bnana: number;
}

export default function WalletModal({ open, onClose, bnana }: Props) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Trap scroll when modal open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      {/* panel */}
      <div className="relative bg-green-950 text-white rounded-xl shadow-xl p-6 w-80">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-300 hover:text-yellow-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Wallet</h2>

        <div className="space-y-3">
          <div>
            <span className="text-yellow-300 text-sm">Address</span>
            <div className="break-all font-mono text-xs">{address}</div>
          </div>

          <div>
            <span className="text-yellow-300 text-sm">In‑game Balance</span>
            <div className="text-lg font-bold">{bnana.toFixed(2)} $BNANA</div>
          </div>
        </div>

        <button
          onClick={() => { disconnect(); onClose(); }}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>
    </div>,
    document.body
  );
}

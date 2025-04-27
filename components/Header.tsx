// components/Header.tsx
import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import WalletModal from './WalletModal';

export default function Header({ bnana = 0 }: { bnana?: number }) {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-bananaYellow shadow-lg">
        <div className="text-3xl font-bold text-jungleGreen drop-shadow-lg">
          🍌 Banana Miners
        </div>

        {isConnected ? (
          <button
            onClick={() => setOpen(true)}
            className="bg-green-900 text-yellow-300 px-4 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Account
          </button>
        ) : (
          <ConnectButton showBalance={false} />
        )}
      </header>

      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        wallet={address || ''}
        onDisconnect={disconnect}
      />
    </>
  );
}

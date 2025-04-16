// lib/WalletContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const connect = () => {
    openConnectModal?.();
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect: () => disconnect(),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

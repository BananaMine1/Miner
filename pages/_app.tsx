// pages/_app.tsx
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';

import type { AppProps } from 'next/app';
import React from 'react';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';

import { WalletProvider } from '../lib/WalletContext';

// 1. RainbowKit / wagmi config (wagmi 1.x + RainbowKit 2.x)
const wagmiConfig = getDefaultConfig({
  appName: 'Banana Miners',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'banana-miners',
  chains: [mainnet, polygon, optimism, arbitrum],
  ssr: true,
});

// 2. React‑Query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={darkTheme()}>
          {/* 🔑 Wrap all pages in WalletProvider so useWallet works */}
          <WalletProvider>
            <Component {...pageProps} />
          </WalletProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

// pages/_app.tsx
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { preloadTextures } from '../lib/assetManager';
import { Toaster } from 'sonner';

// Remove Pixi setup from _app.tsx
// It should be handled within specific components if needed,
// especially since we're using extend locally now.

// —   Wagmi + RainbowKit ——————————————————————
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';

// —   React‑Query ——————————————————————————
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// —   Wallet context ————————————————————————
import { WalletProvider } from '../lib/WalletContext';
import { GameStateProvider } from '../lib/GameStateContext';
import ErrorBoundary from '../components/ErrorBoundary';

const COMMON_ASSETS = [
  '/assets/miner/miner-3.png',
  '/assets/rooms/shack.jpg',
  '/assets/fog.png',
  // Add more as needed
];

function App({ Component, pageProps }: AppProps) {
  // Preload common assets on mount
  useEffect(() => {
    preloadTextures(COMMON_ASSETS);
  }, []);

  // 1. RainbowKit / wagmi config (client‐only)
  const wagmiConfig = React.useMemo(() =>
    getDefaultConfig({
      appName: 'Banana Miners',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'banana-miners',
      chains: [mainnet, polygon, optimism, arbitrum],
      ssr: false,
    }),
  []);
  // 2. React‑Query client (client‐only)
  const queryClient = React.useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={darkTheme()}>
          <WalletProvider>
            <GameStateProvider>
              <Toaster richColors position="top-right" />
              <ErrorBoundary>
                <Component {...pageProps} />
              </ErrorBoundary>
            </GameStateProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

// disable SSR for the entire App so Pixi never runs on server
export default dynamic(() => Promise.resolve(App), { ssr: false });

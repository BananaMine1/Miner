// pages/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';

export default function Home() {
  const { isConnected } = useAccount();
const { openConnectModal } = useConnectModal();
const router = useRouter();
  

  const [bgImage, setBgImage] = useState('/assets/jungle-background.png');
  const [isNight, setIsNight] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);
  const [heroImage, setHeroImage] = useState('/assets/hero-graphic.png');

  const setBackground = (night: boolean) => {
    setIsNight(night);
    setBgImage(night
      ? '/assets/jungle-background-night.png'
      : '/assets/jungle-background.png'
    );
    setHeroImage(night
      ? '/assets/hero-graphic-night.png'
      : '/assets/hero-graphic.png'
    );
  };

  useEffect(() => {
    if (manualOverride === null) {
      const hour = new Date().getHours();
      setBackground(hour >= 18 || hour < 6);
    }
  }, [manualOverride]);

  useEffect(() => {
    const startAudio = () => {
      const audioEl = document.getElementById('bg-music') as HTMLAudioElement;
      if (audioEl) {
        audioEl.volume = 0.5;
        audioEl.play().catch(() => {});
      }
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
    return () => document.removeEventListener('click', startAudio);
  }, []);

  const toggleMode = () => {
    const next = !isNight;
    setManualOverride(next);
    setBackground(next);
  };

  const handleStart = () => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
      router.push('/play');
    }
  };

  return (
    <>
      <Head>
        <title>Banana Miners</title>
        <meta
          name="description"
          content="Mine $BNANA with Jungle Rigs and build your mining empire in a lush jungle setting."
        />
      </Head>

      {/* Background Music */}
      <audio id="bg-music" loop src="/assets/ambient-music.mp3" preload="auto" />

      {/* Day/Night Toggle */}
      <button
        onClick={toggleMode}
        className="fixed top-4 right-4 z-50 bg-yellow-300 text-green-900 font-bold px-4 py-2 rounded shadow hover:scale-105 transition"
      >
        Toggle {isNight ? 'Day' : 'Night'}
      </button>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />

        {/* Fog */}
        {isNight && (
          <div className="fog-container">
            <img src="/assets/fog.png" alt="fog" />
            <img src="/assets/fog.png" alt="fog" />
          </div>
        )}

        {/* Fireflies */}
        {isNight && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="firefly"
                style={{
                  top: `${Math.random() * 90 + 5}%`,
                  left: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Hero + Start Button */}
        <div className="relative w-full max-w-[300px] md:max-w-[400px] xl:max-w-[500px] mx-auto">
          <img src={heroImage} alt="Banana Miners Hero" className="w-full" />

          <img
         src={isNight ? '/assets/start-button-night.png' : '/assets/start-button.png'}
         alt="Start Mining"
         onClick={handleStart}
         className="absolute bottom-[23%] left-1/2 transform -translate-x-1/2 w-[300px] cursor-pointer hover:scale-110 transition"
/>
        </div>
      </div>
    </>
  );
}

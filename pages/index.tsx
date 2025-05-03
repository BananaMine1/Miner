// pages/index.tsx
import React, { useState, useEffect } from 'react';
import PixiLandingBackground from '../components/PixiLandingBackground';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    // Set initial day/night based on time (e.g., 6 PM to 6 AM is night)
    const currentHour = new Date().getHours();
    setIsNight(currentHour >= 18 || currentHour < 6);

    // Optional: Update day/night periodically (e.g., every minute)
    const intervalId = setInterval(() => {
      const updatedHour = new Date().getHours();
      setIsNight(updatedHour >= 18 || updatedHour < 6);
    }, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // --- Audio setup ---
  useEffect(() => {
    const startAudio = () => {
      const audioEl = document.getElementById('bg-music') as HTMLAudioElement | null;
      if (audioEl) {
        audioEl.volume = 0.5;
        audioEl.play().catch(() => {});
      }
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
    return () => document.removeEventListener('click', startAudio);
  }, []);

  const handleStart = () => {
    if (isConnected && address) {
      router.push(`/play/${address}`);
    } else if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <>
      <Head>
        <title>Banana Miners</title>
        <meta name="description" content="Mine $CRROT in a lush jungle setting." />
      </Head>

      {/* Background music element */}
      <audio
        id="bg-music"
        loop
        src="/assets/ambient-music.mp3"
        preload="auto"
      />

      <div className="relative w-screen h-screen overflow-hidden bg-black">
        {/* Pass isNight prop to PixiLandingBackground */}
        {isClient ? <PixiLandingBackground isNight={isNight} /> :
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">Rendering background...</div>
        }

        {/* Main Content Area - Add transform to shift content block higher */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transform -translate-y-16">
          {/* Hero Image */}
          {/*
          <div className="relative w-full max-w-[300px] md:max-w-[400px] xl:max-w-[500px] mx-auto pointer-events-none">
            <img
              src={isNight ? '/assets/hero-graphic-night.png' : '/assets/hero-graphic.png'}
              alt="Banana Miners Hero"
              className="w-full"
            />
          </div>
          */}

          {/* Start Button */}
          <button 
            onClick={handleStart}
            className="absolute left-[39.7%] bottom-20 z-20 pointer-events-auto focus:outline-none hover:scale-110 transition duration-300 ease-in-out"
            aria-label="Start Mining"
          >
             <img
              src={isNight ? '/assets/start-button-night.png' : '/assets/start-button.png'}
              alt="Start Mining Button Graphic"
              className="w-[200px] md:w-[250px] xl:w-[300px]"
            />
          </button>

          {/* Add back temporary toggle button */}
          <button 
            onClick={() => setIsNight(!isNight)}
            className="absolute bottom-4 right-4 bg-yellow-400 text-black p-2 rounded z-30 pointer-events-auto"
          >
            Toggle Day/Night (Temp)
          </button>
        </div>
      </div>
    </>
  );
}

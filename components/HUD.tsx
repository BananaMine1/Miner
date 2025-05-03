import React, { useState, useEffect } from 'react';
import { useGameState } from '../lib/GameStateContext';
import { useWallet } from '../lib/WalletContext';
import { useWattPrice } from '../hooks/useWattPrice';
import { sanitizeInput } from '../lib/sanitize';
import ProfileModal from './ProfileModal';
import WalletModal from './WalletModal';
import WattPriceDisplay from './WattPriceDisplay';
import { useMediaQuery } from 'react-responsive';
import MobileHUDMenu from './MobileHUDMenu';
import AchievementModal from './AchievementModal';
import { playMusic, stopMusic, setMusicVolume, playSFX } from '../lib/audioManager';
import MetaUpgradeModal from './MetaUpgradeModal';

interface HUDProps {
  onOpenRoomModal?: () => void;
  usedWatts: number;
  maxWatts: number;
  yourHashrate: number;
  earningsPerSecond: number;
  wattPrice?: number;
  unclaimed?: number;
  onClaim?: () => void;
  loadingUnclaimed?: boolean;
  hashPowerPercent?: number;
  totalNetworkHashrate?: number;
  dailyEarnings?: number;
}

export const HUD: React.FC<HUDProps> = ({ onOpenRoomModal = () => {}, usedWatts, maxWatts, yourHashrate, earningsPerSecond, wattPrice, unclaimed, onClaim, loadingUnclaimed, hashPowerPercent, totalNetworkHashrate, dailyEarnings }) => {
  const { address, connect, disconnect } = useWallet();
  const {
    profile,
    bnana,
    xp,
    unclaimed: gameStateUnclaimed,
    dailyStreak,
    canClaimStreak,
    loading,
    error,
    claimRewards,
    updateProfile,
    refresh,
  } = useGameState();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const {
    currentPrice,
    delta,
    loading: wattLoading,
    refresh: refreshWattPrice,
  } = useWattPrice();

  // Live unclaimed BNANA counter
  const [liveUnclaimed, setLiveUnclaimed] = useState(gameStateUnclaimed);
  useEffect(() => {
    setLiveUnclaimed(gameStateUnclaimed); // reset when unclaimed changes (e.g. after claim)
  }, [gameStateUnclaimed]);
  useEffect(() => {
    if (earningsPerSecond > 0) {
      const interval = setInterval(() => {
        setLiveUnclaimed(prev => prev + earningsPerSecond / 10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [earningsPerSecond]);

  function handleOpenLeaderboard() {
    window.location.href = '/leaderboard';
  }

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const handleWalletButtonClick = () => {
    if (address) {
      setShowWalletModal(true);
    } else {
      connect();
    }
  };

  const [musicOn, setMusicOn] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(0.3);

  useEffect(() => {
    if (musicOn) {
      playMusic();
    } else {
      stopMusic();
    }
    setMusicVolume(musicVolume);
  }, [musicOn, musicVolume]);

  const handleMusicToggle = () => {
    setMusicOn((on) => !on);
    playSFX('click');
  };
  const handleMusicVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolumeState(vol);
    setMusicVolume(vol);
  };

  // Wrap claimRewards to play SFX
  const handleClaimRewards = async () => {
    try {
      await claimRewards();
      playSFX('claim');
    } catch {
      playSFX('error');
    }
  };

  // Track if music has been started by user interaction
  const [musicStarted, setMusicStarted] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (musicStarted) return;
    const startMusicOnFirstInteraction = () => {
      if (!musicStarted) {
        setMusicOn(true);
        setMusicStarted(true);
      }
    };
    window.addEventListener('pointerdown', startMusicOnFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startMusicOnFirstInteraction);
    };
  }, [musicStarted]);

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showMetaUpgradeModal, setShowMetaUpgradeModal] = useState(false);

  if (loading) {
    return null;
  }
  if (error) {
    return <div className="fixed top-0 left-0 w-full z-50 bg-red-900 bg-opacity-90 flex items-center justify-center text-white text-xl">{error}</div>;
  }

  // Desktop HUD (consolidated AAA bar)
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-30 flex flex-col md:flex-row justify-between items-center px-2 py-2 bg-[#FFF7E0] bg-opacity-95 shadow-lg rounded-b-2xl gap-2 pointer-events-auto border-b-4 border-yellow-300">
        {/* Left: Profile/Avatar and Username */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full border-2 border-yellow-400 overflow-hidden cursor-pointer flex-shrink-0"
            onClick={() => { setShowProfileModal(true); playSFX('click'); }}
            title="Edit profile"
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">🐰</div>
            )}
          </div>
          <span
            className="font-bold text-[#7C4F1D] truncate max-w-[120px] cursor-pointer hover:underline"
            onClick={() => { setShowProfileModal(true); playSFX('click'); }}
            title="Edit profile"
          >
            {sanitizeInput(profile?.username || 'New Farmer')}
          </span>
        </div>
        {/* Center: Stats */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-base font-bold">
          <span className="flex items-center gap-1 text-[#7C4F1D]" title="CRROT Balance">🥕 {bnana.toFixed(2)}</span>
          <span className="flex items-center gap-1 text-green-200" title="Total Bunny Power">⚡ {yourHashrate}</span>
          <span className="flex items-center gap-1 text-blue-300" title="Carrot Points (XP)">⭐ {xp}</span>
          <button
            onClick={onClaim ? onClaim : handleClaimRewards}
            className={`px-3 py-1 rounded font-bold transition ${unclaimed > 0 ? 'bg-yellow-400 text-green-900 hover:scale-105' : 'bg-gray-700 text-gray-400'} ml-2`}
            disabled={loadingUnclaimed || unclaimed <= 0}
            title={loadingUnclaimed ? 'Loading...' : unclaimed > 0 ? `Claim ${unclaimed.toFixed(2)} 🥕` : 'No unclaimed CRROT'}
          >
            Claim 🥕 {unclaimed > 0 ? unclaimed.toFixed(2) : ''}
          </button>
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAchievementModal(true)}
            className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xl font-bold shadow hover:scale-110 transition"
            aria-label="Achievements"
            title="Achievements"
          >
            🏆
          </button>
          <button
            onClick={() => setShowMetaUpgradeModal(true)}
            className="bg-blue-400 text-blue-900 px-2 py-1 rounded text-xl font-bold shadow hover:scale-110 transition"
            aria-label="Upgrades"
            title="Upgrades"
          >
            🛠️
          </button>
          <button
            onClick={handleOpenLeaderboard}
            className="bg-yellow-400 text-green-900 px-2 py-1 rounded text-xl font-bold shadow hover:scale-110 transition"
            aria-label="Leaderboard"
            title="Leaderboard"
          >
            🏅
          </button>
          <button
            onClick={() => { onOpenRoomModal(); playSFX('click'); }}
            className="bg-yellow-400 text-green-900 px-2 py-1 rounded text-xl font-bold shadow hover:scale-110 transition"
            aria-label="Room"
            title="Room"
          >
            🏠
          </button>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="bg-yellow-400 text-green-900 px-2 py-1 rounded text-xl font-bold shadow hover:scale-110 transition"
            aria-label="Menu"
            title="Menu"
          >
            ☰
          </button>
        </div>
      </div>
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        wallet={address || ''}
        initialUsername={profile?.username || null}
        initialAvatarUrl={profile?.avatarUrl || null}
        initialBio={profile?.bio || null}
        refreshProfile={refresh}
      />
      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        wallet={address || ''}
        onDisconnect={disconnect}
      />
      <AchievementModal open={showAchievementModal} onClose={() => setShowAchievementModal(false)} />
      <MetaUpgradeModal open={showMetaUpgradeModal} onClose={() => setShowMetaUpgradeModal(false)} />
      {showMobileMenu && (
        <MobileHUDMenu
          onClose={() => setShowMobileMenu(false)}
          profile={profile}
          address={address}
          shortAddress={shortAddress}
          bnana={bnana}
          usedWatts={usedWatts}
          maxWatts={maxWatts}
          yourHashrate={yourHashrate}
          liveUnclaimed={unclaimed}
          canClaimStreak={canClaimStreak}
          onClaim={onClaim ? onClaim : handleClaimRewards}
          onOpenRoomModal={onOpenRoomModal}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenWallet={() => setShowWalletModal(true)}
          onOpenLeaderboard={handleOpenLeaderboard}
        />
      )}
    </>
  );
};

export default HUD; 
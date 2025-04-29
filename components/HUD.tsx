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
import LoadingScreen from './LoadingScreen';

interface HUDProps {
  onOpenRoomModal?: () => void;
  usedWatts: number;
  maxWatts: number;
  yourHashrate: number;
  earningsPerSecond: number;
}

export const HUD: React.FC<HUDProps> = ({ onOpenRoomModal = () => {}, usedWatts, maxWatts, yourHashrate, earningsPerSecond }) => {
  const { address, connect, disconnect } = useWallet();
  const {
    profile,
    bnana,
    unclaimed,
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
  const [liveUnclaimed, setLiveUnclaimed] = useState(unclaimed);
  useEffect(() => {
    setLiveUnclaimed(unclaimed); // reset when unclaimed changes (e.g. after claim)
  }, [unclaimed]);
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

  if (loading) {
    return <LoadingScreen />;
  }
  if (error) {
    return <div className="fixed top-0 left-0 w-full z-50 bg-red-900 bg-opacity-90 flex items-center justify-center text-white text-xl">{error}</div>;
  }

  // Mobile HUD: logo, BNANA, menu button
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 w-full z-20 flex items-center justify-between px-2 py-2 bg-black bg-opacity-70 pointer-events-auto">
        <img src="/assets/logo.png" alt="Banana Miners Logo" className="h-8 w-auto" />
        <span className="flex items-center gap-1 text-yellow-200 font-bold text-base">
          <span role="img" aria-label="BNANA">🍌</span>
          {bnana.toFixed(2)}
        </span>
        <button
          className="bg-yellow-400 text-green-900 px-3 py-1 rounded text-xl font-bold shadow hover:scale-105 transition"
          onClick={() => setShowMobileMenu(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
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
            liveUnclaimed={liveUnclaimed}
            canClaimStreak={canClaimStreak}
            onClaim={claimRewards}
            onOpenRoomModal={onOpenRoomModal}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenWallet={() => setShowWalletModal(true)}
            onOpenLeaderboard={handleOpenLeaderboard}
          />
        )}
      </div>
    );
  }

  // Desktop HUD (unchanged)
  return (
    <div className="fixed top-0 left-0 w-full z-20 flex flex-col md:flex-row justify-end p-2 md:p-3 gap-2 md:gap-4 pointer-events-none">
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
      <div className="flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 py-2 sm:py-3 bg-transparent text-white text-sm font-bold w-full gap-2 sm:gap-4 pointer-events-auto">
        {/* Left: Logo + user profile */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mb-2 sm:mb-0">
          <img src="/assets/logo.png" alt="Banana Miners Logo" className="h-10 sm:h-14 w-auto" />
          {/* Avatar (clickable) */}
          <div
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-yellow-400 overflow-hidden cursor-pointer flex-shrink-0"
            onClick={() => setShowProfileModal(true)}
            title="Edit profile"
            style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">🐵</div>
            )}
          </div>
          {/* Username (clickable) */}
          {profile?.username && (
            <span
              className="cursor-pointer hover:underline truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px]"
              onClick={() => setShowProfileModal(true)}
              title="Edit profile"
            >
              {sanitizeInput(profile.username)}
            </span>
          )}
          {/* Wallet button */}
          <button
            onClick={handleWalletButtonClick}
            className="ml-1 sm:ml-2 bg-yellow-400 text-green-900 px-2 py-1 rounded hover:scale-105 transition flex-shrink-0 text-xs sm:text-sm"
          >
            {address ? shortAddress : 'Connect Wallet'}
          </button>
        </div>
        {/* Right: stats & actions */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <span className="flex-shrink-0">🔌 {usedWatts}/{maxWatts}W</span>
          <span className="flex-shrink-0">💰 {bnana.toFixed(2)} $BNANA</span>
          <WattPriceDisplay
            currentPrice={currentPrice}
            delta={delta}
            loading={wattLoading}
            onRefresh={refreshWattPrice}
          />
          {/* Leaderboard Button */}
          <button
            onClick={handleOpenLeaderboard}
            className="bg-yellow-400 text-green-900 px-2 sm:px-3 py-1 rounded hover:scale-105 transition flex-shrink-0 text-xs sm:text-sm"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onOpenRoomModal}
            className="bg-yellow-400 text-green-900 px-2 sm:px-3 py-1 rounded hover:scale-105 transition flex-shrink-0 text-xs sm:text-sm"
          >
            Room Info
          </button>
          <button
            onClick={claimRewards}
            className="bg-yellow-400 text-green-900 px-2 sm:px-3 py-1 rounded hover:scale-105 transition flex-shrink-0 text-xs sm:text-sm"
          >
            Claim {liveUnclaimed > 0 ? `+${liveUnclaimed.toFixed(2)}` : ''}
          </button>
          {canClaimStreak && (
            <button
              onClick={() => {}}
              className="bg-yellow-400 text-green-900 px-2 sm:px-3 py-1 rounded hover:scale-105 transition flex-shrink-0 text-xs sm:text-sm"
            >
              🌞 Claim Daily (+1)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HUD; 
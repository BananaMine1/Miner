import React, { useState, useEffect } from 'react';
import { useGameState } from '../lib/GameStateContext';
import { useWallet } from '../lib/WalletContext';
import { useWattPrice } from '../hooks/useWattPrice';
import { sanitizeInput } from '../lib/sanitize';
import ProfileModal from './ProfileModal';
import WalletModal from './WalletModal';
import WattPriceDisplay from './WattPriceDisplay';

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
  } = useGameState();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

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
    return <div className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-60 flex items-center justify-center text-white text-xl">Loading game state…</div>;
  }
  if (error) {
    return <div className="fixed top-0 left-0 w-full z-50 bg-red-900 bg-opacity-90 flex items-center justify-center text-white text-xl">{error}</div>;
  }

  return (
    <div className="absolute top-0 left-0 w-full z-20 flex flex-col md:flex-row justify-end p-3 gap-4">
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        wallet={address || ''}
        initialUsername={profile?.username || null}
        initialAvatarUrl={profile?.avatarUrl || null}
        initialBio={profile?.bio || null}
        onProfileUpdate={(newUsername, newAvatarUrl, newBio) => {
          updateProfile({ username: newUsername, avatarUrl: newAvatarUrl, bio: newBio });
        }}
      />
      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        wallet={address || ''}
        onDisconnect={disconnect}
      />
      <div className="flex justify-between items-center px-6 py-4 bg-transparent text-white text-sm font-bold w-full overflow-x-auto">
        {/* Left: Logo + user profile */}
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Banana Miners Logo" className="h-14 w-auto" />
          {/* Avatar (clickable) */}
          <div
            className="w-10 h-10 rounded-full border-2 border-yellow-400 overflow-hidden cursor-pointer flex-shrink-0"
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
              className="cursor-pointer hover:underline truncate max-w-[120px] md:max-w-[200px]"
              onClick={() => setShowProfileModal(true)}
              title="Edit profile"
            >
              {sanitizeInput(profile.username)}
            </span>
          )}
          {/* Wallet button */}
          <button
            onClick={handleWalletButtonClick}
            className="ml-2 bg-yellow-400 text-green-900 px-2 py-1 rounded hover:scale-105 transition flex-shrink-0"
          >
            {address ? shortAddress : 'Connect Wallet'}
          </button>
        </div>
        {/* Right: stats & actions */}
        <div className="space-x-4 flex items-center flex-wrap">
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
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition flex-shrink-0"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onOpenRoomModal}
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition flex-shrink-0"
          >
            Room Info
          </button>
          <button
            onClick={claimRewards}
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition flex-shrink-0"
          >
            Claim {liveUnclaimed > 0 ? `+${liveUnclaimed.toFixed(2)}` : ''}
          </button>
          {canClaimStreak && (
            <button
              onClick={() => {}}
              className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition flex-shrink-0"
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
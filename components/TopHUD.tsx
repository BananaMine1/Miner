// components/TopHUD.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useWallet } from '../lib/WalletContext';
import { useWattPrice } from '../hooks/useWattPrice';

interface TopHUDProps {
  bnana: number;
  powerUsed: number;
  maxPower: number;
  unclaimed: number;
  wattRate: number;
  dailyStreak: number;
  canClaimStreak: boolean;
  onOpenRoomModal: () => void;
  onClaimRewards: () => void;
  onClaimStreak: () => void;
  onOpenAccount: () => void;        // <-- NEW
}

function ProfileModal({
  open,
  onClose,
  wallet,
  initialUsername,
  initialAvatarUrl,
  initialBio,
  onProfileUpdate,
}: {
  open: boolean;
  onClose: () => void;
  wallet: string;
  initialUsername: string | null;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  onProfileUpdate: (username: string, avatarUrl: string | null, bio: string) => void;
}) {
  const [username, setUsername] = useState(initialUsername || '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bio, setBio] = useState(initialBio || '');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(initialUsername || '');
    setAvatarUrl(initialAvatarUrl);
    setBio(initialBio || '');
    setFile(null);
    setError(null);
  }, [open, initialUsername, initialAvatarUrl, initialBio]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    setError(null);
    let newAvatarUrl = avatarUrl;
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${wallet}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarUrl = data.publicUrl;
      }
      const { error: updateError } = await supabase
        .from('players')
        .update({ username, avatar_url: newAvatarUrl, bio })
        .eq('wallet', wallet);
      if (updateError) throw updateError;
      onProfileUpdate(username, newAvatarUrl, bio);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white text-jungleGreen rounded-lg shadow-lg p-8 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl">🐵</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="mb-2"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={uploading}
        />
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 mb-1 resize-none"
          placeholder="Short bio (max 200 chars)"
          value={bio}
          onChange={e => {
            if (e.target.value.length <= 200) setBio(e.target.value);
          }}
          maxLength={200}
          rows={3}
          disabled={uploading}
        />
        <div className="text-right text-xs text-gray-500 mb-2">{bio.length}/200</div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          className="w-full bg-yellow-400 text-green-900 font-bold py-2 rounded hover:scale-105 transition"
          onClick={handleSave}
          disabled={uploading}
        >
          {uploading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function TopHUD({
  bnana,
  powerUsed,
  maxPower,
  unclaimed,
  wattRate,
  dailyStreak,
  canClaimStreak,
  onOpenRoomModal,
  onClaimRewards,
  onClaimStreak,
  onOpenAccount,                    
}: TopHUDProps) {
  const { address, connect } = useWallet();        
  const [isHydrated, setIsHydrated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Watt price oracle
  const {
    currentPrice,
    yesterdayPrice,
    delta,
    loading: wattLoading,
    refresh: refreshWattPrice,
  } = useWattPrice();

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    if (!address) return;
    supabase
      .from('players')
      .select('username, avatar_url, bio')
      .eq('wallet', address)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setAvatarUrl(data.avatar_url);
          setBio(data.bio);
          if (!data.username || data.username === 'New Miner' || !data.bio) {
            setShowProfileModal(true);
          }
        }
      });
  }, [address]);

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <>
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        wallet={address || ''}
        initialUsername={username}
        initialAvatarUrl={avatarUrl}
        initialBio={bio}
        onProfileUpdate={(newUsername, newAvatarUrl, newBio) => {
          setUsername(newUsername);
          setAvatarUrl(newAvatarUrl);
          setBio(newBio);
        }}
      />
      <div className="flex justify-between items-center px-6 py-4 bg-transparent text-white text-sm font-bold w-full overflow-x-auto">
        {/* Left: Logo + user profile */}
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Banana Miners Logo" className="h-14 w-auto" />

          {/* Avatar (clickable) */}
          <div
            className="w-10 h-10 rounded-full border-2 border-yellow-400 overflow-hidden cursor-pointer"
            onClick={() => setShowProfileModal(true)}
            title="Edit profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">🐵</div>
            )}
          </div>

          {/* Username (clickable) */}
          {username && (
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setShowProfileModal(true)}
              title="Edit profile"
            >
              {username}
            </span>
          )}

          {/* Wallet button */}
          <button
            onClick={() => (address ? onOpenAccount() : connect())}
            className="ml-2 bg-yellow-400 text-green-900 px-2 py-1 rounded hover:scale-105 transition"
          >
            {address ? shortAddress : 'Connect Wallet'}
          </button>
        </div>

        {/* Right: stats & actions */}
        <div className="space-x-4 flex items-center flex-wrap">
          <span>🔌 {isHydrated ? `${powerUsed}W / ${maxPower}W` : '0W / 0W'}</span>
          <span>💰 {isHydrated ? bnana.toFixed(2) : '0.00'} $BNANA</span>

          {/* Watt price oracle display */}
          <span
            className="flex items-center gap-1"
            title="Current watt price (BNANA per kWh). Updates daily via oracle."
          >
            🔋
            {wattLoading ? (
              <span className="inline-block animate-spin h-4 w-4 border-t-2 border-yellow-400 border-solid rounded-full"></span>
            ) : currentPrice !== null ? (
              <>
                {currentPrice} <span className="text-yellow-300">BNANA/kWh</span>
                {delta !== null && delta !== 0 && (
                  <span
                    className={
                      delta > 0
                        ? 'ml-1 text-red-400 font-bold'
                        : 'ml-1 text-green-400 font-bold'
                    }
                    title={
                      delta > 0
                        ? `Up ${delta} since yesterday`
                        : `Down ${Math.abs(delta)} since yesterday`
                    }
                  >
                    {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                  </span>
                )}
                <button
                  onClick={refreshWattPrice}
                  className="ml-1 px-1 py-0.5 rounded bg-yellow-400 text-green-900 text-xs font-bold hover:scale-105 transition"
                  title="Refresh watt price (for testing)"
                  style={{ lineHeight: 1 }}
                >
                  ↻
                </button>
              </>
            ) : (
              <span className="text-gray-400">--</span>
            )}
          </span>

          <button
            onClick={onOpenRoomModal}
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition"
          >
            Room Info
          </button>

          <button
            onClick={onClaimRewards}
            className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition"
          >
            Claim {isHydrated ? `+${unclaimed.toFixed(2)}` : ''}
          </button>

          {canClaimStreak && (
            <button
              onClick={onClaimStreak}
              className="bg-yellow-400 text-green-900 px-3 py-1 rounded hover:scale-105 transition"
            >
              🌞 Claim Daily (+1)
            </button>
          )}
        </div>
      </div>
    </>
  );
}

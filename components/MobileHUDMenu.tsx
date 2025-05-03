import React from 'react';

export default function MobileHUDMenu({
  onClose,
  profile,
  address,
  shortAddress,
  bnana,
  usedWatts,
  maxWatts,
  yourHashrate,
  liveUnclaimed,
  canClaimStreak,
  onClaim,
  onOpenRoomModal,
  onOpenProfile,
  onOpenWallet,
  onOpenLeaderboard,
}: {
  onClose: () => void;
  profile: any;
  address: string;
  shortAddress: string | null;
  bnana: number;
  usedWatts: number;
  maxWatts: number;
  yourHashrate: number;
  liveUnclaimed: number;
  canClaimStreak: boolean;
  onClaim: () => void;
  onOpenRoomModal: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenLeaderboard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-start pt-8 px-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-yellow-300 text-3xl font-bold"
        aria-label="Close Menu"
      >
        ✕
      </button>
      {/* Profile */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-16 h-16 rounded-full border-2 border-yellow-400 overflow-hidden mb-2"
          onClick={onOpenProfile}
          title="Edit profile"
        >
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl">🐵</div>
          )}
        </div>
        <div className="text-yellow-200 font-bold text-lg mb-1">{profile?.username || shortAddress || 'Player'}</div>
        <div className="text-green-200 text-xs mb-1">{address}</div>
        <button
          onClick={onOpenWallet}
          className="bg-yellow-400 text-green-900 px-4 py-1 rounded font-bold text-sm mt-1"
        >
          Wallet
        </button>
      </div>
      {/* Stats */}
      <div className="w-full flex flex-col items-center gap-2 mb-6">
        <div className="text-yellow-300 text-xl font-bold flex items-center gap-2">
          {/* TODO: Replace with CRROT icon */}
          {/* <img src="/assets/ui/bnana.png" alt="$BNANA" className="w-6 h-6 inline-block" /> */}
          {bnana.toFixed(2)} $CRROT
        </div>
        <div className="text-green-200 text-base">🔌 {usedWatts}/{maxWatts}W</div>
        <div className="text-green-200 text-base">💻 {yourHashrate} GH/s</div>
      </div>
      {/* Actions */}
      <div className="w-full flex flex-col gap-4 mb-8">
        <button
          onClick={onClaim}
          className="w-full bg-yellow-400 text-green-900 py-3 rounded-lg font-bold text-lg shadow-lg"
        >
          Claim {liveUnclaimed > 0 ? `+${liveUnclaimed.toFixed(2)}` : ''}
        </button>
        {canClaimStreak && (
          <button
            onClick={() => {}}
            className="w-full bg-yellow-400 text-green-900 py-3 rounded-lg font-bold text-lg shadow-lg"
          >
            🌞 Claim Daily (+1)
          </button>
        )}
        <button
          onClick={onOpenRoomModal}
          className="w-full bg-yellow-400 text-green-900 py-3 rounded-lg font-bold text-lg shadow-lg"
        >
          Room Info
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="w-full bg-yellow-400 text-green-900 py-3 rounded-lg font-bold text-lg shadow-lg"
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={onOpenProfile}
          className="w-full bg-green-800 text-yellow-200 py-3 rounded-lg font-bold text-lg shadow-lg border border-yellow-400"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
} 
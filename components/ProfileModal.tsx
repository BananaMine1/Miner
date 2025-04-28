import React, { useState, useEffect, useRef } from 'react';
import { sanitizeInput } from '../lib/sanitize';
import { supabase } from '../lib/supabaseClient';

const CSRF_TOKEN = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'banana-csrf-demo-token';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  wallet: string;
  initialUsername: string | null;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  refreshProfile?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  wallet,
  initialUsername,
  initialAvatarUrl,
  initialBio,
  refreshProfile,
}) => {
  const [username, setUsername] = useState(initialUsername || '');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bio, setBio] = useState(initialBio || '');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUsername(initialUsername || '');
    setAvatarUrl(initialAvatarUrl);
    setBio(initialBio || '');
    setFile(null);
    setError(null);
    setEditMode(!(initialUsername && initialUsername.length >= 2));
    setUsernameTaken(false);
  }, [open, initialUsername, initialAvatarUrl, initialBio]);

  // Focus trap for accessibility
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  // Live username uniqueness check (debounced)
  useEffect(() => {
    if (!editMode) return;
    if (!username || username.length < 2) {
      setUsernameTaken(false);
      return;
    }
    setCheckingUsername(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('players')
        .select('wallet')
        .eq('username', username)
        .neq('wallet', wallet)
        .maybeSingle();
      setUsernameTaken(!!data);
      setCheckingUsername(false);
    }, 400);
    // eslint-disable-next-line
  }, [username, wallet, editMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (usernameTaken) {
      setError('This username is taken.');
      return;
    }
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
        setAvatarUrl(newAvatarUrl);
      }
      if (!window.ethereum || !wallet) {
        setError('Wallet not connected.');
        setUploading(false);
        return;
      }
      const message = `Update profile for ${wallet} at ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet],
      });
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': CSRF_TOKEN,
        },
        body: JSON.stringify({
          wallet,
          username,
          bio,
          avatar_url: newAvatarUrl,
          signature,
          message,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to update profile.');
      } else {
        setEditMode(false);
        setUsername(username);
        setBio(bio);
        setAvatarUrl(newAvatarUrl);
        if (refreshProfile) refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  // Keyboard: ESC closes modal
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-200 animate-fadeIn pointer-events-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
      tabIndex={-1}
    >
      <div
        className="bg-white text-jungleGreen rounded-lg shadow-lg p-8 w-full max-w-sm relative transform transition-transform duration-200 animate-scaleIn pointer-events-auto outline-none"
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={0}
      >
        <button
          className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close Profile Modal"
        >
          ×
        </button>
        {editMode ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 mb-2 flex-shrink-0">
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
                aria-label="Upload avatar"
              />
            </div>
            <input
              type="text"
              className={`w-full border ${usernameTaken ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 mb-2`}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={uploading}
              aria-label="Username"
            />
            {checkingUsername && <div className="text-xs text-gray-500 mb-1">Checking username…</div>}
            {usernameTaken && <div className="text-xs text-red-500 mb-1">This username is taken</div>}
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
              aria-label="Bio"
            />
            <div className="text-right text-xs text-gray-500 mb-2">{bio.length}/200</div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              className="w-full bg-yellow-400 text-green-900 font-bold py-2 rounded hover:scale-105 transition"
              onClick={handleSave}
              disabled={uploading || usernameTaken}
              aria-label="Save Profile"
            >
              {uploading ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 mb-2 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl">🐵</div>
                )}
              </div>
            </div>
            <div className="mb-2 text-center">
              <div className="text-lg font-bold text-yellow-700">{username}</div>
              <div className="text-green-900 text-sm break-words">{bio}</div>
            </div>
            <button
              className="w-full bg-yellow-400 text-green-900 font-bold py-2 rounded hover:scale-105 transition mt-4"
              onClick={() => setEditMode(true)}
              aria-label="Edit Profile"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal; 
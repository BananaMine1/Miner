import React, { useState, useEffect } from 'react';
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
  // onProfileUpdate: (username: string, avatarUrl: string | null, bio: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  wallet,
  initialUsername,
  initialAvatarUrl,
  initialBio,
  // onProfileUpdate,
}) => {
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
        setAvatarUrl(newAvatarUrl);
      }
      // Get the current session JWT from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      if (!jwt) {
        setError('Not authenticated. Please log in.');
        setUploading(false);
        return;
      }
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'x-csrf-token': CSRF_TOKEN,
        },
        body: JSON.stringify({
          username,
          bio,
          avatar_url: newAvatarUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to update profile.');
      } else {
        // onProfileUpdate(username, newAvatarUrl, bio);
        onClose();
      }
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
        <div className="mb-2 text-green-900 text-xs">
          <div><b>Preview Username:</b> {sanitizeInput(username)}</div>
          <div><b>Preview Bio:</b> {sanitizeInput(bio)}</div>
        </div>
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
};

export default ProfileModal; 
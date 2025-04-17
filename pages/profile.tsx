import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';
import dynamic from 'next/dynamic';

function Profile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet] = useState('demo-wallet-id'); // Replace with actual wallet later

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const fileExt = file.name.split('.').pop();
    const fileName = `${wallet}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
  
    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      return;
    }
  
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (data?.publicUrl) {
      setAvatarUrl(data.publicUrl);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('players').upsert(
      [
        {
          wallet,
          username,
          bio,
          avatar_url: avatarUrl,
        },
      ],
      {
        onConflict: 'wallet',
      }
    );
  
    if (error) {
      console.error('Failed to save profile:', error.message);
    } else {
      alert('Profile saved!');
    }
  
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Profile | Banana Miners</title>
      </Head>

      <div className="min-h-screen bg-green-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Update Profile</h1>

        <div className="flex flex-col space-y-4 w-full max-w-md">
          <label>
            Username:
            <input
              className="w-full px-3 py-2 text-black rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Bio:
            <textarea
              className="w-full px-3 py-2 text-black rounded"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <label>
            Avatar:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar preview" className="w-32 h-32 rounded-full" />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-yellow-400 text-green-900 font-bold px-4 py-2 rounded hover:scale-105 transition"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(Profile), { ssr: false });

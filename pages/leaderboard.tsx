// pages/leaderboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

interface Player {
  id: string;
  wallet: string;
  total_earned: number;
  hashrate: number;
  players: {
    username: string;
    avatar_url: string;
  };
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
  
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, wallet, total_earned, hashrate, players(username, avatar_url)')
      .order('total_earned', { ascending: false })
      .range(page * 20, page * 20 + 19);
  
    if (error) {
      console.error('Error fetching leaderboard:', error.message);
      setLoading(false);
      return;
    }
  
    const merged = data.map((entry) => ({
      id: entry.id,
      wallet: entry.wallet,
      total_earned: entry.total_earned,
      hashrate: entry.hashrate,
      username: entry.players?.username || 'Unknown',
      avatar_url: entry.players?.avatar_url || null,
    }));
  
    setPlayers((prev) => [...prev, ...merged] as Player[]);
    setLoading(false);
  };
  
  

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const topThree = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <>
      <Head>
        <title>Leaderboard | Banana Miners</title>
      </Head>
      <div
        className="w-screen h-screen bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/assets/backgrounds/leaderboard.png')" }}
      >
        {/* 🥇🥈🥉 Top 3 Players */}
        <div className="absolute top-[19.5%] left-[20%] text-center w-[12%]">
          <div className="text-yellow-300 font-bold text-sm mb-1">#2</div>
          {topThree[1]?.players?.avatar_url && (
            <img src={topThree[1].players.avatar_url} className="mx-auto w-24 h-24 rounded-full border border-yellow-300 mb-1" />
          )}
          <div className="text-lg font-bold">{topThree[1]?.players?.username}</div>
          <div className="text-xs text-yellow-100">{topThree[1]?.total_earned.toFixed(2)} $BNANA</div>
        </div>

        <div className="absolute top-[19.5%] left-[39.63%] text-center w-[12%]">
          <div className="text-yellow-300 font-bold text-sm mb-1">#1</div>
          {topThree[0]?.players?.avatar_url && (
            <img src={topThree[0].players.avatar_url} className="mx-auto w-24 h-24 rounded-full border border-yellow-300 mb-1" />
          )}
          <div className="text-lg font-bold">{topThree[0]?.players?.username}</div>
          <div className="text-xs text-yellow-100">{topThree[0]?.total_earned.toFixed(2)} $BNANA</div>
        </div>

        <div className="absolute top-[19.5%] left-[58.8%] text-center w-[12%]">
          <div className="text-yellow-300 font-bold text-sm mb-1">#3</div>
          {topThree[2]?.players?.avatar_url && (
            <img src={topThree[2].players.avatar_url} className="mx-auto w-24 h-24 rounded-full border border-yellow-300 mb-1" />
          )}
          <div className="text-lg font-bold">{topThree[2]?.players?.username}</div>
          <div className="text-xs text-yellow-100">{topThree[2]?.total_earned.toFixed(2)} $BNANA</div>
        </div>

        {/* 🔽 Scrolling List */}
        <div className="absolute bottom-[27%] left-[45.2%] transform -translate-x-1/2 w-[52%] max-h-[30%] bg-black/20 rounded-md p-4 overflow-y-auto">
          {others.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between border-b border-yellow-900 py-1 text-sm text-yellow-200"
            >
              <div className="flex items-center gap-2">
                {player.players?.avatar_url && (
                  <img src={player.players.avatar_url} className="w-6 h-6 rounded-full border border-yellow-300" />
                )}
                <span>#{idx + 4} {player.players?.username}</span>
              </div>
              <span>{player.total_earned.toFixed(2)} $BNANA</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

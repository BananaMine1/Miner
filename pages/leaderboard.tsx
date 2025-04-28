// pages/leaderboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { sanitizeInput } from '../lib/sanitize';
import leaderboardBg from '../public/assets/backgrounds/leaderboard.png';
import { fetchTopPlayers } from '../hooks/useLeaderboard';

interface Player {
  id: string;
  wallet: string;
  total_earned: number;
  hashrate: number;
  players: Array<{
    username: string;
    avatar_url: string;
  }>;
  username?: string;
  avatar_url?: string;
}

function Medal({ rank }: { rank: number }) {
  const colors = [
    'bg-yellow-400 text-yellow-900', // Gold
    'bg-gray-400 text-gray-900',     // Silver
    'bg-orange-700 text-yellow-100', // Bronze
  ];
  return (
    <span className={`inline-block w-8 h-8 rounded-full font-bold flex items-center justify-center text-lg border-2 border-yellow-900 shadow ${colors[rank - 1]}`}>{rank}</span>
  );
}

function Leaderboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const AVATAR_PLACEHOLDER = '/assets/avatar-placeholder.png';

  useEffect(() => {
    setLoading(true);
    fetchTopPlayers(100).then((data) => {
      setPlayers(data || []);
      setLoading(false);
    });
  }, []);

  const topThree = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <>
      <Head>
        <title>Leaderboard | Banana Miners</title>
      </Head>
      <div className="w-full h-full min-h-screen min-w-screen flex items-center justify-center bg-black text-white" style={{ overflow: 'hidden' }}>
        <div
          className="relative"
          style={{
            width: '100vw',
            height: '56.25vw', // 16:9 aspect ratio (1080/1920 = 0.5625)
            maxWidth: '1920px',
            maxHeight: '1080px',
            aspectRatio: '16/9',
          }}
        >
          <img
            src="/assets/backgrounds/leaderboard2.png"
            alt="Leaderboard background"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none', userSelect: 'none', objectFit: 'fill' }}
            draggable={false}
          />
          {/* Top 3 - Each absolutely positioned for pixel-perfect placement */}
          {/* Silver (#2) */}
          <div
            className="absolute"
            style={{
              left: '37%', // user custom
              top: '39%',
              width: '12%',
              textAlign: 'center',
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <img
                src={topThree[1]?.avatar_url || AVATAR_PLACEHOLDER}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                alt={(topThree[1]?.username || topThree[1]?.wallet) + ' avatar'}
                className="w-14 h-14 rounded-full border-4 border-yellow-400 bg-green-900"
              />
              <span className="text-base font-bold text-yellow-200 truncate">{sanitizeInput(topThree[1]?.username || topThree[1]?.wallet?.slice(0, 8) || 'Unknown')}</span>
              <div style={{ minWidth: 24 }} />
              {topThree[1]?.hashrate && (
                <span className="text-base text-green-200 font-mono ml-4">{topThree[1].hashrate} GH/s</span>
              )}
            </div>
          </div>

          {/* Gold (#1) */}
          <div
            className="absolute"
            style={{
              left: '37%', // user custom
              top: '29.8%',
              width: '12%',
              textAlign: 'center',
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <img
                src={topThree[0]?.avatar_url || AVATAR_PLACEHOLDER}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                alt={(topThree[0]?.username || topThree[0]?.wallet) + ' avatar'}
                className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-green-900"
              />
              <span className="text-lg font-bold text-yellow-200 truncate">{sanitizeInput(topThree[0]?.username || topThree[0]?.wallet?.slice(0, 8) || 'Unknown')}</span>
              <div style={{ minWidth: 32 }} />
              {topThree[0]?.hashrate && (
                <span className="text-lg text-green-200 font-mono ml-4">{topThree[0].hashrate} GH/s</span>
              )}
            </div>
          </div>

          {/* Bronze (#3) */}
          <div
            className="absolute"
            style={{
              left: '37%', // user custom
              top: '47%',
              width: '12%',
              textAlign: 'center',
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <img
                src={topThree[2]?.avatar_url || AVATAR_PLACEHOLDER}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                alt={(topThree[2]?.username || topThree[2]?.wallet) + ' avatar'}
                className="w-14 h-14 rounded-full border-4 border-yellow-400 bg-green-900"
              />
              <span className="text-base font-bold text-yellow-200 truncate">{sanitizeInput(topThree[2]?.username || topThree[2]?.wallet?.slice(0, 8) || 'Unknown')}</span>
              <div style={{ minWidth: 24 }} />
              {topThree[2]?.hashrate && (
                <span className="text-base text-green-200 font-mono ml-4">{topThree[2].hashrate} GH/s</span>
              )}
            </div>
          </div>

          {/* Lower Box: Scrollable Table, perfectly aligned */}
          <div className="absolute left-[45%] bottom-[2.5%] w-[45%] h-[38%] -translate-x-1/2 flex flex-col justify-start" aria-label="Leaderboard list">
            <div className="overflow-y-auto rounded-lg px-4 py-2" style={{ maxHeight: '280px' }}>
              <table className="w-full text-yellow-100 text-lg bg-transparent">
                <thead>
                  <tr className="text-yellow-300 text-left sticky top-0 bg-transparent">
                    <th className="py-2 pl-2">Rank</th>
                    <th className="py-2">Player</th>
                    <th className="py-2 text-right pr-2">$BNANA</th>
                  </tr>
                </thead>
                <tbody>
                  {others.length === 0 && !loading && (
                    <tr><td colSpan={3} className="text-center py-8 text-lg bg-transparent">No more players yet!</td></tr>
                  )}
                  {others.slice(0, 100).map((player, idx) => (
                    <tr
                      key={player.wallet}
                      className="border-b border-yellow-900 hover:bg-yellow-900/10 transition bg-transparent"
                      tabIndex={0}
                      aria-label={`Rank ${idx + 4}, ${player.username || player.wallet}, ${player.total_earned?.toFixed(2)} BNANA`}
                      style={{ minHeight: '40px', background: 'transparent' }}
                    >
                      <td className="py-2 pl-2 font-bold w-12 bg-transparent">{idx + 4}</td>
                      <td className="py-2 bg-transparent">
                        {player.avatar_url && (
                          <img
                            src={player.avatar_url || AVATAR_PLACEHOLDER}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                            alt={(player.username || player.wallet) + ' avatar'}
                            className="inline-block w-8 h-8 rounded-full border border-yellow-300 mr-2 align-middle"
                          />
                        )}
                        <span className="truncate max-w-[120px] align-middle">{sanitizeInput(player.username || player.wallet?.slice(0, 10) || 'Unknown')}</span>
                      </td>
                      <td className="py-2 text-right pr-2 font-mono bg-transparent">{player.total_earned?.toFixed(2)} $BNANA</td>
                    </tr>
                  ))}
                  {loading && <tr><td colSpan={3} className="text-center py-4 bg-transparent">Loading…</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(Leaderboard), { ssr: false });

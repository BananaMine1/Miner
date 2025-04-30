// pages/leaderboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { sanitizeInput } from '../lib/sanitize';
import leaderboardBg from '../public/assets/backgrounds/leaderboard.png';
import { fetchTopPlayers } from '../hooks/useLeaderboard';
import { useIsMobile } from '../hooks/useIsMobile';

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
  xp?: number;
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

// Helper for top 3 username display
function getTop3DisplayName(nameOrWallet: string | undefined) {
  if (!nameOrWallet) return 'Unknown';
  return nameOrWallet.length < 10 ? nameOrWallet : nameOrWallet.slice(0, 8);
}

function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

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
            width: isMobile ? '100vw' : '100vw',
            height: isMobile ? '100dvh' : '56.25vw',
            maxWidth: isMobile ? '100vw' : '100vw',
            maxHeight: isMobile ? '100dvh' : '100vh',
            aspectRatio: isMobile ? undefined : '16/9',
          }}
        >
          <img
            src={isMobile ? '/assets/backgrounds/mobile-leaderboard.png' : '/assets/backgrounds/leaderboard2.png'}
            alt="Leaderboard background"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none', userSelect: 'none', objectFit: 'fill', zIndex: 0 }}
            draggable={false}
          />
          {/* Top 3 Placement */}
          {isMobile ? (
            <div className="flex flex-col items-center gap-4 mt-8 w-full z-20 relative">
              {/* Gold (#1) */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <img
                  src={topThree[0]?.avatar_url || AVATAR_PLACEHOLDER}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                  alt={(topThree[0]?.username || topThree[0]?.wallet) + ' avatar'}
                  className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-yellow-400 bg-green-900"
                  style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                />
                <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[0]?.username || topThree[0]?.wallet))}</span>
                {topThree[0]?.hashrate && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-green-200 font-mono ml-2">{topThree[0].hashrate} GH/s</span>
                )}
                {topThree[0]?.xp !== undefined && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-blue-300 font-mono ml-2"><span role="img" aria-label="XP">⭐</span> {topThree[0].xp}</span>
                )}
              </div>
              {/* Silver (#2) */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <img
                  src={topThree[1]?.avatar_url || AVATAR_PLACEHOLDER}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                  alt={(topThree[1]?.username || topThree[1]?.wallet) + ' avatar'}
                  className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-gray-400 bg-green-900"
                  style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                />
                <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[1]?.username || topThree[1]?.wallet))}</span>
                {topThree[1]?.hashrate && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-green-200 font-mono ml-2">{topThree[1].hashrate} GH/s</span>
                )}
                {topThree[1]?.xp !== undefined && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-blue-300 font-mono ml-2"><span role="img" aria-label="XP">⭐</span> {topThree[1].xp}</span>
                )}
              </div>
              {/* Bronze (#3) */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <img
                  src={topThree[2]?.avatar_url || AVATAR_PLACEHOLDER}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                  alt={(topThree[2]?.username || topThree[2]?.wallet) + ' avatar'}
                  className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-orange-700 bg-green-900"
                  style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                />
                <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[2]?.username || topThree[2]?.wallet))}</span>
                {topThree[2]?.hashrate && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-green-200 font-mono ml-2">{topThree[2].hashrate} GH/s</span>
                )}
                {topThree[2]?.xp !== undefined && (
                  <span style={{ fontSize: isMobile ? '4vw' : '2vw' }} className="text-blue-300 font-mono ml-2"><span role="img" aria-label="XP">⭐</span> {topThree[2].xp}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Silver (#2) */}
              <div
                className="absolute"
                style={{
                  left: '37%',
                  top: '38.2%',
                  width: '12%',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-center gap-6">
                  <img
                    src={topThree[1]?.avatar_url || AVATAR_PLACEHOLDER}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                    alt={(topThree[1]?.username || topThree[1]?.wallet) + ' avatar'}
                    className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-yellow-400 bg-green-900"
                    style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                  />
                  <div className="flex items-center justify-center gap-6">
                    <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[1]?.username || topThree[1]?.wallet))}</span>
                    {topThree[1]?.hashrate && (
                      <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="text-green-200 font-mono ml-2">{topThree[1].hashrate} GH/s</span>
                    )}
                  </div>
                  <div style={{ minWidth: '8%' }} />
                </div>
              </div>
              {/* Gold (#1) */}
              <div
                className="absolute"
                style={{
                  left: '37%',
                  top: '29.8%',
                  width: '12%',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-center gap-6">
                  <img
                    src={topThree[0]?.avatar_url || AVATAR_PLACEHOLDER}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                    alt={(topThree[0]?.username || topThree[0]?.wallet) + ' avatar'}
                    className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-yellow-400 bg-green-900"
                    style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                  />
                  <div className="flex items-center justify-center gap-6">
                    <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[0]?.username || topThree[0]?.wallet))}</span>
                    {topThree[0]?.hashrate && (
                      <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="text-green-200 font-mono ml-2">{topThree[0].hashrate} GH/s</span>
                    )}
                  </div>
                  <div style={{ minWidth: '10%' }} />
                </div>
              </div>
              {/* Bronze (#3) */}
              <div
                className="absolute"
                style={{
                  left: '37%',
                  top: '46.4%',
                  width: '12%',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-center gap-6">
                  <img
                    src={topThree[2]?.avatar_url || AVATAR_PLACEHOLDER}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                    alt={(topThree[2]?.username || topThree[2]?.wallet) + ' avatar'}
                    className="rounded-full object-cover flex-shrink-0 flex-grow-0 border-4 border-yellow-400 bg-green-900"
                    style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                  />
                  <div className="flex items-center justify-center gap-6">
                    <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="font-bold text-yellow-200">{sanitizeInput(getTop3DisplayName(topThree[2]?.username || topThree[2]?.wallet))}</span>
                    {topThree[2]?.hashrate && (
                      <span style={{ fontSize: isMobile ? '1.5vw' : '1vw' }} className="text-green-200 font-mono ml-2">{topThree[2].hashrate} GH/s</span>
                    )}
                  </div>
                  <div style={{ minWidth: '8%' }} />
                </div>
              </div>
            </>
          )}
          {/* Scrollable Section Placement */}
          <div
            className={isMobile ? "relative w-full mt-4 px-2" : "absolute left-[45%] bottom-[2.5%] w-[45%] h-[38%] -translate-x-1/2 flex flex-col justify-start"}
            style={isMobile ? { height: '60dvh', maxHeight: 400, zIndex: 10 } : { zIndex: 10 }}
            aria-label="Leaderboard list"
          >
            <div
              className="overflow-y-auto rounded-lg px-2 py-2"
              style={isMobile ? { maxHeight: '100%' } : { maxHeight: '28vw' }}
            >
              <table className="w-full text-yellow-100 text-lg bg-transparent">
                <thead>
                  <tr className="text-yellow-300 text-left sticky top-0 bg-transparent">
                    <th className="py-2 pl-2">Rank</th>
                    <th className="py-2">Player</th>
                    <th className="py-2 text-right pr-2">$BNANA</th>
                    <th className="py-2 text-right pr-2">XP</th>
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
                        <div className="flex items-center gap-2">
                          <img
                            src={player.avatar_url || AVATAR_PLACEHOLDER}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = AVATAR_PLACEHOLDER; }}
                            alt={(player.username || player.wallet) + ' avatar'}
                            className="rounded-full object-cover flex-shrink-0 flex-grow-0 border border-yellow-300 align-middle"
                            style={{ width: 58, height: 58, minWidth: 58, minHeight: 58, maxWidth: 58, maxHeight: 58, objectFit: 'cover', display: 'block' }}
                          />
                          <span className="truncate max-w-[120px] align-middle">{sanitizeInput(player.username || player.wallet?.slice(0, 10) || 'Unknown')}</span>
                          <span className="font-mono text-green-200 ml-2">{player.hashrate} GH/s</span>
                        </div>
                      </td>
                      <td className="py-2 text-right pr-2 font-mono bg-transparent">{player.total_earned?.toFixed(2)} $BNANA</td>
                      <td className="py-2 text-right pr-2 font-mono bg-transparent">{player.xp?.toFixed(2)} XP</td>
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

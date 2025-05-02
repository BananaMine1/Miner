import { supabase } from '../lib/supabaseClient';

export async function fetchTopPlayers(limit = 50, sortKey: 'total_earned' | 'xp' = 'total_earned') {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order(sortKey, { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Fetch leaderboard failed:', error);
    return [];
  }

  return data;
}

export async function updateLeaderboardEntry(wallet: string, totalEarned: number, xp: number) {
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert([
      {
        wallet,
        total_earned: totalEarned,
        xp,
        updated_at: new Date().toISOString(),
      },
    ], { onConflict: 'wallet' });

  if (error) console.error('Leaderboard update error:', error);
  return data;
}

export async function fetchAllLeaderboardEntries(sortKey: 'total_earned' | 'xp' = 'total_earned') {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order(sortKey, { ascending: false });

  if (error) {
    console.error('Fetch all leaderboard entries failed:', error);
    return [];
  }

  return data;
}

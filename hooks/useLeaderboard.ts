import { supabase } from '../lib/supabaseClient';

export async function fetchTopPlayers(limit = 50) {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('total_earned', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Fetch leaderboard failed:', error);
    return [];
  }

  return data;
}

export async function updateLeaderboardEntry(wallet: string, totalEarned: number, hashrate: number) {
  const { data, error } = await supabase
    .from('leaderboard')
    .upsert([
      {
        wallet,
        total_earned: totalEarned,
        hashrate,
        updated_at: new Date().toISOString(),
      },
    ], { onConflict: 'wallet' });

  if (error) console.error('Leaderboard update error:', error);
  return data;
}

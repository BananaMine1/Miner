// lib/syncLeaderboard.ts
import { supabase } from './supabaseClient';

export async function syncLeaderboard(wallet: string, totalEarned: number, hashrate: number) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('leaderboard')
    .upsert(
      [{
        wallet,
        total_earned: totalEarned,
        hashrate: hashrate,
        updated_at: now,
      }],
      { onConflict: 'wallet' }
    );

  if (error) {
    console.error('Error syncing leaderboard:', error);
  }
}

// pages/api/test-supabase.ts
import { supabase } from '../lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase.from('players').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

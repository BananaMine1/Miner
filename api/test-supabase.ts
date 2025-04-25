// pages/api/test-supabase.ts
import { supabase } from '../lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { validateCsrf } from '../lib/csrf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');

  // CSRF protection for mutating requests
  if (req.method !== 'GET') {
    try {
      validateCsrf(req);
    } catch (err) {
      return res.status(403).json({ error: err.message || 'CSRF validation failed' });
    }
  }

  // Create a Supabase client with the user's JWT for RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Optionally, verify the token by fetching the user
  const { data: user, error: userError } = await userSupabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Proceed with the original query
  const { data, error } = await userSupabase.from('players').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

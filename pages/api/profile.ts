import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { validateCsrf } from '../../lib/csrf';

function validateProfileInput(body: any) {
  const errors: string[] = [];
  if (typeof body.username !== 'string' || body.username.length < 2 || body.username.length > 32) {
    errors.push('Username must be 2-32 characters.');
  }
  if (typeof body.bio !== 'string' || body.bio.length > 200) {
    errors.push('Bio must be a string up to 200 characters.');
  }
  if (body.avatar_url !== null && typeof body.avatar_url !== 'string') {
    errors.push('Avatar URL must be a string or null.');
  }
  return errors;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');

  // CSRF protection
  try {
    validateCsrf(req);
  } catch (err) {
    return res.status(403).json({ error: err.message || 'CSRF validation failed' });
  }

  // Input validation
  const errors = validateProfileInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  // Create a Supabase client with the user's JWT for RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Get user wallet from JWT
  const { data: user, error: userError } = await userSupabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const wallet = user.user?.identities?.[0]?.identity_data?.sub || user.user?.id;
  if (!wallet) {
    return res.status(400).json({ error: 'Could not determine wallet from token.' });
  }

  // Update profile in Supabase
  const { error } = await userSupabase.from('players').update({
    username: req.body.username,
    bio: req.body.bio,
    avatar_url: req.body.avatar_url,
  }).eq('wallet', wallet);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
} 
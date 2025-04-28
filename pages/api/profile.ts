import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { validateCsrf } from '../../lib/csrf';
import { ethers } from 'ethers';

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
  if (!body.wallet || typeof body.wallet !== 'string') {
    errors.push('Missing wallet address.');
  }
  if (!body.signature || typeof body.signature !== 'string') {
    errors.push('Missing signature.');
  }
  if (!body.message || typeof body.message !== 'string') {
    errors.push('Missing message.');
  }
  return errors;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  const { wallet, signature, message, username, bio, avatar_url } = req.body;

  // Verify signature
  let recoveredAddress;
  try {
    recoveredAddress = ethers.utils.verifyMessage(message, signature);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid signature.' });
  }
  if (recoveredAddress.toLowerCase() !== wallet.toLowerCase()) {
    return res.status(401).json({ error: 'Signature does not match wallet.' });
  }

  // Create a Supabase client with the service key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Update profile in Supabase
  const { error } = await supabase.from('players').update({
    username,
    bio,
    avatar_url,
  }).eq('wallet', wallet);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
} 
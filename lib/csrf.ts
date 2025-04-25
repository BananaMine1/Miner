// CSRF protection utility
// In production, generate a per-session token and store in a secure cookie or session.
// For demo, use a static token (replace with real implementation for production).

import type { NextApiRequest } from 'next';

const DEMO_CSRF_TOKEN = process.env.CSRF_TOKEN || 'banana-csrf-demo-token';

export function validateCsrf(req: NextApiRequest) {
  const csrf = req.headers['x-csrf-token'] || req.body?.csrfToken;
  if (!csrf || csrf !== DEMO_CSRF_TOKEN) {
    throw new Error('Invalid or missing CSRF token');
  }
} 
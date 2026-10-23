import { shareHtml } from '../../src/domain/share.js';
import { cardFor } from '../_lib/archive.js';

// Crawler-friendly landing: OG/Twitter meta for the card, then redirect to the SPA view.
export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).json({ error: 'Method not allowed' });
  const { params, card } = cardFor(req.query || {});
  const origin = `https://${req.headers['x-forwarded-host'] || req.headers.host || 'celeste.sebiche.com'}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(card ? 200 : 404).send(shareHtml(card, params, origin));
}

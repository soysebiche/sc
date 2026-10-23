import { ImageResponse } from '@vercel/og';
import { cardFor } from '../_lib/archive.js';

const C = { bg: '#0B1120', card: '#151D30', celeste: '#3CBEEF', light: '#6DD4F7', text: '#F8FAFC', muted: '#94A3B8' };
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter(c => c !== null && c !== '') } });

function render(card) {
  const lines = card ? card.lines : ['Archivo histórico de Sporting Cristal'];
  return h('div', { width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', background: C.bg, color: C.text, padding: '56px 64px', fontFamily: 'sans-serif', borderTop: `16px solid ${C.celeste}` },
    h('div', { flexDirection: 'column' },
      h('div', { fontSize: 28, color: C.celeste, textTransform: 'uppercase', letterSpacing: 2 }, card ? card.eyebrow : 'Sebiche Celeste'),
      h('div', { fontSize: card && card.title.length > 34 ? 48 : 60, fontWeight: 700, marginTop: 12, lineHeight: 1.1 }, card ? card.title : 'Sebiche Celeste'),
      card ? h('div', { fontSize: 104, fontWeight: 800, color: C.light, marginTop: 16 }, card.big) : null),
    h('div', { flexDirection: 'column', gap: 8 }, lines.map(l => h('div', { fontSize: 28, color: C.muted }, l.length > 90 ? `${l.slice(0, 87)}…` : l))),
    h('div', { justifyContent: 'space-between', fontSize: 24, color: C.muted, borderTop: `2px solid ${C.card}`, paddingTop: 16 },
      h('div', { color: C.celeste, fontWeight: 700 }, 'SEBICHE CELESTE'),
      h('div', {}, 'celeste.sebiche.com')));
}

export default async function handler(req, res) {
  try {
    const { card } = cardFor(req.query || {});
    const image = new ImageResponse(render(card), { width: 1200, height: 630 });
    const buf = Buffer.from(await image.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(card ? 200 : 404).send(buf);
  } catch (error) {
    console.error('OG render failed', error);
    return res.status(500).json({ error: 'OG render failed' });
  }
}

import { ImageResponse } from '@vercel/og';
import records from '../../src/data/historico_completo_sc.json';
import aliases from '../../src/data/scorer-aliases.json';
import { parseMatch } from '../../src/domain/matches.js';
import { buildCard } from '../../src/domain/share.js';

// @vercel/og is ESM-only; the Edge runtime is its supported target.
export const config = { runtime: 'edge' };

const C = { bg: '#0B1120', card: '#151D30', celeste: '#3CBEEF', light: '#6DD4F7', text: '#F8FAFC', muted: '#94A3B8' };
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter(c => c !== null && c !== '') } });
let matches;

export function render(card) {
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

export default async function handler(request) {
  const q = new URL(request.url).searchParams;
  try {
    matches ||= records.map(parseMatch);
    const card = buildCard(matches, aliases, { type: q.get('type') || 'result', rival: q.get('rival'), name: q.get('name'), date: q.get('date') });
    // Render eagerly so a failure becomes a 500 instead of a cached empty 200.
    const png = await new ImageResponse(render(card), { width: 1200, height: 630 }).arrayBuffer();
    if (!png.byteLength) throw new Error('empty image');
    return new Response(png, {
      status: card ? 200 : 404,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('OG render failed', error);
    return new Response(`OG render failed: ${error && error.message}`, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

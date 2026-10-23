// Share cards (OG images + X intents). Pure: used by the SPA and by /api/og + /api/share.
import { formatMatchDate, getMatchesForDayMonth, sortMatchesNewest } from './matches.js';
import { headToHead, resolveRival } from './rivals.js';
import { scorerProfile } from './goals.js';
import { limaToday, ogImageUrl, qs, SHARE_TYPES, SITE_URL } from './shareLinks.js';

export * from './shareLinks.js';

const RESULT_WORD = { V: 'Victoria', E: 'Empate', P: 'Derrota' };

const scoreLine = m => `${m.home} ${m.scoreLabel} ${m.away}`;

// Returns {title, eyebrow, big, lines[], footer, spaPath, text} or null when the params don't resolve.
export function buildCard(matches, aliases, params = {}, now = new Date()) {
  const type = SHARE_TYPES.includes(params.type) ? params.type : 'result';
  if (type === 'result') {
    const m = sortMatchesNewest(matches.filter(x => x.resultCode))[0];
    if (!m) return null;
    return {
      type, eyebrow: `Último resultado · ${m.tournament}`, title: `${m.home} vs. ${m.away}`, big: m.scoreLabel,
      lines: [`${RESULT_WORD[m.resultCode]} · ${formatMatchDate(m.date)}`, m.goalsNote ? `Goles: ${m.goalsNote}` : ''].filter(Boolean),
      spaPath: '/?view=partidos', text: `${RESULT_WORD[m.resultCode]} celeste: ${scoreLine(m)}`,
    };
  }
  if (type === 'efemeride') {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date || '') ? params.date : limaToday(now);
    const list = getMatchesForDayMonth(matches, date);
    const label = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
    const wins = list.filter(m => m.resultCode === 'V').length;
    return {
      type, eyebrow: 'Efeméride celeste', title: `Un ${label} como hoy`, big: `${list.length} partidos`,
      lines: list.length ? [`${wins} victorias en este día`, ...list.slice(0, 3).map(m => `${m.year}: ${scoreLine(m)}`)] : ['Cristal nunca jugó en esta fecha'],
      spaPath: `/?${qs({ view: 'efemerides', date })}`, text: `Un ${label} como hoy, Sporting Cristal jugó ${list.length} partidos`,
    };
  }
  if (type === 'h2h') {
    if (!params.rival) return null;
    const rival = resolveRival(params.rival, matches);
    const h = headToHead(matches, rival, null);
    if (!h.total.played) return null;
    const t = h.total;
    return {
      type, eyebrow: 'Historial', title: `Sporting Cristal vs. ${rival}`, big: `${t.V}V ${t.E}E ${t.P}D`,
      lines: [`${t.played} partidos · goles ${t.goalsFor}-${t.goalsAgainst} · ${t.winRate}% de victorias`, h.last[0] ? `Último: ${scoreLine(h.last[0])} (${formatMatchDate(h.last[0].date)})` : ''].filter(Boolean),
      spaPath: `/?${qs({ view: 'rivales', rival })}`, text: `Sporting Cristal vs. ${rival}: ${t.V}V ${t.E}E ${t.P}D en ${t.played} partidos`,
    };
  }
  const p = params.name ? scorerProfile(matches, aliases, params.name) : null;
  if (!p) return null;
  const goals = `${p.total}${p.lowerBound ? '*' : ''}`;
  return {
    type, eyebrow: 'Goleador celeste', title: p.name, big: `${goals} goles`,
    lines: [`Mejor año: ${p.bestYear.year} (${p.bestYear.goals}) · ${p.matches} partidos con gol`, `Víctima favorita: ${p.rivals[0].rival} (${p.rivals[0].goals})`, p.lowerBound ? '* mínimo: faltan goleadores antes de 1990' : ''].filter(Boolean),
    spaPath: `/?${qs({ view: 'goleadores', jugador: p.name })}`, text: `${p.name}: ${goals} goles con Sporting Cristal`,
  };
}

export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function shareHtml(card, params, base = SITE_URL) {
  const title = escapeHtml(card ? `${card.title} · Sebiche Celeste` : 'Sebiche Celeste');
  const desc = escapeHtml(card ? card.text : 'Archivo histórico de Sporting Cristal');
  const target = escapeHtml(`${base}${card ? card.spaPath : '/'}`);
  const img = escapeHtml(ogImageUrl(params, base));
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Sebiche Celeste">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${target}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}"></head>
<body><p><a href="${target}">Ir a Sebiche Celeste</a></p></body></html>`;
}

// Parse and normalize Sporting Cristal goalscorers from `Goles (Solo SC)`.
// Raw strings are never rewritten; normalization is applied via scorer-aliases.json.

const JUNK = /^(-|—|no disponible|sin goles|s\/d|n\/d)$|walkover|^\(perdi/i;
const OWN_GOAL = /\b(autogol|og|gec|a\.?g\.?|en contra)\b/i;

export function scGoals(match) {
  const m = /^(\d+)\s*-\s*(\d+)/.exec(match.Marcador || '');
  if (!m) return null;
  const [h, a] = [Number(m[1]), Number(m[2])];
  if (match['Equipo Local'] === 'Sporting Cristal') return h;
  if (match['Equipo Visita'] === 'Sporting Cristal') return a;
  return null;
}

// Split on top-level commas / semicolons, keeping minute-only fragments with the previous name.
function splitEntries(str) {
  // "Name 87', 59' Other 85'" -> insert separators before a new capitalised name
  str = str.replace(/(\d\s*'?(?:\s*\(Pen\.?\))?)\s+(?=[A-ZÁÉÍÓÚÑ])/g, '$1, ');
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  const out = [];
  for (let p of parts.map((s) => s.trim()).filter(Boolean)) {
    if (/^[\d+'\s]/.test(p) && out.length) out[out.length - 1] += ', ' + p;
    else out.push(p);
  }
  return out;
}

function parseEntry(entry) {
  // returns {name, minuteGoals, bareNumber, ownGoal}
  let ownGoal = OWN_GOAL.test(entry);
  const parens = [...entry.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  let name = entry.replace(/\([^)]*\)/g, ' ');
  // trailing minutes outside parens: "Name 23'", "Name 90' +8, 90'"
  const trail = [];
  name = name.replace(/(?:[\s,]+\d+\s*'?(?:\s*\+\s*\d+'?)?)+[\s,]*(pen\.?)?\s*$/i, (m) => { trail.push(m); return ''; });
  name = name.replace(/,.*$/, '').replace(/\b(pen\.?|autogol|og)\b/gi, '').replace(/\s+/g, ' ').trim();
  let minuteGoals = 0, bareNumber = null;
  const multiOg = /^(\d+)\s+autogol/i.exec(entry.trim());
  if (multiOg) return { name: '', minuteGoals: 0, bareNumber: Number(multiOg[1]), ownGoal: true };
  const inner = [...parens, ...trail].join(',');
  if (parens.length === 1 && /^\s*\d+\s*$/.test(parens[0]) && !trail.length) {
    bareNumber = Number(parens[0]);
  } else {
    // count minute tokens: digits optionally followed by +N (stoppage time is one goal)
    const toks = inner.replace(/\d+\s*'?\s*\+\s*\d+/g, 'M').match(/M|\d+/g) || [];
    minuteGoals = toks.length;
  }
  if (/^autogol$/i.test(name) || /^(og|gec)$/i.test(name) || !name) { ownGoal = true; }
  return { name, minuteGoals, bareNumber, ownGoal };
}

// Returns [{name, goals, ownGoal}] for one match row.
export function parseScorers(match) {
  const raw = (match['Goles (Solo SC)'] || '').trim();
  if (!raw || JUNK.test(raw)) return [];
  const entries = splitEntries(raw).map(parseEntry).filter((e) => e.name || e.ownGoal);
  const target = scGoals(match);
  // Bare "(N)" is ambiguous: goal count (old data) or minute (recent data).
  const asCount = entries.reduce((s, e) => s + (e.bareNumber != null ? e.bareNumber : Math.max(1, e.minuteGoals)), 0);
  const asMinute = entries.reduce((s, e) => s + Math.max(1, e.minuteGoals), 0);
  const useCount = entries.some((e) => e.bareNumber != null) && (target === asCount || (target !== asMinute && entries.every((e) => e.bareNumber == null || e.bareNumber <= 5)));
  return entries.map((e) => ({
    name: e.name,
    ownGoal: e.ownGoal,
    goals: e.bareNumber != null ? (useCount ? e.bareNumber : 1) : Math.max(1, e.minuteGoals),
  }));
}

export function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
export function aliasKey(s) {
  return stripAccents(s).toLowerCase().replace(/[.\s]+/g, ' ').trim();
}

export function buildResolver(aliases) {
  const map = new Map();
  for (const [canon, variants] of Object.entries(aliases.players)) {
    map.set(aliasKey(canon), canon);
    for (const v of variants) map.set(aliasKey(v), canon);
  }
  const overrides = new Map((aliases.overrides || []).map((o) => [`${o.date}|${aliasKey(o.raw)}`, o.canonical]));
  return (raw, date) => overrides.get(`${date}|${aliasKey(raw)}`) || map.get(aliasKey(raw)) || raw;
}

export function topScorers(matches, aliases, { limit = Infinity } = {}) {
  const resolve = buildResolver(aliases);
  const totals = new Map();
  for (const m of matches) {
    for (const s of parseScorers(m)) {
      if (s.ownGoal) continue;
      const c = resolve(s.name, m.Fecha);
      totals.set(c, (totals.get(c) || 0) + s.goals);
    }
  }
  return [...totals.entries()].map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name)).slice(0, limit);
}

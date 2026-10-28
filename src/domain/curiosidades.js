// Data-driven curiosities computed only from the archive.
// Inputs are parsed matches from `parseMatch`.
import { matchGoals } from './goals.js';
import { clubOf } from './rivals.js';
import { buildResolver } from './scorers.js';
import { SCORER_COMPLETE_FROM, longestStreaks } from './stats.js';

const scored = ms => ms.filter(m => Number.isInteger(m.scGoals) && Number.isInteger(m.opponentGoals) && m.resultCode && m.date);
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const groupByRival = ms => {
  const map = new Map();
  for (const m of scored(ms)) {
    const k = clubOf(m.opponent);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(m);
  }
  return map;
};

export const RIVAL_STREAKS = Object.freeze({
  unbeaten: { label: 'Invicto ante el mismo rival', test: m => m.resultCode !== 'P' },
  winning: { label: 'Victorias seguidas ante el mismo rival', test: m => m.resultCode === 'V' },
  winless: { label: 'Sin ganarle al mismo rival', test: m => m.resultCode !== 'V' },
});

/** Longest and active streaks per rival, ranked across rivals. */
export function rivalStreaks(matches, { limit = 5, minCurrent = 3, activeYears = 3 } = {}) {
  const groups = groupByRival(matches);
  const lastDate = scored(matches).reduce((a, m) => (m.date > a ? m.date : a), '');
  // An active streak only counts if the rival was faced recently (defunct clubs freeze streaks).
  const activeFrom = lastDate ? `${Number(lastDate.slice(0, 4)) - activeYears}${lastDate.slice(4)}` : '';
  const out = {};
  for (const [id, { label, test }] of Object.entries(RIVAL_STREAKS)) {
    const rows = [...groups].map(([rival, ms]) => ({ rival, ...longestStreaks(ms, test) }));
    const sort = key => (a, b) => b[key].length - a[key].length || byDate({ date: a[key].end }, { date: b[key].end }) * -1 || a.rival.localeCompare(b.rival);
    out[id] = {
      label,
      record: rows.filter(r => r.record).sort(sort('record')).slice(0, limit).map(r => ({ rival: r.rival, ...r.record })),
      current: rows.filter(r => r.current && r.current.length >= minCurrent && r.current.end >= activeFrom).sort(sort('current')).slice(0, limit).map(r => ({ rival: r.rival, ...r.current })),
    };
  }
  return out;
}

const perMatchGoals = (matches, aliases) => {
  const resolve = buildResolver(aliases);
  return scored(matches).map(m => ({ match: m, ...matchGoals(m, resolve) }));
};

/** Player-rival pairs with the most goals. */
export function scorerVsRival(matches, aliases, { limit = 10 } = {}) {
  const map = new Map();
  for (const { match, goals } of perMatchGoals(matches, aliases)) {
    for (const g of goals) {
      if (!g.name) continue;
      const key = `${g.name}|${clubOf(match.opponent)}`;
      const row = map.get(key) || { name: g.name, rival: clubOf(match.opponent), goals: 0, dates: new Set() };
      row.goals += 1; row.dates.add(match.date);
      map.set(key, row);
    }
  }
  return [...map.values()].map(r => ({ name: r.name, rival: r.rival, goals: r.goals, matches: r.dates.size }))
    .sort((a, b) => b.goals - a.goals || a.matches - b.matches || a.name.localeCompare(b.name)).slice(0, limit);
}

/** Matches where one player scored 3+ goals for Cristal. */
export function hatTricks(matches, aliases) {
  const rows = [];
  for (const { match, goals } of perMatchGoals(matches, aliases)) {
    const counts = new Map();
    for (const g of goals) if (g.name) counts.set(g.name, (counts.get(g.name) || 0) + 1);
    for (const [name, n] of counts) if (n >= 3) rows.push({ name, goals: n, date: match.date, home: match.home, away: match.away, scoreLabel: match.scoreLabel, tournament: match.tournament });
  }
  rows.sort((a, b) => byDate(b, a) || a.name.localeCompare(b.name));
  const byPlayer = new Map();
  for (const r of rows) byPlayer.set(r.name, (byPlayer.get(r.name) || 0) + 1);
  const leaders = [...byPlayer].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { rows, leaders, maxGoals: rows.reduce((a, r) => Math.max(a, r.goals), 0) };
}

/** Earliest and latest timed goals (minute + added time). */
export function goalTiming(matches, aliases, { limit = 5 } = {}) {
  const all = [];
  for (const { match, goals, hasMinutes } of perMatchGoals(matches, aliases)) {
    if (!hasMinutes) continue;
    for (const g of goals) all.push({ name: g.ownGoal ? 'Autogol' : g.name, minute: g.minute, added: g.added, date: match.date, opponent: clubOf(match.opponent), scoreLabel: match.scoreLabel, home: match.home, away: match.away });
  }
  const t = g => g.minute * 100 + g.added;
  const fastest = [...all].sort((a, b) => t(a) - t(b) || byDate(a, b)).slice(0, limit);
  // Extra time (>90 regular minutes) is excluded so the list is about stoppage time.
  const latest = all.filter(g => g.minute <= 90).sort((a, b) => t(b) - t(a) || byDate(a, b)).slice(0, limit);
  return { fastest, latest, timedGoals: all.length };
}
export const minuteLabel = g => (g.added ? `${g.minute}+${g.added}'` : `${g.minute}'`);

/** Seasons ranked by points percentage (3 per win, 1 per draw), min matches. */
export function seasonPoints(matches, { minMatches = 15, limit = 5 } = {}) {
  const map = new Map();
  for (const m of scored(matches)) {
    if (!Number.isInteger(m.year)) continue;
    const s = map.get(m.year) || { year: m.year, played: 0, V: 0, E: 0, P: 0, goalsFor: 0, goalsAgainst: 0 };
    s.played++; s[m.resultCode]++; s.goalsFor += m.scGoals; s.goalsAgainst += m.opponentGoals;
    map.set(m.year, s);
  }
  const rows = [...map.values()].filter(s => s.played >= minMatches)
    .map(s => ({ ...s, pct: Math.round(((s.V * 3 + s.E) / (s.played * 3)) * 1000) / 10 }));
  return {
    best: [...rows].sort((a, b) => b.pct - a.pct || b.played - a.played).slice(0, limit),
    worst: [...rows].sort((a, b) => a.pct - b.pct || b.played - a.played).slice(0, limit),
    seasons: rows.length,
  };
}

/** Rival Cristal has scored most / conceded most against, and most-played. */
export function rivalExtremes(matches) {
  const rows = [...groupByRival(matches)].map(([rival, ms]) => ({
    rival, played: ms.length, goalsFor: ms.reduce((a, m) => a + m.scGoals, 0), goalsAgainst: ms.reduce((a, m) => a + m.opponentGoals, 0),
    V: ms.filter(m => m.resultCode === 'V').length,
  }));
  const top = key => [...rows].sort((a, b) => b[key] - a[key] || a.rival.localeCompare(b.rival))[0];
  return { mostPlayed: top('played'), mostGoalsFor: top('goalsFor'), mostGoalsAgainst: top('goalsAgainst'), rivals: rows.length };
}

export const SCORER_CAVEAT_FROM = SCORER_COMPLETE_FROM;

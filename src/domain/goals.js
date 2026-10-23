// Per-goal events (scorer + minute when known) derived from `Goles (Solo SC)`.
import { buildResolver, parseEntry, parseScorers, splitEntries } from './scorers.js';
import { SCORER_COMPLETE_FROM, toRawRow } from './stats.js';

export const MINUTE_BUCKETS = Object.freeze(['1-15', '16-30', '31-45+', '46-60', '61-75', '76-90+']);
export const LATE_MINUTE = 90;

const MINUTE_TOKEN = /(\d{1,3})\s*'?\s*(?:pen\.?)?\s*(?:\+\s*(\d{1,2}))?/gi;

// "Name (45+1, 90' +3)" -> [{minute:45, added:1}, {minute:90, added:3}]
export function minuteTokens(entry) {
  const start = entry.search(/\d/);
  if (start < 0) return [];
  return [...entry.slice(start).matchAll(MINUTE_TOKEN)]
    .map(t => ({ minute: Number(t[1]), added: t[2] ? Number(t[2]) : 0 }));
}

export const bucketOf = ({ minute }) => (minute <= 15 ? 0 : minute <= 30 ? 1 : minute <= 45 ? 2 : minute <= 60 ? 3 : minute <= 75 ? 4 : 5);
export const halfOf = ({ minute }) => (minute <= 45 ? 1 : 2);
export const isLate = ({ minute }) => minute >= LATE_MINUTE;

// Returns {goals:[{name, ownGoal, minute|null, added}], hasMinutes}
export function matchGoals(match, resolve = n => n) {
  const raw = (match.goalsNote || '').trim();
  const counts = parseScorers(toRawRow(match));
  if (!counts.length) return { goals: [], hasMinutes: false };
  const entries = splitEntries(raw).filter(e => { const p = parseEntry(e); return p.name || p.ownGoal; });
  const aligned = entries.length === counts.length;
  const perEntry = counts.map((c, i) => {
    const toks = aligned ? minuteTokens(entries[i]) : [];
    const valid = toks.length === c.goals && toks.every(t => t.minute >= 1 && t.minute <= 120);
    return { c, toks: valid ? toks : null };
  });
  // Old rows use "(2)" as a goal count; only trust minutes when the format is unambiguous.
  const unambiguous = /'|\+/.test(raw) || perEntry.some(e => e.toks && e.toks.some(t => t.minute > 5)) || perEntry.some(e => e.toks && e.toks.length > 1);
  const hasMinutes = unambiguous && perEntry.every(e => e.toks);
  const goals = [];
  for (const { c, toks } of perEntry) {
    const name = c.ownGoal ? null : resolve(c.name, match.date);
    for (let k = 0; k < c.goals; k++) {
      const t = hasMinutes ? toks[k] : null;
      goals.push({ name, ownGoal: c.ownGoal, minute: t ? t.minute : null, added: t ? t.added : 0 });
    }
  }
  return { goals, hasMinutes };
}

export function minuteDistribution(matches, aliases) {
  const resolve = buildResolver(aliases);
  const buckets = MINUTE_BUCKETS.map(label => ({ label, goals: 0 }));
  const halves = { first: 0, second: 0 };
  const late = new Map();
  let lateGoals = 0, covered = 0, goalsWithMinute = 0, matchesWithGoals = 0;
  for (const m of matches) {
    const { goals, hasMinutes } = matchGoals(m, resolve);
    if (!goals.length) continue;
    matchesWithGoals++;
    if (!hasMinutes) continue;
    covered++;
    for (const g of goals) {
      goalsWithMinute++;
      buckets[bucketOf(g)].goals++;
      halves[halfOf(g) === 1 ? 'first' : 'second']++;
      if (isLate(g)) {
        lateGoals++;
        if (g.name) late.set(g.name, (late.get(g.name) || 0) + 1);
      }
    }
  }
  const lateScorers = [...late].map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
  return { buckets, halves, lateGoals, lateScorers, coverage: { matches: covered, matchesWithGoals, goals: goalsWithMinute } };
}

const pushCount = (map, key, n = 1) => map.set(key, (map.get(key) || 0) + n);
const sortedCounts = (map, keyName) => [...map].map(([k, goals]) => ({ [keyName]: k, goals }))
  .sort((a, b) => b.goals - a.goals || String(a[keyName]).localeCompare(String(b[keyName])));

export function scorerProfile(matches, aliases, name) {
  const resolve = buildResolver(aliases);
  const rows = [];
  for (const m of matches) {
    const { goals, hasMinutes } = matchGoals(m, resolve);
    const mine = goals.filter(g => g.name === name);
    if (mine.length) rows.push({ match: m, goals: mine.length, minutes: hasMinutes ? mine.map(g => g.minute) : null, raw: mine });
  }
  if (!rows.length) return null;
  rows.sort((a, b) => a.match.date.localeCompare(b.match.date));
  const byYear = new Map(), byRival = new Map(), byTournament = new Map();
  const buckets = MINUTE_BUCKETS.map(label => ({ label, goals: 0 }));
  let total = 0, braces = 0, hatTricks = 0, preComplete = 0, withMinute = 0, late = 0;
  for (const r of rows) {
    total += r.goals;
    pushCount(byYear, r.match.year, r.goals);
    pushCount(byRival, r.match.opponent, r.goals);
    pushCount(byTournament, r.match.tournament || 'Sin torneo', r.goals);
    if (r.goals === 2) braces++;
    if (r.goals >= 3) hatTricks++;
    if (r.match.year < SCORER_COMPLETE_FROM) preComplete += r.goals;
    if (r.minutes) for (const g of r.raw) { withMinute++; buckets[bucketOf(g)].goals++; if (isLate(g)) late++; }
  }
  const years = sortedCounts(byYear, 'year');
  const ys = [...byYear.keys()];
  const yearSeries = [];
  for (let y = Math.min(...ys); y <= Math.max(...ys); y++) yearSeries.push({ year: y, goals: byYear.get(y) || 0 });
  const pick = r => ({ date: r.match.date, opponent: r.match.opponent, scoreLabel: r.match.scoreLabel, home: r.match.home, away: r.match.away });
  return {
    name, total, matches: rows.length, braces, hatTricks,
    lowerBound: preComplete > 0,
    bestYear: years[0],
    yearSeries,
    first: pick(rows[0]), last: pick(rows[rows.length - 1]),
    rivals: sortedCounts(byRival, 'rival'),
    tournaments: sortedCounts(byTournament, 'tournament'),
    minutes: { buckets, known: withMinute, late },
    rows: rows.slice().reverse().map(r => ({ ...r.match, goals: r.goals, minutes: r.minutes })),
  };
}

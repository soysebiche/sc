// Derived archive statistics (streaks, records, home/away, scorer rankings).
// Inputs are parsed matches from `parseMatch`; views must not recompute these.
import { buildResolver, parseScorers } from './scorers.js';

const chronological = (matches) => matches
  .map((match, index) => ({ match, index }))
  .filter(({ match }) => match.resultCode && match.date)
  .sort((a, b) => (a.match.date < b.match.date ? -1 : a.match.date > b.match.date ? 1 : a.index - b.index))
  .map(({ match }) => match);

export const STREAK_TYPES = Object.freeze({
  unbeaten: { label: 'Invicto', test: m => m.resultCode !== 'P' },
  winning: { label: 'Victorias seguidas', test: m => m.resultCode === 'V' },
  cleanSheet: { label: 'Valla invicta', test: m => m.opponentGoals === 0 },
});

export function longestStreaks(matches, test) {
  const ordered = chronological(matches);
  let record = null;
  let run = null;
  for (const m of ordered) {
    if (test(m)) {
      run = run ? { ...run, length: run.length + 1, end: m.date } : { length: 1, start: m.date, end: m.date };
      if (!record || run.length > record.length) record = run;
    } else {
      run = null;
    }
  }
  return { record, current: run };
}

export function calculateStreaks(matches) {
  return Object.fromEntries(Object.entries(STREAK_TYPES).map(([id, { label, test }]) => [id, { label, ...longestStreaks(matches, test) }]));
}

const scored = matches => matches.filter(m => Number.isInteger(m.scGoals) && Number.isInteger(m.opponentGoals));
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

export function calculateRecords(matches, limit = 5) {
  const list = scored(matches);
  const margin = m => m.scGoals - m.opponentGoals;
  const biggestWins = list.filter(m => margin(m) > 0)
    .sort((a, b) => margin(b) - margin(a) || b.scGoals - a.scGoals || byDate(a, b)).slice(0, limit);
  const biggestLosses = list.filter(m => margin(m) < 0)
    .sort((a, b) => margin(a) - margin(b) || b.opponentGoals - a.opponentGoals || byDate(a, b)).slice(0, limit);
  const highestScoring = [...list]
    .sort((a, b) => (b.scGoals + b.opponentGoals) - (a.scGoals + a.opponentGoals) || byDate(a, b)).slice(0, limit);
  const counts = new Map();
  for (const m of list) {
    const key = `${m.scGoals}-${m.opponentGoals}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const scorelines = [...counts].map(([score, count]) => ({ score, count }))
    .sort((a, b) => b.count - a.count || a.score.localeCompare(b.score)).slice(0, limit * 2);
  return { biggestWins, biggestLosses, highestScoring, scorelines };
}

const emptySplit = () => ({ played: 0, V: 0, E: 0, P: 0, goalsFor: 0, goalsAgainst: 0 });
const addTo = (split, m) => {
  split.played += 1;
  split[m.resultCode] += 1;
  split.goalsFor += m.scGoals;
  split.goalsAgainst += m.opponentGoals;
};
export const winRate = split => (split.played ? Math.round((split.V / split.played) * 100) : 0);

export function calculateHomeAway(matches, { minRivalMatches = 10 } = {}) {
  const overall = { home: emptySplit(), away: emptySplit() };
  const rivals = new Map();
  const decades = new Map();
  for (const m of scored(matches)) {
    if (!m.resultCode) continue;
    const side = m.isHome ? 'home' : 'away';
    addTo(overall[side], m);
    if (!rivals.has(m.opponent)) rivals.set(m.opponent, { home: emptySplit(), away: emptySplit() });
    addTo(rivals.get(m.opponent)[side], m);
    const decade = Number.isInteger(m.year) ? Math.floor(m.year / 10) * 10 : null;
    if (decade !== null) {
      if (!decades.has(decade)) decades.set(decade, { home: emptySplit(), away: emptySplit() });
      addTo(decades.get(decade)[side], m);
    }
  }
  const perRival = [...rivals].map(([name, s]) => ({ name, ...s, played: s.home.played + s.away.played }))
    .filter(r => r.played >= minRivalMatches)
    .sort((a, b) => b.played - a.played || a.name.localeCompare(b.name));
  const perDecade = [...decades].map(([decade, s]) => ({ decade, ...s })).sort((a, b) => a.decade - b.decade);
  return { overall, perRival, perDecade };
}

export const decadeOf = year => (Number.isInteger(year) ? Math.floor(year / 10) * 10 : null);
// Sporting Cristal scorer data is sparse before 1990.
export const SCORER_COMPLETE_FROM = 1990;

const toRawRow = m => ({
  Fecha: m.date,
  Marcador: m.scoreLabel,
  'Equipo Local': m.home,
  'Equipo Visita': m.away,
  'Goles (Solo SC)': m.goalsNote || '',
});

export function rankScorers(matches, aliases, { tournament = '', decade = '' } = {}) {
  const resolve = buildResolver(aliases);
  const totals = new Map();
  for (const m of matches) {
    if (tournament && m.tournament !== tournament) continue;
    if (decade !== '' && decade !== null && decadeOf(m.year) !== Number(decade)) continue;
    for (const s of parseScorers(toRawRow(m))) {
      if (s.ownGoal) continue;
      const name = resolve(s.name, m.date);
      const entry = totals.get(name) || { name, goals: 0, matches: 0, first: m.year, last: m.year, preCompleteGoals: 0 };
      entry.goals += s.goals;
      entry.matches += 1;
      if (m.year < entry.first) entry.first = m.year;
      if (m.year > entry.last) entry.last = m.year;
      if (m.year < SCORER_COMPLETE_FROM) entry.preCompleteGoals += s.goals;
      totals.set(name, entry);
    }
  }
  return [...totals.values()].map(e => ({ ...e, lowerBound: e.preCompleteGoals > 0 }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}

export const listTournaments = matches => [...new Set(matches.map(m => m.tournament).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
export const listDecades = matches => [...new Set(matches.map(m => decadeOf(m.year)).filter(d => d !== null))].sort((a, b) => b - a);

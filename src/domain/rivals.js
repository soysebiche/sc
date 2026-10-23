// Head-to-head, match preview, clásicos and per-tournament records.
// Inputs are parsed matches from `parseMatch`; views must not recompute these.
import { decadeOf, longestStreaks, rankScorers, winRate } from './stats.js';

// Same club under different names across the archive (rebrands). Keyed by archive name.
export const CLUB_LINEAGE = Object.freeze({
  'Real Garcilaso': 'Cusco FC',
});

const FIXTURE_NAME_ALIASES = Object.freeze({
  'Alianza Lima': 'Alianza Lima',
  Universitario: 'Universitario',
  'Universitario de Deportes': 'Universitario',
  UTC: 'U.T.C.',
  'Deportivo Los Chankas': 'Dep. Los Chankas',
  'Los Chankas': 'Dep. Los Chankas',
  'Académia Cantolao': 'Academia Cantolao',
  'Union Comercio': 'Unión Comercio',
  'ADT': 'A.D.T.',
});

export const clubOf = name => CLUB_LINEAGE[name] || FIXTURE_NAME_ALIASES[name] || name;
const strip = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

/** Resolve a fixture team name against archive opponents (accent/punctuation insensitive). */
export function resolveRival(name, matches) {
  const direct = clubOf(name);
  const known = new Set(matches.map(m => clubOf(m.opponent)));
  if (known.has(direct)) return direct;
  const key = strip(direct);
  for (const k of known) if (strip(k) === key) return k;
  return direct;
}

const scored = ms => ms.filter(m => Number.isInteger(m.scGoals) && Number.isInteger(m.opponentGoals) && m.resultCode);
const newestFirst = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export const emptyRecord = () => ({ played: 0, V: 0, E: 0, P: 0, goalsFor: 0, goalsAgainst: 0 });
export function summarize(ms) {
  const r = emptyRecord();
  for (const m of scored(ms)) {
    r.played += 1; r[m.resultCode] += 1; r.goalsFor += m.scGoals; r.goalsAgainst += m.opponentGoals;
  }
  return { ...r, winRate: winRate(r), points: r.V * 3 + r.E };
}

export const matchesVs = (matches, rival) => scored(matches).filter(m => clubOf(m.opponent) === rival);

const margin = m => m.scGoals - m.opponentGoals;
export function headToHead(matches, rival, aliases, { lastN = 5 } = {}) {
  const list = matchesVs(matches, rival).sort(newestFirst);
  const names = [...new Set(list.map(m => m.opponent))];
  const decades = new Map();
  for (const m of list) {
    const d = decadeOf(m.year);
    if (d === null) continue;
    if (!decades.has(d)) decades.set(d, []);
    decades.get(d).push(m);
  }
  const streak = test => longestStreaks(list, test);
  return {
    rival,
    names,
    total: summarize(list),
    home: summarize(list.filter(m => m.isHome)),
    away: summarize(list.filter(m => !m.isHome)),
    last: list.slice(0, lastN),
    byDecade: [...decades].map(([decade, ms]) => ({ decade, ...summarize(ms) })).sort((a, b) => a.decade - b.decade),
    streaks: {
      unbeaten: streak(m => m.resultCode !== 'P'),
      winning: streak(m => m.resultCode === 'V'),
      rivalUnbeaten: streak(m => m.resultCode !== 'V'),
    },
    biggestWins: list.filter(m => margin(m) > 0).sort((a, b) => margin(b) - margin(a) || b.scGoals - a.scGoals || newestFirst(a, b)).slice(0, 5),
    biggestLosses: list.filter(m => margin(m) < 0).sort((a, b) => margin(a) - margin(b) || b.opponentGoals - a.opponentGoals || newestFirst(a, b)).slice(0, 5),
    topScorers: aliases ? rankScorers(list, aliases).slice(0, 5) : [],
    firstMatch: list[list.length - 1] || null,
  };
}

export function currentForm(matches, n = 5) {
  const list = scored(matches).sort(newestFirst);
  return {
    last: list.slice(0, n),
    unbeaten: longestStreaks(list, m => m.resultCode !== 'P').current,
    winning: longestStreaks(list, m => m.resultCode === 'V').current,
  };
}

/** Next fixture after `now` (fixtures: upcoming-fixtures.json `fixtures`). */
export function nextFixture(fixtures, now = new Date()) {
  return [...(fixtures || [])]
    .filter(f => f.start && new Date(f.end || f.start) >= now && f.status !== 'cancelled')
    .sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null;
}

export function buildPreview(matches, fixture, aliases) {
  if (!fixture) return null;
  const isHome = fixture.homeTeam === 'Sporting Cristal';
  const rival = resolveRival(isHome ? fixture.awayTeam : fixture.homeTeam, matches);
  return { fixture, isHome, rival, h2h: headToHead(matches, rival, aliases), form: currentForm(matches) };
}

export const CLASICOS = Object.freeze(['Alianza Lima', 'Universitario']);

// --- Récord por torneo ---------------------------------------------------
const FAMILY_RULES = [
  [/libertadores/i, 'Copa Libertadores'],
  [/sudamericana/i, 'Copa Sudamericana'],
  [/merconorte/i, 'Copa Merconorte'],
  [/copa de la liga/i, 'Copa de la Liga'],
  [/bicentenario/i, 'Copa Bicentenario'],
  [/inca/i, 'Torneo del Inca'],
  [/verano/i, 'Torneo de Verano'],
  [/^(torneo )?apertura$/i, 'Apertura'],
  [/^(torneo )?clausura$/i, 'Clausura'],
  [/liguilla/i, 'Liguillas'],
  [/final|play-?off|definici/i, 'Finales y definiciones'],
];
export const tournamentFamily = name => {
  for (const [re, family] of FAMILY_RULES) if (re.test(name || '')) return family;
  return 'Liga / Descentralizado';
};

export function tournamentRecords(matches, aliases) {
  const groups = new Map();
  for (const m of scored(matches)) {
    const f = tournamentFamily(m.tournament);
    if (!groups.has(f)) groups.set(f, { variants: new Set(), list: [] });
    const g = groups.get(f);
    g.variants.add(m.tournament);
    g.list.push(m);
  }
  return [...groups].map(([family, { variants, list }]) => {
    const years = list.map(m => m.year).filter(Number.isInteger);
    return {
      family,
      variants: [...variants].sort(),
      ...summarize(list),
      firstYear: Math.min(...years),
      lastYear: Math.max(...years),
      topScorer: aliases ? rankScorers(list, aliases)[0] || null : null,
    };
  }).sort((a, b) => b.played - a.played);
}

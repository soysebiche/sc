// Head-to-head, match preview, clásicos and per-tournament records.
// Inputs are parsed matches from `parseMatch`; views must not recompute these.
import { clubOf, canonicalizeRival } from './matches.js';
import { decadeOf, longestStreaks, rankScorers, winRate } from './stats.js';

export { clubOf, canonicalizeRival };

const FIXTURE_NAME_ALIASES = Object.freeze({
  'Alianza Lima': 'Alianza Lima',
  Universitario: 'Universitario',
  'Universitario de Deportes': 'Universitario',
  UTC: 'U.T.C.',
  'Deportivo Los Chankas': 'Dep. Los Chankas',
  'Los Chankas': 'Dep. Los Chankas',
  'Académia Cantolao': 'Academia Cantolao',
  'Union Comercio': 'Unión Comercio',
  ADT: 'A.D.T.',
});

const strip = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
const IDA_RE = /\bida\b/i;
const VUELTA_RE = /\bvuelta\b/i;
const MS_PER_DAY = 86400000;
export const CUP_TIE_MAX_DAYS = 45;

/** Resolve a fixture team name against archive opponents (accent/punctuation insensitive). */
export function resolveRival(name, matches) {
  const direct = clubOf(FIXTURE_NAME_ALIASES[name] || name);
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

export const matchesVs = (matches, rival) => scored(matches).filter(m => clubOf(m.opponent) === clubOf(rival));

const margin = m => m.scGoals - m.opponentGoals;

function stripLegWords(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(IDA_RE, ' ')
    .replace(VUELTA_RE, ' ')
    .replace(/[()[\].,_\-/–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ida or vuelta leg when the archive round/tournament labels it. Otherwise null. */
export function cupLeg(match) {
  const round = String(match.round || '');
  const tournament = String(match.tournament || '');
  const text = `${round} ${tournament}`.trim();
  const ida = IDA_RE.test(text);
  const vuelta = VUELTA_RE.test(text);
  if (ida === vuelta) return null;
  const stage = stripLegWords(text).toLowerCase();
  const label = stripLegWords(`${round} ${tournament}`) || (ida ? 'Ida' : 'Vuelta');
  return { leg: ida ? 'ida' : 'vuelta', stage: stage || label.toLowerCase(), label };
}

function tieFromLegs(idaRow, vueltaRow) {
  const ida = idaRow.match;
  const vuelta = vueltaRow.match;
  const goalsFor = ida.scGoals + vuelta.scGoals;
  const goalsAgainst = ida.opponentGoals + vuelta.opponentGoals;
  let advanced = null;
  let advancedReason = null;
  if (goalsFor > goalsAgainst) {
    advanced = 'Sporting Cristal';
    advancedReason = 'aggregate';
  } else if (goalsAgainst > goalsFor) {
    advanced = idaRow.rival;
    advancedReason = 'aggregate';
  } else {
    const shootout = [ida, vuelta].filter(m => m.scGoals === m.opponentGoals && (m.resultCode === 'V' || m.resultCode === 'P'));
    if (shootout.length === 1) {
      advanced = shootout[0].resultCode === 'V' ? 'Sporting Cristal' : idaRow.rival;
      advancedReason = 'penalties';
    }
  }
  return {
    rival: idaRow.rival,
    stage: idaRow.stage,
    label: idaRow.label || vueltaRow.label,
    ida,
    vuelta,
    goalsFor,
    goalsAgainst,
    scoreLabel: `${goalsFor}-${goalsAgainst}`,
    advanced,
    advancedReason,
  };
}

/**
 * Pair labelled ida/vuelta matches of the same rival and stage when dates are close.
 * Unpaired legs, three-match series and unlabelled rounds stay as regular matches.
 */
export function groupCupTies(matches) {
  const legs = [];
  matches.forEach((match, index) => {
    const info = cupLeg(match);
    if (!info || !Number.isInteger(match.scGoals) || !Number.isInteger(match.opponentGoals)) return;
    const t = Date.parse(match.date);
    if (!Number.isFinite(t)) return;
    legs.push({ match, index, ...info, t, rival: clubOf(match.opponent) });
  });
  legs.sort((a, b) => a.t - b.t || a.index - b.index);

  const used = new Set();
  const ties = [];
  for (const ida of legs) {
    if (used.has(ida.match) || ida.leg !== 'ida') continue;
    let best = null;
    for (const vuelta of legs) {
      if (vuelta === ida || used.has(vuelta.match) || vuelta.leg !== 'vuelta') continue;
      if (vuelta.rival !== ida.rival || vuelta.stage !== ida.stage) continue;
      const days = Math.abs(vuelta.t - ida.t) / MS_PER_DAY;
      if (days > CUP_TIE_MAX_DAYS) continue;
      if (!best || days < best.days) best = { other: vuelta, days };
    }
    if (!best) continue;
    used.add(ida.match);
    used.add(best.other.match);
    ties.push(tieFromLegs(ida, best.other));
  }
  return ties.sort((a, b) => newestFirst(a.vuelta, b.vuelta) || newestFirst(a.ida, b.ida));
}

export function listRivals(matches) {
  const groups = new Map();
  for (const m of matches) {
    const name = clubOf(m.opponent);
    if (!name) continue;
    if (!groups.has(name)) groups.set(name, { name, names: new Set(), matches: [], countries: new Map() });
    const g = groups.get(name);
    g.names.add(m.opponent);
    g.names.add(name);
    g.matches.push(m);
    if (m.country) g.countries.set(m.country, (g.countries.get(m.country) || 0) + 1);
  }
  return [...groups.values()].map(g => {
    const dated = g.matches.filter(m => m.date).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const country = [...g.countries].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))[0]?.[0] || '';
    return {
      name: g.name,
      names: [...g.names].sort((a, b) => a.localeCompare(b, 'es')),
      country,
      firstDate: dated[0]?.date || '',
      lastDate: dated.at(-1)?.date || '',
      matches: g.matches,
      ...summarize(g.matches),
    };
  });
}

export function filterRivals(rivals, query) {
  const needle = strip(query);
  if (!needle) return rivals;
  return rivals.filter(rival => strip(rival.name).includes(needle) || rival.names.some(name => strip(name).includes(needle)));
}

export function sortRivals(rivals, sort = 'played') {
  const rows = [...rivals];
  if (sort === 'name') return rows.sort((a, b) => a.name.localeCompare(b.name, 'es') || b.played - a.played);
  return rows.sort((a, b) => b.played - a.played || a.name.localeCompare(b.name, 'es'));
}

export function headToHead(matches, rival, aliases, { lastN = 5 } = {}) {
  const canonical = clubOf(rival);
  const list = matchesVs(matches, canonical).sort(newestFirst);
  const names = [...new Set(list.map(m => m.opponent))];
  const decades = new Map();
  for (const m of list) {
    const d = decadeOf(m.year);
    if (d === null) continue;
    if (!decades.has(d)) decades.set(d, []);
    decades.get(d).push(m);
  }
  const streak = test => longestStreaks(list, test);
  const winless = streak(m => m.resultCode !== 'V');
  const home = list.filter(m => m.isHome);
  const away = list.filter(m => !m.isHome);
  return {
    rival: canonical,
    names,
    total: summarize(list),
    home: summarize(home),
    away: summarize(away),
    neutral: summarize([]),
    last: list.slice(0, lastN),
    lastMatch: list[0] || null,
    firstMatch: list[list.length - 1] || null,
    byDecade: [...decades].map(([decade, ms]) => ({ decade, ...summarize(ms) })).sort((a, b) => a.decade - b.decade),
    byCompetition: tournamentRecords(list, aliases),
    ties: groupCupTies(list),
    streaks: {
      unbeaten: streak(m => m.resultCode !== 'P'),
      winning: streak(m => m.resultCode === 'V'),
      winless,
      rivalUnbeaten: winless,
    },
    biggestWins: list.filter(m => margin(m) > 0).sort((a, b) => margin(b) - margin(a) || b.scGoals - a.scGoals || newestFirst(a, b)).slice(0, 5),
    biggestLosses: list.filter(m => margin(m) < 0).sort((a, b) => margin(a) - margin(b) || b.opponentGoals - a.opponentGoals || newestFirst(a, b)).slice(0, 5),
    topScorers: aliases ? rankScorers(list, aliases).slice(0, 10) : [],
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

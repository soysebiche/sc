// Custom archive search and streaks over a filtered match set.
// Inputs are parsed matches from `parseMatch`. Query keys are unique to `view=buscar`.
import aliases from '../data/scorer-aliases.json';
import { matchGoals } from './goals.js';
import { canonicalizeRival, sortMatchesNewest, summarizeMatches } from './matches.js';
import { spaSearch } from './publicRoutes.js';
import { clubOf, tournamentFamily } from './rivals.js';
import { buildResolver } from './scorers.js';
import { rankScorers, streakRuns } from './stats.js';

export const SEARCH_VIEW = 'buscar';

export const SEARCH_PARAMS = Object.freeze({
  vs: '',
  comp: '',
  fase: '',
  sede: '',
  from: '',
  to: '',
  res: '',
  gfmin: '',
  gamax: '',
  score: '',
  goleador: '',
  sp: '1',
});

export const SEARCH_STREAKS = Object.freeze({
  winning: { label: 'Victorias seguidas', test: m => m.resultCode === 'V' },
  unbeaten: { label: 'Invicto', test: m => m.resultCode !== 'P' },
  winless: { label: 'Sin ganar', test: m => m.resultCode !== 'V' },
  scoring: { label: 'Marcando', test: m => m.scGoals > 0 },
  cleanSheet: { label: 'Valla invicta', test: m => m.opponentGoals === 0 },
});

export const PHASE_FAMILIES = Object.freeze([
  { id: 'final', label: 'Final' },
  { id: 'semifinal', label: 'Semifinal' },
  { id: 'cuartos', label: 'Cuartos' },
  { id: 'octavos', label: 'Octavos' },
  { id: 'dieciseisavos', label: 'Dieciseisavos' },
  { id: 'grupos', label: 'Fase de grupos' },
  { id: 'playoff', label: 'Playoff / repechaje' },
  { id: 'regular', label: 'Fecha regular' },
]);

export const SEARCH_PRESETS = Object.freeze([
  {
    id: 'alianza-local-2000',
    label: 'Vs. Alianza Lima de local desde 2000',
    params: { vs: 'Alianza Lima', sede: 'local', from: '2000' },
  },
  {
    id: 'universitario-visita',
    label: 'Vs. Universitario de visita',
    params: { vs: 'Universitario', sede: 'visita' },
  },
  {
    id: 'libertadores-valla',
    label: 'Valla invicta en Copa Libertadores',
    params: { comp: 'Copa Libertadores', gamax: '0' },
  },
  {
    id: 'cuatro-goles',
    label: 'Cristal marcó 4 o más',
    params: { gfmin: '4' },
  },
  {
    id: 'soto-alianza',
    label: 'Goles de Jorge Soto vs. Alianza Lima',
    params: { goleador: 'Jorge Soto', vs: 'Alianza Lima' },
  },
]);

const YEAR_OR_DATE = /^\d{4}(-\d{2}-\d{2})?$/;
const INT = /^\d{1,2}$/;
const SCORE = /^\d{1,2}-\d{1,2}$/;
const RES = /^[VEP](,[VEP])*$/;
const SEDE = /^(local|visita)$/;
const PAGE = /^\d+$/;

const VALIDATORS = Object.freeze({
  from: YEAR_OR_DATE,
  to: YEAR_OR_DATE,
  gfmin: INT,
  gamax: INT,
  score: SCORE,
  res: RES,
  sede: SEDE,
  sp: PAGE,
});

const dateBound = (value, edge) => {
  if (!value) return '';
  if (YEAR_OR_DATE.test(value) && value.length === 4) {
    return edge === 'start' ? `${value}-01-01` : `${value}-12-31`;
  }
  return value;
};

export function phaseOf(round) {
  const value = String(round || '').trim();
  if (!value) return '';
  if (/dieciseisavos/i.test(value)) return 'dieciseisavos';
  if (/octavos/i.test(value) || /^O[12]$/i.test(value)) return 'octavos';
  if (/cuartos/i.test(value)) return 'cuartos';
  if (/semifinal/i.test(value) || /^S[12]$/i.test(value)) return 'semifinal';
  if (/final/i.test(value) || /^F[12]$/i.test(value)) return 'final';
  if (/grupo/i.test(value) || /^[CD][1-6]$/i.test(value)) return 'grupos';
  if (
    /play-?offs?|repechaje|preliminar|desempate|1\.?ª?\s*fase|2\.?ª?\s*fase|3era\s*fase|1era|2da\s*fase/i.test(value)
    || /^(ida|vuelta)$/i.test(value)
  ) return 'playoff';
  if (/^\d+(\s*\((Apertura|Clausura|Revancha)\))?$/i.test(value)) return 'regular';
  return 'otros';
}

export function readSearchQuery(search) {
  const params = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const query = { ...SEARCH_PARAMS };
  Object.keys(SEARCH_PARAMS).forEach(key => {
    const value = params.get(key);
    if (value == null || value === '') return;
    const validate = VALIDATORS[key];
    if (validate && !validate.test(value)) return;
    query[key] = key === 'vs' ? canonicalizeRival(value) : value;
  });
  return query;
}

export function searchUpdates(query, extras = {}) {
  const merged = { ...SEARCH_PARAMS, ...query, ...extras };
  return Object.fromEntries(
    Object.keys(SEARCH_PARAMS).map(key => [
      key,
      { value: merged[key] ?? SEARCH_PARAMS[key], defaultValue: SEARCH_PARAMS[key] },
    ])
  );
}

export function searchHref(query = {}) {
  return spaSearch({ view: SEARCH_VIEW, ...Object.fromEntries(
    Object.entries({ ...SEARCH_PARAMS, ...query }).filter(([key, value]) => (
      key !== 'sp' && value !== '' && value != null && value !== SEARCH_PARAMS[key]
    ))
  ) });
}

export function hasSearchFilters(query) {
  return Object.keys(SEARCH_PARAMS).some(key => (
    key !== 'sp' && query[key] !== '' && query[key] != null && query[key] !== SEARCH_PARAMS[key]
  ));
}

export function presetIsActive(query, preset) {
  return Object.entries(preset.params).every(([key, value]) => query[key] === value)
    && Object.keys(SEARCH_PARAMS).every(key => (
      key === 'sp' || preset.params[key] != null || query[key] === SEARCH_PARAMS[key]
    ));
}

export function listSearchRivals(matches) {
  return [...new Set(matches.map(match => clubOf(match.opponent)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'));
}

export function listSearchCompetitions(matches) {
  const families = new Map();
  matches.forEach(match => {
    if (!match.tournament) return;
    const family = tournamentFamily(match.tournament);
    if (!families.has(family)) families.set(family, new Set());
    families.get(family).add(match.tournament);
  });
  return [...families.entries()]
    .map(([family, variants]) => ({ family, variants: [...variants].sort((a, b) => a.localeCompare(b, 'es')) }))
    .sort((a, b) => a.family.localeCompare(b.family, 'es'));
}

export function listSearchPhases(matches) {
  const present = new Set(matches.map(match => phaseOf(match.round)).filter(Boolean));
  return PHASE_FAMILIES.filter(phase => present.has(phase.id));
}

export function listSearchScorers(matches, scorerAliases = aliases) {
  return rankScorers(matches, scorerAliases).map(row => row.name);
}

const parseScore = value => {
  const parts = String(value || '').split('-').map(part => Number.parseInt(part, 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { gf: parts[0], ga: parts[1] };
};

function matchPasses(match, query, resolve) {
  if (query.vs && clubOf(match.opponent) !== clubOf(canonicalizeRival(query.vs))) return false;
  if (query.comp && match.tournament !== query.comp && tournamentFamily(match.tournament) !== query.comp) return false;
  if (query.fase && match.round !== query.fase && phaseOf(match.round) !== query.fase) return false;
  if (query.sede === 'local' && !match.isHome) return false;
  if (query.sede === 'visita' && match.isHome) return false;

  if (query.from || query.to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match.date || '')) return false;
    const from = dateBound(query.from, 'start');
    const to = dateBound(query.to, 'end');
    if (from && match.date < from) return false;
    if (to && match.date > to) return false;
  }

  const results = String(query.res || '').split(',').filter(Boolean);
  if (results.length && !results.includes(match.resultCode)) return false;

  const scored = Number.isInteger(match.scGoals) && Number.isInteger(match.opponentGoals);
  if (query.gfmin !== '') {
    if (!scored || match.scGoals < Number(query.gfmin)) return false;
  }
  if (query.gamax !== '') {
    if (!scored || match.opponentGoals > Number(query.gamax)) return false;
  }
  if (query.score) {
    const wanted = parseScore(query.score);
    if (!wanted || !scored || match.scGoals !== wanted.gf || match.opponentGoals !== wanted.ga) return false;
  }
  if (query.goleador) {
    const wanted = resolve(query.goleador, match.date);
    const { goals } = matchGoals(match, resolve);
    if (!goals.some(goal => !goal.ownGoal && goal.name === wanted)) return false;
  }
  return true;
}

export function filterMatches(matches, query, scorerAliases = aliases) {
  const resolve = buildResolver(scorerAliases);
  return sortMatchesNewest(matches.filter(match => matchPasses(match, query, resolve)));
}

export function summarizeSearch(matches) {
  const summary = summarizeMatches(matches);
  return {
    ...summary,
    points: summary.victories * 3 + summary.draws,
  };
}

export function searchStreaks(matches) {
  return Object.fromEntries(Object.entries(SEARCH_STREAKS).map(([id, { label, test }]) => (
    [id, { id, label, ...streakRuns(matches, test) }]
  )));
}

export function matchNoun(length) {
  return length === 1 ? 'partido' : 'partidos';
}

export function streakCountLabel(length) {
  return `${length} ${matchNoun(length)}`;
}

export function clipStreakMatches(matches = [], cap = 10) {
  if (!Array.isArray(matches) || matches.length <= cap) {
    return { shown: matches, hidden: 0, split: false };
  }
  const head = 4;
  const tail = 4;
  return {
    shown: [...matches.slice(0, head), ...matches.slice(-tail)],
    hidden: matches.length - head - tail,
    split: true,
  };
}

export function activeStreaks(streaks, { minLength = 2 } = {}) {
  const order = ['winning', 'unbeaten', 'scoring', 'cleanSheet', 'winless'];
  return order
    .map(id => streaks[id])
    .filter(streak => streak?.current?.length >= minLength);
}

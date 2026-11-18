// Uniform random match picker. Views must not re-parse scores, dates or rival aliases.
import { formatMatchDate } from './matches.js';
import { RESULT_WORD } from './publicRoutes.js';
import { CLASICOS, clubOf } from './rivals.js';
import { decadeOf, listDecades } from './stats.js';
import { xIntentUrl } from './shareLinks.js';

export const RANDOM_MATCH_PATH = '/partidos/azar';
export const RESERVED_MATCH_IDS = Object.freeze(['azar']);
export const FILTERS_STORAGE_KEY = 'sc-azar-filters';
export const LAST_PATH_STORAGE_KEY = 'sc-azar-last';

const CLASICO_SET = new Set(CLASICOS);

export function emptyRandomFilters() {
  return { winsOnly: false, clasicosOnly: false, decade: null };
}

export function normalizeRandomFilters(input = {}) {
  const rawDecade = input.decade;
  const decade = rawDecade === '' || rawDecade == null ? null : Number(rawDecade);
  return {
    winsOnly: Boolean(input.winsOnly),
    clasicosOnly: Boolean(input.clasicosOnly),
    decade: Number.isInteger(decade) ? decade : null,
  };
}

function paramsFrom(search, hash) {
  const query = new URLSearchParams(search || '');
  const hashParams = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const get = key => (query.has(key) ? query.get(key) : hashParams.get(key));
  return { get, query, hashParams };
}

export function parseRandomFilters(search = '', hash = '') {
  const { get } = paramsFrom(search, hash);
  const wins = get('wins');
  const clasico = get('clasico') || get('clasicos');
  const decade = get('decade');
  if (wins == null && clasico == null && decade == null) return null;
  return normalizeRandomFilters({
    winsOnly: wins === '1',
    clasicosOnly: clasico === '1',
    decade,
  });
}

export function hasAutoRoll(search = '', hash = '') {
  const { get } = paramsFrom(search, hash);
  return get('auto') === '1';
}

export function randomMatchHref(filters = {}, { auto = false } = {}) {
  const next = normalizeRandomFilters(filters);
  const params = new URLSearchParams();
  if (auto) params.set('auto', '1');
  if (next.winsOnly) params.set('wins', '1');
  if (next.clasicosOnly) params.set('clasico', '1');
  if (next.decade != null) params.set('decade', String(next.decade));
  const encoded = params.toString();
  if (!encoded) return RANDOM_MATCH_PATH;
  return `${RANDOM_MATCH_PATH}#${encoded}`;
}

export function readStoredFilters(storage = globalThis.sessionStorage) {
  try {
    const raw = storage?.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRandomFilters(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredFilters(filters, storage = globalThis.sessionStorage) {
  try {
    storage?.setItem(FILTERS_STORAGE_KEY, JSON.stringify(normalizeRandomFilters(filters)));
  } catch {
    // Private mode can block sessionStorage; picking still works.
  }
}

export function readLastMatchPath(storage = globalThis.sessionStorage) {
  try {
    return storage?.getItem(LAST_PATH_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function writeLastMatchPath(path, storage = globalThis.sessionStorage) {
  try {
    if (path) storage?.setItem(LAST_PATH_STORAGE_KEY, path);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resolveRandomFilters({ search = '', hash = '', stored } = {}) {
  return parseRandomFilters(search, hash) || stored || readStoredFilters() || emptyRandomFilters();
}

export function isClasicoMatch(match) {
  return CLASICO_SET.has(clubOf(match?.opponent));
}

export function matchPassesRandomFilters(match, filters = {}) {
  const next = normalizeRandomFilters(filters);
  if (!match) return false;
  if (next.winsOnly && match.resultCode !== 'V') return false;
  if (next.clasicosOnly && !isClasicoMatch(match)) return false;
  if (next.decade != null && decadeOf(match.year) !== next.decade) return false;
  return true;
}

export function filterRandomPool(entries, filters = {}) {
  return (entries || []).filter(entry => (
    Boolean(entry?.path)
    && matchPassesRandomFilters(entry.match, filters)
  ));
}

export function compactRandomIndex(entries) {
  return (entries || []).filter(entry => entry?.path).map(entry => ({
    p: entry.path,
    y: entry.match.year,
    r: entry.match.resultCode || '',
    c: isClasicoMatch(entry.match) ? 1 : 0,
  }));
}

export function compactRowPassesFilters(row, filters = {}) {
  const next = normalizeRandomFilters(filters);
  if (!row?.p) return false;
  if (next.winsOnly && row.r !== 'V') return false;
  if (next.clasicosOnly && row.c !== 1) return false;
  if (next.decade != null && decadeOf(row.y) !== next.decade) return false;
  return true;
}

export function filterCompactIndex(rows, filters = {}) {
  return (rows || []).filter(row => compactRowPassesFilters(row, filters));
}

export function createSeededRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickUniform(items, rng = Math.random) {
  if (!items?.length) return null;
  const raw = rng();
  const unit = Number.isFinite(raw) ? raw - Math.floor(raw) : 0;
  const bounded = unit < 0 ? unit + 1 : unit;
  const index = Math.min(items.length - 1, Math.floor(bounded * items.length));
  return items[index];
}

function excludeFromPool(pool, excludePath) {
  if (!excludePath || pool.length <= 1) return pool;
  const next = pool.filter(item => (item.path || item.p) !== excludePath);
  return next.length ? next : pool;
}

export function pickRandomMatch(entries, filters = {}, rng = Math.random, { excludePath } = {}) {
  const pool = excludeFromPool(filterRandomPool(entries, filters), excludePath);
  return { pool, pick: pickUniform(pool, rng) };
}

export function pickRandomCompact(rows, filters = {}, rng = Math.random, { excludePath } = {}) {
  const pool = excludeFromPool(filterCompactIndex(rows, filters), excludePath);
  return { pool, pick: pickUniform(pool, rng) };
}

export function randomMatchShareText(match) {
  if (!match) return 'Sporting Cristal en Sebiche Celeste';
  const word = RESULT_WORD[match.resultCode] || 'Partido';
  return `${word} ${match.scoreLabel}: ${match.home} vs. ${match.away} (${formatMatchDate(match.date)})`;
}

export function randomMatchShareIntent(match, url) {
  return xIntentUrl(randomMatchShareText(match), url);
}

export function decadesForRandom(matches) {
  return listDecades(matches);
}

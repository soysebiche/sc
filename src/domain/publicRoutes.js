// Canonical public paths for the static HTML archive. Query param names stay unchanged.
import { clubOf } from './matches.js';
import { SITE_URL } from './shareLinks.js';
import { rankScorers } from './stats.js';

export { SITE_URL };

export const OG_IMAGE_PATH = '/og/home.png';
export const RESULT_WORD = Object.freeze({ V: 'Victoria', E: 'Empate', P: 'Derrota' });
export const PUBLIC_NAV = Object.freeze([
  { path: '/partidos', label: 'Partidos' },
  { path: '/jugadores', label: 'Jugadores' },
  { path: '/rivales', label: 'Rivales' },
  { path: '/paises', label: 'Países' },
  { path: '/temporadas', label: 'Temporadas' },
]);
export const ARCHIVE_HEADS = Object.freeze(['partidos', 'jugadores', 'rivales', 'paises', 'temporadas']);
export const COMPARE_PATH = '/temporadas/comparar';

export function slugify(value) {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'item';
}

export function uniqueSlug(name, used) {
  const base = slugify(name);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const next = `${base}-${n}`;
  used.add(next);
  return next;
}

const RESERVED_MATCH_IDS = new Set(['azar']);

export function matchPublicId(match, used) {
  const candidates = [
    slugify(`${match.date}-${match.opponent}`),
    slugify(`${match.date}-${match.opponent}-${match.tournament}`),
    slugify(`${match.date}-${match.home}-${match.away}-${match.tournament}`),
  ];
  for (const candidate of candidates) {
    if (candidate && !used.has(candidate) && !RESERVED_MATCH_IDS.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  const fallback = candidates.at(-1) || slugify(match.date);
  let n = 2;
  while (used.has(`${fallback}-${n}`)) n += 1;
  const next = `${fallback}-${n}`;
  used.add(next);
  return next;
}

export function spaSearch(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `/?${query}` : '/';
}

export function buildPublicCatalog(matches, scorerAliases = { players: {} }) {
  const usedMatchIds = new Set();
  const usedRivalSlugs = new Set();
  const usedCountrySlugs = new Set();
  const usedPlayerSlugs = new Set();

  const matchEntries = matches.map(match => {
    const id = matchPublicId(match, usedMatchIds);
    return {
      match,
      id,
      path: `/partidos/${id}`,
      spa: spaSearch({ view: 'partidos', year: match.year || '', month: match.month || '' }),
    };
  });

  const byRival = new Map();
  const byCountry = new Map();
  const bySeason = new Map();

  matchEntries.forEach(entry => {
    const { match } = entry;
    const rivalName = clubOf(match.opponent);
    if (!byRival.has(rivalName)) byRival.set(rivalName, { names: new Set(), entries: [] });
    const group = byRival.get(rivalName);
    group.names.add(match.opponent);
    group.names.add(rivalName);
    group.entries.push(entry);
    if (match.country) {
      if (!byCountry.has(match.country)) byCountry.set(match.country, []);
      byCountry.get(match.country).push(entry);
    }
    if (match.year != null) {
      if (!bySeason.has(match.year)) bySeason.set(match.year, []);
      bySeason.get(match.year).push(entry);
    }
  });

  const rivals = [...byRival.keys()].sort((a, b) => a.localeCompare(b, 'es')).map(name => {
    const slug = uniqueSlug(name, usedRivalSlugs);
    const group = byRival.get(name);
    return {
      name,
      names: [...group.names].sort((a, b) => a.localeCompare(b, 'es')),
      slug,
      path: `/rivales/${slug}`,
      matches: group.entries,
      spa: spaSearch({ view: 'rivales', rival: name }),
    };
  });

  const countries = [...byCountry.keys()].sort((a, b) => a.localeCompare(b, 'es')).map(name => {
    const slug = uniqueSlug(name, usedCountrySlugs);
    return {
      name,
      slug,
      path: `/paises/${slug}`,
      matches: byCountry.get(name),
      spa: spaSearch({ view: 'paises', country: name }),
    };
  });

  const seasons = [...bySeason.keys()].sort((a, b) => b - a).map(year => ({
    year,
    path: `/temporadas/${year}`,
    matches: bySeason.get(year),
    spa: spaSearch({ view: 'partidos', year }),
  }));

  const players = rankScorers(matches, scorerAliases).map(player => {
    const slug = uniqueSlug(player.name, usedPlayerSlugs);
    return {
      name: player.name,
      goals: player.goals,
      matches: player.matches,
      first: player.first,
      last: player.last,
      lowerBound: player.lowerBound,
      slug,
      path: `/jugadores/${slug}`,
      spa: spaSearch({ view: 'goleadores', jugador: player.name }),
    };
  });

  return {
    matches: matchEntries,
    rivals,
    countries,
    seasons,
    players,
    indexes: {
      home: { path: '/', spa: '/' },
      partidos: { path: '/partidos', spa: spaSearch({ view: 'partidos' }) },
      jugadores: { path: '/jugadores', spa: spaSearch({ view: 'goleadores' }) },
      rivales: { path: '/rivales', spa: spaSearch({ view: 'rivales' }) },
      paises: { path: '/paises', spa: spaSearch({ view: 'paises' }) },
      temporadas: { path: '/temporadas', spa: spaSearch({ view: 'analisis-anual' }) },
      comparar: { path: COMPARE_PATH, spa: spaSearch({ view: 'comparar' }) },
    },
  };
}

export function compareSpaSearch({ a, b, ap, bp } = {}) {
  return spaSearch({ view: 'comparar', a, b, ap, bp });
}

export function rivalPathByName(catalog, name) {
  const canonical = clubOf(name);
  return catalog.rivals.find(rival => rival.name === name || rival.name === canonical || rival.names?.includes(name) || rival.names?.includes(canonical))?.path || '/rivales';
}

export function countryPathByName(catalog, name) {
  return catalog.countries.find(country => country.name === name)?.path || '/paises';
}

export function seasonPathByYear(year) {
  return `/temporadas/${year}`;
}

export function matchKey(match) {
  return [match.date, match.home, match.away, match.tournament].join('|');
}

export function playerPathByName(catalog, name) {
  return catalog.players.find(player => player.name === name)?.path || '/jugadores';
}

export function buildCatalogLookups(catalog) {
  const rivalPaths = new Map();
  for (const rival of catalog.rivals) {
    rivalPaths.set(rival.name, rival.path);
    for (const alias of rival.names || []) rivalPaths.set(alias, rival.path);
  }
  return {
    matchPathByKey: new Map(catalog.matches.map(entry => [matchKey(entry.match), entry.path])),
    rivalPathByName: rivalPaths,
    countryPathByName: new Map(catalog.countries.map(country => [country.name, country.path])),
    playerPathByName: new Map(catalog.players.map(player => [player.name, player.path])),
  };
}

export function canonicalPath(pathname) {
  const raw = String(pathname || '/').split('?')[0].split('#')[0];
  let path = raw.replace(/\/+$/, '');
  if (!path || path === '/index.html') return '/';
  if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
  path = path || '/';
  const segs = path.split('/').filter(Boolean);
  if (segs[0] && ARCHIVE_HEADS.includes(segs[0].toLowerCase())) {
    return `/${segs.map(seg => seg.toLowerCase()).join('/')}`;
  }
  return path;
}

export function absoluteUrl(pathname, origin = SITE_URL) {
  const path = canonicalPath(pathname);
  if (path === '/') return `${origin}/`;
  return `${origin}${path}`;
}

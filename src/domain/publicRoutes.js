// Canonical public paths for the static HTML archive. Query param names stay unchanged.
import { SITE_URL } from './shareLinks.js';

export { SITE_URL };

export const OG_IMAGE_PATH = '/og/home.png';
export const RESULT_WORD = Object.freeze({ V: 'Victoria', E: 'Empate', P: 'Derrota' });

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

export function matchPublicId(match, used) {
  const candidates = [
    slugify(`${match.date}-${match.opponent}`),
    slugify(`${match.date}-${match.opponent}-${match.tournament}`),
    slugify(`${match.date}-${match.home}-${match.away}-${match.tournament}`),
  ];
  for (const candidate of candidates) {
    if (candidate && !used.has(candidate)) {
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

export function buildPublicCatalog(matches) {
  const usedMatchIds = new Set();
  const usedRivalSlugs = new Set();
  const usedCountrySlugs = new Set();

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
    if (!byRival.has(match.opponent)) byRival.set(match.opponent, []);
    byRival.get(match.opponent).push(entry);
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
    return {
      name,
      slug,
      path: `/rivales/${slug}`,
      matches: byRival.get(name),
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

  return {
    matches: matchEntries,
    rivals,
    countries,
    seasons,
    indexes: {
      home: { path: '/', spa: '/' },
      partidos: { path: '/partidos', spa: spaSearch({ view: 'partidos' }) },
      rivales: { path: '/rivales', spa: spaSearch({ view: 'rivales' }) },
      paises: { path: '/paises', spa: spaSearch({ view: 'paises' }) },
      temporadas: { path: '/temporadas', spa: spaSearch({ view: 'analisis-anual' }) },
    },
  };
}

export function rivalPathByName(catalog, name) {
  return catalog.rivals.find(rival => rival.name === name)?.path || '/rivales';
}

export function countryPathByName(catalog, name) {
  return catalog.countries.find(country => country.name === name)?.path || '/paises';
}

export function seasonPathByYear(year) {
  return `/temporadas/${year}`;
}

export function absoluteUrl(pathname, origin = SITE_URL) {
  if (pathname === '/') return `${origin}/`;
  return `${origin}${pathname}`;
}

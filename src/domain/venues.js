import { CITY_COORDS, RIVAL_HOME_CITY, isKnownCityId } from '../data/rival-cities.js';
import { canonicalizeRival, sortMatchesNewest } from './matches.js';
import { clubOf, summarize } from './rivals.js';

export { isKnownCityId };

const scored = matches => matches.filter(m => (
  Number.isInteger(m.scGoals) && Number.isInteger(m.opponentGoals) && m.resultCode
));

export function cityIdForRival(opponent, country) {
  const names = [
    opponent,
    canonicalizeRival(opponent),
    clubOf(opponent),
    clubOf(canonicalizeRival(opponent)),
  ];
  for (const name of names) {
    const cityId = RIVAL_HOME_CITY[`${name}|${country}`];
    if (cityId) return cityId;
  }
  return null;
}

function emptyBucket(city) {
  return {
    ...city,
    homeMatches: [],
    awayMatches: [],
    clubs: new Map(),
  };
}

function clubRows(clubs, fallbackCountry) {
  return [...clubs].map(([name, list]) => ({
    name,
    country: list[0]?.country || fallbackCountry,
    ...summarize(list),
    matches: sortMatchesNewest(list),
  })).sort((a, b) => b.played - a.played || a.name.localeCompare(b.name, 'es'));
}

/**
 * Group scored matches by rival home city.
 * Home matches (Cristal as Equipo Local) are attributed to Lima, the club's
 * city — not to a stadium. Away matches use the curated club → city table.
 */
export function aggregateCities(matches) {
  const byCity = new Map();
  const unmappedMatches = [];

  const ensure = (id) => {
    if (!byCity.has(id)) byCity.set(id, emptyBucket(CITY_COORDS[id]));
    return byCity.get(id);
  };

  for (const match of scored(matches)) {
    if (match.isHome) {
      ensure('lima').homeMatches.push(match);
      continue;
    }
    const cityId = cityIdForRival(match.opponent, match.country);
    if (!cityId || !CITY_COORDS[cityId]) {
      unmappedMatches.push(match);
      continue;
    }
    const bucket = ensure(cityId);
    bucket.awayMatches.push(match);
    const club = canonicalizeRival(match.opponent);
    if (!bucket.clubs.has(club)) bucket.clubs.set(club, []);
    bucket.clubs.get(club).push(match);
  }

  const cities = [...byCity.values()].map((bucket) => {
    const home = summarize(bucket.homeMatches);
    const away = summarize(bucket.awayMatches);
    return {
      id: bucket.id,
      name: bucket.name,
      country: bucket.country,
      lat: bucket.lat,
      lng: bucket.lng,
      isPeru: bucket.country === 'Perú',
      home,
      away,
      totalPlayed: home.played + away.played,
      homeMatches: sortMatchesNewest(bucket.homeMatches),
      awayMatches: sortMatchesNewest(bucket.awayMatches),
      clubs: clubRows(bucket.clubs, bucket.country),
    };
  }).sort((a, b) => {
    if (a.id === 'lima') return -1;
    if (b.id === 'lima') return 1;
    return b.away.played - a.away.played || a.name.localeCompare(b.name, 'es');
  });

  const unmappedClubs = new Map();
  for (const match of unmappedMatches) {
    const club = canonicalizeRival(match.opponent);
    if (!unmappedClubs.has(club)) unmappedClubs.set(club, []);
    unmappedClubs.get(club).push(match);
  }

  return {
    cities,
    unmapped: {
      matches: sortMatchesNewest(unmappedMatches),
      clubs: clubRows(unmappedClubs, ''),
    },
  };
}

export function filterCities(cities, scope = 'todos') {
  if (scope === 'peru') return cities.filter(city => city.isPeru);
  if (scope === 'internacional') return cities.filter(city => !city.isPeru);
  return cities;
}

export const MAP_SCOPES = Object.freeze(['todos', 'peru', 'internacional']);
export const isMapScope = value => MAP_SCOPES.includes(value);
export const LIMA_SIDES = Object.freeze(['local', 'visita']);
export const isLimaSide = value => LIMA_SIDES.includes(value);

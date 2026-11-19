import { describe, expect, it } from 'vitest';
import { CITY_COORDS, RIVAL_HOME_CITY, UNMAPPED_RIVAL_KEYS } from '../data/rival-cities.js';
import archive from '../data/historico_completo_sc.json';
import { canonicalizeRival, parseMatch } from './matches.js';
import { clubOf } from './rivals.js';
import { aggregateCities, cityIdForRival, filterCities } from './venues.js';

const all = archive.map(parseMatch);

const mk = (extra = {}) => parseMatch({
  Año: 2024,
  Fecha: '2024-08-04',
  Torneo: 'Liga',
  'Equipo Local': 'Sporting Cristal',
  'Equipo Visita': 'A.D.T.',
  Marcador: '2-0',
  Resultado: 'V',
  País: 'Perú',
  ...extra,
});

describe('rival city table', () => {
  it('points every mapped club at a defined city centroid', () => {
    const missing = Object.entries(RIVAL_HOME_CITY)
      .filter(([, cityId]) => !CITY_COORDS[cityId])
      .map(([key]) => key);
    expect(missing).toEqual([]);
  });

  it('keeps city records without stadium fields', () => {
    Object.values(CITY_COORDS).forEach((city) => {
      expect(city).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        country: expect.any(String),
        lat: expect.any(Number),
        lng: expect.any(Number),
      }));
      expect(city).not.toHaveProperty('stadium');
      expect(city).not.toHaveProperty('venue');
    });
  });

  it('uses the canonical A.D.T. name for Tarma', () => {
    expect(clubOf('ADT')).toBe('A.D.T.');
    expect(cityIdForRival('A.D.T.', 'Perú')).toBe('tarma');
    expect(cityIdForRival('ADT', 'Perú')).toBe('tarma');
    expect(CITY_COORDS.tarma).toMatchObject({ name: 'Tarma', country: 'Perú' });
  });

  it('disambiguates shared archive names by country', () => {
    expect(cityIdForRival('Estudiantes', 'Perú')).toBe('ica');
    expect(cityIdForRival('Estudiantes', 'Argentina')).toBe('la-plata');
    expect(cityIdForRival('Universidad Católica', 'Chile')).toBe('santiago');
    expect(cityIdForRival('Universidad Católica', 'Ecuador')).toBe('quito');
  });

  it('does not treat Internazionale or América as European/Colombian clubs', () => {
    expect(cityIdForRival('Internazionale', 'Perú')).toBe('lima');
    expect(cityIdForRival('América', 'México')).toBe('ciudad-de-mexico');
    expect(cityIdForRival('Nacional', 'Uruguay')).toBe('montevideo');
    expect(cityIdForRival('Santos', 'Brasil')).toBe('santos');
    expect(cityIdForRival('Santos Laguna', 'México')).toBe('torreon');
  });

  it('normalizes rival aliases before looking up a city', () => {
    expect(cityIdForRival('UTC', 'Perú')).toBe('cajamarca');
    expect(cityIdForRival('Union Comercio', 'Perú')).toBe('nueva-cajamarca');
    expect(cityIdForRival('Académia Cantolao', 'Perú')).toBe('callao');
    expect(cityIdForRival('Deportivo Los Chankas', 'Perú')).toBe('andahuaylas');
  });
});

describe('aggregateCities', () => {
  it('attributes every home match to Lima and away matches to the rival city', () => {
    const home = mk();
    const away = mk({
      Fecha: '2024-08-11',
      'Equipo Local': 'A.D.T.',
      'Equipo Visita': 'Sporting Cristal',
      Marcador: '1-0',
      Resultado: 'P',
    });
    const { cities, unmapped } = aggregateCities([home, away]);
    expect(unmapped.matches).toHaveLength(0);
    const lima = cities.find(city => city.id === 'lima');
    const tarma = cities.find(city => city.id === 'tarma');
    expect(lima.home).toMatchObject({ played: 1, V: 1, goalsFor: 2, goalsAgainst: 0 });
    expect(lima.away.played).toBe(0);
    expect(tarma.away).toMatchObject({ played: 1, P: 1, goalsFor: 0, goalsAgainst: 1 });
    expect(tarma.home.played).toBe(0);
    expect(tarma.clubs[0].name).toBe('A.D.T.');
  });

  it('keeps undocumented away rivals off the map', () => {
    const unknown = mk({
      'Equipo Local': 'Pirata',
      'Equipo Visita': 'Sporting Cristal',
      Marcador: '2-2',
      País: 'Perú',
    });
    const { cities, unmapped } = aggregateCities([unknown]);
    expect(cities.some(city => city.awayMatches.includes(unknown))).toBe(false);
    expect(unmapped.matches).toHaveLength(1);
    expect(unmapped.clubs[0].name).toBe('Pirata');
  });

  it('filters Peru vs international city lists', () => {
    const { cities } = aggregateCities(all);
    const peru = filterCities(cities, 'peru');
    const intl = filterCities(cities, 'internacional');
    expect(peru.every(city => city.isPeru)).toBe(true);
    expect(intl.every(city => !city.isPeru)).toBe(true);
    expect(peru.length + intl.length).toBe(cities.length);
  });
});

describe('real archive coverage', () => {
  const { cities, unmapped } = aggregateCities(all);
  const lima = cities.find(city => city.id === 'lima');
  const scored = all.filter(m => m.resultCode && Number.isInteger(m.scGoals));
  const home = scored.filter(m => m.isHome);
  const away = scored.filter(m => !m.isHome);

  it('puts every scored home match in Lima and does not invent venues', () => {
    expect(lima.home.played).toBe(home.length);
    expect(lima.homeMatches).toHaveLength(home.length);
    expect(cities.every(city => city.stadium == null && city.venue == null)).toBe(true);
  });

  it('maps away matches except the explicitly undocumented names', () => {
    const mappedAway = cities.reduce((sum, city) => sum + city.away.played, 0);
    expect(mappedAway + unmapped.matches.length).toBe(away.length);
    const keys = [...new Set(unmapped.matches.map(m => `${canonicalizeRival(m.opponent)}|${m.country}`))].sort();
    expect(keys).toEqual([...UNMAPPED_RIVAL_KEYS].sort());
  });

  it('records A.D.T. away games in Tarma and Lima home games separately', () => {
    const tarma = cities.find(city => city.id === 'tarma');
    const adtAway = scored.filter(m => !m.isHome && m.opponent === 'A.D.T.');
    expect(tarma.clubs.some(club => club.name === 'A.D.T.')).toBe(true);
    expect(tarma.away.played).toBe(adtAway.length);
    expect(tarma.away.goalsFor).toBe(adtAway.reduce((sum, m) => sum + m.scGoals, 0));
    expect(tarma.away.goalsAgainst).toBe(adtAway.reduce((sum, m) => sum + m.opponentGoals, 0));
  });

  it('splits Estudiantes 2001 (Ica) from Estudiantes de La Plata', () => {
    const ica = cities.find(city => city.id === 'ica');
    const laPlata = cities.find(city => city.id === 'la-plata');
    expect(ica.awayMatches.some(m => m.opponent === 'Estudiantes' && m.country === 'Perú')).toBe(true);
    expect(laPlata.awayMatches.every(m => m.country === 'Argentina')).toBe(true);
    expect(laPlata.clubs.some(club => club.name === 'Estudiantes')).toBe(true);
  });
});

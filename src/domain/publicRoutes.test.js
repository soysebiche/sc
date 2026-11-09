import archive from '../data/historico_completo_sc.json';
import { parseMatch } from './matches';
import { absoluteUrl, buildPublicCatalog, canonicalPath, matchPublicId, slugify, spaSearch } from './publicRoutes';

const matches = archive.map(parseMatch);

describe('public archive routes', () => {
  const catalog = buildPublicCatalog(matches);

  test('slugify strips accents and punctuation', () => {
    expect(slugify('Alianza Lima')).toBe('alianza-lima');
    expect(slugify('Unión Comercio')).toBe('union-comercio');
    expect(slugify('U.T.C.')).toBe('u-t-c');
  });

  test('assigns a unique path to every match, rival, country and season', () => {
    const matchIds = catalog.matches.map(entry => entry.id);
    expect(new Set(matchIds).size).toBe(matches.length);
    expect(new Set(catalog.rivals.map(rival => rival.slug)).size).toBe(catalog.rivals.length);
    expect(new Set(catalog.countries.map(country => country.slug)).size).toBe(catalog.countries.length);
    expect(new Set(catalog.seasons.map(season => season.path)).size).toBe(catalog.seasons.length);
    expect(catalog.matches).toHaveLength(2154);
    expect(catalog.rivals.length).toBeGreaterThan(100);
    expect(catalog.countries.map(country => country.name)).toEqual(expect.arrayContaining(['Perú', 'Argentina']));
  });

  test('keeps shareable SPA query names when mapping a public path', () => {
    expect(spaSearch({ view: 'rivales', rival: 'Alianza Lima' })).toBe('/?view=rivales&rival=Alianza+Lima');
    const alianzas = catalog.rivals.find(rival => rival.name === 'Alianza Lima');
    expect(alianzas.spa).toBe('/?view=rivales&rival=Alianza+Lima');
    expect(catalog.indexes.partidos.spa).toBe('/?view=partidos');
  });

  test('canonical paths drop trailing slashes, queries and index.html', () => {
    expect(canonicalPath('/partidos/1956-08-05-alianza-lima/')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(canonicalPath('/rivales/alianza-lima?utm=1')).toBe('/rivales/alianza-lima');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/temporadas/1991/index.html')).toBe('/temporadas/1991');
    expect(absoluteUrl('/partidos/foo/')).toBe('https://celeste.sebiche.com/partidos/foo');
    expect(absoluteUrl('/')).toBe('https://celeste.sebiche.com/');
  });

  test('disambiguates a colliding match id without inventing a match', () => {
    const used = new Set();
    const first = matchPublicId({ date: '1990-01-01', opponent: 'Demo', tournament: 'Liga', home: 'Sporting Cristal', away: 'Demo' }, used);
    const second = matchPublicId({ date: '1990-01-01', opponent: 'Demo', tournament: 'Copa', home: 'Demo', away: 'Sporting Cristal' }, used);
    expect(first).not.toBe(second);
    expect(used.size).toBe(2);
  });
});

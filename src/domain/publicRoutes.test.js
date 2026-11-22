import archive from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseMatch } from './matches';
import { COMPARE_PATH, absoluteUrl, buildCatalogLookups, buildPublicCatalog, canonicalPath, compareSpaSearch, matchKey, matchPublicId, slugify, spaSearch } from './publicRoutes';

const matches = archive.map(parseMatch);

describe('public archive routes', () => {
  const catalog = buildPublicCatalog(matches, aliases);

  test('slugify strips accents and punctuation', () => {
    expect(slugify('Alianza Lima')).toBe('alianza-lima');
    expect(slugify('Unión Comercio')).toBe('union-comercio');
    expect(slugify('U.T.C.')).toBe('u-t-c');
  });

  test('assigns a unique path to every match, rival, country, season and player', () => {
    const matchIds = catalog.matches.map(entry => entry.id);
    expect(new Set(matchIds).size).toBe(matches.length);
    expect(new Set(catalog.rivals.map(rival => rival.slug)).size).toBe(catalog.rivals.length);
    expect(new Set(catalog.countries.map(country => country.slug)).size).toBe(catalog.countries.length);
    expect(new Set(catalog.seasons.map(season => season.path)).size).toBe(catalog.seasons.length);
    expect(new Set(catalog.players.map(player => player.slug)).size).toBe(catalog.players.length);
    expect(catalog.matches).toHaveLength(2156);
    expect(catalog.rivals.length).toBeGreaterThan(100);
    expect(catalog.players.length).toBeGreaterThan(300);
    expect(catalog.players[0].name).toBe('Jorge Soto');
    expect(catalog.players[0].path).toBe('/jugadores/jorge-soto');
    expect(catalog.countries.map(country => country.name)).toEqual(expect.arrayContaining(['Perú', 'Argentina']));
  });

  test('keeps shareable SPA query names when mapping a public path', () => {
    expect(spaSearch({ view: 'rivales', rival: 'Alianza Lima' })).toBe('/?view=rivales&rival=Alianza+Lima');
    const alianzas = catalog.rivals.find(rival => rival.name === 'Alianza Lima');
    expect(alianzas.spa).toBe('/?view=rivales&rival=Alianza+Lima');
    expect(catalog.indexes.partidos.spa).toBe('/?view=partidos');
    expect(catalog.indexes.jugadores.spa).toBe('/?view=goleadores');
    expect(catalog.indexes.comparar.path).toBe(COMPARE_PATH);
    expect(compareSpaSearch({ a: 2023, b: 2024, ap: 'apertura' })).toBe('/?view=comparar&a=2023&b=2024&ap=apertura');
  });

  test('canonical paths drop trailing slashes, queries and index.html', () => {
    expect(canonicalPath('/partidos/1956-08-05-alianza-lima/')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(canonicalPath('/rivales/alianza-lima?utm=1')).toBe('/rivales/alianza-lima');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/temporadas/1991/index.html')).toBe('/temporadas/1991');
    expect(canonicalPath('/Partidos/1956-08-05-Alianza-Lima')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(canonicalPath('/Jugadores/Jorge-Soto')).toBe('/jugadores/jorge-soto');
    expect(absoluteUrl('/partidos/foo/')).toBe('https://celeste.sebiche.com/partidos/foo');
    expect(absoluteUrl('/')).toBe('https://celeste.sebiche.com/');
  });

  test('lookups map a match and rival to the public path used in the sitemap', () => {
    const lookups = buildCatalogLookups(catalog);
    const alianzas = catalog.rivals.find(rival => rival.name === 'Alianza Lima');
    const first = alianzas.matches[0];
    expect(lookups.matchPathByKey.get(matchKey(first.match))).toBe(first.path);
    expect(lookups.rivalPathByName.get('Alianza Lima')).toBe('/rivales/alianza-lima');
    expect(lookups.rivalPathByName.get('Real Garcilaso')).toBe('/rivales/cusco-fc');
    expect(lookups.playerPathByName.get('Jorge Soto')).toBe('/jugadores/jorge-soto');
  });

  test('groups lineage aliases onto one rival slug and keeps distinct clubs apart', () => {
    const cusco = catalog.rivals.find(rival => rival.name === 'Cusco FC');
    expect(cusco.slug).toBe('cusco-fc');
    expect(cusco.names).toEqual(expect.arrayContaining(['Cusco FC', 'Real Garcilaso']));
    expect(catalog.rivals.find(rival => rival.name === 'Real Garcilaso')).toBeUndefined();
    expect(catalog.rivals.find(rival => rival.name === 'Deportivo Garcilaso').slug).toBe('deportivo-garcilaso');
    expect(catalog.rivals.find(rival => rival.name === 'A.D.T.').slug).toBe('a-d-t');
  });

  test('disambiguates a colliding match id without inventing a match', () => {
    const used = new Set();
    const first = matchPublicId({ date: '1990-01-01', opponent: 'Demo', tournament: 'Liga', home: 'Sporting Cristal', away: 'Demo' }, used);
    const second = matchPublicId({ date: '1990-01-01', opponent: 'Demo', tournament: 'Copa', home: 'Demo', away: 'Sporting Cristal' }, used);
    expect(first).not.toBe(second);
    expect(used.size).toBe(2);
  });

  test('does not assign the reserved /partidos/azar id to a match', () => {
    expect(catalog.matches.some(entry => entry.id === 'azar' || entry.path === '/partidos/azar')).toBe(false);
  });
});

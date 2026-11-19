import { isArchivePath, normalizePublicPath, redirectLocation } from './publicRedirects';

describe('public URL duplicate redirects', () => {
  test('leaves the canonical archive path and SPA home queries alone', () => {
    expect(redirectLocation('/partidos/1956-08-05-alianza-lima')).toBeNull();
    expect(redirectLocation('/rivales/alianza-lima')).toBeNull();
    expect(redirectLocation('/temporadas/1956')).toBeNull();
    expect(redirectLocation('/', '?view=rivales&rival=Alianza+Lima')).toBeNull();
    expect(redirectLocation('/privacidad.html')).toBeNull();
    expect(redirectLocation('/api/share', '?type=h2h')).toBeNull();
  });

  test('308s slash, index.html, case, aliases, locale and /celeste prefixes', () => {
    expect(redirectLocation('/partidos/1956-08-05-alianza-lima/')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/partidos/1956-08-05-alianza-lima/index.html')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/Partidos/1956-08-05-Alianza-Lima')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/matches/1956-08-05-alianza-lima')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/partido/1956-08-05-alianza-lima')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/en/partidos/1956-08-05-alianza-lima')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/es/rivales/alianza-lima')).toBe('/rivales/alianza-lima');
    expect(redirectLocation('/celeste/temporadas/1956')).toBe('/temporadas/1956');
    expect(redirectLocation('/celeste')).toBe('/');
    expect(redirectLocation('/seasons/1991')).toBe('/temporadas/1991');
    expect(redirectLocation('/rivals/alianza-lima')).toBe('/rivales/alianza-lima');
    expect(redirectLocation('/countries/argentina')).toBe('/paises/argentina');
    expect(redirectLocation('/players/jorge-soto')).toBe('/jugadores/jorge-soto');
    expect(redirectLocation('/jugador/jorge-soto')).toBe('/jugadores/jorge-soto');
    expect(redirectLocation('/goleadores/jorge-soto')).toBe('/jugadores/jorge-soto');
    expect(redirectLocation('/Jugadores/Jorge-Soto')).toBe('/jugadores/jorge-soto');
  });

  test('strips query strings on archive pages but not on the SPA home', () => {
    expect(redirectLocation('/partidos/1956-08-05-alianza-lima', '?utm=1')).toBe('/partidos/1956-08-05-alianza-lima');
    expect(redirectLocation('/rivales', '?view=rivales')).toBe('/rivales');
    expect(redirectLocation('/', '?view=partidos&year=1956')).toBeNull();
  });

  test('does not treat /paises as the singular /pais alias', () => {
    expect(normalizePublicPath('/paises/peru')).toBe('/paises/peru');
    expect(redirectLocation('/paises/peru')).toBeNull();
    expect(redirectLocation('/pais/peru')).toBe('/paises/peru');
    expect(isArchivePath('/partidos/foo')).toBe(true);
    expect(isArchivePath('/')).toBe(false);
  });
});

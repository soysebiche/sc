import archive from '../data/historico_completo_sc.json';
import {
  canonicalizeRival,
  getMatchesForDayMonth,
  getUniqueYears,
  paginateMatches,
  parseMatch,
  resultFromScoreAndNote,
  summarizeMatches,
  calculateArchiveOverview,
} from './matches';

const rawHomeWin = {
  Año: 2024,
  Fecha: '2024-08-04',
  'Equipo Local': 'Sporting Cristal',
  'Equipo Visita': 'UTC',
  Marcador: '2-0',
};

const homeWin = parseMatch(rawHomeWin);

describe('match domain', () => {
  test('normalizes confirmed rival aliases without changing historical records', () => {
    expect(canonicalizeRival('UTC')).toBe('U.T.C.');
    expect(canonicalizeRival('Union Comercio')).toBe('Unión Comercio');
    expect(canonicalizeRival('Sport Boys')).toBe('Sport Boys');
    expect(homeWin.opponent).toBe('U.T.C.');
  });

  test('reads year and score from the club perspective', () => {
    expect(homeWin.year).toBe(2024);
    expect(homeWin.scGoals).toBe(2);
    expect(homeWin.opponentGoals).toBe(0);
    expect(homeWin.resultCode).toBe('V');
  });

  test('honors a documented penalty shootout after a drawn score', () => {
    expect(parseMatch({
      ...rawHomeWin,
      Marcador: '0-0',
      Resultado: 'D',
      'Goles (Solo SC)': '(Perdió 5-4 en penales)',
    }).resultCode).toBe('P');
    expect(resultFromScoreAndNote({
      scGoals: 0,
      opponentGoals: 0,
      resultField: 'D',
      goalsNote: '(Perdió 5-4 en penales)',
    })).toBe('P');
  });

  test('keeps unique years in descending order', () => {
    expect(getUniqueYears([
      homeWin,
      parseMatch({ ...rawHomeWin, Año: 2026 }),
      parseMatch({ ...rawHomeWin, Año: 2024 }),
      parseMatch({ ...rawHomeWin, Año: 1956 }),
    ])).toEqual([2026, 2024, 1956]);
  });

  test('summarizes valid matches from the club perspective', () => {
    const draw = parseMatch({ ...rawHomeWin, Marcador: '1-1' });
    expect(summarizeMatches([homeWin, draw])).toEqual({
      total: 2,
      victories: 1,
      draws: 1,
      defeats: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      winPercentage: '50.0',
      drawPercentage: '50.0',
      defeatPercentage: '0.0',
    });
  });

  test('clamps pagination and keeps collections bounded', () => {
    const matches = Array.from({ length: 40 }, (_, index) => ({ id: index }));
    expect(paginateMatches(matches, '2')).toMatchObject({ currentPage: 2, totalPages: 3, start: 19, end: 36 });
    expect(paginateMatches(matches, '99').items).toHaveLength(4);
  });

  test('finds efemerides by day and month across years', () => {
    expect(getMatchesForDayMonth([
      homeWin,
      parseMatch({ ...rawHomeWin, Fecha: '2020-08-04' }),
      parseMatch({ ...rawHomeWin, Fecha: '2020-08-05' }),
    ], '2026-08-04')).toHaveLength(2);
  });

  test('exposes summarizeMatches fields on the archive overview', () => {
    const draw = parseMatch({ ...rawHomeWin, Marcador: '1-1', País: 'Perú' });
    const win = parseMatch({ ...rawHomeWin, País: 'Perú' });
    const overview = calculateArchiveOverview([win, draw]);
    expect(overview).toMatchObject({
      total: 2,
      victories: 1,
      draws: 1,
      goalsFor: 3,
      winPercentage: '50.0',
    });
    expect(overview.totalMatches).toBeUndefined();
    expect(overview.maxScGoals).toBeUndefined();
    expect(overview.ganados).toBeUndefined();
  });

  test('names best and worst rivals with summarizeMatches fields', () => {
    const easy = Array.from({ length: 5 }, () => parseMatch({
      ...rawHomeWin,
      'Equipo Visita': 'Easy FC',
      País: 'Perú',
    }));
    const hard = Array.from({ length: 5 }, () => parseMatch({
      ...rawHomeWin,
      'Equipo Visita': 'Hard FC',
      Marcador: '0-1',
      País: 'Perú',
    }));
    const overview = calculateArchiveOverview([...easy, ...hard]);
    expect(overview.bestRival).toMatchObject({ name: 'Easy FC', total: 5, victories: 5, draws: 0, defeats: 0 });
    expect(overview.worstRival).toMatchObject({ name: 'Hard FC', total: 5, victories: 0, draws: 0, defeats: 5 });
    expect(overview.bestRival.ganados).toBeUndefined();
  });

  test('parses representative archive records to the same result codes as production', () => {
    const home = archive.find(match => match['Equipo Local'] === 'Sporting Cristal' && match.Marcador === '2-0');
    const away = archive.find(match => match['Equipo Visita'] === 'Sporting Cristal' && /^\d+-\d+$/.test(match.Marcador));
    const penalty = archive.find(match => /penal/i.test(match['Goles (Solo SC)'] || ''));
    expect(parseMatch(home).isHome).toBe(true);
    expect(parseMatch(home).resultCode).toBe('V');
    expect(parseMatch(away).isHome).toBe(false);
    expect(['V', 'E', 'P']).toContain(parseMatch(away).resultCode);
    expect(['V', 'P']).toContain(parseMatch(penalty).resultCode);
  });
});

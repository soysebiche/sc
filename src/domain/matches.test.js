import {
  canonicalizeRival,
  getOpponent,
  getMatchesForDayMonth,
  getResultCode,
  getScore,
  getUniqueYears,
  getYearFromMatch,
  paginateMatches,
  summarizeMatches,
} from './matches';

const homeWin = {
  Año: 2024,
  Fecha: '2024-08-04',
  'Equipo Local': 'Sporting Cristal',
  'Equipo Visita': 'UTC',
  Marcador: '2-0',
};

describe('match domain', () => {
  test('normalizes confirmed rival aliases without changing historical records', () => {
    expect(canonicalizeRival('UTC')).toBe('U.T.C.');
    expect(canonicalizeRival('Union Comercio')).toBe('Unión Comercio');
    expect(canonicalizeRival('Sport Boys')).toBe('Sport Boys');
    expect(getOpponent(homeWin)).toBe('U.T.C.');
  });

  test('reads year and score from the club perspective', () => {
    expect(getYearFromMatch(homeWin)).toBe(2024);
    expect(getScore(homeWin)).toEqual({ valid: true, scGoals: 2, opponentGoals: 0 });
    expect(getResultCode(homeWin)).toBe('V');
  });

  test('honors a documented penalty shootout after a drawn score', () => {
    expect(getResultCode({
      ...homeWin,
      Marcador: '0-0',
      Resultado: 'D',
      'Goles (Solo SC)': '(Perdió 5-4 en penales)',
    })).toBe('P');
  });

  test('keeps unique years in descending order', () => {
    expect(getUniqueYears([
      homeWin,
      { ...homeWin, Año: 2026 },
      { ...homeWin, Año: 2024 },
      { ...homeWin, Año: 1956 },
    ])).toEqual([2026, 2024, 1956]);
  });

  test('summarizes valid matches from the club perspective', () => {
    const draw = { ...homeWin, Marcador: '1-1' };
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
      { ...homeWin, Fecha: '2020-08-04' },
      { ...homeWin, Fecha: '2020-08-05' },
    ], '2026-08-04')).toHaveLength(2);
  });
});

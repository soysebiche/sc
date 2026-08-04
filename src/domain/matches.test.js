import {
  canonicalizeRival,
  getOpponent,
  getResultCode,
  getScore,
  getUniqueYears,
  getYearFromMatch,
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

  test('keeps unique years in descending order', () => {
    expect(getUniqueYears([
      homeWin,
      { ...homeWin, Año: 2026 },
      { ...homeWin, Año: 2024 },
      { ...homeWin, Año: 1956 },
    ])).toEqual([2026, 2024, 1956]);
  });
});

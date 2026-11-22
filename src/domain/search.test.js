import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseMatch } from './matches.js';
import {
  SEARCH_PRESETS,
  activeStreaks,
  clipStreakMatches,
  filterMatches,
  hasSearchFilters,
  phaseOf,
  presetIsActive,
  readSearchQuery,
  searchHref,
  searchStreaks,
  streakCountLabel,
  summarizeSearch,
} from './search.js';

const mk = (date, extra = {}) => {
  const sc = extra.scGoals ?? 1;
  const op = extra.opponentGoals ?? 0;
  return {
    date,
    year: Number(date.slice(0, 4)),
    scGoals: sc,
    opponentGoals: op,
    isHome: extra.isHome ?? true,
    opponent: extra.opponent || 'X',
    tournament: extra.tournament || 'Apertura',
    round: extra.round || '1',
    home: extra.isHome === false ? extra.opponent || 'X' : 'Sporting Cristal',
    away: extra.isHome === false ? 'Sporting Cristal' : extra.opponent || 'X',
    scoreLabel: `${sc}-${op}`,
    goalsNote: extra.goalsNote ?? null,
    resultCode: extra.resultCode || (sc > op ? 'V' : sc < op ? 'P' : 'E'),
  };
};

describe('search query contract', () => {
  it('reads shareable params and drops invalid values', () => {
    const query = readSearchQuery('?vs=Union+Comercio&sede=local&from=2000&gfmin=4&gamax=0&res=V&sp=2&score=4-0&token=no');
    expect(query.vs).toBe('Unión Comercio');
    expect(query.sede).toBe('local');
    expect(query.from).toBe('2000');
    expect(query.gfmin).toBe('4');
    expect(query.gamax).toBe('0');
    expect(query.res).toBe('V');
    expect(query.sp).toBe('2');
    expect(query.score).toBe('4-0');
    expect(query.token).toBeUndefined();
    expect(readSearchQuery('?sede=neutral&gfmin=abc&from=20').sede).toBe('');
  });

  it('builds a shareable href without empty defaults', () => {
    expect(searchHref({ vs: 'Alianza Lima', sede: 'local', from: '2000' }))
      .toBe('/?view=buscar&vs=Alianza+Lima&sede=local&from=2000');
    expect(hasSearchFilters(readSearchQuery(''))).toBe(false);
    expect(presetIsActive(
      readSearchQuery('?vs=Alianza+Lima&sede=local&from=2000'),
      SEARCH_PRESETS[0]
    )).toBe(true);
    expect(presetIsActive(
      readSearchQuery('?vs=Alianza+Lima&sede=local&from=2000&gfmin=4'),
      SEARCH_PRESETS[0]
    )).toBe(false);
  });
});

describe('phase families', () => {
  it('maps archive round labels without inventing stages', () => {
    expect(phaseOf('Octavos (Ida)')).toBe('octavos');
    expect(phaseOf('O2')).toBe('octavos');
    expect(phaseOf('Cuartos de Final')).toBe('cuartos');
    expect(phaseOf('S1')).toBe('semifinal');
    expect(phaseOf('F2')).toBe('final');
    expect(phaseOf('Grupo J - 1')).toBe('grupos');
    expect(phaseOf('C4')).toBe('grupos');
    expect(phaseOf('Repechaje (Ida)')).toBe('playoff');
    expect(phaseOf('10 (Revancha)')).toBe('regular');
    expect(phaseOf('15')).toBe('regular');
  });
});

describe('filters and streaks (synthetic)', () => {
  const ms = [
    mk('2020-01-01', { opponent: 'Alianza Lima', scGoals: 4, opponentGoals: 0, goalsNote: 'Soto (10, 20), Otro (30), Autogol (40og)' }),
    mk('2020-01-08', { opponent: 'Alianza Lima', scGoals: 1, opponentGoals: 1, isHome: false, resultCode: 'E' }),
    mk('2020-01-15', { opponent: 'Universitario', scGoals: 0, opponentGoals: 1, resultCode: 'P' }),
    mk('2021-06-01', { opponent: 'A.D.T.', scGoals: 2, opponentGoals: 0, tournament: 'Copa Libertadores', round: 'Octavos', goalsNote: 'Soto (8), Soto (55)' }),
    mk('2021-06-08', { opponent: 'A.D.T.', scGoals: 1, opponentGoals: 0, tournament: 'Copa Libertadores', round: 'Octavos (Vuelta)', goalsNote: 'Name (71og)' }),
    mk('2022-03-01', { opponent: 'Alianza Lima', scGoals: 3, opponentGoals: 0, tournament: 'Copa Libertadores' }),
  ];

  it('combines rival, venue, range, result and goal thresholds', () => {
    const found = filterMatches(ms, { ...readSearchQuery(''), vs: 'Alianza Lima', sede: 'local', from: '2020', gfmin: '3' });
    expect(found.map(m => m.date)).toEqual(['2022-03-01', '2020-01-01']);
    expect(summarizeSearch(found)).toMatchObject({ total: 2, victories: 2, points: 6, goalsFor: 7, goalsAgainst: 0 });
  });

  it('counts an own goal in the score and not as a Cristal scorer', () => {
    const byScore = filterMatches(ms, { ...readSearchQuery(''), score: '1-0', vs: 'A.D.T.' });
    expect(byScore).toHaveLength(1);
    expect(byScore[0].date).toBe('2021-06-08');
    expect(filterMatches(ms, { ...readSearchQuery(''), goleador: 'Name' })).toEqual([]);
    expect(filterMatches(ms, { ...readSearchQuery(''), goleador: 'Soto' }).map(m => m.date)).toEqual(['2021-06-01', '2020-01-01']);
  });

  it('reports record and current streaks with linked match dates', () => {
    const streaks = searchStreaks(ms);
    expect(streaks.winning.record).toMatchObject({ length: 3, start: '2021-06-01', end: '2022-03-01' });
    expect(streaks.winning.record.matches.map(m => m.date)).toEqual(['2021-06-01', '2021-06-08', '2022-03-01']);
    expect(streaks.winning.current.length).toBe(3);
    expect(streaks.cleanSheet.record.length).toBe(3);
    expect(streaks.winless.current).toBeNull();
    expect(activeStreaks(streaks)[0].id).toBe('winning');
    expect(activeStreaks(streaks, { minLength: 4 })).toEqual([]);
    expect(streakCountLabel(1)).toBe('1 partido');
    expect(streakCountLabel(3)).toBe('3 partidos');
  });
});

describe('filters (archive)', () => {
  const matches = records.map(parseMatch);

  it('resolves A.D.T. from the published name and the ADT alias', () => {
    const byCanonical = filterMatches(matches, { ...readSearchQuery(''), vs: 'A.D.T.' });
    const byAlias = filterMatches(matches, { ...readSearchQuery(''), vs: 'ADT' });
    expect(byCanonical).toHaveLength(18);
    expect(byAlias).toHaveLength(18);
    expect(byCanonical.every(m => m.opponent === 'A.D.T.')).toBe(true);
  });

  it('applies the Alianza at home since 2000 preset', () => {
    const found = filterMatches(matches, { ...readSearchQuery(''), ...SEARCH_PRESETS[0].params });
    expect(found).toHaveLength(44);
    expect(found.every(m => m.opponent === 'Alianza Lima' && m.isHome && m.date >= '2000-01-01')).toBe(true);
    expect(summarizeSearch(found).points).toBe(summarizeSearch(found).victories * 3 + summarizeSearch(found).draws);
  });

  it('keeps Libertadores clean sheets inside the competition family', () => {
    const found = filterMatches(matches, { ...readSearchQuery(''), comp: 'Copa Libertadores', gamax: '0' });
    expect(found.length).toBeGreaterThan(40);
    expect(found.every(m => /libertadores/i.test(m.tournament) && m.opponentGoals === 0)).toBe(true);
  });

  it('does not treat Yordi Vílchez as scorer of the 2026-11-02 own goal', () => {
    const match = matches.find(m => m.date === '2026-11-02');
    expect(match.scGoals).toBe(5);
    expect(filterMatches([match], { ...readSearchQuery(''), gfmin: '4' })).toHaveLength(1);
    expect(filterMatches([match], { ...readSearchQuery(''), goleador: 'Yordi Vílchez' }, aliases)).toHaveLength(0);
    expect(filterMatches([match], { ...readSearchQuery(''), goleador: 'Maxloren Castro' }, aliases)).toHaveLength(1);
  });

  it('counts matches where Cristal scored 4 or more', () => {
    const found = filterMatches(matches, { ...readSearchQuery(''), gfmin: '4' });
    expect(found).toHaveLength(275);
    expect(found.every(m => m.scGoals >= 4)).toBe(true);
    expect(summarizeSearch(found)).toMatchObject({
      total: 275,
      victories: 269,
      draws: 4,
      defeats: 2,
      goalsFor: 1281,
      goalsAgainst: 273,
      points: 811,
    });
  });

  it('clips long streak lists to the first and last matches', () => {
    const dates = Array.from({ length: 20 }, (_, i) => ({ date: `2020-01-${String(i + 1).padStart(2, '0')}` }));
    expect(clipStreakMatches(dates.slice(0, 8), 10)).toEqual({ shown: dates.slice(0, 8), hidden: 0, split: false });
    expect(clipStreakMatches(dates, 10)).toEqual({
      shown: [...dates.slice(0, 4), ...dates.slice(-4)],
      hidden: 12,
      split: true,
    });
  });

  it('filters knockout rounds from Número de Fecha', () => {
    const found = filterMatches(matches, { ...readSearchQuery(''), fase: 'octavos', comp: 'Copa Libertadores' });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(m => phaseOf(m.round) === 'octavos')).toBe(true);
  });
});

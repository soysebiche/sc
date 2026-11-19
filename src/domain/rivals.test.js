import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { clubOf, parseMatch } from './matches.js';
import {
  buildPreview,
  CUP_TIE_MAX_DAYS,
  cupLeg,
  filterRivals,
  groupCupTies,
  headToHead,
  listRivals,
  nextFixture,
  resolveRival,
  sortRivals,
  tournamentFamily,
  tournamentRecords,
} from './rivals.js';

const mk = (date, sc, op, extra = {}) => ({
  date, year: Number(date.slice(0, 4)), scGoals: sc, opponentGoals: op, isHome: true, opponent: 'X',
  tournament: extra.tournament || 'Liga', home: extra.home || 'Sporting Cristal', away: extra.away || extra.opponent || 'X',
  scoreLabel: `${sc}-${op}`, goalsNote: extra.goalsNote ?? null, round: extra.round || '',
  resultCode: extra.resultCode || (sc > op ? 'V' : sc < op ? 'P' : 'E'), ...extra,
});
const all = records.map(parseMatch);

describe('rivals', () => {
  it('merges club lineage and resolves fixture names', () => {
    expect(clubOf('Real Garcilaso')).toBe('Cusco FC');
    expect(clubOf('ADT')).toBe('A.D.T.');
    expect(clubOf('A.D.T.')).toBe('A.D.T.');
    expect(resolveRival('Cusco FC', all)).toBe('Cusco FC');
    expect(resolveRival('UTC', all)).toBe('U.T.C.');
    expect(resolveRival('ADT', all)).toBe('A.D.T.');
    expect(resolveRival('Club Nuevo', all)).toBe('Club Nuevo');
  });

  it('does not merge distinct clubs that share a word', () => {
    expect(clubOf('Deportivo Garcilaso')).toBe('Deportivo Garcilaso');
    expect(clubOf('Pirata')).toBe('Pirata');
    expect(clubOf('Pirata FC')).toBe('Pirata FC');
    expect(clubOf('Huancayo FC')).toBe('Huancayo FC');
    expect(clubOf('Sport Huancayo')).toBe('Sport Huancayo');
    expect(clubOf('América')).toBe('América');
    expect(clubOf('América de Cali')).toBe('América de Cali');
  });

  it('computes h2h totals, splits, streaks and last matches', () => {
    const ms = [mk('2020-01-01', 2, 0), mk('2020-02-01', 1, 1, { isHome: false }), mk('2020-03-01', 0, 3), mk('2021-01-01', 4, 1), mk('2021-02-01', 1, 0, { opponent: 'Y' })];
    const h = headToHead(ms, 'X', null, { lastN: 2 });
    expect(h.total).toMatchObject({ played: 4, V: 2, E: 1, P: 1, goalsFor: 7, goalsAgainst: 5 });
    expect(h.away.played).toBe(1);
    expect(h.home.played).toBe(3);
    expect(h.neutral.played).toBe(0);
    expect(h.last.map(m => m.date)).toEqual(['2021-01-01', '2020-03-01']);
    expect(h.firstMatch.date).toBe('2020-01-01');
    expect(h.lastMatch.date).toBe('2021-01-01');
    expect(h.streaks.unbeaten.record.length).toBe(2);
    expect(h.streaks.winning.record.length).toBe(1);
    expect(h.streaks.winless.record.length).toBe(2);
    expect(h.biggestWins[0].date).toBe('2021-01-01');
    expect(h.biggestLosses[0].date).toBe('2020-03-01');
  });

  it('handles rivals without history', () => {
    const p = buildPreview(all, { homeTeam: 'Sporting Cristal', awayTeam: 'Club Nuevo', start: '2030-01-01T00:00:00Z' }, aliases);
    expect(p.isHome).toBe(true);
    expect(p.h2h.total.played).toBe(0);
    expect(p.h2h.last).toEqual([]);
  });

  it('picks the next fixture', () => {
    const fx = [{ start: '2026-10-29T15:30:00-05:00' }, { start: '2026-10-24T15:15:00-05:00' }, { start: '2026-10-01T15:00:00-05:00' }];
    expect(nextFixture(fx, new Date('2026-10-20T00:00:00Z')).start).toBe('2026-10-24T15:15:00-05:00');
    expect(nextFixture([], new Date())).toBeNull();
  });

  it('groups tournament variants into families', () => {
    expect(tournamentFamily('Playoff Libertadores')).toBe('Copa Libertadores');
    expect(tournamentFamily('Torneo Apertura')).toBe('Apertura');
    expect(tournamentFamily('Apertura - Final')).toBe('Finales y definiciones');
    expect(tournamentFamily('Primera División - First Stage')).toBe('Liga / Descentralizado');
    const t = tournamentRecords(all, aliases);
    expect(t.reduce((s, r) => s + r.played, 0)).toBe(all.filter(m => m.resultCode).length);
    expect(t.find(r => r.family === 'Copa Libertadores').topScorer).toBeTruthy();
  });
});

describe('rival aggregation from the archive', () => {
  const rivals = listRivals(all);
  const byName = name => rivals.find(r => r.name === name);

  it('uses A.D.T. as the canonical name and a stable slug source', () => {
    expect(byName('A.D.T.')).toBeTruthy();
    expect(byName('ADT')).toBeUndefined();
    expect(byName('A.D.T.').played).toBeGreaterThan(10);
  });

  it('merges Real Garcilaso into Cusco FC without touching Deportivo Garcilaso', () => {
    const cusco = byName('Cusco FC');
    const real = all.filter(m => m.opponent === 'Real Garcilaso');
    const later = all.filter(m => m.opponent === 'Cusco FC');
    expect(byName('Real Garcilaso')).toBeUndefined();
    expect(cusco.names).toEqual(expect.arrayContaining(['Cusco FC', 'Real Garcilaso']));
    expect(cusco.played).toBe(real.length + later.length);
    expect(byName('Deportivo Garcilaso').played).toBe(all.filter(m => m.opponent === 'Deportivo Garcilaso').length);
  });

  it('keeps Alianza Lima totals unchanged', () => {
    expect(byName('Alianza Lima').played).toBe(156);
  });

  it('excludes own goals from Cristal top scorers against a rival', () => {
    const h = headToHead(all, '2 de Mayo', aliases);
    expect(h.topScorers.map(s => s.name)).toContain('Yoshimar Yotún');
    expect(h.topScorers.map(s => s.name)).not.toContain('Ángel Martínez');
    const ogMatch = all.find(m => m.goalsNote && m.goalsNote.includes('Ángel Martínez') && m.opponent === '2 de Mayo');
    expect(ogMatch.scGoals).toBeGreaterThan(0);
    expect(h.total.goalsFor).toBeGreaterThanOrEqual(ogMatch.scGoals);
  });

  it('filters and sorts the rival index without merging distinct names', () => {
    const filtered = filterRivals(rivals, 'garcilaso');
    expect(filtered.map(r => r.name).sort()).toEqual(['Cusco FC', 'Deportivo Garcilaso']);
    const byPlayed = sortRivals(rivals, 'played');
    expect(byPlayed[0].played).toBeGreaterThanOrEqual(byPlayed[1].played);
    expect(sortRivals(rivals, 'name')[0].name.localeCompare(sortRivals(rivals, 'name')[1].name, 'es')).toBeLessThan(0);
  });
});

describe('two-legged cup ties', () => {
  const ida = (date, sc, op, extra = {}) => mk(date, sc, op, { round: extra.round || 'Semifinal (Ida)', isHome: extra.isHome ?? true, ...extra });
  const vuelta = (date, sc, op, extra = {}) => mk(date, sc, op, { round: extra.round || 'Semifinal (Vuelta)', isHome: extra.isHome ?? false, ...extra });

  it('reads ida/vuelta from round or tournament labels', () => {
    expect(cupLeg(mk('2026-01-01', 1, 0, { round: 'Semifinal - Ida' })).leg).toBe('ida');
    expect(cupLeg(mk('2026-01-08', 1, 0, { round: 'Semifinal - Vuelta' })).leg).toBe('vuelta');
    expect(cupLeg(mk('2014-12-14', 2, 2, { tournament: 'Final (Ida)', round: 'Final' })).leg).toBe('ida');
    expect(cupLeg(mk('2024-01-01', 1, 0, { round: 'Fecha 10' }))).toBeNull();
    expect(CUP_TIE_MAX_DAYS).toBe(45);
  });

  it('groups a labelled pair with an aggregate winner', () => {
    const ties = groupCupTies([
      ida('2026-09-27', 1, 0, { isHome: false, opponent: 'A.D.T.', away: 'Sporting Cristal', home: 'A.D.T.' }),
      vuelta('2026-10-01', 5, 0, { isHome: true, opponent: 'A.D.T.', home: 'Sporting Cristal', away: 'A.D.T.' }),
    ]);
    expect(ties).toHaveLength(1);
    expect(ties[0]).toMatchObject({
      scoreLabel: '6-0',
      advanced: 'Sporting Cristal',
      advancedReason: 'aggregate',
    });
  });

  it('records the rival as advancing when the aggregate goes against Cristal', () => {
    const ties = groupCupTies([
      ida('2024-02-20', 1, 6, { opponent: 'Always Ready' }),
      vuelta('2024-02-27', 3, 1, { opponent: 'Always Ready' }),
    ]);
    expect(ties[0]).toMatchObject({ scoreLabel: '4-7', advanced: 'Always Ready', advancedReason: 'aggregate' });
  });

  it('uses a penalty result only when the aggregate is level', () => {
    const ties = groupCupTies([
      ida('2014-12-14', 2, 2, { tournament: 'Final (Ida)', round: 'Final', opponent: 'Juan Aurich' }),
      vuelta('2014-12-17', 0, 0, {
        tournament: 'Final (Vuelta)',
        round: 'Final',
        opponent: 'Juan Aurich',
        resultCode: 'V',
        goalsNote: '(Ganó 3-2 en penales)',
      }),
    ]);
    expect(ties[0]).toMatchObject({ scoreLabel: '2-2', advanced: 'Sporting Cristal', advancedReason: 'penalties' });
  });

  it('does not invent a winner on a level aggregate without penalty evidence', () => {
    const ties = groupCupTies([
      ida('2026-02-17', 2, 2, { opponent: '2 de Mayo' }),
      vuelta('2026-02-24', 0, 0, { opponent: '2 de Mayo' }),
    ]);
    expect(ties[0].scoreLabel).toBe('2-2');
    expect(ties[0].advanced).toBeNull();
    expect(ties[0].advancedReason).toBeNull();
  });

  it('leaves unpaired or far-apart legs ungrouped', () => {
    expect(groupCupTies([ida('1998-12-23', 1, 2, { opponent: 'Universitario' })])).toEqual([]);
    expect(groupCupTies([
      ida('2007-01-24', 0, 5, { opponent: 'América' }),
      vuelta('2009-02-04', 0, 1, { opponent: 'América' }),
    ])).toEqual([]);
  });

  it('does not pair different stages or different rivals', () => {
    expect(groupCupTies([
      ida('2026-03-04', 1, 0, { round: '3era fase (Ida)', opponent: 'Carabobo' }),
      vuelta('2026-03-11', 1, 2, { round: 'Playoff (Vuelta)', opponent: 'Carabobo' }),
    ])).toEqual([]);
    expect(groupCupTies([
      ida('2026-07-22', 0, 0, { opponent: 'Red Bull Bragantino' }),
      vuelta('2026-07-29', 0, 1, { opponent: 'Always Ready' }),
    ])).toEqual([]);
  });

  it('groups archive Copa de la Liga 2026 vs A.D.T.', () => {
    const h = headToHead(all, 'A.D.T.', aliases);
    const tie = h.ties.find(t => t.ida.date === '2026-09-27');
    expect(tie).toMatchObject({ scoreLabel: '6-0', advanced: 'Sporting Cristal' });
  });
});

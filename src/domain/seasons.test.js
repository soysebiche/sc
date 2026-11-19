import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import palmares from '../data/palmares.json';
import { parseMatch } from './matches.js';
import { parseScorers } from './scorers.js';
import {
  THREE_POINT_ERA_FROM,
  aggregateSeason,
  archiveCompareContext,
  belongsToPhase,
  compareSeasons,
  defaultSeasonPair,
  filterSeasonMatches,
  honoursForYear,
  missingArchiveYears,
  palmaresYearsMissingFromArchive,
  phaseSlug,
  resolvePhaseSlug,
  sideWinner,
  summarizeSeason,
} from './seasons.js';

const mk = (date, sc, op, extra = {}) => ({
  date,
  year: extra.year ?? Number(date.slice(0, 4)),
  scGoals: sc,
  opponentGoals: op,
  isHome: extra.isHome ?? true,
  opponent: extra.opponent || 'X',
  tournament: extra.tournament || 'Apertura',
  home: extra.isHome === false ? extra.opponent || 'X' : 'Sporting Cristal',
  away: extra.isHome === false ? 'Sporting Cristal' : extra.opponent || 'X',
  scoreLabel: extra.isHome === false ? `${op}-${sc}` : `${sc}-${op}`,
  goalsNote: extra.goalsNote || null,
  resultCode: sc > op ? 'V' : sc < op ? 'P' : 'E',
  ...extra,
});

const emptyPalmares = { competitions: [], topScorers: [] };
const all = records.map(parseMatch);

describe('season filtering', () => {
  it('keeps Apertura finals in the Apertura phase without inventing a tournament', () => {
    expect(belongsToPhase('Apertura', 'Apertura')).toBe(true);
    expect(belongsToPhase('Apertura - Final', 'Apertura')).toBe(true);
    expect(belongsToPhase('Torneo Apertura', 'Apertura')).toBe(true);
    expect(belongsToPhase('Clausura', 'Apertura')).toBe(false);
    expect(belongsToPhase('Copa Libertadores', 'Apertura')).toBe(false);
  });

  it('filters a year and phase from synthetic matches', () => {
    const ms = [
      mk('2023-02-01', 1, 0, { tournament: 'Apertura' }),
      mk('2023-08-01', 0, 1, { tournament: 'Clausura' }),
      mk('2024-02-01', 2, 0, { tournament: 'Apertura' }),
    ];
    expect(filterSeasonMatches(ms, { year: 2023 }).map(m => m.date)).toEqual(['2023-02-01', '2023-08-01']);
    expect(filterSeasonMatches(ms, { year: 2023, phase: 'Apertura' }).map(m => m.date)).toEqual(['2023-02-01']);
    expect(filterSeasonMatches(ms, { year: 1991 })).toEqual([]);
  });

  it('resolves a phase slug against the families present that year', () => {
    expect(phaseSlug('Copa Libertadores')).toBe('copa-libertadores');
    expect(resolvePhaseSlug(all, 2023, 'apertura')).toBe('Apertura');
    expect(resolvePhaseSlug(all, 2023, 'no-existe')).toBe('');
  });
});

describe('season aggregation', () => {
  const ms = [
    mk('2023-02-01', 3, 0, { tournament: 'Apertura', opponent: 'A.D.T.' }),
    mk('2023-02-10', 1, 1, { tournament: 'Apertura', isHome: false, opponent: 'A.D.T.' }),
    mk('2023-03-01', 0, 4, { tournament: 'Apertura', opponent: 'Alianza Lima' }),
    mk('2023-08-01', 2, 0, { tournament: 'Clausura' }),
    mk('2023-08-08', 1, 0, { tournament: 'Clausura' }),
    mk('2023-08-15', 2, 1, { tournament: 'Clausura' }),
  ];

  it('counts W/D/L, 3-1-0 points, goal difference and home/away split', () => {
    const season = aggregateSeason(ms, { players: {} }, emptyPalmares, { year: 2023 });
    expect(season.summary).toMatchObject({
      played: 6, V: 4, E: 1, P: 1, goalsFor: 9, goalsAgainst: 6, points: 13, goalDiff: 3,
    });
    expect(season.home.played).toBe(5);
    expect(season.away.played).toBe(1);
    expect(season.away.E).toBe(1);
    expect(season.biggestWin.opponent).toBe('A.D.T.');
    expect(season.biggestLoss.opponent).toBe('Alianza Lima');
    expect(season.winningStreak).toEqual({ length: 3, start: '2023-08-01', end: '2023-08-15' });
    expect(season.unbeatenStreak.length).toBe(3);
  });

  it('does not count own goals in Name (71og) as Cristal scorers', () => {
    const raw = {
      Año: 2026,
      Fecha: '2026-11-02',
      Torneo: 'Clausura',
      'Equipo Local': 'Sporting Cristal',
      'Equipo Visita': 'FC Cajamarca',
      Marcador: '5-0',
      'Goles (Solo SC)': 'Gerald Távara (52), Maxloren Castro (62), Luis Iberico (67), Yordi Vílchez (71og), Juan Cuesta (87)',
    };
    const parsed = parseScorers(raw);
    expect(parsed.find(row => row.name === 'Yordi Vílchez').ownGoal).toBe(true);
    const season = aggregateSeason([parseMatch(raw)], aliases, emptyPalmares, { year: 2026, phase: 'Clausura' });
    expect(season.summary).toMatchObject({ played: 1, V: 1, goalsFor: 5, goalsAgainst: 0, points: 3 });
    expect(season.scorers.map(row => row.name)).not.toContain('Yordi Vílchez');
    expect(season.scorers.some(row => row.name === 'Gerald Távara')).toBe(true);
  });

  it('keeps the published A.D.T. name from the archive', () => {
    const adt = all.filter(match => match.opponent === 'A.D.T.');
    expect(adt.length).toBeGreaterThan(0);
    expect(adt.every(match => match.opponent === 'A.D.T.')).toBe(true);
  });

  it('flags an empty or sparse season instead of hiding the gap', () => {
    const empty = aggregateSeason(ms, { players: {} }, palmares, { year: 1991 }, { latestYear: 2023 });
    expect(empty.coverage.empty).toBe(true);
    expect(empty.coverage.notes.some(note => note.includes('no tiene partidos'))).toBe(true);
    expect(empty.honours.titles.map(item => item.id)).toContain('liga');

    const sparse = aggregateSeason(
      [mk('1962-04-01', 1, 0, { year: 1962, tournament: 'Copa Libertadores' })],
      { players: {} },
      emptyPalmares,
      { year: 1962 },
    );
    expect(sparse.coverage.sparse).toBe(true);
    expect(sparse.coverage.twoPointEra).toBe(true);
    expect(sparse.summary.points).toBe(3);
  });

  it('marks the current archive year as in progress', () => {
    const season = aggregateSeason(ms, { players: {} }, emptyPalmares, { year: 2023 }, {
      latestYear: 2023,
      latestMatchDate: '2023-08-15',
    });
    expect(season.coverage.inProgress).toBe(true);
    expect(season.coverage.notes.join(' ')).toContain('en curso');
  });
});

describe('side-by-side comparison', () => {
  it('marks the better value in each comparable row', () => {
    expect(sideWinner(10, 8, 1)).toBe('left');
    expect(sideWinner(10, 8, -1)).toBe('right');
    expect(sideWinner(2, 2, 1)).toBeNull();
    expect(sideWinner(1, 2, 0)).toBeNull();

    const left = [
      mk('2022-01-01', 2, 0),
      mk('2022-01-08', 1, 0),
      mk('2022-01-15', 0, 1),
    ];
    const right = [
      mk('2023-01-01', 5, 0),
      mk('2023-01-08', 1, 1),
      mk('2023-01-15', 0, 3),
    ];
    const compared = compareSeasons([...left, ...right], { players: {} }, emptyPalmares, { year: 2022 }, { year: 2023 });
    const byId = Object.fromEntries(compared.rows.map(row => [row.id, row]));
    expect(byId.V.winner).toBe('left');
    expect(byId.points.left).toBe(6);
    expect(byId.points.right).toBe(4);
    expect(byId.points.winner).toBe('left');
    expect(byId.goalsFor.winner).toBe('right');
    expect(byId.P.winner).toBeNull();
    expect(byId.biggestWin.left).toBe(2);
    expect(byId.biggestWin.right).toBe(5);
    expect(byId.biggestWin.winner).toBe('right');
    expect(compared.sameSelection).toBe(false);
  });

  it('allows the same year with two different phases', () => {
    const ms = [
      mk('2023-02-01', 1, 0, { tournament: 'Apertura' }),
      mk('2023-08-01', 0, 2, { tournament: 'Clausura' }),
    ];
    const compared = compareSeasons(ms, { players: {} }, emptyPalmares, { year: 2023, phase: 'Apertura' }, { year: 2023, phase: 'Clausura' });
    expect(compared.sameSelection).toBe(false);
    expect(compared.left.summary.V).toBe(1);
    expect(compared.right.summary.P).toBe(1);
  });
});

describe('real archive coverage', () => {
  const ctx = archiveCompareContext(all, palmares);

  it('lists missing years and Palmarés years the archive does not have', () => {
    expect(missingArchiveYears(ctx.years)).toContain(1991);
    expect(ctx.palmaresGaps.some(row => row.year === 1991 && row.kind === 'title')).toBe(true);
    expect(palmaresYearsMissingFromArchive(palmares, ctx.years).map(row => row.year)).toEqual(
      expect.arrayContaining([1963, 1967, 1977, 1991]),
    );
    expect(honoursForYear(palmares, 2020).titles.some(item => item.id === 'liga')).toBe(true);
    expect(honoursForYear(palmares, 2024).titles).toEqual([]);
    expect(honoursForYear(palmares, 2024).runnersUp.some(item => item.id === 'liga')).toBe(true);
  });

  it('defaults to the two most recent archive years', () => {
    expect(defaultSeasonPair(ctx.years)).toEqual({ a: 2025, b: 2026 });
    expect(ctx.latestYear).toBe(2026);
  });

  it('aggregates 2023 Apertura from published matches only', () => {
    const apertura = aggregateSeason(all, aliases, palmares, { year: 2023, phase: 'Apertura' }, {
      latestYear: ctx.latestYear,
      latestMatchDate: ctx.latestMatchDate,
    });
    const expected = summarizeSeason(filterSeasonMatches(all, { year: 2023, phase: 'Apertura' }));
    expect(apertura.summary.played).toBe(expected.played);
    expect(apertura.summary.points).toBe(expected.V * 3 + expected.E);
    expect(apertura.coverage.inProgress).toBe(false);
    expect(apertura.year).toBeGreaterThanOrEqual(THREE_POINT_ERA_FROM);
    expect(apertura.scorers.every(row => row.name !== 'Yordi Vílchez' || row.goals > 0)).toBe(true);
  });
});

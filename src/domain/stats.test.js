import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseMatch } from './matches.js';
import { calculateHomeAway, calculateRecords, calculateStreaks, longestStreaks, rankScorers } from './stats.js';

const mk = (date, sc, op, extra = {}) => ({
  date, year: Number(date.slice(0, 4)), scGoals: sc, opponentGoals: op, isHome: true, opponent: 'X',
  tournament: 'Liga', home: 'Sporting Cristal', away: 'X', scoreLabel: `${sc}-${op}`, goalsNote: null,
  resultCode: sc > op ? 'V' : sc < op ? 'P' : 'E', ...extra,
});

describe('streaks', () => {
  it('orders chronologically and reports record and current runs', () => {
    const ms = [mk('2020-01-03', 0, 1), mk('2020-01-01', 1, 0), mk('2020-01-02', 1, 1), mk('2020-01-04', 2, 0), mk('2020-01-05', 1, 0)];
    const { record, current } = longestStreaks(ms, m => m.resultCode !== 'P');
    expect(record).toEqual({ length: 2, start: '2020-01-01', end: '2020-01-02' });
    expect(current).toEqual({ length: 2, start: '2020-01-04', end: '2020-01-05' });
    const s = calculateStreaks(ms);
    expect(s.winning.record.length).toBe(2);
    expect(s.cleanSheet.current.length).toBe(2);
  });
  it('a loss ends the current run', () => {
    expect(longestStreaks([mk('2020-01-01', 1, 0), mk('2020-01-02', 0, 1)], m => m.resultCode === 'V').current).toBeNull();
  });
});

describe('records and home/away', () => {
  const ms = [mk('2020-01-01', 5, 0), mk('2020-01-02', 0, 4, { isHome: false }), mk('2020-01-03', 3, 3), mk('2020-01-04', 1, 0)];
  it('ranks wins, losses, goals and scorelines', () => {
    const r = calculateRecords(ms);
    expect(r.biggestWins[0].date).toBe('2020-01-01');
    expect(r.biggestLosses[0].date).toBe('2020-01-02');
    expect(r.highestScoring[0].date).toBe('2020-01-03');
    expect(r.scorelines.find(s => s.score === '1-0').count).toBe(1);
  });
  it('splits by venue, rival and decade', () => {
    const h = calculateHomeAway(ms, { minRivalMatches: 1 });
    expect(h.overall.home.played).toBe(3);
    expect(h.overall.away.P).toBe(1);
    expect(h.perRival[0].name).toBe('X');
    expect(h.perDecade[0].decade).toBe(2020);
  });
});

describe('real archive', () => {
  const matches = records.map(parseMatch);
  it('scorer ranking is led by Jorge Soto and filters by decade', () => {
    const all = rankScorers(matches, aliases);
    expect(all[0].name).toBe('Jorge Soto');
    const nineties = rankScorers(matches, aliases, { decade: 1990 });
    expect(nineties.every(e => e.first >= 1990 && e.last < 2000)).toBe(true);
  });
  it('home + away covers every scored match', () => {
    const { overall } = calculateHomeAway(matches);
    expect(overall.home.played + overall.away.played).toBe(matches.filter(m => m.resultCode).length);
  });
});

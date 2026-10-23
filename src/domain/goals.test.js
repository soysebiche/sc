import { describe, expect, it } from 'vitest';
import { matchGoals, minuteDistribution, minuteTokens, scorerProfile } from './goals';

const m = (goalsNote, scoreLabel, extra = {}) => ({ date: '2024-05-01', year: 2024, home: 'Sporting Cristal', away: 'Rival', opponent: 'Rival', tournament: 'Liga 1', scoreLabel, goalsNote, resultCode: 'V', ...extra });
const aliases = { players: { 'Jorge Soto': ['J. Soto'] } };

describe('goal minutes', () => {
  it('parses stoppage and penalty tokens', () => {
    expect(minuteTokens("Brenner (72' pen, 96')")).toEqual([{ minute: 72, added: 0 }, { minute: 96, added: 0 }]);
    expect(minuteTokens('Santiago González (45+1)')).toEqual([{ minute: 45, added: 1 }]);
  });
  it('treats old "(2)" as a goal count, not a minute', () => {
    const r = matchGoals(m('Zunino (2), Mosquera', '3-0', { year: 1956 }));
    expect(r.hasMinutes).toBe(false);
    expect(r.goals).toHaveLength(3);
  });
  it('reads modern minute formats', () => {
    const r = matchGoals(m('Gerald Távara (7pen, 82, 91)', '3-0'));
    expect(r.hasMinutes).toBe(true);
    expect(r.goals.map(g => g.minute)).toEqual([7, 82, 91]);
  });
  it('buckets distribution and late goals with coverage', () => {
    const d = minuteDistribution([m("J. Soto (10', 90'+2)", '2-0'), m('Zunino (2)', '2-0', { year: 1960 })], aliases);
    expect(d.coverage).toEqual({ matches: 1, matchesWithGoals: 2, goals: 2 });
    expect(d.buckets[0].goals).toBe(1);
    expect(d.lateScorers).toEqual([{ name: 'Jorge Soto', goals: 1 }]);
    expect(d.halves).toEqual({ first: 1, second: 1 });
  });
});

describe('scorerProfile', () => {
  it('summarises a scorer and flags pre-1990 totals as lower bounds', () => {
    const p = scorerProfile([
      m("J. Soto (10', 20', 30')", '3-0', { date: '1995-01-01', year: 1995 }),
      m('Jorge Soto', '1-0', { date: '1985-01-01', year: 1985, opponent: 'Otro' }),
    ], aliases, 'Jorge Soto');
    expect(p.total).toBe(4);
    expect(p.hatTricks).toBe(1);
    expect(p.lowerBound).toBe(true);
    expect(p.first.date).toBe('1985-01-01');
    expect(p.bestYear).toEqual({ year: 1995, goals: 3 });
    expect(p.rivals[0]).toEqual({ rival: 'Rival', goals: 3 });
    expect(p.minutes.known).toBe(3);
  });
  it('returns null for unknown names', () => {
    expect(scorerProfile([m('Zunino', '1-0')], aliases, 'Nadie')).toBeNull();
  });
});

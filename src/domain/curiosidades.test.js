import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseMatch } from './matches.js';
import { goalTiming, hatTricks, minuteLabel, rivalStreaks, scorerVsRival, seasonPoints } from './curiosidades.js';

const mk = (date, opponent, sc, op, goalsNote = null) => ({
  date, year: Number(date.slice(0, 4)), opponent, scGoals: sc, opponentGoals: op, isHome: true,
  home: 'Sporting Cristal', away: opponent, scoreLabel: `${sc}-${op}`, tournament: 'Liga', goalsNote,
  resultCode: sc > op ? 'V' : sc < op ? 'P' : 'E',
});

describe('curiosidades (synthetic)', () => {
  const ms = [
    mk('2024-01-01', 'A', 1, 0), mk('2024-02-01', 'A', 2, 2), mk('2024-03-01', 'A', 3, 1), mk('2024-04-01', 'A', 1, 0),
    mk('2024-01-05', 'B', 0, 1), mk('2024-02-05', 'B', 0, 0), mk('2024-03-05', 'B', 1, 3),
    mk('2000-01-01', 'Old', 1, 0), mk('2000-02-01', 'Old', 1, 0), mk('2000-03-01', 'Old', 1, 0),
  ];
  it('ranks per-rival streaks and drops stale active ones', () => {
    const s = rivalStreaks(ms);
    expect(s.unbeaten.record[0]).toMatchObject({ rival: 'A', length: 4 });
    expect(s.winless.current[0]).toMatchObject({ rival: 'B', length: 3 });
    expect(s.winning.current.map(r => r.rival)).toEqual([]);
    expect(s.winning.record.map(r => r.rival)).toContain('Old');
  });
  it('computes points percentage per season with a minimum', () => {
    expect(seasonPoints(ms, { minMatches: 7 }).best[0]).toMatchObject({ year: 2024, played: 7, pct: 52.4 });
    expect(seasonPoints(ms, { minMatches: 8 }).seasons).toBe(0);
  });
  it('formats added time', () => {
    expect(minuteLabel({ minute: 90, added: 8 })).toBe("90+8'");
    expect(minuteLabel({ minute: 1, added: 0 })).toBe("1'");
  });
});

describe('curiosidades (archive)', () => {
  const matches = records.map(parseMatch);
  it('finds hat-tricks led by Cauteruccio', () => {
    const h = hatTricks(matches, aliases);
    expect(h.rows.length).toBeGreaterThan(50);
    expect(h.leaders[0].name).toBe('Martín Cauteruccio');
    expect(h.rows.every(r => r.goals >= 3)).toBe(true);
  });
  it('lists player-rival pairs sorted by goals', () => {
    const p = scorerVsRival(matches, aliases);
    expect(p).toHaveLength(10);
    p.slice(1).forEach((r, i) => expect(r.goals).toBeLessThanOrEqual(p[i].goals));
  });
  it('keeps timed goals within regulation for the latest list', () => {
    const t = goalTiming(matches, aliases);
    expect(t.fastest[0].minute).toBe(1);
    expect(t.latest.every(g => g.minute <= 90)).toBe(true);
  });
});

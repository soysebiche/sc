import { describe, expect, it } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseMatch } from './matches.js';
import { buildPreview, clubOf, headToHead, nextFixture, resolveRival, tournamentFamily, tournamentRecords } from './rivals.js';

const mk = (date, sc, op, extra = {}) => ({
  date, year: Number(date.slice(0, 4)), scGoals: sc, opponentGoals: op, isHome: true, opponent: 'X',
  tournament: 'Liga', home: 'Sporting Cristal', away: 'X', scoreLabel: `${sc}-${op}`, goalsNote: null,
  resultCode: sc > op ? 'V' : sc < op ? 'P' : 'E', ...extra,
});
const all = records.map(parseMatch);

describe('rivals', () => {
  it('merges club lineage and resolves fixture names', () => {
    expect(clubOf('Real Garcilaso')).toBe('Cusco FC');
    expect(resolveRival('Cusco FC', all)).toBe('Cusco FC');
    expect(resolveRival('UTC', all)).toBe('U.T.C.');
    expect(resolveRival('Club Nuevo', all)).toBe('Club Nuevo');
  });

  it('computes h2h totals, splits, streaks and last matches', () => {
    const ms = [mk('2020-01-01', 2, 0), mk('2020-02-01', 1, 1, { isHome: false }), mk('2020-03-01', 0, 3), mk('2021-01-01', 4, 1), mk('2021-02-01', 1, 0, { opponent: 'Y' })];
    const h = headToHead(ms, 'X', null, { lastN: 2 });
    expect(h.total).toMatchObject({ played: 4, V: 2, E: 1, P: 1, goalsFor: 7, goalsAgainst: 5 });
    expect(h.away.played).toBe(1);
    expect(h.last.map(m => m.date)).toEqual(['2021-01-01', '2020-03-01']);
    expect(h.streaks.unbeaten.record.length).toBe(2);
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

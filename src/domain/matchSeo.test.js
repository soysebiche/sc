import { adjacentEntries, h2hContext, matchDescription, matchHeading, matchTitle, venuePhrase } from './matchSeo';

const entry = (id, extras = {}) => ({
  id,
  path: `/partidos/${id}`,
  match: {
    home: 'Sporting Cristal',
    away: extras.away || 'Alianza Lima',
    opponent: extras.away || 'Alianza Lima',
    scoreLabel: extras.scoreLabel || '2-1',
    date: extras.date || '1990-01-01',
    tournament: extras.tournament || 'Liga',
    resultCode: extras.resultCode || 'V',
    isHome: extras.isHome ?? true,
    country: extras.country || 'Perú',
    goalsNote: extras.goalsNote || null,
    scGoals: extras.scGoals ?? 2,
    opponentGoals: extras.opponentGoals ?? 1,
    ...extras.match,
  },
});

describe('match SEO copy', () => {
  test('heading, title and description include date, score, competition and venue', () => {
    const match = entry('1990-01-01-alianza-lima').match;
    expect(matchHeading(match)).toContain('2-1');
    expect(matchHeading(match)).toContain('1990');
    expect(matchHeading(match)).toContain('Liga');
    expect(matchTitle(match)).toMatch(/Victoria 2-1/);
    expect(matchTitle(match)).toContain('Sebiche Celeste');
    expect(matchDescription(match)).toContain('como local (Perú)');
    expect(venuePhrase({ isHome: false, country: 'Argentina' })).toBe('como visita (Argentina)');
  });

  test('description adds scorers and head-to-head context when present', () => {
    const match = entry('x', { goalsNote: "Soto (7')" }).match;
    const text = matchDescription(match, { h2hSentence: 'Es el partido 3 de 10 vs. Alianza Lima.' });
    expect(text).toContain("Goles de Sporting Cristal: Soto (7')");
    expect(text).toContain('partido 3 de 10');
  });

  test('prev/next walk chronological archive order', () => {
    const a = entry('a', { date: '1990-01-01' });
    const b = entry('b', { date: '1990-02-01', away: 'Universitario', scoreLabel: '0-0', resultCode: 'E' });
    const c = entry('c', { date: '1990-03-01', away: 'Melgar', scoreLabel: '1-0' });
    expect(adjacentEntries([c, a, b], 'b')).toMatchObject({
      prev: { id: 'a' },
      next: { id: 'c' },
      index: 1,
      total: 3,
    });
    expect(adjacentEntries([a, b, c], 'a').prev).toBeNull();
    expect(adjacentEntries([a, b, c], 'c').next).toBeNull();
  });

  test('head-to-head counts only prior matches against the same rival', () => {
    const first = entry('1', { date: '1990-01-01', scGoals: 2, opponentGoals: 1 });
    const second = entry('2', { date: '1991-01-01', scoreLabel: '0-1', resultCode: 'P', scGoals: 0, opponentGoals: 1 });
    const third = entry('3', { date: '1992-01-01', scoreLabel: '3-3', resultCode: 'E', scGoals: 3, opponentGoals: 3 });
    const firstContext = h2hContext(first, [third, second, first]);
    expect(firstContext.h2hSentence).toMatch(/Primer partido/);
    expect(firstContext.n).toBe(1);
    const secondContext = h2hContext(second, [first, second, third]);
    expect(secondContext.n).toBe(2);
    expect(secondContext.total).toBe(3);
    expect(secondContext.h2hSentence).toContain('frente a Alianza Lima');
    expect(secondContext.h2hSentence).toContain('1V 0E 0P');
    expect(secondContext.prevRival.id).toBe('1');
    expect(secondContext.nextRival.id).toBe('3');
  });
});

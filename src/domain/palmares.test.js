import { describe, expect, it } from 'vitest';
import data from '../data/palmares.json';
import { seasonHref, palmaresSummary } from './palmares.js';

describe('palmares', () => {
  it('counts official titles and runner-up finishes', () => {
    expect(palmaresSummary(data)).toEqual({ titles: 21, runnersUp: 16, leagueTitles: 20, topScorers: 14 });
  });

  it('backs every entry with at least two sources and unique sorted years', () => {
    data.competitions.forEach(c => {
      expect(c.sources.length).toBeGreaterThanOrEqual(2);
      [c.titles, c.runnersUp].forEach(ys => expect([...ys].sort((a, b) => a - b)).toEqual([...new Set(ys)]));
    });
    data.topScorers.forEach(s => expect(s.sources.length).toBeGreaterThanOrEqual(2));
  });

  it('links a year to its season page only when the archive has it', () => {
    const years = new Set([1997]);
    expect(seasonHref(1997, years)).toBe('/temporadas/1997');
    expect(seasonHref(1963, years)).toBeNull();
  });
});

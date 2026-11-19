import { describe, expect, it } from 'vitest';
import archive from '../data/historico_completo_sc.json';
import { parseMatch } from './matches';
import { buildPublicCatalog } from './publicRoutes';
import {
  compactRandomIndex,
  createSeededRng,
  emptyRandomFilters,
  filterCompactIndex,
  filterRandomPool,
  hasAutoRoll,
  isClasicoMatch,
  matchPassesRandomFilters,
  parseRandomFilters,
  pickRandomCompact,
  pickRandomMatch,
  pickUniform,
  randomMatchHref,
  randomMatchShareText,
  readStoredFilters,
  resolveRandomFilters,
  writeStoredFilters,
} from './randomMatch';

const matches = archive.map(parseMatch);
const catalog = buildPublicCatalog(matches);
const entries = catalog.matches;

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
  };
};

describe('random match filters', () => {
  it('keeps every catalogued match when no filter is set', () => {
    expect(filterRandomPool(entries, emptyRandomFilters())).toHaveLength(entries.length);
    expect(entries.every(entry => entry.path.startsWith('/partidos/'))).toBe(true);
    expect(entries.some(entry => entry.path === '/partidos/azar')).toBe(false);
  });

  it('restricts to victories, clásicos or a decade without inventing rows', () => {
    const wins = filterRandomPool(entries, { winsOnly: true });
    expect(wins.length).toBeGreaterThan(0);
    expect(wins.every(entry => entry.match.resultCode === 'V')).toBe(true);
    expect(wins.length).toBe(matches.filter(match => match.resultCode === 'V').length);

    const clasicos = filterRandomPool(entries, { clasicosOnly: true });
    expect(clasicos.length).toBeGreaterThan(0);
    expect(clasicos.every(entry => isClasicoMatch(entry.match))).toBe(true);
    expect(new Set(clasicos.map(entry => entry.match.opponent))).toEqual(new Set(['Alianza Lima', 'Universitario']));

    const nineties = filterRandomPool(entries, { decade: 1990 });
    expect(nineties.length).toBeGreaterThan(0);
    expect(nineties.every(entry => entry.match.year >= 1990 && entry.match.year <= 1999)).toBe(true);

    const combo = filterRandomPool(entries, { winsOnly: true, clasicosOnly: true, decade: 1990 });
    expect(combo.length).toBeGreaterThan(0);
    expect(combo.every(entry => (
      entry.match.resultCode === 'V'
      && isClasicoMatch(entry.match)
      && entry.match.year >= 1990
      && entry.match.year <= 1999
    ))).toBe(true);
    expect(combo.every(entry => entries.includes(entry))).toBe(true);
  });

  it('returns an empty pool rather than inventing a match', () => {
    expect(filterRandomPool(entries, { decade: 1800 })).toEqual([]);
    expect(matchPassesRandomFilters(null, { winsOnly: true })).toBe(false);
    expect(filterRandomPool([{ match: matches[0] }], emptyRandomFilters())).toEqual([]);
  });

  it('treats compact index rows as the same pool as parsed matches', () => {
    const index = compactRandomIndex(entries);
    expect(index).toHaveLength(entries.length);
    expect(filterCompactIndex(index, { winsOnly: true, clasicosOnly: true, decade: 1990 }))
      .toHaveLength(filterRandomPool(entries, { winsOnly: true, clasicosOnly: true, decade: 1990 }).length);
    const alianza = entries.find(entry => entry.match.opponent === 'Alianza Lima');
    const compact = index.find(row => row.p === alianza.path);
    expect(compact.c).toBe(1);
  });
});

describe('random match picking', () => {
  it('picks uniformly from the filtered pool with an injectable RNG', () => {
    const pool = filterRandomPool(entries, { clasicosOnly: true });
    expect(pickUniform(pool, () => 0)).toBe(pool[0]);
    expect(pickUniform(pool, () => 0.999999)).toBe(pool.at(-1));
    expect(pickUniform([], () => 0)).toBeNull();

    const { pick } = pickRandomMatch(entries, { winsOnly: true }, () => 0);
    expect(pick.match.resultCode).toBe('V');
    expect(pick.path).toBe(filterRandomPool(entries, { winsOnly: true })[0].path);
  });

  it('is deterministic with a seeded RNG and independent of catalog order copies', () => {
    const filters = { clasicosOnly: true, decade: 2000 };
    const first = pickRandomMatch(entries, filters, createSeededRng(42)).pick;
    const second = pickRandomMatch(entries, filters, createSeededRng(42)).pick;
    const third = pickRandomMatch(entries, filters, createSeededRng(7)).pick;
    expect(first.path).toBe(second.path);
    expect(third.path).not.toBe(first.path);
    expect(first.match.year).toBeGreaterThanOrEqual(2000);
    expect(first.match.year).toBeLessThanOrEqual(2009);
  });

  it('avoids the previous path when rolling again, unless it is the only option', () => {
    const pool = filterRandomPool(entries, { winsOnly: true, clasicosOnly: true, decade: 1990 });
    const current = pool[0];
    const again = pickRandomMatch(entries, { winsOnly: true, clasicosOnly: true, decade: 1990 }, () => 0, {
      excludePath: current.path,
    });
    expect(again.pick.path).not.toBe(current.path);
    expect(again.pool).toHaveLength(pool.length - 1);

    const lone = [{ path: '/partidos/solo', match: current.match }];
    expect(pickRandomMatch(lone, emptyRandomFilters(), () => 0, { excludePath: '/partidos/solo' }).pick.path)
      .toBe('/partidos/solo');
  });

  it('picks the same path from the compact index as from catalog entries', () => {
    const rng = createSeededRng(99);
    const filters = { winsOnly: true };
    const fromEntries = pickRandomMatch(entries, filters, createSeededRng(99)).pick;
    const fromIndex = pickRandomCompact(compactRandomIndex(entries), filters, rng).pick;
    expect(fromIndex.p).toBe(fromEntries.path);
  });
});

describe('random match URLs, storage and share copy', () => {
  it('parses filters from query or hash and serializes them on /partidos/azar', () => {
    expect(parseRandomFilters('?wins=1&clasico=1&decade=1990')).toEqual({
      winsOnly: true,
      clasicosOnly: true,
      decade: 1990,
    });
    expect(parseRandomFilters('', '#auto=1&wins=1')).toEqual({
      winsOnly: true,
      clasicosOnly: false,
      decade: null,
    });
    expect(hasAutoRoll('', '#auto=1')).toBe(true);
    expect(randomMatchHref({ winsOnly: true, decade: 2010 }, { auto: true }))
      .toBe('/partidos/azar#auto=1&wins=1&decade=2010');
    expect(randomMatchHref(emptyRandomFilters(), { auto: true })).toBe('/partidos/azar#auto=1');
  });

  it('falls back to stored filters and writes a JSON payload the boot script can reread', () => {
    const storage = memoryStorage();
    expect(resolveRandomFilters({ stored: null })).toEqual(emptyRandomFilters());
    writeStoredFilters({ winsOnly: true, clasicosOnly: true, decade: '1980' }, storage);
    expect(readStoredFilters(storage)).toEqual({
      winsOnly: true,
      clasicosOnly: true,
      decade: 1980,
    });
    expect(resolveRandomFilters({ search: '', hash: '', stored: readStoredFilters(storage) })).toEqual({
      winsOnly: true,
      clasicosOnly: true,
      decade: 1980,
    });
  });

  it('builds a short Spanish share line from score and date', () => {
    const alianza = entries.find(entry => (
      entry.match.opponent === 'Alianza Lima' && entry.match.resultCode === 'V' && entry.match.scoreLabel
    ));
    const text = randomMatchShareText(alianza.match);
    expect(text).toMatch(/^Victoria /);
    expect(text).toContain(alianza.match.scoreLabel);
    expect(text).toContain(alianza.match.home);
    expect(text).toContain(alianza.match.away);
    expect(text).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

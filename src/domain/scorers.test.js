import { describe, it, expect } from 'vitest';
import matches from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { parseScorers, buildResolver, topScorers } from './scorers.js';

const row = (g, m = '2-0', local = 'Sporting Cristal') => ({ 'Goles (Solo SC)': g, Marcador: m, 'Equipo Local': local, 'Equipo Visita': 'X' });

describe('parseScorers', () => {
  it('counts minute lists, stoppage time and penalties', () => {
    expect(parseScorers(row("Alejandro Hohberg 90' +8, 90' (Pen.)"))).toEqual([{ name: 'Alejandro Hohberg', goals: 2, ownGoal: false }]);
    expect(parseScorers(row("I. Ávila (30', 54', 83' pen), W. Chiroque (71')", '4-0')).map((s) => s.goals)).toEqual([3, 1]);
  });
  it('treats bare (N) as count or minute based on the score', () => {
    expect(parseScorers(row('Solano (2), Bonnet', '3-0')).map((s) => s.goals)).toEqual([2, 1]);
    expect(parseScorers(row('Felipe Vizeu (9), Luis Iberico (92)')).map((s) => s.goals)).toEqual([1, 1]);
  });
  it('splits comma-less lists and flags own goals', () => {
    expect(parseScorers(row("Omar Merlo 34' Cristian Palacios 31")).map((s) => s.name)).toEqual(['Omar Merlo', 'Cristian Palacios']);
    expect(parseScorers(row("Erick Rossi (38' GEC)", '1-0'))[0].ownGoal).toBe(true);
    expect(parseScorers(row('No disponible'))).toEqual([]);
  });
});

describe('scorer aliases', () => {
  const resolve = buildResolver(aliases);
  it('every variant maps to exactly one canonical name', () => {
    const seen = new Map();
    for (const [c, vs] of Object.entries(aliases.players)) for (const v of vs) {
      expect(seen.has(v), `${v} duplicated`).toBe(false);
      seen.set(v, c);
    }
  });
  it('resolves ambiguous surnames by date', () => {
    expect(resolve('Palacios', '1995-03-17')).toBe('Roberto Palacios');
    expect(resolve('Ramírez', '1980-04-25')).toBe('Oswaldo Ramírez');
    expect(resolve('Ramírez', '1961-08-15')).toBe('Alberto Ramírez');
    expect(resolve('Jhilmar Lobaton', '2020-10-17')).toBe('Jhilmar Lobatón');
    expect(resolve('Gerald Támara', '2020-01-01')).toBe('Gerald Távara');
  });
  it('produces a top-scorers table', () => {
    const top = topScorers(matches, aliases, { limit: 3 });
    expect(top[0].name).toBe('Jorge Soto');
    expect(top).toHaveLength(3);
  });
});

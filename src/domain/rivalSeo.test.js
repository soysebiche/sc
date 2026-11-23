import { describe, expect, test } from 'vitest';
import records from '../data/historico_completo_sc.json';
import aliases from '../data/scorer-aliases.json';
import { clubOf, parseMatch } from './matches.js';
import { headToHead } from './rivals.js';
import {
  RIVAL_DESC_MAX,
  RIVAL_DESC_MIN,
  rivalDescription,
  rivalHeading,
  rivalTitle,
} from './rivalSeo';

const all = records.map(parseMatch);
const rivalNames = [...new Set(all.map(match => clubOf(match.opponent)))];

describe('rival historial SEO copy', () => {
  test('Alianza Atlético title leads with the query people type', () => {
    const title = rivalTitle('Alianza Atlético');
    expect(title).toBe('Sporting Cristal vs Alianza Atlético: historial | Celeste');
    expect(title.length).toBeLessThanOrEqual(60);
    expect(rivalHeading('Alianza Atlético')).toBe('Sporting Cristal vs. Alianza Atlético: historial');
  });

  test('Alianza Atlético description includes historial, record and last result', () => {
    const h2h = headToHead(all, 'Alianza Atlético', aliases);
    const description = rivalDescription('Alianza Atlético', h2h);
    expect(description.toLowerCase()).toContain('historial');
    expect(description).toContain('Alianza Atlético');
    expect(description).toContain(`${h2h.total.played} PJ`);
    expect(description).toContain(`${h2h.total.V}V`);
    expect(description).toContain(h2h.lastMatch.scoreLabel);
    expect(description.length).toBeGreaterThanOrEqual(RIVAL_DESC_MIN);
    expect(description.length).toBeLessThanOrEqual(RIVAL_DESC_MAX);
  });

  test('every rival page title and description stay in the SERP-length band', () => {
    rivalNames.forEach(name => {
      const title = rivalTitle(name);
      const description = rivalDescription(name, headToHead(all, name, aliases));
      expect(title.toLowerCase()).toContain('historial');
      expect(title).toContain(name);
      expect(title.endsWith('| Celeste')).toBe(true);
      expect(title.length).toBeLessThanOrEqual(73);
      expect(description.toLowerCase()).toContain('historial');
      expect(description).toContain(name);
      expect(description.length).toBeGreaterThanOrEqual(RIVAL_DESC_MIN);
      expect(description.length).toBeLessThanOrEqual(RIVAL_DESC_MAX);
    });
  });

  test('long club names drop Sporting from the title before overflowing', () => {
    expect(rivalTitle('Universidad César Vallejo')).toBe('Cristal vs Universidad César Vallejo: historial | Celeste');
    expect(rivalTitle('Universidad César Vallejo').length).toBeLessThanOrEqual(60);
  });

  test('short rival names still reach the description band', () => {
    ['SIMA', 'AELU'].forEach(name => {
      const description = rivalDescription(name, headToHead(all, name, aliases));
      expect(description.length).toBeGreaterThanOrEqual(RIVAL_DESC_MIN);
      expect(description.length).toBeLessThanOrEqual(RIVAL_DESC_MAX);
    });
  });
});

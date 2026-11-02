import { describe, expect, it } from 'vitest';
import data from '../data/scorer-birthdays.json';
import { ageOn, birthdaysOn } from './birthdays.js';

const sample = [
  { name: 'A', birthDate: '1971-10-27', goals: 160 },
  { name: 'B', birthDate: '1990-10-27', goals: 10 },
  { name: 'C', birthDate: '2000-02-29', goals: 1 },
];

describe('birthdays', () => {
  it('computes age', () => {
    expect(ageOn('1971-10-27', 2026, 10, 26)).toBe(54);
    expect(ageOn('1971-10-27', 2026, 10, 27)).toBe(55);
  });
  it('returns scorers born on the day, sorted by goals, with age', () => {
    expect(birthdaysOn(sample, { year: 2026, month: 10, day: 27 })).toEqual([
      { name: 'A', birthDate: '1971-10-27', goals: 160, age: 55 },
      { name: 'B', birthDate: '1990-10-27', goals: 10, age: 36 },
    ]);
    expect(birthdaysOn(sample, new Date(2026, 10, 2))).toEqual([]);
  });
  it('shows 29-feb on 28-feb in non-leap years', () => {
    expect(birthdaysOn(sample, { year: 2026, month: 2, day: 28 }).map((e) => e.name)).toEqual(['C']);
    expect(birthdaysOn(sample, { year: 2028, month: 2, day: 28 })).toEqual([]);
  });
  it('data file is well formed', () => {
    expect(data.length).toBeGreaterThan(0);
    for (const e of data) {
      expect(e.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof e.name).toBe('string');
      expect(e.goals).toBeGreaterThan(0);
    }
  });
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildCalendar, validateFixtureData } from './generate-calendar.mjs';

const loadData = async () => JSON.parse(await readFile(new URL('../src/data/upcoming-fixtures.json', import.meta.url), 'utf8'));

test('publica únicamente partidos confirmados sin datos de cuenta', async () => {
  const data = await loadData();
  const calendar = buildCalendar(data);

  assert.match(calendar, /METHOD:PUBLISH/);
  assert.match(calendar, /BEGIN:VTIMEZONE\r\nTZID:America\/Lima/);
  assert.doesNotMatch(calendar, /20260807T200000|Universitario vs\. Sporting Cristal/);
  assert.doesNotMatch(calendar, /20260816T110000/);
  assert.doesNotMatch(calendar, /20260821T150000|Alianza Atlético vs\. Sporting Cristal/);
  assert.doesNotMatch(calendar, /20260826T150000|Copa de la Liga · Cuartos de final/);
  assert.doesNotMatch(calendar, /20260830T153000|Sport Boys vs\. Sporting Cristal/);
  assert.match(calendar, /DTSTART;TZID=America\/Lima:20260906T110000/);
  assert.match(calendar, /DTEND;TZID=America\/Lima:20260906T131500/);
  assert.match(calendar, /Sporting Cristal vs\. Los Chankas/);
  assert.match(calendar, /Estadio Alberto Gallardo/);
  assert.match(calendar, /DTSTART;TZID=America\/Lima:20260912T151500/);
  assert.match(calendar, /DTEND;TZID=America\/Lima:20260912T173000/);
  assert.match(calendar, /CD Moquegua vs\. Sporting Cristal/);
  assert.doesNotMatch(calendar, /@gmail\.com|calendar\.google\.com\/calendar\/ical\/.*private/i);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 2);
});

test('rechaza eventos tentativos o sin programación completa', async () => {
  const data = await loadData();
  data.fixtures[0].status = 'tentative';
  assert.throws(() => validateFixtureData(data), /no confirmado/);
});

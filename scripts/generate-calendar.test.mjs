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
  assert.doesNotMatch(calendar, /20260906T110000|Sporting Cristal vs\. Los Chankas/);
  assert.doesNotMatch(calendar, /20260912T151500/);
  assert.doesNotMatch(calendar, /20260913T100000|CD Moquegua vs\. Sporting Cristal/);
  assert.match(calendar, /20260919T153000|Sporting Cristal vs\. Atlético Grau/);
  assert.match(calendar, /20260927T151500|ADT vs\. Sporting Cristal/);
  assert.match(calendar, /20261001T150000|Sporting Cristal vs\. ADT/);
  assert.doesNotMatch(calendar, /@gmail\.com|calendar\.google\.com\/calendar\/ical\/.*private/i);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 3);
  assert.equal(data.fixtures.length, 3);
});

test('rechaza eventos tentativos o sin programación completa', async () => {
  const data = await loadData();
  data.fixtures = [{
    id: 'sample-tentative',
    competition: 'Liga 1 — Torneo Clausura',
    round: 'Fecha X',
    homeTeam: 'Sample FC',
    awayTeam: 'Sporting Cristal',
    start: '2026-09-20T15:00:00-05:00',
    end: '2026-09-20T17:15:00-05:00',
    venue: 'Estadio Sample',
    status: 'tentative',
  }];
  assert.throws(() => validateFixtureData(data), /no confirmado/);
});

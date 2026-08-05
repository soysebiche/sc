import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const DATA_URL = new URL('src/data/upcoming-fixtures.json', ROOT);
const OUTPUT_URL = new URL('public/sporting-cristal.ics', ROOT);

const escapeText = value => String(value)
  .replaceAll('\\', '\\\\')
  .replaceAll('\n', '\\n')
  .replaceAll(',', '\\,')
  .replaceAll(';', '\\;');

const compactLocalDate = value => value.slice(0, 19).replaceAll('-', '').replaceAll(':', '').replace('T', 'T');
const compactUtcDate = value => new Date(value).toISOString().replace(/[-:]/g, '').replace('.000', '');

const foldLine = line => {
  const chunks = [];
  let remaining = line;
  while (Buffer.byteLength(remaining, 'utf8') > 73) {
    let cut = 73;
    while (Buffer.byteLength(remaining.slice(0, cut), 'utf8') > 73) cut -= 1;
    chunks.push(remaining.slice(0, cut));
    remaining = ` ${remaining.slice(cut)}`;
  }
  chunks.push(remaining);
  return chunks.join('\r\n');
};

export function validateFixtureData(data) {
  if (!data?.calendar?.canonicalUrl?.startsWith('https://celeste.sebiche.com/')) {
    throw new Error('El calendario debe usar la URL HTTPS canónica del sitio.');
  }

  for (const fixture of data.fixtures || []) {
    if (fixture.status !== 'confirmed') throw new Error(`Partido no confirmado: ${fixture.id}`);
    if (!fixture.id || !fixture.homeTeam || !fixture.awayTeam || !fixture.venue) throw new Error(`Partido incompleto: ${fixture.id || 'sin-id'}`);
    if (Number.isNaN(Date.parse(fixture.start)) || Number.isNaN(Date.parse(fixture.end))) throw new Error(`Horario inválido: ${fixture.id}`);
    if (Date.parse(fixture.end) <= Date.parse(fixture.start)) throw new Error(`La hora final debe ser posterior al inicio: ${fixture.id}`);
  }
}

export function buildCalendar(data) {
  validateFixtureData(data);
  const { calendar, fixtures } = data;
  const dtstamp = compactUtcDate(calendar.lastVerifiedAt);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sebiche Celeste//Partidos de Sporting Cristal//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendar.name)}`,
    `X-WR-CALDESC:${escapeText(calendar.description)}`,
    `X-WR-TIMEZONE:${calendar.timeZone}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    'BEGIN:VTIMEZONE',
    `TZID:${calendar.timeZone}`,
    `X-LIC-LOCATION:${calendar.timeZone}`,
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0500',
    'TZNAME:-05',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  fixtures.forEach(fixture => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${fixture.id}@celeste.sebiche.com`,
      `DTSTAMP:${dtstamp}`,
      `LAST-MODIFIED:${dtstamp}`,
      `DTSTART;TZID=${calendar.timeZone}:${compactLocalDate(fixture.start)}`,
      `DTEND;TZID=${calendar.timeZone}:${compactLocalDate(fixture.end)}`,
      `SUMMARY:${escapeText(`${fixture.homeTeam} vs. ${fixture.awayTeam}`)}`,
      `DESCRIPTION:${escapeText(`${fixture.competition} · ${fixture.round}. Programación sujeta a cambios. Fuente: ${calendar.sourceName}`)}`,
      `LOCATION:${escapeText(fixture.venue)}`,
      `URL:${calendar.sourceUrl}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Sporting Cristal juega en 2 horas',
      'END:VALARM',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

async function run() {
  const data = JSON.parse(await readFile(DATA_URL, 'utf8'));
  await writeFile(OUTPUT_URL, buildCalendar(data), 'utf8');
  console.log(`Calendario generado: ${fileURLToPath(OUTPUT_URL)} (${data.fixtures.length} partidos)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

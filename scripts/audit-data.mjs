import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const REQUIRED_KEYS = [
  'Año', 'Mes', 'Dia', 'Día de la Semana', 'Fecha', 'Torneo', 'Número de Fecha',
  'Equipo Local', 'Equipo Visita', 'Marcador', 'Resultado', 'Goles (Solo SC)', 'País',
];

const RESULT_GROUPS = {
  win: new Set(['G', 'V']),
  draw: new Set(['E']),
  loss: new Set(['D', 'P']),
};

const issue = (code, index, message) => ({ code, record: index + 1, message });

export function auditArchive(records, metadata) {
  const issues = [];
  const identities = new Map();
  const dates = [];

  records.forEach((match, index) => {
    const keys = Object.keys(match);
    if (JSON.stringify(keys) !== JSON.stringify(REQUIRED_KEYS)) {
      issues.push(issue('schema', index, 'Las 13 claves o su orden no coinciden con el contrato.'));
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(match.Fecha || '') || Number.isNaN(Date.parse(`${match.Fecha}T00:00:00Z`))) {
      issues.push(issue('date', index, `Fecha inválida: ${match.Fecha}`));
    } else {
      dates.push(match.Fecha);
      const calendarYear = Number(match.Fecha.slice(0, 4));
      const isJanuarySeasonCarryover = match.Fecha.slice(5, 7) === '01' && Number(match.Año) === calendarYear - 1;
      if (Number(match.Año) !== calendarYear && !isJanuarySeasonCarryover) {
        issues.push(issue('year', index, `Año ${match.Año} no coincide con ${match.Fecha}.`));
      }
    }

    const score = String(match.Marcador || '').match(/^(\d+)\s*-\s*(\d+)$/);
    if (!score) {
      issues.push(issue('score', index, `Marcador inválido: ${match.Marcador}`));
    }

    const isHome = match['Equipo Local'] === 'Sporting Cristal';
    const isAway = match['Equipo Visita'] === 'Sporting Cristal';
    if (isHome === isAway) {
      issues.push(issue('club', index, 'Sporting Cristal debe aparecer exactamente una vez.'));
    }

    if (score && (isHome || isAway)) {
      const homeGoals = Number(score[1]);
      const awayGoals = Number(score[2]);
      const scGoals = isHome ? homeGoals : awayGoals;
      const opponentGoals = isHome ? awayGoals : homeGoals;
      let group = scGoals > opponentGoals ? 'win' : scGoals < opponentGoals ? 'loss' : 'draw';
      const penaltyNote = String(match['Goles (Solo SC)'] || '');
      if (group === 'draw' && /perdi[oó].*penal/i.test(penaltyNote)) group = 'loss';
      if (group === 'draw' && /gan[oó].*penal/i.test(penaltyNote)) group = 'win';
      if (!RESULT_GROUPS[group].has(match.Resultado)) {
        issues.push(issue('result', index, `Resultado ${match.Resultado} contradice el marcador ${match.Marcador}.`));
      }
    }

    if (!String(match.País || '').trim()) issues.push(issue('country', index, 'País vacío.'));
    if (!String(match.Torneo || '').trim()) issues.push(issue('tournament', index, 'Torneo vacío.'));

    const identity = [match.Fecha, match.Torneo, match['Equipo Local'], match['Equipo Visita']].join('|');
    if (identities.has(identity)) {
      issues.push(issue('duplicate', index, `Duplica el registro ${identities.get(identity) + 1}: ${identity}`));
    } else {
      identities.set(identity, index);
    }
  });

  const orderedDates = [...dates].sort();
  if (records.length !== metadata.recordCount) {
    issues.push({ code: 'metadata-count', record: 0, message: `Metadata=${metadata.recordCount}; dataset=${records.length}.` });
  }
  if (orderedDates[0] !== metadata.firstMatchDate || orderedDates.at(-1) !== metadata.latestMatchDate) {
    issues.push({ code: 'metadata-range', record: 0, message: `Rango real ${orderedDates[0]}–${orderedDates.at(-1)} no coincide con metadata.` });
  }
  if (metadata.lastUpdated < metadata.latestMatchDate) {
    issues.push({ code: 'metadata-freshness', record: 0, message: 'lastUpdated precede al último partido.' });
  }

  return issues;
}

async function run() {
  const root = new URL('../', import.meta.url);
  const records = JSON.parse(await readFile(new URL('src/data/historico_completo_sc.json', root), 'utf8'));
  const metadata = JSON.parse(await readFile(new URL('src/data/archive-metadata.json', root), 'utf8'));
  const issues = auditArchive(records, metadata);

  if (issues.length > 0) {
    console.error(JSON.stringify({ ok: false, records: records.length, issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    records: records.length,
    range: `${metadata.firstMatchDate}..${metadata.latestMatchDate}`,
    revision: metadata.datasetRevision,
    checks: ['schema', 'date', 'year', 'score', 'result', 'club', 'country', 'tournament', 'duplicates', 'metadata'],
  }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

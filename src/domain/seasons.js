// Season selection, coverage caveats and side-by-side comparison.
// Inputs are parsed matches from `parseMatch`. Views must not re-parse scores.
import { tournamentFamily } from './rivals.js';
import { slugify } from './publicRoutes.js';
import { calculateHomeAway, calculateRecords, calculateStreaks, rankScorers, SCORER_COMPLETE_FROM } from './stats.js';

export const ALL_PHASE = '';
export const SPARSE_MATCH_THRESHOLD = 15;
// Comparison always uses 3 points for a win. The archive does not store the
// table system of each era; Peruvian league seasons before 1995 are flagged.
export const THREE_POINT_ERA_FROM = 1995;

const PHASE_ORDER = [
  'Apertura',
  'Clausura',
  'Liga / Descentralizado',
  'Copa de la Liga',
  'Copa Bicentenario',
  'Torneo del Inca',
  'Torneo de Verano',
  'Copa Libertadores',
  'Copa Sudamericana',
  'Copa Merconorte',
  'Liguillas',
  'Finales y definiciones',
];

const scored = ms => ms.filter(m => Number.isInteger(m.scGoals) && Number.isInteger(m.opponentGoals) && m.resultCode);

export const phaseSlug = family => slugify(family);

export function sortPhases(families) {
  const unique = [...new Set(families.filter(Boolean))];
  return unique.sort((a, b) => {
    const ia = PHASE_ORDER.indexOf(a);
    const ib = PHASE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'es');
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function belongsToPhase(tournament, phase) {
  if (!phase) return true;
  if (tournamentFamily(tournament) === phase) return true;
  const name = String(tournament || '');
  if (phase === 'Apertura' && /^apertura/i.test(name)) return true;
  if (phase === 'Clausura' && /^clausura/i.test(name)) return true;
  return false;
}

export function filterSeasonMatches(matches, { year, phase = ALL_PHASE } = {}) {
  const y = Number(year);
  if (!Number.isInteger(y)) return [];
  return matches.filter(match => match.year === y && belongsToPhase(match.tournament, phase || ALL_PHASE));
}

export function phasesForYear(matches, year) {
  const families = new Set();
  for (const match of matches) {
    if (match.year === Number(year) && match.tournament) families.add(tournamentFamily(match.tournament));
  }
  return sortPhases([...families]);
}

export function resolvePhaseSlug(matches, year, slug) {
  if (!slug) return ALL_PHASE;
  return phasesForYear(matches, year).find(family => phaseSlug(family) === slug) || ALL_PHASE;
}

export function listSeasonSlots(matches) {
  const byYear = new Map();
  for (const match of matches) {
    if (!Number.isInteger(match.year)) continue;
    if (!byYear.has(match.year)) byYear.set(match.year, []);
    byYear.get(match.year).push(match);
  }
  return [...byYear.keys()].sort((a, b) => b - a).map(year => ({
    year,
    phases: phasesForYear(byYear.get(year), year),
    played: scored(byYear.get(year)).length,
  }));
}

export function missingArchiveYears(years) {
  if (!years.length) return [];
  const present = new Set(years);
  const missing = [];
  for (let year = Math.min(...years); year <= Math.max(...years); year += 1) {
    if (!present.has(year)) missing.push(year);
  }
  return missing;
}

export function honoursForYear(palmares, year) {
  const y = Number(year);
  const titles = [];
  const runnersUp = [];
  for (const competition of palmares?.competitions || []) {
    if (competition.titles.includes(y)) titles.push({ id: competition.id, name: competition.name });
    if (competition.runnersUp.includes(y)) runnersUp.push({ id: competition.id, name: competition.name });
  }
  const topScorer = (palmares?.topScorers || []).find(row => row.year === y) || null;
  return { titles, runnersUp, topScorer };
}

export function palmaresYearsMissingFromArchive(palmares, years) {
  const present = new Set(years);
  const rows = [];
  for (const competition of palmares?.competitions || []) {
    for (const year of competition.titles) {
      if (!present.has(year)) rows.push({ year, competition: competition.name, kind: 'title' });
    }
    for (const year of competition.runnersUp) {
      if (!present.has(year)) rows.push({ year, competition: competition.name, kind: 'runnerUp' });
    }
  }
  return rows.sort((a, b) => a.year - b.year || a.competition.localeCompare(b.competition, 'es'));
}

export function defaultSeasonPair(years) {
  const ordered = [...years].sort((a, b) => b - a);
  return {
    a: ordered[1] || ordered[0] || null,
    b: ordered[0] || null,
  };
}

export function seasonLabel({ year, phase }) {
  if (!year) return 'Temporada';
  return phase ? `${year} · ${phase}` : String(year);
}

export function summarizeSeason(matches) {
  const list = scored(matches);
  const summary = list.reduce((acc, match) => {
    acc.played += 1;
    acc[match.resultCode] += 1;
    acc.goalsFor += match.scGoals;
    acc.goalsAgainst += match.opponentGoals;
    return acc;
  }, { played: 0, V: 0, E: 0, P: 0, goalsFor: 0, goalsAgainst: 0 });
  const points = summary.V * 3 + summary.E;
  const goalDiff = summary.goalsFor - summary.goalsAgainst;
  const dates = list.map(match => match.date).filter(Boolean).sort();
  return {
    ...summary,
    points,
    goalDiff,
    winPercentage: summary.played ? ((summary.V / summary.played) * 100).toFixed(1) : '0.0',
    firstDate: dates[0] || null,
    lastDate: dates.at(-1) || null,
  };
}

function coverageFor({ year, phase }, summary, { latestYear, latestMatchDate, palmares } = {}) {
  const honours = honoursForYear(palmares, year);
  const sparse = summary.played > 0 && summary.played < SPARSE_MATCH_THRESHOLD;
  const empty = summary.played === 0;
  const inProgress = Number(year) === Number(latestYear);
  const twoPointEra = Number(year) < THREE_POINT_ERA_FROM;
  const scorerLowerBound = Number(year) < SCORER_COMPLETE_FROM;
  const notes = [];
  if (empty) {
    notes.push(phase
      ? `El archivo no tiene partidos de ${year} en ${phase}.`
      : `El archivo no tiene partidos de ${year}.`);
  }
  if (sparse) {
    notes.push(`Solo ${summary.played} partidos de ${seasonLabel({ year, phase })} están en el archivo; la temporada puede estar incompleta.`);
  }
  if (inProgress && latestMatchDate) {
    notes.push(`Temporada en curso según el archivo (último partido: ${latestMatchDate}).`);
  } else if (inProgress) {
    notes.push('Temporada en curso según el archivo.');
  }
  if (twoPointEra) {
    notes.push(`Los puntos de ${year} se muestran con 3 por victoria para comparar. El campeonato local de esa época usaba habitualmente 2 puntos por victoria; el archivo no guarda el reglamento de cada año.`);
  }
  if (scorerLowerBound) {
    notes.push(`Los goleadores de ${year} son un mínimo: antes de ${SCORER_COMPLETE_FROM} el archivo no registra todos los goles.`);
  }
  if (empty && honours.titles.length) {
    notes.push(`Palmarés sí registra título(s) en ${year}: ${honours.titles.map(item => item.name).join(', ')}.`);
  }
  if (phase && honours.titles.length) {
    notes.push('Los títulos de Palmarés se anotan por año, no por fase.');
  }
  return {
    empty,
    sparse,
    inProgress,
    twoPointEra,
    scorerLowerBound,
    notes,
  };
}

export function aggregateSeason(matches, aliases, palmares, selection, options = {}) {
  const year = Number(selection?.year);
  const phase = selection?.phase || ALL_PHASE;
  const filtered = filterSeasonMatches(matches, { year, phase });
  const list = scored(filtered);
  const summary = summarizeSeason(list);
  const homeAway = calculateHomeAway(list);
  const records = calculateRecords(list, 1);
  const streaks = calculateStreaks(list);
  const scorers = aliases ? rankScorers(list, aliases).slice(0, 5) : [];
  const honours = honoursForYear(palmares, year);
  const coverage = coverageFor({ year, phase }, summary, options);
  return {
    year,
    phase,
    label: seasonLabel({ year, phase }),
    path: Number.isInteger(year) ? `/temporadas/${year}` : '/temporadas',
    summary,
    home: homeAway.overall.home,
    away: homeAway.overall.away,
    biggestWin: records.biggestWins[0] || null,
    biggestLoss: records.biggestLosses[0] || null,
    winningStreak: streaks.winning.record,
    unbeatenStreak: streaks.unbeaten.record,
    scorers,
    honours,
    coverage,
    families: phasesForYear(list, year),
  };
}

export function sideWinner(left, right, direction) {
  if (direction === 0 || left == null || right == null || left === right) return null;
  if (direction > 0) return left > right ? 'left' : 'right';
  return left < right ? 'left' : 'right';
}

const marginOf = match => (match ? match.scGoals - match.opponentGoals : null);

export function comparisonRows(left, right) {
  const split = (side, key) => ({
    played: side[key].played,
    V: side[key].V,
    E: side[key].E,
    P: side[key].P,
    points: side[key].V * 3 + side[key].E,
    goalsFor: side[key].goalsFor,
    goalsAgainst: side[key].goalsAgainst,
    goalDiff: side[key].goalsFor - side[key].goalsAgainst,
  });
  return [
    { id: 'played', label: 'Partidos', left: left.summary.played, right: right.summary.played, direction: 0 },
    { id: 'V', label: 'Victorias', left: left.summary.V, right: right.summary.V, direction: 1 },
    { id: 'E', label: 'Empates', left: left.summary.E, right: right.summary.E, direction: 0 },
    { id: 'P', label: 'Derrotas', left: left.summary.P, right: right.summary.P, direction: -1 },
    { id: 'points', label: 'Puntos (3 por victoria)', left: left.summary.points, right: right.summary.points, direction: 1 },
    { id: 'goalsFor', label: 'Goles a favor', left: left.summary.goalsFor, right: right.summary.goalsFor, direction: 1 },
    { id: 'goalsAgainst', label: 'Goles en contra', left: left.summary.goalsAgainst, right: right.summary.goalsAgainst, direction: -1 },
    { id: 'goalDiff', label: 'Diferencia de goles', left: left.summary.goalDiff, right: right.summary.goalDiff, direction: 1 },
    { id: 'winPercentage', label: '% victorias', left: Number(left.summary.winPercentage), right: Number(right.summary.winPercentage), direction: 1, displayLeft: `${left.summary.winPercentage}%`, displayRight: `${right.summary.winPercentage}%` },
    { id: 'homePoints', label: 'Puntos de local', left: split(left, 'home').points, right: split(right, 'home').points, direction: 1 },
    { id: 'awayPoints', label: 'Puntos de visita', left: split(left, 'away').points, right: split(right, 'away').points, direction: 1 },
    { id: 'winningStreak', label: 'Racha de victorias', left: left.winningStreak?.length || 0, right: right.winningStreak?.length || 0, direction: 1 },
    { id: 'unbeatenStreak', label: 'Racha invicta', left: left.unbeatenStreak?.length || 0, right: right.unbeatenStreak?.length || 0, direction: 1 },
    { id: 'biggestWin', label: 'Mayor victoria (diferencia)', left: marginOf(left.biggestWin), right: marginOf(right.biggestWin), direction: 1 },
    { id: 'biggestLoss', label: 'Peor derrota (diferencia)', left: marginOf(left.biggestLoss), right: marginOf(right.biggestLoss), direction: 1 },
    { id: 'titles', label: 'Títulos (Palmarés)', left: left.honours.titles.length, right: right.honours.titles.length, direction: 1 },
  ].map(row => ({
    ...row,
    winner: sideWinner(row.left, row.right, row.direction),
  }));
}

export function compareSeasons(matches, aliases, palmares, leftSel, rightSel, options = {}) {
  const left = aggregateSeason(matches, aliases, palmares, leftSel, options);
  const right = aggregateSeason(matches, aliases, palmares, rightSel, options);
  return {
    left,
    right,
    rows: comparisonRows(left, right),
    sameSelection: left.year === right.year && left.phase === right.phase,
  };
}

export function archiveCompareContext(matches, palmares) {
  const years = [...new Set(matches.map(match => match.year).filter(Number.isInteger))].sort((a, b) => b - a);
  const latestYear = years[0] || null;
  const latestMatchDate = matches.reduce((max, match) => (match.date && match.date > max ? match.date : max), '');
  return {
    years,
    slots: listSeasonSlots(matches),
    missingYears: missingArchiveYears(years),
    palmaresGaps: palmaresYearsMissingFromArchive(palmares, years),
    defaults: defaultSeasonPair(years),
    latestYear,
    latestMatchDate,
  };
}

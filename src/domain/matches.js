export const CLUB_NAME = 'Sporting Cristal';
export const MATCHES_PER_PAGE = 18;
export const MONTH_NAMES = Object.freeze([
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]);

export const RIVAL_ALIASES = Object.freeze({
  'Académia Cantolao': 'Academia Cantolao',
  'Deportivo Los Chankas': 'Dep. Los Chankas',
  'Union Comercio': 'Unión Comercio',
  UTC: 'U.T.C.',
});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOST_ON_PENALTIES = /perdi[oó].*penal/i;
const WON_ON_PENALTIES = /gan[oó].*penal/i;
const INTERNATIONAL_TOURNAMENTS = new Set(['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte']);

export const canonicalizeRival = (name = '') => RIVAL_ALIASES[name] || name;

export const parseCalendarDate = (value) => {
  if (!value || value === 'TBD' || !DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return null;
  return { date, year, monthIndex: month - 1, monthName: MONTH_NAMES[month - 1], day };
};

const parseScoreLabel = (marcador) => {
  const values = String(marcador || '').split('-').map(value => Number.parseInt(value.trim(), 10));
  if (values.length !== 2 || values.some(Number.isNaN)) return null;
  return { home: values[0], away: values[1] };
};

export const resultFromScoreAndNote = ({ scGoals, opponentGoals, resultField, goalsNote }) => {
  if (scGoals > opponentGoals) return 'V';
  if (scGoals < opponentGoals) return 'P';
  const note = String(goalsNote || '');
  if (['D', 'P'].includes(resultField) && LOST_ON_PENALTIES.test(note)) return 'P';
  if (['G', 'V'].includes(resultField) && WON_ON_PENALTIES.test(note)) return 'V';
  return 'E';
};

export const parseMatch = (record) => {
  const home = record['Equipo Local'] || '';
  const away = record['Equipo Visita'] || '';
  const isHome = home === CLUB_NAME;
  const parsedDate = parseCalendarDate(record.Fecha);
  const score = parseScoreLabel(record.Marcador);
  const goalsNote = record['Goles (Solo SC)'] && record['Goles (Solo SC)'] !== '-'
    ? String(record['Goles (Solo SC)'])
    : null;

  let scGoals = null;
  let opponentGoals = null;
  let resultCode = null;
  if (score) {
    scGoals = isHome ? score.home : score.away;
    opponentGoals = isHome ? score.away : score.home;
    resultCode = resultFromScoreAndNote({
      scGoals,
      opponentGoals,
      resultField: record.Resultado,
      goalsNote,
    });
  }

  return {
    year: Number.isInteger(record.Año) ? record.Año : parsedDate?.year ?? null,
    month: MONTH_NAMES.includes(record.Mes) ? record.Mes : parsedDate?.monthName ?? null,
    date: record.Fecha || '',
    tournament: record.Torneo || '',
    home,
    away,
    opponent: canonicalizeRival(isHome ? away : home),
    country: record.País || '',
    scoreLabel: record.Marcador || '',
    goalsNote,
    isHome,
    scGoals,
    opponentGoals,
    resultCode,
  };
};

export const getUniqueYears = (matches) => [...new Set(
  matches.map(match => match.year).filter(year => year !== null)
)].sort((a, b) => b - a);

export const formatMatchDate = (dateString, options = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}) => {
  const parsed = parseCalendarDate(dateString);
  if (!parsed) return 'Fecha pendiente';
  return parsed.date.toLocaleDateString('es-ES', options);
};

const dateValue = (match) => {
  if (match.date === 'TBD') return Number.NEGATIVE_INFINITY;
  const parsed = parseCalendarDate(match.date);
  return parsed ? parsed.date.getTime() : Number.NEGATIVE_INFINITY;
};

export const sortMatchesNewest = (matches) => [...matches].sort((a, b) => dateValue(b) - dateValue(a));

export const summarizeMatches = (matches) => {
  const summary = matches.reduce((accumulator, match) => {
    if (match.scGoals == null) return accumulator;
    accumulator.total += 1;
    accumulator.goalsFor += match.scGoals;
    accumulator.goalsAgainst += match.opponentGoals;
    if (match.resultCode === 'V') accumulator.victories += 1;
    else if (match.resultCode === 'P') accumulator.defeats += 1;
    else accumulator.draws += 1;
    return accumulator;
  }, { total: 0, victories: 0, draws: 0, defeats: 0, goalsFor: 0, goalsAgainst: 0 });

  const percentage = value => summary.total > 0 ? ((value / summary.total) * 100).toFixed(1) : '0.0';
  return {
    ...summary,
    winPercentage: percentage(summary.victories),
    drawPercentage: percentage(summary.draws),
    defeatPercentage: percentage(summary.defeats),
  };
};

export const paginateMatches = (matches, requestedPage, pageSize = MATCHES_PER_PAGE) => {
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const parsedPage = Number.parseInt(requestedPage, 10) || 1;
  const currentPage = Math.min(Math.max(parsedPage, 1), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    items: matches.slice(start, start + pageSize),
    start: matches.length === 0 ? 0 : start + 1,
    end: Math.min(start + pageSize, matches.length),
  };
};

export const getUniqueMonths = (matches) => {
  const present = new Set(matches.map(match => match.month).filter(Boolean));
  return MONTH_NAMES.filter(month => present.has(month));
};

export const filterMatchesByYearAndMonth = (matches, year = '', month = '') => sortMatchesNewest(
  matches.filter(match => {
    const yearMatches = year ? String(match.year) === String(year) : true;
    if (!yearMatches || !month) return yearMatches;
    return match.month === month;
  })
);

export const getMatchesForDayMonth = (matches, dateString) => {
  if (!DATE_PATTERN.test(dateString || '')) return [];
  const [, month, day] = dateString.split('-');
  return sortMatchesNewest(matches.filter(match => {
    if (!DATE_PATTERN.test(match.date || '')) return false;
    const [, matchMonth, matchDay] = match.date.split('-');
    return matchMonth === month && matchDay === day;
  }));
};

export const calculateArchiveOverview = (matches) => {
  const rivalStats = {};
  const countries = new Set();

  matches.forEach(match => {
    if (match.scGoals == null) return;
    const rival = match.opponent;
    if (!rivalStats[rival]) rivalStats[rival] = { total: 0, victories: 0, draws: 0, defeats: 0 };
    rivalStats[rival].total += 1;
    if (match.resultCode === 'V') rivalStats[rival].victories += 1;
    else if (match.resultCode === 'P') rivalStats[rival].defeats += 1;
    else rivalStats[rival].draws += 1;
    if (match.country && match.country !== 'Perú') countries.add(match.country);
  });

  const eligibleRivals = Object.entries(rivalStats).filter(([, stats]) => stats.total >= 5);
  const bestRivalEntry = eligibleRivals.reduce((best, entry) => (
    !best || entry[1].victories / entry[1].total > best[1].victories / best[1].total ? entry : best
  ), null);
  const worstRivalEntry = eligibleRivals.reduce((worst, entry) => (
    !worst || entry[1].defeats / entry[1].total > worst[1].defeats / worst[1].total ? entry : worst
  ), null);
  const toNamedStats = entry => entry ? { name: entry[0], ...entry[1] } : null;

  return {
    ...summarizeMatches(matches),
    bestRival: toNamedStats(bestRivalEntry),
    worstRival: toNamedStats(worstRivalEntry),
    totalIntlCountries: countries.size,
  };
};

export const calculateYearlyStats = (matches, filter = 'todos') => {
  const filtered = matches.filter(match => {
    const isInternational = INTERNATIONAL_TOURNAMENTS.has(match.tournament);
    if (filter === 'local') return !isInternational;
    if (filter === 'internacional') return isInternational;
    return true;
  });
  const groups = new Map();

  filtered.forEach(match => {
    if (match.year === null) return;
    if (!groups.has(match.year)) groups.set(match.year, []);
    groups.get(match.year).push(match);
  });

  return [...groups.entries()].map(([year, yearMatches]) => ({
    year,
    ...summarizeMatches(yearMatches),
  }));
};

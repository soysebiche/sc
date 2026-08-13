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

export const canonicalizeRival = (name = '') => RIVAL_ALIASES[name] || name;

export const getOpponent = (match) => canonicalizeRival(
  match['Equipo Local'] === CLUB_NAME ? match['Equipo Visita'] : match['Equipo Local']
);

export const getYearFromMatch = (match) => {
  if (Number.isInteger(match.Año)) return match.Año;
  if (!match.Fecha || match.Fecha === 'TBD') return null;

  const date = new Date(`${match.Fecha}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

export const getScore = (match) => {
  const values = String(match.Marcador || '').split('-').map(value => Number.parseInt(value.trim(), 10));
  if (values.length !== 2 || values.some(Number.isNaN)) {
    return { valid: false, scGoals: 0, opponentGoals: 0 };
  }

  const isHome = match['Equipo Local'] === CLUB_NAME;
  return {
    valid: true,
    scGoals: isHome ? values[0] : values[1],
    opponentGoals: isHome ? values[1] : values[0],
  };
};

export const getResultCode = (match) => {
  const { valid, scGoals, opponentGoals } = getScore(match);
  if (!valid) return null;
  if (scGoals > opponentGoals) return 'V';
  if (scGoals < opponentGoals) return 'P';
  if (['D', 'P'].includes(match.Resultado) && /perdi[oó].*penal/i.test(String(match['Goles (Solo SC)'] || ''))) return 'P';
  if (['G', 'V'].includes(match.Resultado) && /gan[oó].*penal/i.test(String(match['Goles (Solo SC)'] || ''))) return 'V';
  return 'E';
};

export const getUniqueYears = (matches) => [...new Set(
  matches.map(getYearFromMatch).filter(year => year !== null)
)].sort((a, b) => b - a);

export const formatMatchDate = (dateString, options = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}) => {
  if (!dateString || dateString === 'TBD') return 'Fecha pendiente';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('es-ES', options);
};

export const sortMatchesNewest = (matches) => [...matches].sort((a, b) => {
  const dateA = a.Fecha === 'TBD' ? Number.NEGATIVE_INFINITY : Date.parse(`${a.Fecha}T00:00:00`);
  const dateB = b.Fecha === 'TBD' ? Number.NEGATIVE_INFINITY : Date.parse(`${b.Fecha}T00:00:00`);
  return (Number.isNaN(dateB) ? Number.NEGATIVE_INFINITY : dateB)
    - (Number.isNaN(dateA) ? Number.NEGATIVE_INFINITY : dateA);
});

export const summarizeMatches = (matches) => {
  const summary = matches.reduce((accumulator, match) => {
    const { valid, scGoals, opponentGoals } = getScore(match);
    if (!valid) return accumulator;

    accumulator.total += 1;
    accumulator.goalsFor += scGoals;
    accumulator.goalsAgainst += opponentGoals;
    const result = getResultCode(match);
    if (result === 'V') accumulator.victories += 1;
    else if (result === 'P') accumulator.defeats += 1;
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
  const present = new Set(matches.map(match => {
    if (match.Mes && MONTH_NAMES.includes(match.Mes)) return match.Mes;
    if (!match.Fecha || match.Fecha === 'TBD') return null;
    const date = new Date(`${match.Fecha}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : MONTH_NAMES[date.getMonth()];
  }).filter(Boolean));

  return MONTH_NAMES.filter(month => present.has(month));
};

export const filterMatchesByYearAndMonth = (matches, year = '', month = '') => sortMatchesNewest(
  matches.filter(match => {
    const matchYear = getYearFromMatch(match);
    const yearMatches = year ? String(matchYear) === String(year) : true;
    if (!yearMatches || !month) return yearMatches;

    if (match.Mes && MONTH_NAMES.includes(match.Mes)) return match.Mes === month;
    if (!match.Fecha || match.Fecha === 'TBD') return false;
    const date = new Date(`${match.Fecha}T00:00:00`);
    return !Number.isNaN(date.getTime()) && MONTH_NAMES[date.getMonth()] === month;
  })
);

export const getMatchesForDayMonth = (matches, dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) return [];
  const [, month, day] = dateString.split('-');
  return sortMatchesNewest(matches.filter(match => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match.Fecha || '')) return false;
    const [, matchMonth, matchDay] = match.Fecha.split('-');
    return matchMonth === month && matchDay === day;
  }));
};

const INTERNATIONAL_TOURNAMENTS = new Set(['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte']);

export const calculateArchiveOverview = (matches) => {
  const rivalStats = {};
  const countries = new Set();

  matches.forEach(match => {
    const { valid } = getScore(match);
    if (!valid) return;

    const rival = getOpponent(match);
    if (!rivalStats[rival]) rivalStats[rival] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 };
    rivalStats[rival].jugados += 1;
    const result = getResultCode(match);
    if (result === 'V') rivalStats[rival].ganados += 1;
    else if (result === 'P') rivalStats[rival].perdidos += 1;
    else rivalStats[rival].empatados += 1;

    if (match.País && match.País !== 'Perú') countries.add(match.País);
  });

  const eligibleRivals = Object.entries(rivalStats).filter(([, stats]) => stats.jugados >= 5);
  const bestRivalEntry = eligibleRivals.reduce((best, entry) => (
    !best || entry[1].ganados / entry[1].jugados > best[1].ganados / best[1].jugados ? entry : best
  ), null);
  const worstRivalEntry = eligibleRivals.reduce((worst, entry) => (
    !worst || entry[1].perdidos / entry[1].jugados > worst[1].perdidos / worst[1].jugados ? entry : worst
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
    const isInternational = INTERNATIONAL_TOURNAMENTS.has(match.Torneo);
    if (filter === 'local') return !isInternational;
    if (filter === 'internacional') return isInternational;
    return true;
  });
  const groups = new Map();

  filtered.forEach(match => {
    const year = getYearFromMatch(match);
    if (year === null) return;
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(match);
  });

  return [...groups.entries()].map(([year, yearMatches]) => ({
    year,
    ...summarizeMatches(yearMatches),
  }));
};

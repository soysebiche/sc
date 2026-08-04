export const CLUB_NAME = 'Sporting Cristal';

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

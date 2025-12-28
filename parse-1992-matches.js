// Script para parsear partidos de Sporting Cristal 1992
const fs = require('fs');

// Mapeo de meses en español
const meses = {
  'Abril': 4, 'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
  'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
};

// Días de la semana
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Normalizar nombres de equipos
function normalizeTeamName(name) {
  const map = {
    'Dep. Municipal': 'Deportivo Municipal',
    'Dep. Yurimaguas': 'Deportivo Yurimaguas',
    'Dep. San Agustin': 'Deportivo San Agustín',
    'C.N.I.': 'Colegio Nacional de Iquitos',
    'U.T.C.': 'Univ. Técnica de Cajamarca',
    'FBC Melgar': 'FBC Melgar',
    'Melgar FBC': 'FBC Melgar',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Lima': 'Alianza Lima',
    'Universitario': 'Universitario',
    'Sport Boys': 'Sport Boys',
    'Cienciano': 'Cienciano',
    'Leon de Huanuco': 'León de Huanuco',
    'Union Minas': 'Unión Minas',
    'Carlos A. Manucci': 'Carlos A. Manucci',
    'Defensor Lima': 'Defensor Lima',
    'Sporting Cristal': 'Sporting Cristal',
    'Ovacion Sipesa': 'Ovación Sipesa',
    'Ovación Sipesa': 'Ovación Sipesa'
  };
  return map[name.trim()] || name.trim();
}

// Obtener resultado (V/E/D)
function getResultado(marcador, equipoLocal, equipoVisita) {
  if (!marcador || marcador === '-') return 'E';
  const [local, visita] = marcador.split('-').map(s => parseInt(s.trim()));
  if (isNaN(local) || isNaN(visita)) return 'E';
  
  if (equipoLocal === 'Sporting Cristal') {
    if (local > visita) return 'V';
    if (local < visita) return 'D';
    return 'E';
  } else {
    if (visita > local) return 'V';
    if (visita < local) return 'D';
    return 'E';
  }
}

// Obtener día de la semana
function getDayOfWeek(dateStr) {
  const date = new Date(dateStr);
  return diasSemana[date.getDay()];
}

// Obtener nombre del mes
function getMonthName(monthNum) {
  const monthNames = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };
  return monthNames[monthNum];
}

// Parsear fecha desde formato [MMM DD,DD] o [DD MMM]
function parseRoundDate(dateStr, year = 1992) {
  // Formato: [Apr 11,12] o [Nov 8] o [Oct 31, Nov 1]
  const months = {
    'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
    'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };
  
  // Extraer mes y días
  const match = dateStr.match(/([A-Za-z]+)\s+(\d+)(?:,(\d+))?/);
  if (!match) return null;
  
  const month = months[match[1]];
  const day1 = parseInt(match[2]);
  const day2 = match[3] ? parseInt(match[3]) : null;
  
  return { month, day1, day2 };
}

// Crear objeto de partido
function createMatch(data) {
  // Parsear fecha directamente desde string YYYY-MM-DD
  const fechaParts = data.Fecha.split('-');
  const año = parseInt(fechaParts[0]);
  const mes = parseInt(fechaParts[1]);
  const dia = parseInt(fechaParts[2]);
  
  // Determinar condición
  let condicion = 'Neutral';
  if (data['Equipo Local'] === 'Sporting Cristal') {
    condicion = 'Local';
  } else if (data['Equipo Visita'] === 'Sporting Cristal') {
    condicion = 'Visitante';
  }
  
  return {
    "Año": año,
    "Mes": getMonthName(mes),
    "Dia": dia,
    "Día de la Semana": getDayOfWeek(data.Fecha),
    "Fecha": data.Fecha,
    "Torneo": data.Torneo || 'Descentralizado',
    "Número de Fecha": data['Número de Fecha'] || '1',
    "Equipo Local": data['Equipo Local'],
    "Equipo Visita": data['Equipo Visita'],
    "Marcador": data.Marcador,
    "Resultado": data.Resultado || getResultado(data.Marcador, data['Equipo Local'], data['Equipo Visita']),
    "Goles (Solo SC)": data['Goles (Solo SC)'] || '-',
    "Condicion": condicion,
    "Estadio": "TBD"
  };
}

// Datos de las rondas con fechas
const roundDates = {
  1: { month: 4, day1: 11, day2: 12 },
  2: { month: 4, day1: 18, day2: 19 },
  3: { month: 4, day1: 25, day2: 26 },
  4: { month: 5, day1: 2, day2: 3 },
  5: { month: 5, day1: 10, day2: 11 },
  6: { month: 5, day1: 16, day2: 17 },
  7: { month: 5, day1: 23, day2: 24 },
  8: { month: 5, day1: 30, day2: 31 },
  9: { month: 6, day1: 6, day2: 7 },
  10: { month: 6, day1: 13, day2: 14 },
  11: { month: 6, day1: 20, day2: 21 },
  12: { month: 6, day1: 27, day2: 28 },
  13: { month: 7, day1: 3, day2: 4 },
  14: { month: 7, day1: 11, day2: 12 },
  15: { month: 7, day1: 18, day2: 19 },
  16: { month: 8, day1: 8, day2: 9 },
  17: { month: 8, day1: 15, day2: 16 },
  18: { month: 8, day1: 23, day2: 24 },
  19: { month: 8, day1: 30, day2: 31 },
  20: { month: 9, day1: 5, day2: 6 },
  21: { month: 9, day1: 12, day2: 13 },
  22: { month: 9, day1: 19, day2: 20 },
  23: { month: 9, day1: 26, day2: 27 },
  24: { month: 10, day1: 3, day2: 4 },
  25: { month: 10, day1: 10, day2: 11 },
  26: { month: 10, day1: 17, day2: 18 },
  27: { month: 10, day1: 24, day2: 25 },
  28: { month: 10, day1: 31, day2: null }, // Nov 1
  29: { month: 11, day1: 8, day2: null },
  30: { month: 11, day1: 15, day2: null }
};

// Partidos del torneo regular (30 partidos)
const regularMatches = [
  // Round 1
  { round: 1, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '0-2', dateOffset: 1 },
  // Round 2
  { round: 2, local: 'Sporting Cristal', visita: 'Carlos A. Manucci', marcador: '1-0', dateOffset: 0 },
  // Round 3
  { round: 3, local: 'Sporting Cristal', visita: 'Union Minas', marcador: '1-1', dateOffset: 0 },
  // Round 4
  { round: 4, local: 'C.N.I.', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 0 },
  // Round 5
  { round: 5, local: 'Dep. Yurimaguas', visita: 'Sporting Cristal', marcador: '0-1', dateOffset: 1 },
  // Round 6
  { round: 6, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '1-1', dateOffset: 0 },
  // Round 7
  { round: 7, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 1 },
  // Round 8
  { round: 8, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '2-1', dateOffset: 0 },
  // Round 9
  { round: 9, local: 'Sporting Cristal', visita: 'U.T.C.', marcador: '2-2', dateOffset: 0 },
  // Round 10
  { round: 10, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '1-1', dateOffset: 0 },
  // Round 11
  { round: 11, local: 'Sporting Cristal', visita: 'FBC Melgar', marcador: '0-0', dateOffset: 0 },
  // Round 12
  { round: 12, local: 'Universitario', visita: 'Sporting Cristal', marcador: '0-2', dateOffset: 0 },
  // Round 13
  { round: 13, local: 'Sporting Cristal', visita: 'Leon de Huanuco', marcador: '0-0', dateOffset: 1 },
  // Round 14
  { round: 14, local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '1-2', dateOffset: 1 },
  // Round 15
  { round: 15, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '2-2', dateOffset: 0 },
  // Round 16
  { round: 16, local: 'Sporting Cristal', visita: 'Dep. San Agustin', marcador: '3-0', dateOffset: 0 },
  // Round 17
  { round: 17, local: 'Carlos A. Manucci', visita: 'Sporting Cristal', marcador: '0-3', dateOffset: 1 },
  // Round 18
  { round: 18, local: 'Union Minas', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 1 },
  // Round 19
  { round: 19, local: 'Sporting Cristal', visita: 'C.N.I.', marcador: '2-0', dateOffset: 0 },
  // Round 20
  { round: 20, local: 'Sporting Cristal', visita: 'Dep. Yurimaguas', marcador: '4-1', dateOffset: 0 },
  // Round 21
  { round: 21, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 1 },
  // Round 22
  { round: 22, local: 'Sporting Cristal', visita: 'Alianza Atletico', marcador: '3-0', dateOffset: 0 },
  // Round 23
  { round: 23, local: 'Defensor Lima', visita: 'Sporting Cristal', marcador: '1-1', dateOffset: 1 },
  // Round 24
  { round: 24, local: 'U.T.C.', visita: 'Sporting Cristal', marcador: '0-1', dateOffset: 1 },
  // Round 25
  { round: 25, local: 'Sport Boys', visita: 'Sporting Cristal', marcador: '1-2', dateOffset: 1 },
  // Round 26
  { round: 26, local: 'FBC Melgar', visita: 'Sporting Cristal', marcador: '6-0', dateOffset: 1 },
  // Round 27
  { round: 27, local: 'Sporting Cristal', visita: 'Universitario', marcador: '2-1', dateOffset: 0 },
  // Round 28
  { round: 28, local: 'Leon de Huanuco', visita: 'Sporting Cristal', marcador: '2-4', dateOffset: 1 },
  // Round 29
  { round: 29, local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '0-0', dateOffset: 0 },
  // Round 30
  { round: 30, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '1-1', dateOffset: 0 }
];

// Partidos de Liguilla
const liguillaMatches = [
  { round: 1, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '4-0', date: '1992-11-29' },
  { round: 2, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '2-2', date: '1992-12-02' },
  { round: 3, local: 'Sporting Cristal', visita: 'Ovacion Sipesa', marcador: '3-1', date: '1992-12-06' },
  { round: 4, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '2-2', date: '1992-12-09' },
  { round: 5, local: 'Sporting Cristal', visita: 'Melgar FBC', marcador: '1-0', date: '1992-12-13' }
];

// Función para generar fecha
function generateDate(round, dateOffset = 0) {
  const roundInfo = roundDates[round];
  if (!roundInfo) return null;
  
  let day = dateOffset === 0 ? roundInfo.day1 : (roundInfo.day2 || roundInfo.day1);
  // Si round 28 y dateOffset es 1, es Nov 1
  if (round === 28 && dateOffset === 1) {
    return `1992-11-01`;
  }
  
  return `1992-${String(roundInfo.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Procesar partidos regulares
const processedMatches = [];

regularMatches.forEach(match => {
  const fecha = generateDate(match.round, match.dateOffset);
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: fecha,
    Torneo: 'Descentralizado',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos de Liguilla
liguillaMatches.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Liguilla Pre-Libertadores',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Ordenar por fecha
processedMatches.sort((a, b) => {
  const dateA = new Date(a.Fecha);
  const dateB = new Date(b.Fecha);
  return dateA - dateB;
});

// Calcular estadísticas
const total = processedMatches.length;
const victorias = processedMatches.filter(m => m.Resultado === 'V').length;
const empates = processedMatches.filter(m => m.Resultado === 'E').length;
const derrotas = processedMatches.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1992\n');
console.log(`Total de partidos: ${total}`);
console.log(`Victorias: ${victorias}`);
console.log(`Empates: ${empates}`);
console.log(`Derrotas: ${derrotas}\n`);

// Guardar JSON
const outputPath = './matches-1992.json';
fs.writeFileSync(outputPath, JSON.stringify(processedMatches, null, 4), 'utf8');
console.log(`✅ Partidos guardados en ${outputPath}`);
console.log(`\nTotal de partidos en JSON: ${processedMatches.length}`);


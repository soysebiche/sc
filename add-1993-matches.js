// Script para agregar partidos de Sporting Cristal 1993 al archivo existente
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
    'Dep. San Agustin': 'Deportivo San Agustín',
    'C.N.I.': 'Colegio Nacional de Iquitos',
    'U.T.C.': 'Universidad Técnica de Cajamarca',
    'FBC Melgar': 'FBC Melgar',
    'Melgar F.B.C.': 'FBC Melgar',
    'Melgar FBC': 'FBC Melgar',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Lima': 'Alianza Lima',
    'Universitario': 'Universitario de Deportes',
    'Universitario de Deportes': 'Universitario de Deportes',
    'Sport Boys': 'Sport Boys',
    'Cienciano': 'Cienciano',
    'Leon de Huanuco': 'León de Huánuco',
    'León de Huánuco': 'León de Huánuco',
    'Union Minas': 'Unión Minas',
    'Unión Minas': 'Unión Minas',
    'Carlos A. Manucci': 'Carlos A. Mannucci',
    'Carlos A. Mannucci': 'Carlos A. Mannucci',
    'Defensor Lima': 'Defensor Lima',
    'Sporting Cristal': 'Sporting Cristal',
    'Deportivo Sipesa': 'Deportivo Sipesa',
    'Union Huaral': 'Unión Huaral',
    'Unión Huaral': 'Unión Huaral'
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

// Fechas aproximadas para 1993 (asumiendo estructura similar a 1992)
// Necesitamos estimar las fechas basándonos en la estructura del torneo
const roundDates1993 = {
  1: { month: 4, day1: 10, day2: 11 },
  2: { month: 4, day1: 17, day2: 18 },
  3: { month: 4, day1: 24, day2: 25 },
  4: { month: 5, day1: 1, day2: 2 },
  5: { month: 5, day1: 8, day2: 9 },
  6: { month: 5, day1: 15, day2: 16 },
  7: { month: 5, day1: 22, day2: 23 },
  8: { month: 5, day1: 29, day2: 30 },
  9: { month: 6, day1: 5, day2: 6 },
  10: { month: 6, day1: 12, day2: 13 },
  11: { month: 6, day1: 19, day2: 20 },
  12: { month: 6, day1: 26, day2: 27 },
  13: { month: 7, day1: 3, day2: 4 },
  14: { month: 7, day1: 10, day2: 11 },
  15: { month: 7, day1: 17, day2: 18 },
  16: { month: 7, day1: 24, day2: 25 },
  17: { month: 7, day1: 31, day2: null },
  18: { month: 8, day1: 7, day2: 8 },
  19: { month: 8, day1: 14, day2: 15 },
  20: { month: 8, day1: 21, day2: 22 },
  21: { month: 8, day1: 28, day2: 29 },
  22: { month: 9, day1: 4, day2: 5 },
  23: { month: 9, day1: 11, day2: 12 },
  24: { month: 9, day1: 18, day2: 19 },
  25: { month: 9, day1: 25, day2: 26 },
  26: { month: 10, day1: 2, day2: 3 },
  27: { month: 10, day1: 9, day2: 10 },
  28: { month: 10, day1: 16, day2: 17 },
  29: { month: 10, day1: 23, day2: 24 },
  30: { month: 10, day1: 30, day2: 31 }
};

// Función para generar fecha
function generateDate(round, dateOffset = 0, year = 1993) {
  const roundInfo = roundDates1993[round];
  if (!roundInfo) return null;
  
  let day = dateOffset === 0 ? roundInfo.day1 : (roundInfo.day2 || roundInfo.day1);
  
  return `${year}-${String(roundInfo.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Partidos del torneo regular 1993 (30 partidos)
const regularMatches1993 = [
  // Round 1
  { round: 1, local: 'FBC Melgar', visita: 'Sporting Cristal', marcador: '1-3', dateOffset: 1, note: 'awarded 2-0' },
  // Round 2
  { round: 2, local: 'Sporting Cristal', visita: 'Alianza Atletico', marcador: '3-0', dateOffset: 0 },
  // Round 3
  { round: 3, local: 'Defensor Lima', visita: 'Sporting Cristal', marcador: '1-2', dateOffset: 1 },
  // Round 4
  { round: 4, local: 'Sporting Cristal', visita: 'Universitario', marcador: '1-0', dateOffset: 0 },
  // Round 5
  { round: 5, local: 'Carlos A. Manucci', visita: 'Sporting Cristal', marcador: '1-0', dateOffset: 1 },
  // Round 6
  { round: 6, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '7-0', dateOffset: 0 },
  // Round 7
  { round: 7, local: 'Sport Boys', visita: 'Sporting Cristal', marcador: '2-0', dateOffset: 1 },
  // Round 8
  { round: 8, local: 'Sporting Cristal', visita: 'Dep. San Agustin', marcador: '3-0', dateOffset: 0 },
  // Round 9
  { round: 9, local: 'Union Minas', visita: 'Sporting Cristal', marcador: '1-1', dateOffset: 1 },
  // Round 10
  { round: 10, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '2-1', dateOffset: 0 },
  // Round 11
  { round: 11, local: 'U.T.C.', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 1 },
  // Round 12
  { round: 12, local: 'Sporting Cristal', visita: 'Leon de Huanuco', marcador: '4-1', dateOffset: 0 },
  // Round 13
  { round: 13, local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '0-3', dateOffset: 1 },
  // Round 14
  { round: 14, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '5-1', dateOffset: 0 },
  // Round 15
  { round: 15, local: 'Sporting Cristal', visita: 'Union Huaral', marcador: '1-0', dateOffset: 0 },
  // Round 16
  { round: 16, local: 'Sporting Cristal', visita: 'FBC Melgar', marcador: '6-2', dateOffset: 0 },
  // Round 17
  { round: 17, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '0-0', dateOffset: 1 },
  // Round 18
  { round: 18, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '1-2', dateOffset: 0 },
  // Round 19
  { round: 19, local: 'Universitario', visita: 'Sporting Cristal', marcador: '2-1', dateOffset: 1 },
  // Round 20
  { round: 20, local: 'Sporting Cristal', visita: 'Carlos A. Manucci', marcador: '5-3', dateOffset: 0 },
  // Round 21
  { round: 21, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '0-0', dateOffset: 1 },
  // Round 22
  { round: 22, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '1-1', dateOffset: 0 },
  // Round 23
  { round: 23, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '2-4', dateOffset: 1 },
  // Round 24
  { round: 24, local: 'Sporting Cristal', visita: 'Union Minas', marcador: '8-0', dateOffset: 0 },
  // Round 25
  { round: 25, local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '1-0', dateOffset: 1 },
  // Round 26
  { round: 26, local: 'Sporting Cristal', visita: 'U.T.C.', marcador: '3-0', dateOffset: 0 },
  // Round 27
  { round: 27, local: 'Leon de Huanuco', visita: 'Sporting Cristal', marcador: '1-2', dateOffset: 1 },
  // Round 28
  { round: 28, local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '1-1', dateOffset: 0 },
  // Round 29
  { round: 29, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '2-0', dateOffset: 1 },
  // Round 30
  { round: 30, local: 'Union Huaral', visita: 'Sporting Cristal', marcador: '4-2', dateOffset: 1 }
];

// Partidos de Playoffs Liguilla
const playoffMatches1993 = [
  { local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '0-1', date: '1993-11-06' },
  { local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '2-2', date: '1993-11-10' }
];

// Partidos de Liguilla Pre-Libertadores
const liguillaMatches1993 = [
  { round: 1, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '7-0', date: '1993-11-13' },
  { round: 2, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '1-2', date: '1993-11-16' },
  { round: 3, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '0-0', date: '1993-11-20' },
  { round: 4, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '1-1', date: '1993-11-23', note: 'Playoff, 5-4 penalties' }
];

// Partidos del Torneo Intermedio (Grupo 3)
const intermedioMatches1993 = [
  { round: 1, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '2-0', date: '1993-07-10', location: 'Sullana' },
  { round: 2, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '1-1', date: '1993-07-14', location: 'Lima' },
  { round: 3, local: 'Sporting Cristal', visita: 'U.T.C.', marcador: '7-4', date: '1993-07-18', location: 'Sullana' },
  { round: 4, local: 'Sporting Cristal', visita: 'Alianza Atletico', marcador: '0-0', date: '1993-07-25', location: 'Chiclayo' },
  { round: 5, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '2-1', date: '1993-07-29', location: 'Chiclayo' },
  { round: 6, local: 'Sporting Cristal', visita: 'U.T.C.', marcador: '10-1', date: '1993-08-02', location: 'Chiclayo' }
];

// Partidos de Cuartos de Final del Torneo Intermedio
const intermedioCuartos1993 = [
  { local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '3-0', date: '1993-08-08', leg: 'Ida' },
  { local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '2-2', date: '1993-08-15', leg: 'Vuelta' }
];

// Procesar partidos regulares
const processedMatches = [];

regularMatches1993.forEach(match => {
  const fecha = generateDate(match.round, match.dateOffset, 1993);
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

// Procesar partidos de Playoffs
playoffMatches1993.forEach((match, index) => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Liguilla Playoffs',
    'Número de Fecha': String(index + 1),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos de Liguilla
liguillaMatches1993.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  const torneo = match.note ? 'Liguilla Pre-Libertadores (Playoff)' : 'Liguilla Pre-Libertadores';
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: torneo,
    'Número de Fecha': String(match.round || '1'),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos del Torneo Intermedio
intermedioMatches1993.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Intermedio',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos de Cuartos de Final del Torneo Intermedio
intermedioCuartos1993.forEach((match, index) => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Intermedio - Cuartos de Final',
    'Número de Fecha': match.leg,
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

// Leer archivo existente
const existingFile = './matches-1992.json';
let existingMatches = [];
if (fs.existsSync(existingFile)) {
  existingMatches = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
  
  // Filtrar partidos de 1993 que ya existen para evitar duplicados
  // Solo agregar los nuevos partidos de cuartos de final
  const existing1993Count = existingMatches.filter(m => m.Año === 1993).length;
  console.log(`Partidos de 1993 existentes: ${existing1993Count}`);
  
  // Si ya hay partidos de 1993, solo agregar los de cuartos de final
  if (existing1993Count > 0) {
    // Filtrar solo los partidos de cuartos de final del intermedio
    const cuartosMatches = processedMatches.filter(m => 
      m.Año === 1993 && m.Torneo === 'Torneo Intermedio - Cuartos de Final'
    );
    
    // Verificar si ya existen
    const cuartosExistentes = existingMatches.filter(m => 
      m.Año === 1993 && m.Torneo === 'Torneo Intermedio - Cuartos de Final'
    );
    
    if (cuartosExistentes.length === 0) {
      console.log(`Agregando ${cuartosMatches.length} partidos de cuartos de final...`);
      existingMatches = [...existingMatches, ...cuartosMatches];
    } else {
      console.log('Los partidos de cuartos de final ya existen.');
      processedMatches = cuartosMatches.filter(c => {
        return !cuartosExistentes.some(e => 
          e.Fecha === c.Fecha && 
          e['Equipo Local'] === c['Equipo Local'] &&
          e['Equipo Visita'] === c['Equipo Visita']
        );
      });
      if (processedMatches.length > 0) {
        existingMatches = [...existingMatches, ...processedMatches];
      }
    }
  } else {
    // Si no hay partidos de 1993, agregar todos
    existingMatches = [...existingMatches, ...processedMatches];
  }
} else {
  // Si no existe el archivo, usar todos los partidos procesados
  existingMatches = processedMatches;
}

// Combinar partidos (ya combinados arriba)
const allMatches = existingMatches;

// Ordenar todos por fecha
allMatches.sort((a, b) => {
  const dateA = new Date(a.Fecha);
  const dateB = new Date(b.Fecha);
  if (dateA - dateB !== 0) return dateA - dateB;
  // Si misma fecha, ordenar por año
  return a.Año - b.Año;
});

// Calcular estadísticas de 1993
const matches1993 = processedMatches.filter(m => m.Año === 1993);
const total1993 = matches1993.length;
const victorias1993 = matches1993.filter(m => m.Resultado === 'V').length;
const empates1993 = matches1993.filter(m => m.Resultado === 'E').length;
const derrotas1993 = matches1993.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1993\n');
console.log(`Total de partidos: ${total1993}`);
console.log(`Victorias: ${victorias1993}`);
console.log(`Empates: ${empates1993}`);
console.log(`Derrotas: ${derrotas1993}\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993)\n`);
console.log(`Total de partidos: ${allMatches.length}`);
const totalVictorias = allMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = allMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = allMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

// Guardar JSON actualizado
const outputPath = './matches-1992.json';
fs.writeFileSync(outputPath, JSON.stringify(allMatches, null, 4), 'utf8');
console.log(`✅ Partidos actualizados en ${outputPath}`);
console.log(`\nTotal de partidos en JSON: ${allMatches.length}`);


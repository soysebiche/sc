// Script para agregar partidos de Sporting Cristal 1994
const fs = require('fs');

// Días de la semana
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Normalizar nombres de equipos
function normalizeTeamName(name) {
  const map = {
    'Defensor Lima': 'Defensor Lima',
    'Cienciano': 'Cienciano',
    'Aurich-Cañaña': 'Juan Aurich/Cañaña',
    'Juan Aurich/Cañaña': 'Juan Aurich/Cañaña',
    'Dep. San Agustin': 'Deportivo San Agustín',
    'Deportivo San Agustín': 'Deportivo San Agustín',
    'Deportivo Sipesa': 'Deportivo Sipesa',
    'Sipesa': 'Deportivo Sipesa',
    'Alianza Lima': 'Alianza Lima',
    'Leon de Huanuco': 'León de Huánuco',
    'León de Huanuco': 'León de Huánuco',
    'León de Huánuco': 'León de Huánuco',
    'Sporting Cristal': 'Sporting Cristal',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Atlético': 'Alianza Atlético',
    'FBC Melgar': 'FBC Melgar',
    'Melgar F.B.C.': 'FBC Melgar',
    'Ciclista Lima': 'Ciclista Lima',
    'Carlos A. Manucci': 'Carlos A. Mannucci',
    'Carlos A. Mannucci': 'Carlos A. Mannucci',
    'Carlos Manucci': 'Carlos A. Mannucci',
    'Dep. Municipal': 'Deportivo Municipal',
    'Deportivo Municipal': 'Deportivo Municipal',
    'Municipal': 'Deportivo Municipal',
    'Sport Boys': 'Sport Boys',
    'Universitario': 'Universitario',
    'Union Minas': 'Unión Minas',
    'Unión Minas': 'Unión Minas'
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

// Partidos del Torneo Apertura (Grupo A)
const aperturaMatches1994 = [
  { round: 1, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '3-0', date: '1994-02-20' },
  { round: 2, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '4-0', date: '1994-02-23' },
  { round: 3, local: 'Aurich-Cañaña', visita: 'Sporting Cristal', marcador: '1-5', date: '1994-02-27' },
  { round: 4, local: 'Leon de Huanuco', visita: 'Sporting Cristal', marcador: '2-1', date: '1994-03-06' },
  { round: 5, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '0-4', date: '1994-03-13' },
  { round: 6, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '2-1', date: '1994-03-20' },
  { round: 7, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '5-0', date: '1994-03-27' }
];

// Final del Torneo Apertura
const finalApertura1994 = [
  { local: 'Sporting Cristal', visita: 'Ciclista Lima', marcador: '4-1', date: '1994-03-30' }
];

// Partidos del Campeonato Descentralizado 1994 (30 partidos)
const regularMatches1994 = [
  // Round 1
  { round: 1, local: 'FBC Melgar', visita: 'Sporting Cristal', marcador: '1-0', date: '1994-04-03' },
  // Round 2 (jugado después del round 6)
  { round: 2, local: 'Sporting Cristal', visita: 'Aurich - Cañaña', marcador: '2-1', date: '1994-05-08' },
  // Round 3
  { round: 3, local: 'Sporting Cristal', visita: 'Alianza Atlético', marcador: '4-0', date: '1994-04-10' },
  // Round 4
  { round: 4, local: 'Sport Boys', visita: 'Sporting Cristal', marcador: '0-3', date: '1994-04-17' },
  // Round 5
  { round: 5, local: 'Sporting Cristal', visita: 'Universitario', marcador: '2-0', date: '1994-04-24' },
  // Round 6
  { round: 6, local: 'Carlos A. Manucci', visita: 'Sporting Cristal', marcador: '0-4', date: '1994-05-01' },
  // Round 7
  { round: 7, local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '0-4', date: '1994-05-15' },
  // Round 8
  { round: 8, local: 'Sporting Cristal', visita: 'Dep. San Agustin', marcador: '4-0', date: '1994-05-22' },
  // Round 9
  { round: 9, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '0-1', date: '1994-05-29' },
  // Round 10
  { round: 10, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '3-2', date: '1994-06-05' },
  // Round 11
  { round: 11, local: 'Union Minas', visita: 'Sporting Cristal', marcador: '1-0', date: '1994-06-12' },
  // Round 12
  { round: 12, local: 'Sporting Cristal', visita: 'Leon de Huanuco', marcador: '4-0', date: '1994-07-24' },
  // Round 13
  { round: 13, local: 'Defensor Lima', visita: 'Sporting Cristal', marcador: '1-11', date: '1994-07-31' },
  // Round 14
  { round: 14, local: 'Sporting Cristal', visita: 'Ciclista Lima', marcador: '3-1', date: '1994-08-07' },
  // Round 15
  { round: 15, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '1-0', date: '1994-08-14' },
  // Round 16
  { round: 16, local: 'Sporting Cristal', visita: 'FBC Melgar', marcador: '5-0', date: '1994-08-21' },
  // Round 17
  { round: 17, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '3-4', date: '1994-08-28' },
  // Round 18
  { round: 18, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '5-0', date: '1994-09-04' },
  // Round 19
  { round: 19, local: 'Universitario', visita: 'Sporting Cristal', marcador: '0-1', date: '1994-09-11' },
  // Round 20
  { round: 20, local: 'Sporting Cristal', visita: 'Carlos A. Manucci', marcador: '5-0', date: '1994-09-18' },
  // Round 21
  { round: 21, local: 'Aurich - Cañaña', visita: 'Sporting Cristal', marcador: '0-0', date: '1994-09-25' },
  // Round 22
  { round: 22, local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '3-2', date: '1994-10-02' },
  // Round 23
  { round: 23, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '0-4', date: '1994-10-09' },
  // Round 24
  { round: 24, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '6-1', date: '1994-10-16' },
  // Round 25
  { round: 25, local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '0-0', date: '1994-10-23' },
  // Round 26
  { round: 26, local: 'Sporting Cristal', visita: 'Union Minas', marcador: '1-1', date: '1994-10-30' },
  // Round 27
  { round: 27, local: 'Leon de Huanuco', visita: 'Sporting Cristal', marcador: '4-0', date: '1994-11-06' },
  // Round 28
  { round: 28, local: 'Sporting Cristal', visita: 'Defensor Lima', marcador: '4-1', date: '1994-11-13' },
  // Round 29
  { round: 29, local: 'Ciclista Lima', visita: 'Sporting Cristal', marcador: '0-1', date: '1994-11-20' },
  // Round 30
  { round: 30, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '0-1', date: '1994-11-27' }
];

// Procesar partidos
const processedMatches = [];

// Procesar partidos del Apertura
aperturaMatches1994.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Apertura',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar final del Apertura
finalApertura1994.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Apertura - Final',
    'Número de Fecha': 'Final',
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos regulares
regularMatches1994.forEach(match => {
  const fecha = match.date;
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
  
  // Verificar si ya existen partidos de 1994
  const existing1994Count = existingMatches.filter(m => m.Año === 1994).length;
  
  if (existing1994Count > 0) {
    console.log(`⚠️  Ya existen ${existing1994Count} partidos de 1994.`);
    console.log('Verificando si faltan algunos...\n');
    
    // Verificar cada partido nuevo
    const nuevosPartidos = processedMatches.filter(nuevo => {
      return !existingMatches.some(existente => 
        existente.Año === nuevo.Año &&
        existente.Fecha === nuevo.Fecha &&
        existente['Equipo Local'] === nuevo['Equipo Local'] &&
        existente['Equipo Visita'] === nuevo['Equipo Visita']
      );
    });
    
    if (nuevosPartidos.length > 0) {
      console.log(`Agregando ${nuevosPartidos.length} partidos faltantes...`);
      existingMatches = [...existingMatches, ...nuevosPartidos];
    } else {
      console.log('✅ Todos los partidos de 1994 ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de 1994...`);
    existingMatches = [...existingMatches, ...processedMatches];
  }
} else {
  console.log('❌ No se encontró el archivo matches-1992.json');
  process.exit(1);
}

// Ordenar todos por fecha
existingMatches.sort((a, b) => {
  const dateA = new Date(a.Fecha);
  const dateB = new Date(b.Fecha);
  if (dateA - dateB !== 0) return dateA - dateB;
  return a.Año - b.Año;
});

// Guardar JSON actualizado
fs.writeFileSync(existingFile, JSON.stringify(existingMatches, null, 4), 'utf8');

// Calcular estadísticas
const matches1994 = existingMatches.filter(m => m.Año === 1994);
const total1994 = matches1994.length;
const victorias1994 = matches1994.filter(m => m.Resultado === 'V').length;
const empates1994 = matches1994.filter(m => m.Resultado === 'E').length;
const derrotas1994 = matches1994.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1994\n');
console.log(`Total de partidos: ${total1994}`);
console.log(`Victorias: ${victorias1994}`);
console.log(`Empates: ${empates1994}`);
console.log(`Derrotas: ${derrotas1994}\n`);

const apertura1994 = matches1994.filter(m => m.Torneo.includes('Apertura'));
const descentralizado1994 = matches1994.filter(m => m.Torneo === 'Descentralizado');
console.log(`Torneo Apertura: ${apertura1994.length} partidos`);
console.log(`Descentralizado: ${descentralizado1994.length} partidos\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993 + 1994)\n`);
console.log(`Total de partidos: ${existingMatches.length}`);
const totalVictorias = existingMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = existingMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = existingMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

console.log(`✅ Archivo actualizado: ${existingFile}`);


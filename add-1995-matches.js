// Script para agregar partidos de Sporting Cristal 1995
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
    'Juan Aurich': 'Juan Aurich/Cañaña',
    'Dep. San Agustin': 'Deportivo San Agustín',
    'Deportivo San Agustín': 'Deportivo San Agustín',
    'Dep. San Agustín': 'Deportivo San Agustín',
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
    'Melgar FBC': 'FBC Melgar',
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
    'Unión Minas': 'Unión Minas',
    'Atletico Torino': 'Atlético Torino',
    'Atlético Torino': 'Atlético Torino',
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

// Partidos del Campeonato Descentralizado 1995 (30 partidos)
const regularMatches1995 = [
  // Round 1
  { round: 1, local: 'Universitario', visita: 'Sporting Cristal', marcador: '2-1', date: '1995-03-04' },
  // Round 2
  { round: 2, local: 'Sporting Cristal', visita: 'Union Huaral', marcador: '3-3', date: '1995-03-11' },
  // Round 3
  { round: 3, local: 'Aurich-Cañaña', visita: 'Sporting Cristal', marcador: '0-1', date: '1995-03-18' },
  // Round 4
  { round: 4, local: 'Sporting Cristal', visita: 'Union Minas', marcador: '5-1', date: '1995-03-25' },
  // Round 5
  { round: 5, local: 'Ciclista Lima', visita: 'Sporting Cristal', marcador: '1-0', date: '1995-04-01' },
  // Round 6
  { round: 6, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '2-1', date: '1995-04-11' },
  // Round 7
  { round: 7, local: 'Atletico Torino', visita: 'Sporting Cristal', marcador: '0-2', date: '1995-04-15' },
  // Round 8
  { round: 8, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '3-2', date: '1995-04-22' },
  // Round 9
  { round: 9, local: 'FBC Melgar', visita: 'Sporting Cristal', marcador: '2-1', date: '1995-04-29' },
  // Round 10
  { round: 10, local: 'Sporting Cristal', visita: 'Alianza Atletico', marcador: '4-1', date: '1995-05-06' },
  // Round 11
  { round: 11, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '4-4', date: '1995-05-12' },
  // Round 12
  { round: 12, local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '0-2', date: '1995-05-17' },
  // Round 13
  { round: 13, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '0-3', date: '1995-05-20' },
  // Round 14
  { round: 14, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '4-0', date: '1995-05-27' },
  // Round 15
  { round: 15, local: 'Sporting Cristal', visita: 'Leon de Huanuco', marcador: '3-0', date: '1995-06-03' },
  // Round 16
  { round: 16, local: 'Sporting Cristal', visita: 'Universitario', marcador: '0-0', date: '1995-07-29' },
  // Round 17
  { round: 17, local: 'Union Huaral', visita: 'Sporting Cristal', marcador: '0-1', date: '1995-08-06' },
  // Round 18
  { round: 18, local: 'Aurich-Cañaña', visita: 'Sporting Cristal', marcador: '2-6', date: '1995-08-12' },
  // Round 19
  { round: 19, local: 'Union Minas', visita: 'Sporting Cristal', marcador: '0-0', date: '1995-08-19' },
  // Round 20
  { round: 20, local: 'Sporting Cristal', visita: 'Ciclista Lima', marcador: '3-2', date: '1995-08-26' },
  // Round 21
  { round: 21, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '1-0', date: '1995-08-30' },
  // Round 22
  { round: 22, local: 'Sporting Cristal', visita: 'Atletico Torino', marcador: '3-0', date: '1995-09-02' },
  // Round 23
  { round: 23, local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '2-2', date: '1995-09-09' },
  // Round 24
  { round: 24, local: 'Sporting Cristal', visita: 'FBC Melgar', marcador: '4-0', date: '1995-09-13' },
  // Round 25
  { round: 25, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '2-1', date: '1995-09-16' },
  // Round 26
  { round: 26, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '6-0', date: '1995-09-23' },
  // Round 27
  { round: 27, local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '3-1', date: '1995-09-27' },
  // Round 28
  { round: 28, local: 'Sporting Cristal', visita: 'Dep. San Agustin', marcador: '3-0', date: '1995-09-30' },
  // Round 29
  { round: 29, local: 'Sport Boys', visita: 'Sporting Cristal', marcador: '0-2', date: '1995-10-08' },
  // Round 30
  { round: 30, local: 'Leon de Huanuco', visita: 'Sporting Cristal', marcador: '1-3', date: '1995-10-15' }
];

// Partidos de Liguilla Final (14 partidos adicionales, rounds 31-44)
const liguillaMatches1995 = [
  { round: 31, local: 'Sporting Cristal', visita: 'Dep. San Agustin', marcador: '4-0', date: '1995-10-22' },
  { round: 32, local: 'FBC Melgar', visita: 'Sporting Cristal', marcador: '0-1', date: '1995-10-29' },
  { round: 33, local: 'Sporting Cristal', visita: 'Dep. Municipal', marcador: '1-0', date: '1995-11-01' },
  { round: 34, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '1-1', date: '1995-11-04' },
  { round: 35, local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '3-2', date: '1995-11-09' },
  { round: 36, local: 'Universitario', visita: 'Sporting Cristal', marcador: '2-0', date: '1995-11-18' },
  { round: 37, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '0-0', date: '1995-11-22' },
  { round: 38, local: 'Dep. San Agustin', visita: 'Sporting Cristal', marcador: '1-4', date: '1995-11-25' },
  { round: 39, local: 'Sporting Cristal', visita: 'FBC Melgar', marcador: '2-0', date: '1995-12-03' },
  { round: 40, local: 'Dep. Municipal', visita: 'Sporting Cristal', marcador: '0-1', date: '1995-12-06' },
  { round: 41, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '2-2', date: '1995-12-10' },
  { round: 42, local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '0-0', date: '1995-12-13' },
  { round: 43, local: 'Sporting Cristal', visita: 'Universitario', marcador: '0-1', date: '1995-12-16' },
  { round: 44, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '3-0', date: '1995-12-20' }
];

// Procesar partidos
const processedMatches = [];

// Procesar partidos regulares
regularMatches1995.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Descentralizado',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos de Liguilla Final
liguillaMatches1995.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Liguilla Final',
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
  
  // Verificar si ya existen partidos de 1995
  const existing1995Count = existingMatches.filter(m => m.Año === 1995).length;
  
  if (existing1995Count > 0) {
    console.log(`⚠️  Ya existen ${existing1995Count} partidos de 1995.`);
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
      console.log('✅ Todos los partidos de 1995 ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de 1995...`);
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
const matches1995 = existingMatches.filter(m => m.Año === 1995);
const total1995 = matches1995.length;
const victorias1995 = matches1995.filter(m => m.Resultado === 'V').length;
const empates1995 = matches1995.filter(m => m.Resultado === 'E').length;
const derrotas1995 = matches1995.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1995\n');
console.log(`Total de partidos: ${total1995}`);
console.log(`Victorias: ${victorias1995}`);
console.log(`Empates: ${empates1995}`);
console.log(`Derrotas: ${derrotas1995}\n`);

const descentralizado1995 = matches1995.filter(m => m.Torneo === 'Descentralizado');
const liguilla1995 = matches1995.filter(m => m.Torneo === 'Liguilla Final');
console.log(`Descentralizado: ${descentralizado1995.length} partidos`);
console.log(`Liguilla Final: ${liguilla1995.length} partidos\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993 + 1994 + 1995)\n`);
console.log(`Total de partidos: ${existingMatches.length}`);
const totalVictorias = existingMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = existingMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = existingMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

console.log(`✅ Archivo actualizado: ${existingFile}`);


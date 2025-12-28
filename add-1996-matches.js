// Script para agregar partidos de Sporting Cristal 1996
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
    'Aurich': 'Juan Aurich/Cañaña',
    'Juan Aurich': 'Juan Aurich/Cañaña',
    'Dep. San Agustin': 'Deportivo San Agustín',
    'Deportivo San Agustín': 'Deportivo San Agustín',
    'Dep. San Agustín': 'Deportivo San Agustín',
    'San Agustin': 'Deportivo San Agustín',
    'San Agustín': 'Deportivo San Agustín',
    'Deportivo Sipesa': 'Deportivo Sipesa',
    'Sipesa': 'Deportivo Sipesa',
    'Deportivo Pesquero': 'Deportivo Pesquero',
    'Pesquero': 'Deportivo Pesquero',
    'Alianza Lima': 'Alianza Lima',
    'Alianza': 'Alianza Lima',
    'Leon de Huanuco': 'León de Huánuco',
    'León de Huanuco': 'León de Huánuco',
    'León de Huánuco': 'León de Huánuco',
    'Sporting Cristal': 'Sporting Cristal',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Atlético': 'Alianza Atlético',
    'Alianza Atlético Sullana': 'Alianza Atlético',
    'FBC Melgar': 'FBC Melgar',
    'Melgar FBC': 'FBC Melgar',
    'Melgar': 'FBC Melgar',
    'Ciclista Lima': 'Ciclista Lima',
    'Ciclista': 'Ciclista Lima',
    'Carlos A. Manucci': 'Carlos A. Mannucci',
    'Carlos A. Mannucci': 'Carlos A. Mannucci',
    'Carlos Manucci': 'Carlos A. Mannucci',
    'Dep. Municipal': 'Deportivo Municipal',
    'Deportivo Municipal': 'Deportivo Municipal',
    'Municipal': 'Deportivo Municipal',
    'Municipal Lima': 'Deportivo Municipal',
    'Sport Boys': 'Sport Boys',
    'Universitario': 'Universitario',
    'Universitario Lima': 'Universitario',
    'Union Minas': 'Unión Minas',
    'Unión Minas': 'Unión Minas',
    'Atletico Torino': 'Atlético Torino',
    'Atlético Torino': 'Atlético Torino',
    'Torino': 'Atlético Torino',
    'Union Huaral': 'Unión Huaral',
    'Unión Huaral': 'Unión Huaral',
    'La Loretana': 'La Loretana',
    'Loretana': 'La Loretana',
    'Guardia Republicana': 'Guardia Republicana',
    'Republicana': 'Guardia Republicana'
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

// Partidos del Campeonato Descentralizado 1996 (30 partidos)
// Fechas aproximadas basadas en la estructura del torneo
const regularMatches1996 = [
  // Round 1
  { round: 1, local: 'Union Minas', visita: 'Sporting Cristal', marcador: '0-1', date: '1996-03-02' },
  // Round 2
  { round: 2, local: 'Sporting Cristal', visita: 'Cienciano', marcador: '6-0', date: '1996-03-09' },
  // Round 3
  { round: 3, local: 'Sport Boys', visita: 'Sporting Cristal', marcador: '3-1', date: '1996-03-16' },
  // Round 4
  { round: 4, local: 'Sporting Cristal', visita: 'Ciclista', marcador: '6-2', date: '1996-03-23' },
  // Round 5
  { round: 5, local: 'Pesquero', visita: 'Sporting Cristal', marcador: '3-0', date: '1996-03-30' },
  // Round 6
  { round: 6, local: 'Sporting Cristal', visita: 'Aurich', marcador: '2-0', date: '1996-04-06' },
  // Round 7
  { round: 7, local: 'Republicana', visita: 'Sporting Cristal', marcador: '0-2', date: '1996-04-13' },
  // Round 8
  { round: 8, local: 'Sporting Cristal', visita: 'San Agustin', marcador: '3-1', date: '1996-04-20' },
  // Round 9
  { round: 9, local: 'Torino', visita: 'Sporting Cristal', marcador: '0-2', date: '1996-04-27' },
  // Round 10
  { round: 10, local: 'Sporting Cristal', visita: 'La Loretana', marcador: '2-0', date: '1996-05-04' },
  // Round 11
  { round: 11, local: 'Alianza Atletico', visita: 'Sporting Cristal', marcador: '1-2', date: '1996-05-11' },
  // Round 12
  { round: 12, local: 'Sporting Cristal', visita: 'Melgar', marcador: '3-0', date: '1996-05-18' },
  // Round 13
  { round: 13, local: 'Municipal', visita: 'Sporting Cristal', marcador: '0-2', date: '1996-05-25' },
  // Round 14
  { round: 14, local: 'Sporting Cristal', visita: 'Universitario', marcador: '1-2', date: '1996-06-01' },
  // Round 15
  { round: 15, local: 'Alianza Lima', visita: 'Sporting Cristal', marcador: '0-0', date: '1996-06-08' },
  // Round 16
  { round: 16, local: 'Sporting Cristal', visita: 'Union Minas', marcador: '7-1', date: '1996-06-15' },
  // Round 17
  { round: 17, local: 'Cienciano', visita: 'Sporting Cristal', marcador: '3-1', date: '1996-06-22' },
  // Round 18
  { round: 18, local: 'Sporting Cristal', visita: 'Sport Boys', marcador: '0-0', date: '1996-06-29' },
  // Round 19
  { round: 19, local: 'Ciclista', visita: 'Sporting Cristal', marcador: '2-4', date: '1996-07-06' },
  // Round 20
  { round: 20, local: 'Sporting Cristal', visita: 'Pesquero', marcador: '3-1', date: '1996-07-13' },
  // Round 21
  { round: 21, local: 'Sporting Cristal', visita: 'Aurich', marcador: '1-2', date: '1996-07-20' },
  // Round 22
  { round: 22, local: 'Sporting Cristal', visita: 'Republicana', marcador: '1-0', date: '1996-07-27' },
  // Round 23
  { round: 23, local: 'San Agustin', visita: 'Sporting Cristal', marcador: '0-3', date: '1996-08-03' },
  // Round 24
  { round: 24, local: 'Sporting Cristal', visita: 'Torino', marcador: '2-0', date: '1996-08-10' },
  // Round 25
  { round: 25, local: 'Sporting Cristal', visita: 'Loretana', marcador: '2-0', date: '1996-08-17' },
  // Round 26
  { round: 26, local: 'Sporting Cristal', visita: 'Alianza Atletico', marcador: '4-1', date: '1996-08-24' },
  // Round 27
  { round: 27, local: 'Melgar', visita: 'Sporting Cristal', marcador: '1-1', date: '1996-08-31' },
  // Round 28
  { round: 28, local: 'Sporting Cristal', visita: 'Municipal', marcador: '5-2', date: '1996-09-07' },
  // Round 29
  { round: 29, local: 'Universitario', visita: 'Sporting Cristal', marcador: 'Awd', date: '1996-09-14', note: 'Awarded 0-2, finished 1-1' },
  // Round 30
  { round: 30, local: 'Sporting Cristal', visita: 'Alianza Lima', marcador: '2-1', date: '1996-09-21' }
];

// Procesar partidos
const processedMatches = [];

// Procesar partidos regulares
regularMatches1996.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  // Manejar el caso especial del round 29 (awarded)
  let marcador = match.marcador;
  if (marcador === 'Awd') {
    marcador = '0-2'; // Resultado otorgado
  }
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Descentralizado',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: marcador,
    'Goles (Solo SC)': match.note ? match.note : '-'
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
  
  // Verificar si ya existen partidos de 1996
  const existing1996Count = existingMatches.filter(m => m.Año === 1996).length;
  
  if (existing1996Count > 0) {
    console.log(`⚠️  Ya existen ${existing1996Count} partidos de 1996.`);
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
      console.log('✅ Todos los partidos de 1996 ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de 1996...`);
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
const matches1996 = existingMatches.filter(m => m.Año === 1996);
const total1996 = matches1996.length;
const victorias1996 = matches1996.filter(m => m.Resultado === 'V').length;
const empates1996 = matches1996.filter(m => m.Resultado === 'E').length;
const derrotas1996 = matches1996.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1996\n');
console.log(`Total de partidos: ${total1996}`);
console.log(`Victorias: ${victorias1996}`);
console.log(`Empates: ${empates1996}`);
console.log(`Derrotas: ${derrotas1996}\n`);

const descentralizado1996 = matches1996.filter(m => m.Torneo === 'Descentralizado');
console.log(`Descentralizado: ${descentralizado1996.length} partidos\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993 + 1994 + 1995 + 1996)\n`);
console.log(`Total de partidos: ${existingMatches.length}`);
const totalVictorias = existingMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = existingMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = existingMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

console.log(`✅ Archivo actualizado: ${existingFile}`);


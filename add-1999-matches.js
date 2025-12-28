// Script para agregar partidos de Sporting Cristal 1999
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
    'Juan Aurich': 'Juan Aurich',
    'Aurich': 'Juan Aurich',
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
    'Cristal': 'Sporting Cristal',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Atlético': 'Alianza Atlético',
    'Alianza Atlético Sullana': 'Alianza Atlético',
    'Alianza Atl': 'Alianza Atlético',
    'A. Atlético': 'Alianza Atlético',
    'Alanza Atlético': 'Alianza Atlético',
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
    'Minas': 'Unión Minas',
    'Atletico Torino': 'Atlético Torino',
    'Atlético Torino': 'Atlético Torino',
    'Torino': 'Atlético Torino',
    'Union Huaral': 'Unión Huaral',
    'Unión Huaral': 'Unión Huaral',
    'La Loretana': 'La Loretana',
    'Loretana': 'La Loretana',
    'Guardia Republicana': 'Guardia Republicana',
    'Republicana': 'Guardia Republicana',
    'Alcides Vigo Hurtado': 'Alcides Vigo Hurtado',
    'Alcides': 'Alcides Vigo Hurtado',
    'Jose Galvez': 'José Gálvez',
    'José Gálvez': 'José Gálvez',
    'Jose Galvez': 'José Gálvez',
    'Galvez': 'José Gálvez',
    'Lawn Tennis': 'Lawn Tennis',
    'IMI F.C.': 'IMI F.C.'
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

// Partidos del Torneo Apertura 1999 (22 partidos)
const aperturaMatches1999 = [
  { round: 1, local: 'Juan Aurich', visita: 'Cristal', marcador: '1-2', date: '1999-02-07' },
  { round: 2, local: 'Cristal', visita: 'Cienciano', marcador: '1-1', date: '1999-02-14' },
  { round: 3, local: 'Universitario', visita: 'Cristal', marcador: '0-2', date: '1999-02-20' },
  { round: 4, local: 'Cristal', visita: 'Municipal', marcador: '2-0', date: '1999-02-27' },
  { round: 5, local: 'Cristal', visita: 'Alianza', marcador: '2-2', date: '1999-03-06' },
  { round: 6, local: 'Cristal', visita: 'Alianza Atl', marcador: '4-1', date: '1999-03-13' },
  { round: 7, local: 'Cristal', visita: 'IMI F.C.', marcador: '6-1', date: '1999-03-20' },
  { round: 8, local: 'Pesquero', visita: 'Cristal', marcador: '1-1', date: '1999-03-28' },
  { round: 9, local: 'Cristal', visita: 'Minas', marcador: '4-1', date: '1999-03-31' },
  { round: 10, local: 'Cristal', visita: 'Sport Boys', marcador: '1-1', date: '1999-04-03' },
  { round: 11, local: 'Melgar', visita: 'Cristal', marcador: '1-3', date: '1999-04-12' },
  { round: 12, local: 'Cristal', visita: 'Juan Aurich', marcador: '3-0', date: '1999-04-18' },
  { round: 13, local: 'Cienciano', visita: 'Cristal', marcador: '2-0', date: '1999-04-25' },
  { round: 14, local: 'Cristal', visita: 'Universitario', marcador: '1-1', date: '1999-04-29' },
  { round: 15, local: 'Municipal', visita: 'Cristal', marcador: '1-4', date: '1999-05-02' },
  { round: 16, local: 'Alianza', visita: 'Cristal', marcador: '3-2', date: '1999-05-08' },
  { round: 17, local: 'Alianza Atl', visita: 'Cristal', marcador: '0-0', date: '1999-05-16' },
  { round: 18, local: 'IMI F.C.', visita: 'Cristal', marcador: '1-1', date: '1999-05-23' },
  { round: 19, local: 'Cristal', visita: 'Pesquero', marcador: '5-0', date: '1999-05-29' },
  { round: 20, local: 'Minas', visita: 'Cristal', marcador: '1-0', date: '1999-06-05' },
  { round: 21, local: 'Sport Boys', visita: 'Cristal', marcador: '3-3', date: '1999-06-13' },
  { round: 22, local: 'Cristal', visita: 'Melgar', marcador: '3-1', date: '1999-06-16' }
];

// Partidos del Torneo Clausura 1999 (22 partidos)
const clausuraMatches1999 = [
  { round: 1, local: 'Juan Aurich', visita: 'Cristal', marcador: '1-1', date: '1999-07-25' },
  { round: 2, local: 'Cristal', visita: 'Cienciano', marcador: '1-3', date: '1999-08-01' },
  { round: 3, local: 'Universitario', visita: 'Cristal', marcador: '2-1', date: '1999-08-08' },
  { round: 4, local: 'Cristal', visita: 'Municipal', marcador: '6-0', date: '1999-08-14' },
  { round: 5, local: 'Alianza', visita: 'Cristal', marcador: '2-1', date: '1999-08-21' },
  { round: 6, local: 'Cristal', visita: 'Alianza Atl', marcador: '3-2', date: '1999-08-28' },
  { round: 7, local: 'Cristal', visita: 'IMI F.C.', marcador: '4-0', date: '1999-09-04' },
  { round: 8, local: 'Pesquero', visita: 'Cristal', marcador: '1-1', date: '1999-09-12' },
  { round: 9, local: 'Cristal', visita: 'Minas', marcador: '5-1', date: '1999-09-15' },
  { round: 10, local: 'Cristal', visita: 'Sport Boys', marcador: '2-1', date: '1999-09-19' },
  { round: 11, local: 'Melgar', visita: 'Cristal', marcador: '1-1', date: '1999-09-26' },
  { round: 12, local: 'Cristal', visita: 'Juan Aurich', marcador: '2-1', date: '1999-10-02' },
  { round: 13, local: 'Cienciano', visita: 'Cristal', marcador: '2-0', date: '1999-10-10', note: 'Awarded 0-2, Cienciano fielded 4 foreigners' },
  { round: 14, local: 'Cristal', visita: 'Universitario', marcador: '2-2', date: '1999-10-17' },
  { round: 15, local: 'Municipal', visita: 'Cristal', marcador: '1-3', date: '1999-10-23' },
  { round: 16, local: 'Cristal', visita: 'Alianza', marcador: '2-2', date: '1999-10-31' },
  { round: 17, local: 'Alianza Atl', visita: 'Cristal', marcador: '1-3', date: '1999-11-07' },
  { round: 18, local: 'IMI F.C.', visita: 'Cristal', marcador: '0-2', date: '1999-11-14' },
  { round: 19, local: 'Cristal', visita: 'Pesquero', marcador: '2-1', date: '1999-11-21' },
  { round: 20, local: 'Minas', visita: 'Cristal', marcador: '3-0', date: '1999-11-28' },
  { round: 21, local: 'Sport Boys', visita: 'Cristal', marcador: '2-1', date: '1999-12-05' },
  { round: 22, local: 'Cristal', visita: 'Melgar', marcador: '3-2', date: '1999-12-08' }
];

// Procesar partidos
const processedMatches = [];

// Procesar partidos del Apertura
aperturaMatches1999.forEach(match => {
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

// Procesar partidos del Clausura
clausuraMatches1999.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  // Manejar el caso especial del round 13 (awarded)
  let marcador = match.marcador;
  if (match.note && match.note.includes('Awarded')) {
    marcador = '0-2'; // Resultado otorgado
  }
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Clausura',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: marcador,
    'Goles (Solo SC)': match.note || '-'
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
  
  // Verificar si ya existen partidos de 1999
  const existing1999Count = existingMatches.filter(m => m.Año === 1999).length;
  
  if (existing1999Count > 0) {
    console.log(`⚠️  Ya existen ${existing1999Count} partidos de 1999.`);
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
      console.log('✅ Todos los partidos de 1999 ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de 1999...`);
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
const matches1999 = existingMatches.filter(m => m.Año === 1999);
const total1999 = matches1999.length;
const victorias1999 = matches1999.filter(m => m.Resultado === 'V').length;
const empates1999 = matches1999.filter(m => m.Resultado === 'E').length;
const derrotas1999 = matches1999.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1999\n');
console.log(`Total de partidos: ${total1999}`);
console.log(`Victorias: ${victorias1999}`);
console.log(`Empates: ${empates1999}`);
console.log(`Derrotas: ${derrotas1999}\n`);

const apertura1999 = matches1999.filter(m => m.Torneo === 'Torneo Apertura');
const clausura1999 = matches1999.filter(m => m.Torneo === 'Torneo Clausura');
console.log(`Torneo Apertura: ${apertura1999.length} partidos`);
console.log(`Torneo Clausura: ${clausura1999.length} partidos\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993 + 1994 + 1995 + 1996 + 1997 + 1998 + 1999)\n`);
console.log(`Total de partidos: ${existingMatches.length}`);
const totalVictorias = existingMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = existingMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = existingMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

console.log(`✅ Archivo actualizado: ${existingFile}`);


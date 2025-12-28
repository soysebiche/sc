// Script para agregar partidos de Sporting Cristal 1997
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
    'Cristal': 'Sporting Cristal',
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Atlético': 'Alianza Atlético',
    'Alianza Atlético Sullana': 'Alianza Atlético',
    'Alianza Atl': 'Alianza Atlético',
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
    'Sports Boys': 'Sport Boys',
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
    'Galvez': 'José Gálvez'
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

// Partidos del Torneo Apertura 1997 (13 partidos)
const aperturaMatches1997 = [
  { round: 1, local: 'La Loretana', visita: 'Cristal', marcador: '1-2', date: '1997-02-23' },
  { round: 2, local: 'Municipal', visita: 'Cristal', marcador: '1-6', date: '1997-03-01' },
  { round: 3, local: 'Cristal', visita: 'Alianza Atl', marcador: '2-1', date: '1997-03-08' },
  { round: 4, local: 'Universitario', visita: 'Cristal', marcador: '2-0', date: '1997-03-15' },
  { round: 5, local: 'Alcides', visita: 'Cristal', marcador: '1-3', date: '1997-03-22' },
  { round: 6, local: 'Cristal', visita: 'Jose Galvez', marcador: '6-0', date: '1997-04-05' },
  { round: 7, local: 'Minas', visita: 'Cristal', marcador: '0-0', date: '1997-04-30' },
  { round: 8, local: 'Cristal', visita: 'Torino', marcador: '4-2', date: '1997-04-19' },
  { round: 9, local: 'Pesquero', visita: 'Cristal', marcador: '0-0', date: '1997-05-14' },
  { round: 10, local: 'Alianza', visita: 'Cristal', marcador: '5-4', date: '1997-05-03' },
  { round: 11, local: 'Cristal', visita: 'Sport Boys', marcador: '2-0', date: '1997-05-10' },
  { round: 12, local: 'Cristal', visita: 'Melgar', marcador: '1-0', date: '1997-05-17' },
  { round: 13, local: 'Cienciano', visita: 'Cristal', marcador: '0-0', date: '1997-05-24' }
];

// Partidos del Torneo Clausura 1997 (13 partidos)
const clausuraMatches1997 = [
  { round: 1, local: 'Cristal', visita: 'La Loretana', marcador: '4-1', date: '1997-07-12' },
  { round: 2, local: 'Cristal', visita: 'Municipal', marcador: '3-2', date: '1997-07-19' },
  { round: 3, local: 'Alianza Atl', visita: 'Cristal', marcador: '2-2', date: '1997-07-26' },
  { round: 4, local: 'Cristal', visita: 'Universitario', marcador: '0-1', date: '1997-08-02' },
  { round: 5, local: 'Cristal', visita: 'Alcides', marcador: '1-1', date: '1997-08-09' },
  { round: 6, local: 'Jose Galvez', visita: 'Cristal', marcador: '1-2', date: '1997-08-31' },
  { round: 7, local: 'Cristal', visita: 'Minas', marcador: '4-1', date: '1997-09-14' },
  { round: 8, local: 'Torino', visita: 'Cristal', marcador: '1-1', date: '1997-09-21' },
  { round: 9, local: 'Cristal', visita: 'Pesquero', marcador: '3-1', date: '1997-09-28' },
  { round: 10, local: 'Cristal', visita: 'Alianza', marcador: '2-3', date: '1997-10-18' },
  { round: 11, local: 'Sport Boys', visita: 'Cristal', marcador: '1-1', date: '1997-10-25' },
  { round: 12, local: 'Melgar', visita: 'Cristal', marcador: '1-0', date: '1997-11-05' },
  { round: 13, local: 'Cristal', visita: 'Cienciano', marcador: '2-0', date: '1997-11-08' }
];

// Partidos de Liguilla Pre-Libertadores 1997 (5 partidos)
const liguillaMatches1997 = [
  { round: 1, local: 'Melgar', visita: 'Cristal', marcador: '0-3', date: '1997-11-22' },
  { round: 2, local: 'Cristal', visita: 'Cienciano', marcador: '1-0', date: '1997-11-29' },
  { round: 3, local: 'Universitario', visita: 'Cristal', marcador: '0-0', date: '1997-12-06' },
  { round: 4, local: 'Cristal', visita: 'Municipal', marcador: '3-0', date: '1997-12-13' },
  { round: 5, local: 'Cristal', visita: 'Alianza Atl', marcador: '2-1', date: '1997-12-20' }
];

// Procesar partidos
const processedMatches = [];

// Procesar partidos del Apertura
aperturaMatches1997.forEach(match => {
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
clausuraMatches1997.forEach(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  processedMatches.push(createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Clausura',
    'Número de Fecha': String(match.round),
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  }));
});

// Procesar partidos de Liguilla
liguillaMatches1997.forEach(match => {
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

// Leer archivo existente
const existingFile = './matches-1992.json';
let existingMatches = [];
if (fs.existsSync(existingFile)) {
  existingMatches = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
  
  // Verificar si ya existen partidos de 1997
  const existing1997Count = existingMatches.filter(m => m.Año === 1997).length;
  
  if (existing1997Count > 0) {
    console.log(`⚠️  Ya existen ${existing1997Count} partidos de 1997.`);
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
      console.log('✅ Todos los partidos de 1997 ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de 1997...`);
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
const matches1997 = existingMatches.filter(m => m.Año === 1997);
const total1997 = matches1997.length;
const victorias1997 = matches1997.filter(m => m.Resultado === 'V').length;
const empates1997 = matches1997.filter(m => m.Resultado === 'E').length;
const derrotas1997 = matches1997.filter(m => m.Resultado === 'D').length;

console.log('\n📊 RESUMEN DE PARTIDOS - SPORTING CRISTAL 1997\n');
console.log(`Total de partidos: ${total1997}`);
console.log(`Victorias: ${victorias1997}`);
console.log(`Empates: ${empates1997}`);
console.log(`Derrotas: ${derrotas1997}\n`);

const apertura1997 = matches1997.filter(m => m.Torneo === 'Torneo Apertura');
const clausura1997 = matches1997.filter(m => m.Torneo === 'Torneo Clausura');
const liguilla1997 = matches1997.filter(m => m.Torneo === 'Liguilla Pre-Libertadores');
console.log(`Torneo Apertura: ${apertura1997.length} partidos`);
console.log(`Torneo Clausura: ${clausura1997.length} partidos`);
console.log(`Liguilla Pre-Libertadores: ${liguilla1997.length} partidos\n`);

console.log(`📊 RESUMEN TOTAL (1992 + 1993 + 1994 + 1995 + 1996 + 1997)\n`);
console.log(`Total de partidos: ${existingMatches.length}`);
const totalVictorias = existingMatches.filter(m => m.Resultado === 'V').length;
const totalEmpates = existingMatches.filter(m => m.Resultado === 'E').length;
const totalDerrotas = existingMatches.filter(m => m.Resultado === 'D').length;
console.log(`Victorias: ${totalVictorias}`);
console.log(`Empates: ${totalEmpates}`);
console.log(`Derrotas: ${totalDerrotas}\n`);

console.log(`✅ Archivo actualizado: ${existingFile}`);


// Script para agregar partidos de cuartos de final del Torneo Intermedio 1993
const fs = require('fs');

// Días de la semana
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Normalizar nombres de equipos
function normalizeTeamName(name) {
  const map = {
    'Deportivo Sipesa': 'Deportivo Sipesa',
    'Sporting Cristal': 'Sporting Cristal'
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
    "Torneo": data.Torneo || 'Torneo Intermedio - Cuartos de Final',
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

// Partidos de Cuartos de Final del Torneo Intermedio
const cuartosMatches = [
  { local: 'Deportivo Sipesa', visita: 'Sporting Cristal', marcador: '3-0', date: '1993-08-08', leg: 'Ida' },
  { local: 'Sporting Cristal', visita: 'Deportivo Sipesa', marcador: '2-2', date: '1993-08-15', leg: 'Vuelta' }
];

// Procesar partidos
const processedMatches = cuartosMatches.map(match => {
  const local = normalizeTeamName(match.local);
  const visita = normalizeTeamName(match.visita);
  
  return createMatch({
    Fecha: match.date,
    Torneo: 'Torneo Intermedio - Cuartos de Final',
    'Número de Fecha': match.leg,
    'Equipo Local': local,
    'Equipo Visita': visita,
    Marcador: match.marcador,
    'Goles (Solo SC)': '-'
  });
});

// Leer archivo existente
const existingFile = './matches-1992.json';
let existingMatches = [];
if (fs.existsSync(existingFile)) {
  existingMatches = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
  
  // Verificar si ya existen estos partidos
  const cuartosExistentes = existingMatches.filter(m => 
    m.Año === 1993 && 
    m.Torneo === 'Torneo Intermedio - Cuartos de Final'
  );
  
  if (cuartosExistentes.length > 0) {
    console.log(`⚠️  Ya existen ${cuartosExistentes.length} partidos de cuartos de final.`);
    console.log('Verificando si faltan algunos...\n');
    
    // Verificar cada partido nuevo
    const nuevosPartidos = processedMatches.filter(nuevo => {
      return !cuartosExistentes.some(existente => 
        existente.Fecha === nuevo.Fecha &&
        existente['Equipo Local'] === nuevo['Equipo Local'] &&
        existente['Equipo Visita'] === nuevo['Equipo Visita']
      );
    });
    
    if (nuevosPartidos.length > 0) {
      console.log(`Agregando ${nuevosPartidos.length} partidos faltantes...`);
      existingMatches = [...existingMatches, ...nuevosPartidos];
    } else {
      console.log('✅ Todos los partidos de cuartos de final ya están en el archivo.');
      process.exit(0);
    }
  } else {
    console.log(`Agregando ${processedMatches.length} partidos de cuartos de final...`);
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
const matches1993 = existingMatches.filter(m => m.Año === 1993);
const cuartos1993 = matches1993.filter(m => m.Torneo === 'Torneo Intermedio - Cuartos de Final');

console.log('\n📊 RESUMEN ACTUALIZADO - SPORTING CRISTAL 1993\n');
console.log(`Total de partidos 1993: ${matches1993.length}`);
console.log(`Partidos de cuartos de final: ${cuartos1993.length}`);
console.log(`\n✅ Archivo actualizado: ${existingFile}`);
console.log(`Total de partidos en JSON: ${existingMatches.length}`);


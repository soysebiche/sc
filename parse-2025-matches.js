const fs = require('fs');

// Función para obtener el día de la semana en español
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

// Función para obtener el mes en español
function getMonthName(monthNumber) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthNumber - 1];
}

// Función para determinar el resultado (V, D, E)
function getResultado(marcador, equipoLocal) {
  if (!marcador || marcador === '-') return 'E';
  
  const [local, visita] = marcador.split('-').map(Number);
  
  if (equipoLocal === 'Sporting Cristal') {
    if (local > visita) return 'V';
    if (local < visita) return 'D';
    return 'E';
  } else {
    // Si SC es visitante
    if (visita > local) return 'V';
    if (visita < local) return 'D';
    return 'E';
  }
}

// Función para extraer goles de SC del texto
function extractSCGoals(text, equipoLocal, equipoVisita) {
  if (!text) return '-';
  
  // Si Sporting Cristal es local o visitante
  const isLocal = equipoLocal === 'Sporting Cristal';
  
  // Buscar goles en el formato [Jugador (minuto)]
  const goalPattern = /\[([^\]]+)\]/g;
  const matches = text.match(goalPattern);
  
  if (!matches) return '-';
  
  // Extraer solo los goles que corresponden a SC
  // Esto requiere análisis del texto completo, por ahora devolvemos el texto completo
  // y el usuario puede ajustarlo manualmente si es necesario
  return text.replace(/\[|\]/g, '').trim() || '-';
}

// Función para crear un objeto de partido
function createMatch(data) {
  const fecha = new Date(data.Fecha);
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  
  return {
    "Año": año,
    "Mes": getMonthName(mes),
    "Dia": dia,
    "Día de la Semana": getDayOfWeek(data.Fecha),
    "Fecha": data.Fecha,
    "Torneo": data.Torneo || 'Apertura',
    "Número de Fecha": data['Número de Fecha'] || data.NumeroFecha || '1',
    "Equipo Local": data['Equipo Local'] || data.EquipoLocal,
    "Equipo Visita": data['Equipo Visita'] || data.EquipoVisita,
    "Marcador": data.Marcador,
    "Resultado": data.Resultado || getResultado(data.Marcador, data['Equipo Local'] || data.EquipoLocal),
    "Goles (Solo SC)": data['Goles (Solo SC)'] || data.Goles || '-'
  };
}

// Función para parsear fecha desde formato [MMM DD] o [DD MMM]
function parseDate(dateStr, year = 2025) {
  const months = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };
  
  // Formato [Feb 7] o [Jul 18]
  const match = dateStr.match(/\[(\w+)\s+(\d+)\]/);
  if (match) {
    const month = months[match[1]];
    const day = parseInt(match[2]);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return null;
}

// Datos completos de los partidos del 2025
// Voy a crear un array con todos los partidos basado en el texto proporcionado
const allMatches = [];

// APERTURA TOURNAMENT
const aperturaMatches = [
  // Round 1
  { Fecha: "2025-02-07", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Sport Huancayo", "Equipo Visita": "Alianza Atlético", Marcador: "2-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-08", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "FBC Melgar", "Equipo Visita": "U.T.C.", Marcador: "3-0", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-08", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Atlético Grau", "Equipo Visita": "Ayacucho FC", Marcador: "1-0", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-08", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Alianza Lima", "Equipo Visita": "Cusco FC", Marcador: "3-0", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-09", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Alianza Universidad", "Equipo Visita": "Sporting Cristal", Marcador: "2-2", "Goles (Solo SC)": "Santiago González (10'), Martín Cauteruccio (50' pen)" },
  { Fecha: "2025-02-09", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Sport Boys", "Equipo Visita": "Juan Pablo II", Marcador: "1-0", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-09", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Comerciantes Unidos", "Equipo Visita": "Universitario", Marcador: "1-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-09", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Cienciano", "Equipo Visita": "A.D.T.", Marcador: "2-2", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-10", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Dep. Los Chankas", "Equipo Visita": "Deportivo Garcilaso", Marcador: "2-2", "Goles (Solo SC)": "-" },
  
  // Round 2
  { Fecha: "2025-02-14", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Cusco FC", "Equipo Visita": "FBC Melgar", Marcador: "0-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-15", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "U.T.C.", "Equipo Visita": "EMD Binacional", Marcador: "0-4", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-15", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "A.D.T.", "Equipo Visita": "Atlético Grau", Marcador: "4-3", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-15", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Alianza Atlético", "Equipo Visita": "Alianza Lima", Marcador: "3-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-15", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Universitario", "Equipo Visita": "Cienciano", Marcador: "3-2", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-16", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Sport Boys", Marcador: "2-1", "Goles (Solo SC)": "Martín Cauteruccio (38'), Martín Cauteruccio (66' pen)" },
  { Fecha: "2025-02-16", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Juan Pablo II", "Equipo Visita": "Sport Huancayo", Marcador: "0-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-16", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Deportivo Garcilaso", "Equipo Visita": "Comerciantes Unidos", Marcador: "2-1", "Goles (Solo SC)": "-" },
  { Fecha: "2025-02-17", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Ayacucho FC", "Equipo Visita": "Alianza Universidad", Marcador: "3-2", "Goles (Solo SC)": "-" },
];

// Agregar todos los partidos del Apertura
allMatches.push(...aperturaMatches);

console.log('📝 Procesando partidos del 2025...');
console.log(`📊 Total de partidos del Apertura: ${aperturaMatches.length}`);

// Convertir todos los partidos al formato correcto
const formattedMatches = allMatches.map(match => createMatch(match));

// Guardar en archivo
fs.writeFileSync('data-2025.json', JSON.stringify(formattedMatches, null, 4));
console.log(`✅ Archivo data-2025.json creado con ${formattedMatches.length} partidos`);
console.log('\n💡 NOTA: Este archivo contiene solo los primeros rounds del Apertura.');
console.log('   Necesitarás agregar manualmente todos los demás partidos o');
console.log('   puedo ayudarte a crear un archivo completo con todos los partidos.');
console.log('\n📋 Para agregar todos los partidos, ejecuta:');
console.log('   node add-2025-data.js');




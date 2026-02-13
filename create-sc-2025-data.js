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

// SOLO PARTIDOS DE SPORTING CRISTAL - APERTURA 2025
const scMatches2025 = [
  // Round 1
  { Fecha: "2025-02-09", Torneo: "Apertura", "Número de Fecha": "1", "Equipo Local": "Alianza Universidad", "Equipo Visita": "Sporting Cristal", Marcador: "2-2", "Goles (Solo SC)": "Santiago González (10'), Martín Cauteruccio (50' pen)" },
  
  // Round 2
  { Fecha: "2025-02-16", Torneo: "Apertura", "Número de Fecha": "2", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Sport Boys", Marcador: "2-1", "Goles (Solo SC)": "Martín Cauteruccio (38'), Martín Cauteruccio (66' pen)" },
  
  // Round 3
  { Fecha: "2025-02-22", Torneo: "Apertura", "Número de Fecha": "3", "Equipo Local": "Sport Huancayo", "Equipo Visita": "Sporting Cristal", Marcador: "0-1", "Goles (Solo SC)": "Irven Ávila (68')" },
  
  // Round 4
  { Fecha: "2025-03-01", Torneo: "Apertura", "Número de Fecha": "4", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Alianza Lima", Marcador: "1-2", "Goles (Solo SC)": "Jhoao Velásquez (9' og)" },
  
  // Round 5
  { Fecha: "2025-03-08", Torneo: "Apertura", "Número de Fecha": "5", "Equipo Local": "FBC Melgar", "Equipo Visita": "Sporting Cristal", Marcador: "1-0", "Goles (Solo SC)": "-" },
  
  // Round 6
  { Fecha: "2025-03-29", Torneo: "Apertura", "Número de Fecha": "6", "Equipo Local": "Sporting Cristal", "Equipo Visita": "EMD Binacional", Marcador: "5-0", "Goles (Solo SC)": "Martín Cauteruccio (35'), Martín Cauteruccio (47'), Irven Ávila (54'), Santiago González (77'), Misael Sosa (86')" },
  
  // Round 7
  { Fecha: "2025-04-05", Torneo: "Apertura", "Número de Fecha": "7", "Equipo Local": "U.T.C.", "Equipo Visita": "Sporting Cristal", Marcador: "4-1", "Goles (Solo SC)": "Christofer Gonzales (9' pen)" },
  
  // Round 8
  { Fecha: "2025-04-13", Torneo: "Apertura", "Número de Fecha": "8", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Cusco FC", Marcador: "1-0", "Goles (Solo SC)": "Gerald Távara (83' pen)" },
  
  // Round 9
  { Fecha: "2025-04-19", Torneo: "Apertura", "Número de Fecha": "9", "Equipo Local": "Alianza Atlético", "Equipo Visita": "Sporting Cristal", Marcador: "1-0", "Goles (Solo SC)": "-" },
  
  // Round 10
  { Fecha: "2025-04-27", Torneo: "Apertura", "Número de Fecha": "10", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Juan Pablo II", Marcador: "3-2", "Goles (Solo SC)": "Gerald Távara (22'), Christofer Gonzales (31'), Christofer Gonzales (50')" },
  
  // Round 11
  { Fecha: "2025-05-10", Torneo: "Apertura", "Número de Fecha": "11", "Equipo Local": "Ayacucho FC", "Equipo Visita": "Sporting Cristal", Marcador: "1-4", "Goles (Solo SC)": "Irven Ávila (6'), Irven Ávila (34'), Misael Sosa (28'), Ian Wisdom (38')" },
  
  // Round 12
  { Fecha: "2025-05-16", Torneo: "Apertura", "Número de Fecha": "12", "Equipo Local": "Sporting Cristal", "Equipo Visita": "A.D.T.", Marcador: "2-1", "Goles (Solo SC)": "Gerald Távara (41'), Maxloren Castro (96')" },
  
  // Round 13
  { Fecha: "2025-05-22", Torneo: "Apertura", "Número de Fecha": "13", "Equipo Local": "Universitario", "Equipo Visita": "Sporting Cristal", Marcador: "2-0", "Goles (Solo SC)": "-" },
  
  // Round 14
  { Fecha: "2025-06-15", Torneo: "Apertura", "Número de Fecha": "14", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Deportivo Garcilaso", Marcador: "3-2", "Goles (Solo SC)": "Martín Cauteruccio (42' pen), Martín Cauteruccio (87' pen), Christofer Gonzales (70')" },
  
  // Round 15
  { Fecha: "2025-06-21", Torneo: "Apertura", "Número de Fecha": "15", "Equipo Local": "Dep. Los Chankas", "Equipo Visita": "Sporting Cristal", Marcador: "3-1", "Goles (Solo SC)": "Christofer Gonzales (14')" },
  
  // Round 16
  { Fecha: "2025-06-27", Torneo: "Apertura", "Número de Fecha": "16", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Comerciantes Unidos", Marcador: "2-0", "Goles (Solo SC)": "Martín Cauteruccio (51' pen), Fernando Pacheco (54')" },
  
  // Round 17
  { Fecha: "2025-07-04", Torneo: "Apertura", "Número de Fecha": "17", "Equipo Local": "Cienciano", "Equipo Visita": "Sporting Cristal", Marcador: "1-1", "Goles (Solo SC)": "Christofer Gonzales (92')" },
  
  // Round 18
  { Fecha: "2025-07-11", Torneo: "Apertura", "Número de Fecha": "18", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Atlético Grau", Marcador: "2-1", "Goles (Solo SC)": "Irven Ávila (9'), Santiago González (94')" },
  
  // CLAUSURA 2025
  // Round 1
  { Fecha: "2025-07-20", Torneo: "Clausura", "Número de Fecha": "1", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Alianza Universidad", Marcador: "3-0", "Goles (Solo SC)": "Gerald Távara (22'), Irven Ávila (28'), Leandro Sosa (53')" },
  
  // Round 2
  { Fecha: "2025-07-26", Torneo: "Clausura", "Número de Fecha": "2", "Equipo Local": "Sport Boys", "Equipo Visita": "Sporting Cristal", Marcador: "0-2", "Goles (Solo SC)": "Leandro Sosa (40'), Miguel Araujo (53')" },
  
  // Round 3
  { Fecha: "2025-07-30", Torneo: "Clausura", "Número de Fecha": "3", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Sport Huancayo", Marcador: "5-0", "Goles (Solo SC)": "Christofer Gonzales (8'), Christofer Gonzales (50'), Miguel Araujo (16'), Irven Ávila (67'), Yoshimar Yotún (93' pen)" },
  
  // Round 4
  { Fecha: "2025-08-05", Torneo: "Clausura", "Número de Fecha": "4", "Equipo Local": "Alianza Lima", "Equipo Visita": "Sporting Cristal", Marcador: "0-0", "Goles (Solo SC)": "-" },
  
  // Round 5
  { Fecha: "2025-08-10", Torneo: "Clausura", "Número de Fecha": "5", "Equipo Local": "Sporting Cristal", "Equipo Visita": "FBC Melgar", Marcador: "1-0", "Goles (Solo SC)": "Ian Wisdom (51')" },
  
  // Round 6
  { Fecha: "2025-08-16", Torneo: "Clausura", "Número de Fecha": "6", "Equipo Local": "EMD Binacional", "Equipo Visita": "Sporting Cristal", Marcador: "1-3", "Goles (Solo SC)": "Fernando Pacheco (12'), Alejandro Pósito (16'), Gerald Távara (21')" },
  
  // Round 7
  { Fecha: "2025-08-23", Torneo: "Clausura", "Número de Fecha": "7", "Equipo Local": "Sporting Cristal", "Equipo Visita": "U.T.C.", Marcador: "2-2", "Goles (Solo SC)": "Luis Abram (54'), Santiago González (75')" },
  
  // Round 8
  { Fecha: "2025-09-14", Torneo: "Clausura", "Número de Fecha": "8", "Equipo Local": "Cusco FC", "Equipo Visita": "Sporting Cristal", Marcador: "3-2", "Goles (Solo SC)": "Leandro Sosa (2'), Irven Ávila (52')" },
  
  // Round 9
  { Fecha: "2025-09-17", Torneo: "Clausura", "Número de Fecha": "9", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Alianza Atletico", Marcador: "0-0", "Goles (Solo SC)": "-" },
  
  // Round 10
  { Fecha: "2025-09-21", Torneo: "Clausura", "Número de Fecha": "10", "Equipo Local": "Juan Pablo II", "Equipo Visita": "Sporting Cristal", Marcador: "0-0", "Goles (Solo SC)": "-" },
  
  // Round 11
  { Fecha: "2025-09-30", Torneo: "Clausura", "Número de Fecha": "11", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Ayacucho FC", Marcador: "3-0", "Goles (Solo SC)": "Ian Wisdom (6'), Felipe Vizeu (23'), Felipe Vizeu (41')" },
  
  // Round 12
  { Fecha: "2025-10-03", Torneo: "Clausura", "Número de Fecha": "12", "Equipo Local": "A.D.T.", "Equipo Visita": "Sporting Cristal", Marcador: "3-2", "Goles (Solo SC)": "Santiago González (39'), Leandro Sosa (45+1')" },
  
  // Round 13
  { Fecha: "2025-10-16", Torneo: "Clausura", "Número de Fecha": "13", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Universitario", Marcador: "0-1", "Goles (Solo SC)": "-" },
  
  // Round 14
  { Fecha: "2025-10-19", Torneo: "Clausura", "Número de Fecha": "14", "Equipo Local": "Deportivo Garcilaso", "Equipo Visita": "Sporting Cristal", Marcador: "0-1", "Goles (Solo SC)": "Irven Ávila (88')" },
  
  // Round 15
  { Fecha: "2025-10-25", Torneo: "Clausura", "Número de Fecha": "15", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Dep. Los Chankas", Marcador: "0-1", "Goles (Solo SC)": "-" },
  
  // Round 16
  { Fecha: "2025-11-01", Torneo: "Clausura", "Número de Fecha": "16", "Equipo Local": "Comerciantes Unidos", "Equipo Visita": "Sporting Cristal", Marcador: "1-4", "Goles (Solo SC)": "Santiago González (4'), Irven Ávila (68'), Irven Ávila (72'), Maxloren Castro (83')" },
  
  // Round 17
  { Fecha: "2025-11-19", Torneo: "Clausura", "Número de Fecha": "17", "Equipo Local": "Atlético Grau", "Equipo Visita": "Sporting Cristal", Marcador: "1-2", "Goles (Solo SC)": "Cristian Benavente (36'), Diego Otoya (53')" },
  
  // Round 18
  { Fecha: "2025-11-07", Torneo: "Clausura", "Número de Fecha": "18", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Cienciano", Marcador: "2-1", "Goles (Solo SC)": "Leandro Sosa (49'), Gerald Távara (94')" },
  
  // COPA LIBERTADORES 2026 PLAYOFF
  // Third Place
  { Fecha: "2025-12-02", Torneo: "Copa Libertadores 2026 Playoff", "Número de Fecha": "1", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Alianza Lima", Marcador: "1-1", "Goles (Solo SC)": "Gerald Távara (68' pen)" },
  { Fecha: "2025-12-06", Torneo: "Copa Libertadores 2026 Playoff", "Número de Fecha": "2", "Equipo Local": "Alianza Lima", "Equipo Visita": "Sporting Cristal", Marcador: "3-3", "Goles (Solo SC)": "Martin Tavara (7' pen), Martin Tavara (82'), Martin Tavara (91')" },
  
  // Second Place
  { Fecha: "2025-12-10", Torneo: "Copa Libertadores 2026 Playoff", "Número de Fecha": "3", "Equipo Local": "Sporting Cristal", "Equipo Visita": "Cusco FC", Marcador: "1-0", "Goles (Solo SC)": "Santiago González (15')" },
  { Fecha: "2025-12-14", Torneo: "Copa Libertadores 2026 Playoff", "Número de Fecha": "4", "Equipo Local": "Cusco FC", "Equipo Visita": "Sporting Cristal", Marcador: "2-0", "Goles (Solo SC)": "-" },
];

// Convertir todos los partidos al formato correcto
const formattedMatches = scMatches2025.map(match => createMatch(match));

// Guardar en archivo
fs.writeFileSync('data-2025.json', JSON.stringify(formattedMatches, null, 4));
console.log(`✅ Archivo data-2025.json creado con ${formattedMatches.length} partidos de Sporting Cristal`);
console.log('\n📊 Resumen:');
console.log(`   - Apertura: ${formattedMatches.filter(m => m.Torneo === 'Apertura').length} partidos`);
console.log(`   - Clausura: ${formattedMatches.filter(m => m.Torneo === 'Clausura').length} partidos`);
console.log(`   - Playoffs: ${formattedMatches.filter(m => m.Torneo.includes('Playoff')).length} partidos`);
console.log('\n💡 Ahora ejecuta: node add-2025-data.js');




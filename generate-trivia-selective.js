// Script para generar preguntas de trivia selectivas basadas en partidos específicos
const fs = require('fs');

const historicoFile = './src/data/historico_completo_sc.json';
const historicoData = JSON.parse(fs.readFileSync(historicoFile, 'utf8'));

// Función para determinar década
function getDecade(año) {
  if (año >= 1993 && año <= 1999) return '93-99';
  if (año >= 2000 && año <= 2010) return '00-10';
  if (año >= 2011 && año <= 2020) return '11-20';
  if (año >= 2021) return '21-25';
  return '93-25';
}

// Función para formatear fecha
function formatFecha(partido) {
  return `${partido.Dia} de ${partido.Mes} de ${partido.Año}`;
}

// Generar preguntas selectivas
const preguntas = [];
let id = 1;

// Identificar rivales importantes
const rivalesImportantes = ['Alianza Lima', 'Universitario', 'Universitario de Deportes', 'FBC Melgar', 'Cienciano'];

// Agrupar partidos
const partidosPorRival = {};
const partidosPorTorneo = {};
const partidosConGoles = [];

historicoData.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];

  if (!partidosPorRival[rival]) {
    partidosPorRival[rival] = [];
  }
  partidosPorRival[rival].push(partido);

  const torneo = partido.Torneo || 'Desconocido';
  if (!partidosPorTorneo[torneo]) {
    partidosPorTorneo[torneo] = [];
  }
  partidosPorTorneo[torneo].push(partido);

  // Partidos con goles (solo 2000+)
  if (partido.Año >= 2000 && 
      partido['Goles (Solo SC)'] && 
      partido['Goles (Solo SC)'] !== '-' && 
      partido['Goles (Solo SC)'] !== null &&
      partido['Goles (Solo SC)'].trim() !== '') {
    partidosConGoles.push(partido);
  }
});

// 1. Preguntas sobre goles de partidos importantes (clásicos, finales, etc.)
partidosConGoles.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const esClasico = rivalesImportantes.includes(rival);
  const esPlayoff = partido.Torneo && (
    partido.Torneo.toLowerCase().includes('playoff') || 
    partido.Torneo.toLowerCase().includes('final') ||
    partido.Torneo.toLowerCase().includes('liguilla')
  );

  // Priorizar clásicos y partidos importantes
  if (esClasico || esPlayoff || Math.random() < 0.1) {
    const fechaFormateada = formatFecha(partido);
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Quién anotó los goles de Sporting Cristal en el partido contra ${rival} del ${fechaFormateada}?`,
      answer: partido['Goles (Solo SC)'],
      category: "Goleadores",
      difficulty: esClasico ? "medio" : "difícil"
    });
  }
});

// 2. Preguntas sobre día de la semana de partidos importantes
historicoData.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const esClasico = rivalesImportantes.includes(rival);
  const esPlayoff = partido.Torneo && (
    partido.Torneo.toLowerCase().includes('playoff') || 
    partido.Torneo.toLowerCase().includes('final') ||
    partido.Torneo.toLowerCase().includes('liguilla')
  );

  // Priorizar clásicos y partidos importantes
  if (esClasico || esPlayoff || Math.random() < 0.15) {
    const fechaFormateada = formatFecha(partido);
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Qué día de la semana se jugó el partido contra ${rival} del ${fechaFormateada}?`,
      answer: partido['Día de la Semana'],
      category: "Calendario",
      difficulty: "medio"
    });
  }
});

// 3. Preguntas sobre resultados de clásicos
historicoData.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const esClasico = rivalesImportantes.includes(rival);
  const esPlayoff = partido.Torneo && (
    partido.Torneo.toLowerCase().includes('playoff') || 
    partido.Torneo.toLowerCase().includes('final') ||
    partido.Torneo.toLowerCase().includes('liguilla')
  );

  if (esClasico || esPlayoff) {
    const fechaFormateada = formatFecha(partido);
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Cuál fue el resultado del partido contra ${rival} del ${fechaFormateada}?`,
      answer: partido.Marcador,
      category: "Resultados",
      difficulty: esClasico ? "fácil" : "medio"
    });
  }
});

// 4. Preguntas sobre resultados de partidos de torneos importantes
Object.entries(partidosPorTorneo).forEach(([torneo, partidos]) => {
  // Filtrar torneos importantes
  const torneosImportantes = ['Copa Libertadores', 'Copa Sudamericana', 'Apertura', 'Clausura', 'Descentralizado'];
  const esImportante = torneosImportantes.some(t => torneo.includes(t));
  
  if (esImportante && partidos.length > 0) {
    // Seleccionar algunos partidos representativos (máximo 20 por torneo)
    const partidosSeleccionados = partidos
      .filter(p => rivalesImportantes.includes(
        p['Equipo Local'] === 'Sporting Cristal' ? p['Equipo Visita'] : p['Equipo Local']
      ))
      .slice(0, 20);
    
    if (partidosSeleccionados.length === 0) {
      partidosSeleccionados.push(...partidos.slice(0, 10));
    }

    partidosSeleccionados.forEach(partido => {
      const rival = partido['Equipo Local'] === 'Sporting Cristal' 
        ? partido['Equipo Visita'] 
        : partido['Equipo Local'];
      const década = getDecade(partido.Año);
      const fechaFormateada = formatFecha(partido);
      
      preguntas.push({
        id: id++,
        decade: década,
        question: `¿Cuál fue el resultado del partido de ${torneo} contra ${rival} del ${fechaFormateada}?`,
        answer: partido.Marcador,
        category: "Torneos",
        difficulty: "medio"
      });
    });
  }
});

// 5. Preguntas sobre resultados de partidos contra rivales frecuentes (muestreo)
Object.entries(partidosPorRival).forEach(([rival, partidos]) => {
  if (partidos.length >= 10) {
    // Seleccionar algunos partidos representativos (máximo 15 por rival)
    const partidosSeleccionados = partidos
      .filter(p => {
        const esPlayoff = p.Torneo && (
          p.Torneo.toLowerCase().includes('playoff') || 
          p.Torneo.toLowerCase().includes('final')
        );
        return esPlayoff || Math.random() < 0.2;
      })
      .slice(0, 15);

    partidosSeleccionados.forEach(partido => {
      const década = getDecade(partido.Año);
      const fechaFormateada = formatFecha(partido);
      
      preguntas.push({
        id: id++,
        decade: década,
        question: `¿Cuál fue el resultado del partido contra ${rival} del ${fechaFormateada}?`,
        answer: partido.Marcador,
        category: "Resultados",
        difficulty: "medio"
      });
    });
  }
});

// Eliminar duplicados
const preguntasUnicas = [];
const seen = new Set();

preguntas.forEach(p => {
  const key = `${p.question}|${p.answer}`;
  if (!seen.has(key)) {
    seen.add(key);
    preguntasUnicas.push(p);
  }
});

// Reasignar IDs
preguntasUnicas.forEach((p, index) => {
  p.id = index + 1;
});

console.log(`Generadas ${preguntasUnicas.length} preguntas selectivas basadas en partidos específicos\n`);

// Guardar en archivo
fs.writeFileSync('./trivia-questions-generated.json', JSON.stringify(preguntasUnicas, null, 2), 'utf8');
console.log('✅ Preguntas guardadas en trivia-questions-generated.json');
console.log(`\nResumen por década:`);
Object.entries(preguntasUnicas.reduce((acc, p) => {
  acc[p.decade] = (acc[p.decade] || 0) + 1;
  return acc;
}, {})).forEach(([década, cantidad]) => {
  console.log(`  ${década}: ${cantidad} preguntas`);
});

console.log(`\nResumen por categoría:`);
Object.entries(preguntasUnicas.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {})).forEach(([categoria, cantidad]) => {
  console.log(`  ${categoria}: ${cantidad} preguntas`);
});


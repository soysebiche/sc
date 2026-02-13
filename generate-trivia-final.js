// Script para generar preguntas de trivia selectivas y balanceadas
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

// Identificar rivales importantes
const rivalesImportantes = ['Alianza Lima', 'Universitario', 'Universitario de Deportes', 'FBC Melgar', 'Cienciano'];

// Clasificar partidos
const clasicos = [];
const playoffs = [];
const partidosConGoles = [];
const otrosPartidos = [];

historicoData.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  
  const esClasico = rivalesImportantes.includes(rival);
  const esPlayoff = partido.Torneo && (
    partido.Torneo.toLowerCase().includes('playoff') || 
    partido.Torneo.toLowerCase().includes('final') ||
    partido.Torneo.toLowerCase().includes('liguilla')
  );

  if (esClasico) {
    clasicos.push(partido);
  } else if (esPlayoff) {
    playoffs.push(partido);
  } else {
    otrosPartidos.push(partido);
  }

  // Partidos con goles (solo 2000+)
  if (partido.Año >= 2000 && 
      partido['Goles (Solo SC)'] && 
      partido['Goles (Solo SC)'] !== '-' && 
      partido['Goles (Solo SC)'] !== null &&
      partido['Goles (Solo SC)'].trim() !== '') {
    partidosConGoles.push(partido);
  }
});

const preguntas = [];
let id = 1;

// 1. TODOS los clásicos - preguntas sobre resultados y día de la semana
clasicos.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const fechaFormateada = formatFecha(partido);

  // Resultado del clásico
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuál fue el resultado del partido contra ${rival} del ${fechaFormateada}?`,
    answer: partido.Marcador,
    category: "Resultados",
    difficulty: "fácil"
  });

  // Día de la semana
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Qué día de la semana se jugó el partido contra ${rival} del ${fechaFormateada}?`,
    answer: partido['Día de la Semana'],
    category: "Calendario",
    difficulty: "medio"
  });

  // Goles (solo si tiene datos y es 2000+)
  if (partido.Año >= 2000 && 
      partido['Goles (Solo SC)'] && 
      partido['Goles (Solo SC)'] !== '-' && 
      partido['Goles (Solo SC)'] !== null &&
      partido['Goles (Solo SC)'].trim() !== '') {
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Quién anotó los goles de Sporting Cristal en el partido contra ${rival} del ${fechaFormateada}?`,
      answer: partido['Goles (Solo SC)'],
      category: "Goleadores",
      difficulty: "medio"
    });
  }
});

// 2. TODOS los playoffs - preguntas sobre resultados y día de la semana
playoffs.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const fechaFormateada = formatFecha(partido);

  // Resultado
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuál fue el resultado del partido de ${partido.Torneo} contra ${rival} del ${fechaFormateada}?`,
    answer: partido.Marcador,
    category: "Torneos",
    difficulty: "medio"
  });

  // Día de la semana
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Qué día de la semana se jugó el partido de ${partido.Torneo} contra ${rival} del ${fechaFormateada}?`,
    answer: partido['Día de la Semana'],
    category: "Calendario",
    difficulty: "medio"
  });

  // Goles (solo si tiene datos y es 2000+)
  if (partido.Año >= 2000 && 
      partido['Goles (Solo SC)'] && 
      partido['Goles (Solo SC)'] !== '-' && 
      partido['Goles (Solo SC)'] !== null &&
      partido['Goles (Solo SC)'].trim() !== '') {
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Quién anotó los goles de Sporting Cristal en el partido de ${partido.Torneo} contra ${rival} del ${fechaFormateada}?`,
      answer: partido['Goles (Solo SC)'],
      category: "Goleadores",
      difficulty: "difícil"
    });
  }
});

// 3. Partidos con goles importantes (muestreo de 2000+)
const partidosConGolesImportantes = partidosConGoles.filter(p => {
  const rival = p['Equipo Local'] === 'Sporting Cristal' 
    ? p['Equipo Visita'] 
    : p['Equipo Local'];
  return rivalesImportantes.includes(rival) || 
         (p.Torneo && p.Torneo.toLowerCase().includes('libertadores'));
});

// Agregar todos los partidos con goles de clásicos y libertadores
partidosConGolesImportantes.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const fechaFormateada = formatFecha(partido);

  const key = `${partido.Fecha}-${rival}-goles`;
  const existe = preguntas.some(p => 
    p.question.includes(fechaFormateada) && 
    p.question.includes(rival) && 
    p.category === "Goleadores"
  );

  if (!existe) {
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Quién anotó los goles de Sporting Cristal en el partido contra ${rival} del ${fechaFormateada}?`,
      answer: partido['Goles (Solo SC)'],
      category: "Goleadores",
      difficulty: "difícil"
    });
  }
});

// 4. Muestreo de otros partidos importantes (torneos importantes)
const torneosImportantes = ['Copa Libertadores', 'Copa Sudamericana', 'Apertura', 'Clausura'];
const otrosImportantes = otrosPartidos.filter(p => 
  torneosImportantes.some(t => p.Torneo && p.Torneo.includes(t))
);

// Seleccionar muestra representativa (máximo 100)
const muestraOtros = otrosImportantes
  .sort(() => Math.random() - 0.5)
  .slice(0, 100);

muestraOtros.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  const fechaFormateada = formatFecha(partido);

  // Resultado
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuál fue el resultado del partido de ${partido.Torneo} contra ${rival} del ${fechaFormateada}?`,
    answer: partido.Marcador,
    category: "Resultados",
    difficulty: "medio"
  });
});

// Eliminar duplicados exactos
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

console.log(`Generadas ${preguntasUnicas.length} preguntas selectivas y balanceadas\n`);

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

console.log(`\n📊 Estadísticas:`);
console.log(`  Clásicos procesados: ${clasicos.length}`);
console.log(`  Playoffs procesados: ${playoffs.length}`);
console.log(`  Partidos con goles (2000+): ${partidosConGoles.length}`);


// Script para generar preguntas de trivia basadas en partidos específicos del histórico
const fs = require('fs');

const historicoFile = './src/data/historico_completo_sc.json';
const historicoData = JSON.parse(fs.readFileSync(historicoFile, 'utf8'));

// Analizar partidos con datos completos
function analyzeMatches() {
  const partidosConGoles = [];
  const partidosPorRival = {};
  const partidosPorFecha = {};
  const partidosPorTorneo = {};
  const resultadosEspecificos = [];

  historicoData.forEach(partido => {
    const rival = partido['Equipo Local'] === 'Sporting Cristal' 
      ? partido['Equipo Visita'] 
      : partido['Equipo Local'];

    // Partidos con goles registrados (no "-" y no null)
    if (partido['Goles (Solo SC)'] && 
        partido['Goles (Solo SC)'] !== '-' && 
        partido['Goles (Solo SC)'] !== null &&
        partido['Goles (Solo SC)'].trim() !== '') {
      partidosConGoles.push(partido);
    }

    // Agrupar por rival
    if (!partidosPorRival[rival]) {
      partidosPorRival[rival] = [];
    }
    partidosPorRival[rival].push(partido);

    // Agrupar por torneo
    const torneo = partido.Torneo || 'Desconocido';
    if (!partidosPorTorneo[torneo]) {
      partidosPorTorneo[torneo] = [];
    }
    partidosPorTorneo[torneo].push(partido);

    // Resultados específicos
    if (partido.Marcador && partido.Fecha) {
      resultadosEspecificos.push({
        fecha: partido.Fecha,
        rival: rival,
        marcador: partido.Marcador,
        torneo: torneo,
        diaSemana: partido['Día de la Semana'],
        año: partido.Año
      });
    }
  });

  return {
    partidosConGoles,
    partidosPorRival,
    partidosPorTorneo,
    resultadosEspecificos
  };
}

const stats = analyzeMatches();

// Generar preguntas basadas en partidos específicos
const preguntas = [];
let id = 1;

// Función para determinar década
function getDecade(año) {
  if (año >= 1993 && año <= 1999) return '93-99';
  if (año >= 2000 && año <= 2010) return '00-10';
  if (año >= 2011 && año <= 2020) return '11-20';
  if (año >= 2021) return '21-25';
  return '93-25';
}

// Preguntas sobre goles de partidos específicos (solo si tienen datos completos)
stats.partidosConGoles.forEach(partido => {
  const rival = partido['Equipo Local'] === 'Sporting Cristal' 
    ? partido['Equipo Visita'] 
    : partido['Equipo Local'];
  const década = getDecade(partido.Año);
  
  // Solo hacer preguntas de goles si NO es de los 90s (1993-1999) porque los datos no están completos
  if (partido.Año >= 2000) {
    const fechaFormateada = `${partido.Dia} de ${partido.Mes} de ${partido.Año}`;
    
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

// Preguntas sobre día de la semana de partidos específicos
stats.resultadosEspecificos.forEach(resultado => {
  const década = getDecade(resultado.año);
  const fechaFormateada = resultado.fecha.split('-');
  const dia = parseInt(fechaFormateada[2]);
  const mes = resultado.fecha.split('-')[1];
  const año = resultado.año;
  
  // Mapear mes a nombre
  const meses = {
    '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril',
    '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto',
    '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre'
  };
  
  const mesNombre = meses[mes] || mes;
  const fechaCompleta = `${dia} de ${mesNombre} de ${año}`;
  
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Qué día de la semana se jugó el partido contra ${resultado.rival} del ${fechaCompleta}?`,
    answer: resultado.diaSemana,
    category: "Calendario",
    difficulty: "medio"
  });
});

// Preguntas sobre resultados de partidos específicos
const partidosImportantes = stats.resultadosEspecificos.filter(p => {
  // Filtrar partidos importantes (clásicos, finales, etc.)
  const esClasico = p.rival === 'Alianza Lima' || p.rival === 'Universitario' || p.rival === 'Universitario de Deportes';
  const esPlayoff = p.torneo.toLowerCase().includes('playoff') || p.torneo.toLowerCase().includes('final');
  return esClasico || esPlayoff;
});

partidosImportantes.forEach(resultado => {
  const década = getDecade(resultado.año);
  const fechaFormateada = resultado.fecha.split('-');
  const dia = parseInt(fechaFormateada[2]);
  const mes = resultado.fecha.split('-')[1];
  const año = resultado.año;
  
  const meses = {
    '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril',
    '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto',
    '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre'
  };
  
  const mesNombre = meses[mes] || mes;
  const fechaCompleta = `${dia} de ${mesNombre} de ${año}`;
  
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuál fue el resultado del partido contra ${resultado.rival} del ${fechaCompleta}?`,
    answer: resultado.marcador,
    category: "Resultados",
    difficulty: "medio"
  });
});

// Preguntas sobre resultados de partidos por fecha específica
const partidosPorFechaAgrupados = {};
stats.resultadosEspecificos.forEach(resultado => {
  const key = `${resultado.año}-${resultado.fecha.split('-')[1]}-${resultado.fecha.split('-')[2]}`;
  if (!partidosPorFechaAgrupados[key]) {
    partidosPorFechaAgrupados[key] = [];
  }
  partidosPorFechaAgrupados[key].push(resultado);
});

// Seleccionar algunas fechas con múltiples partidos o partidos importantes
Object.entries(partidosPorFechaAgrupados).forEach(([fechaKey, partidos]) => {
  if (partidos.length > 0) {
    const partido = partidos[0];
    const década = getDecade(partido.año);
    const fechaParts = fechaKey.split('-');
    const dia = parseInt(fechaParts[2]);
    const mes = fechaParts[1];
    const año = partido.año;
    
    const meses = {
      '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril',
      '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto',
      '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre'
    };
    
    const mesNombre = meses[mes] || mes;
    const fechaCompleta = `${dia} de ${mesNombre} de ${año}`;
    
    // Pregunta sobre resultado de un partido específico
    preguntas.push({
      id: id++,
      decade: década,
      question: `¿Cuál fue el resultado del partido contra ${partido.rival} del ${fechaCompleta}?`,
      answer: partido.marcador,
      category: "Resultados",
      difficulty: "medio"
    });
  }
});

// Preguntas sobre partidos de torneos específicos
Object.entries(stats.partidosPorTorneo).forEach(([torneo, partidos]) => {
  if (partidos.length > 0) {
    // Seleccionar algunos partidos representativos
    const partidosSeleccionados = partidos.slice(0, Math.min(5, partidos.length));
    
    partidosSeleccionados.forEach(partido => {
      const rival = partido['Equipo Local'] === 'Sporting Cristal' 
        ? partido['Equipo Visita'] 
        : partido['Equipo Local'];
      const década = getDecade(partido.Año);
      const fechaFormateada = `${partido.Dia} de ${partido.Mes} de ${partido.Año}`;
      
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

// Preguntas sobre partidos contra rivales específicos
Object.entries(stats.partidosPorRival).forEach(([rival, partidos]) => {
  if (partidos.length >= 5) {
    // Seleccionar algunos partidos representativos
    const partidosSeleccionados = partidos.slice(0, Math.min(10, partidos.length));
    
    partidosSeleccionados.forEach(partido => {
      const década = getDecade(partido.Año);
      const fechaFormateada = `${partido.Dia} de ${partido.Mes} de ${partido.Año}`;
      
      // Pregunta sobre día de la semana
      preguntas.push({
        id: id++,
        decade: década,
        question: `¿Qué día de la semana se jugó el partido contra ${rival} del ${fechaFormateada}?`,
        answer: partido['Día de la Semana'],
        category: "Calendario",
        difficulty: "medio"
      });
      
      // Pregunta sobre resultado
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

// Eliminar duplicados (misma pregunta y respuesta)
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

console.log(`Generadas ${preguntasUnicas.length} preguntas basadas en partidos específicos\n`);

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


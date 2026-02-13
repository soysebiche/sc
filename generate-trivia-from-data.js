// Script para generar preguntas de trivia basadas en datos reales del histórico
const fs = require('fs');

const historicoFile = './src/data/historico_completo_sc.json';
const historicoData = JSON.parse(fs.readFileSync(historicoFile, 'utf8'));

// Analizar datos
function analyzeData() {
  const stats = {
    goleadores: {},
    rivales: {},
    torneos: {},
    marcadores: {},
    resultados: { V: 0, E: 0, D: 0 },
    partidosPorAño: {},
    partidosPorDécada: {},
    goleadas: [],
    derrotas: []
  };

  historicoData.forEach(partido => {
    const año = partido.Año;
    let década = 'otro';
    if (año >= 1993 && año <= 1999) década = '93-99';
    else if (año >= 2000 && año <= 2010) década = '00-10';
    else if (año >= 2011 && año <= 2020) década = '11-20';
    else if (año >= 2021) década = '21-25';

    // Partidos por año
    stats.partidosPorAño[año] = (stats.partidosPorAño[año] || 0) + 1;
    stats.partidosPorDécada[década] = (stats.partidosPorDécada[década] || 0) + 1;

    // Resultados
    if (partido.Resultado) {
      stats.resultados[partido.Resultado] = (stats.resultados[partido.Resultado] || 0) + 1;
    }

    // Rivales
    const rival = partido['Equipo Local'] === 'Sporting Cristal' 
      ? partido['Equipo Visita'] 
      : partido['Equipo Local'];
    stats.rivales[rival] = (stats.rivales[rival] || 0) + 1;

    // Torneos
    const torneo = partido.Torneo || 'Desconocido';
    stats.torneos[torneo] = (stats.torneos[torneo] || 0) + 1;

    // Marcadores
    if (partido.Marcador) {
      stats.marcadores[partido.Marcador] = (stats.marcadores[partido.Marcador] || 0) + 1;
    }

    // Goleadores
    if (partido['Goles (Solo SC)'] && partido['Goles (Solo SC)'] !== '-') {
      const goles = partido['Goles (Solo SC)'];
      const regex = /([^(]+?)\s*\(/g;
      let resultado;
      while ((resultado = regex.exec(goles)) !== null) {
        const nombre = resultado[1].trim();
        if (nombre && nombre.length > 1) {
          stats.goleadores[nombre] = (stats.goleadores[nombre] || 0) + 1;
        }
      }
    }

    // Goleadas y derrotas
    if (partido.Marcador) {
      const partes = partido.Marcador.split('-');
      if (partes.length === 2) {
        const local = parseInt(partes[0]);
        const visita = parseInt(partes[1]);
        if (!isNaN(local) && !isNaN(visita)) {
          if (partido['Equipo Local'] === 'Sporting Cristal') {
            if (local - visita >= 4) {
              stats.goleadas.push({ rival: rival, marcador: partido.Marcador, fecha: partido.Fecha });
            }
            if (visita - local >= 4) {
              stats.derrotas.push({ rival: rival, marcador: partido.Marcador, fecha: partido.Fecha });
            }
          } else {
            if (visita - local >= 4) {
              stats.goleadas.push({ rival: rival, marcador: partido.Marcador, fecha: partido.Fecha });
            }
            if (local - visita >= 4) {
              stats.derrotas.push({ rival: rival, marcador: partido.Marcador, fecha: partido.Fecha });
            }
          }
        }
      }
    }
  });

  return stats;
}

const stats = analyzeData();

// Generar preguntas basadas en datos reales
const preguntas = [];
let id = 1;

// Preguntas sobre goleadores (1993-2025)
const topGoleadores = Object.entries(stats.goleadores)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

if (topGoleadores.length > 0) {
  preguntas.push({
    id: id++,
    decade: "93-25",
    question: "¿Qué jugador tiene más goles registrados en el histórico de Sporting Cristal?",
    answer: topGoleadores[0][0],
    category: "Goleadores",
    difficulty: "fácil"
  });

  topGoleadores.slice(0, 3).forEach(([jugador, goles]) => {
    preguntas.push({
      id: id++,
      decade: "93-25",
      question: `¿Cuántos goles tiene registrados ${jugador} en el histórico?`,
      answer: `${goles} goles`,
      category: "Goleadores",
      difficulty: "medio"
    });
  });
}

// Preguntas sobre rivales
const topRivales = Object.entries(stats.rivales)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

if (topRivales.length > 0) {
  preguntas.push({
    id: id++,
    decade: "93-25",
    question: "¿Contra qué equipo ha jugado más partidos Sporting Cristal?",
    answer: topRivales[0][0],
    category: "Rivales",
    difficulty: "fácil"
  });

  topRivales.forEach(([rival, partidos]) => {
    preguntas.push({
      id: id++,
      decade: "93-25",
      question: `¿Cuántos partidos ha jugado Sporting Cristal contra ${rival}?`,
      answer: `${partidos} partidos`,
      category: "Rivales",
      difficulty: "medio"
    });
  });
}

// Preguntas sobre resultados totales
preguntas.push({
  id: id++,
  decade: "93-25",
  question: "¿Cuántas victorias tiene Sporting Cristal en el histórico completo?",
  answer: `${stats.resultados.V} victorias`,
  category: "Estadísticas",
  difficulty: "fácil"
});

preguntas.push({
  id: id++,
  decade: "93-25",
  question: "¿Cuántos empates tiene Sporting Cristal en el histórico completo?",
  answer: `${stats.resultados.E} empates`,
  category: "Estadísticas",
  difficulty: "fácil"
});

preguntas.push({
  id: id++,
  decade: "93-25",
  question: "¿Cuántas derrotas tiene Sporting Cristal en el histórico completo?",
  answer: `${stats.resultados.D} derrotas`,
  category: "Estadísticas",
  difficulty: "fácil"
});

// Preguntas por década
Object.entries(stats.partidosPorDécada).forEach(([década, partidos]) => {
  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuántos partidos jugó Sporting Cristal en la década ${década}?`,
    answer: `${partidos} partidos`,
    category: "Estadísticas",
    difficulty: "medio"
  });
});

// Preguntas sobre años específicos
const añosConMasPartidos = Object.entries(stats.partidosPorAño)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

añosConMasPartidos.forEach(([año, partidos]) => {
  let década = '93-25';
  if (año >= 1993 && año <= 1999) década = '93-99';
  else if (año >= 2000 && año <= 2010) década = '00-10';
  else if (año >= 2011 && año <= 2020) década = '11-20';
  else if (año >= 2021) década = '21-25';

  preguntas.push({
    id: id++,
    decade: década,
    question: `¿Cuántos partidos jugó Sporting Cristal en ${año}?`,
    answer: `${partidos} partidos`,
    category: "Estadísticas",
    difficulty: "medio"
  });
});

// Preguntas sobre torneos
const topTorneos = Object.entries(stats.torneos)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

topTorneos.forEach(([torneo, partidos]) => {
  preguntas.push({
    id: id++,
    decade: "93-25",
    question: `¿En cuántos partidos de ${torneo} ha participado Sporting Cristal?`,
    answer: `${partidos} partidos`,
    category: "Torneos",
    difficulty: "medio"
  });
});

// Preguntas sobre goleadas
if (stats.goleadas.length > 0) {
  const mayorGoleada = stats.goleadas.sort((a, b) => {
    const partesA = a.marcador.split('-');
    const partesB = b.marcador.split('-');
    const diffA = Math.abs(parseInt(partesA[0]) - parseInt(partesA[1]));
    const diffB = Math.abs(parseInt(partesB[0]) - parseInt(partesB[1]));
    return diffB - diffA;
  })[0];
  
  preguntas.push({
    id: id++,
    decade: "93-25",
    question: "¿Cuál fue una de las mayores goleadas de Sporting Cristal?",
    answer: `${mayorGoleada.marcador} contra ${mayorGoleada.rival}`,
    category: "Resultados",
    difficulty: "difícil"
  });
}

// Preguntas específicas de 1993-1999
const partidos1993_1999 = historicoData.filter(m => m.Año >= 1993 && m.Año <= 1999);
const victorias1993_1999 = partidos1993_1999.filter(m => m.Resultado === 'V').length;
const empates1993_1999 = partidos1993_1999.filter(m => m.Resultado === 'E').length;
const derrotas1993_1999 = partidos1993_1999.filter(m => m.Resultado === 'D').length;

preguntas.push({
  id: id++,
  decade: "93-99",
  question: "¿Cuántos partidos jugó Sporting Cristal entre 1993 y 1999?",
  answer: `${partidos1993_1999.length} partidos`,
  category: "Estadísticas",
  difficulty: "fácil"
});

preguntas.push({
  id: id++,
  decade: "93-99",
  question: "¿Cuántas victorias tuvo Sporting Cristal entre 1993 y 1999?",
  answer: `${victorias1993_1999} victorias`,
  category: "Estadísticas",
  difficulty: "medio"
});

preguntas.push({
  id: id++,
  decade: "93-99",
  question: "¿Cuántos empates tuvo Sporting Cristal entre 1993 y 1999?",
  answer: `${empates1993_1999} empates`,
  category: "Estadísticas",
  difficulty: "medio"
});

preguntas.push({
  id: id++,
  decade: "93-99",
  question: "¿Cuántas derrotas tuvo Sporting Cristal entre 1993 y 1999?",
  answer: `${derrotas1993_1999} derrotas`,
  category: "Estadísticas",
  difficulty: "medio"
});

// Pregunta sobre año con más partidos en 1993-1999
const partidosPorAño1993_1999 = partidos1993_1999.reduce((acc, m) => {
  acc[m.Año] = (acc[m.Año] || 0) + 1;
  return acc;
}, {});

const añoConMasPartidos = Object.entries(partidosPorAño1993_1999)
  .sort((a, b) => b[1] - a[1])[0];

if (añoConMasPartidos) {
  preguntas.push({
    id: id++,
    decade: "93-99",
    question: "¿En qué año de la década 1993-1999 jugó más partidos Sporting Cristal?",
    answer: añoConMasPartidos[0],
    category: "Estadísticas",
    difficulty: "medio"
  });
}

// Preguntas sobre años específicos de 1993-1999
const años1993_1999 = [1993, 1994, 1995, 1996, 1997, 1998, 1999];
años1993_1999.forEach(año => {
  const partidosAño = partidos1993_1999.filter(m => m.Año === año);
  if (partidosAño.length > 0) {
    const victorias = partidosAño.filter(m => m.Resultado === 'V').length;
    const empates = partidosAño.filter(m => m.Resultado === 'E').length;
    const derrotas = partidosAño.filter(m => m.Resultado === 'D').length;
    
    preguntas.push({
      id: id++,
      decade: "93-99",
      question: `¿Cuántas victorias tuvo Sporting Cristal en ${año}?`,
      answer: `${victorias} victorias`,
      category: "Estadísticas",
      difficulty: "medio"
    });

    preguntas.push({
      id: id++,
      decade: "93-99",
      question: `¿Cuántos partidos jugó Sporting Cristal en ${año}?`,
      answer: `${partidosAño.length} partidos`,
      category: "Estadísticas",
      difficulty: "medio"
    });
  }
});

// Preguntas sobre torneos de 1993-1999
const torneos1993_1999 = partidos1993_1999.reduce((acc, m) => {
  const torneo = m.Torneo || 'Desconocido';
  acc[torneo] = (acc[torneo] || 0) + 1;
  return acc;
}, {});

Object.entries(torneos1993_1999).forEach(([torneo, cantidad]) => {
  preguntas.push({
    id: id++,
    decade: "93-99",
    question: `¿En cuántos partidos de ${torneo} participó Sporting Cristal entre 1993 y 1999?`,
    answer: `${cantidad} partidos`,
    category: "Torneos",
    difficulty: "medio"
  });
});

// Preguntas sobre rivales más frecuentes en 1993-1999
const rivales1993_1999 = partidos1993_1999.reduce((acc, m) => {
  const rival = m['Equipo Local'] === 'Sporting Cristal' 
    ? m['Equipo Visita'] 
    : m['Equipo Local'];
  acc[rival] = (acc[rival] || 0) + 1;
  return acc;
}, {});

const topRivales1993_1999 = Object.entries(rivales1993_1999)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

topRivales1993_1999.forEach(([rival, partidos]) => {
  preguntas.push({
    id: id++,
    decade: "93-99",
    question: `¿Cuántos partidos jugó Sporting Cristal contra ${rival} entre 1993 y 1999?`,
    answer: `${partidos} partidos`,
    category: "Rivales",
    difficulty: "medio"
  });
});

console.log(`Generadas ${preguntas.length} preguntas basadas en datos reales\n`);

// Guardar en archivo
fs.writeFileSync('./trivia-questions-generated.json', JSON.stringify(preguntas, null, 2), 'utf8');
console.log('✅ Preguntas guardadas en trivia-questions-generated.json');
console.log(`\nResumen por década:`);
Object.entries(preguntas.reduce((acc, p) => {
  acc[p.decade] = (acc[p.decade] || 0) + 1;
  return acc;
}, {})).forEach(([década, cantidad]) => {
  console.log(`  ${década}: ${cantidad} preguntas`);
});

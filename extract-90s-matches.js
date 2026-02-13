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

// Función para convertir mes en inglés a número
function monthToNumber(monthStr) {
  const months = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };
  return months[monthStr] || 0;
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

// Función para normalizar nombre de equipo
function normalizeTeamName(name) {
  if (!name) return name;
  
  // Normalizaciones básicas
  let normalized = name.trim();
  
  // Normalizar "Dep." a "Deportivo"
  if (normalized.startsWith('Dep. ')) {
    normalized = normalized.replace(/^Dep\. /, 'Deportivo ');
  }
  
  // Normalizaciones comunes
  const normalizations = {
    'Alianza Atletico': 'Alianza Atlético',
    'Alianza Atletico Sullana': 'Alianza Atlético',
    'Union Minas': 'Unión Minas',
    'Union Huaral': 'Unión Huaral',
    'Leon de Huanuco': 'León de Huánuco',
    'C.N.I.': 'C.N.I.',
    'CNI': 'C.N.I.',
    'U.T.C.': 'U.T.C.',
    'Dep. Municipal': 'Centro Deportivo Municipal',
    'Deportivo Municipal': 'Centro Deportivo Municipal',
    'Dep. San Agustin': 'Deportivo San Agustín',
    'Dep. Yurimaguas': 'Deportivo Yurimaguas',
    'Dep. Sipesa': 'Deportivo Sipesa',
    'Carlos A. Manucci': 'Carlos A. Mannucci',
    'Carlos A. Mannucci': 'Carlos A. Mannucci',
    'Defensor Lima': 'Defensor Lima',
    'Colegio Nac. de Iquitos': 'C.N.I.',
    'Univ.Técnica de Cajamarca': 'U.T.C.',
    'Universitario': 'Universitario',
    'Alianza Lima': 'Alianza Lima',
    'FBC Melgar': 'FBC Melgar',
    'Melgar': 'FBC Melgar',
    'Sport Boys': 'Sport Boys',
    'Cienciano': 'Cienciano',
    'Sporting Cristal': 'Sporting Cristal'
  };
  
  return normalizations[normalized] || normalized;
}

// Función para parsear fecha desde formato "Round X [Month Day,Day]"
function parseRoundDate(roundLine, year) {
  // Formato: "Round 1 [Apr 11,12]" o "Round 1 [Apr 11]"
  const match = roundLine.match(/Round\s+\d+\s+\[(\w+)\s+(\d+)(?:,(\d+))?\]/);
  if (!match) return null;
  
  const monthStr = match[1];
  const day1 = parseInt(match[2]);
  const day2 = match[3] ? parseInt(match[3]) : null;
  
  const month = monthToNumber(monthStr);
  if (!month) return null;
  
  // Si hay dos días, usar el primero (o podríamos crear dos partidos)
  const day = day1;
  
  return {
    fecha: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    month,
    day
  };
}

// Función para parsear un partido
function parseMatch(matchLine, year, roundNum, torneo) {
  // Formato: "Equipo Local\tMarcador\tEquipo Visita"
  // Ejemplo: "Sporting Cristal	1-0	Carlos A. Manucci"
  
  // Separar por tabs
  const parts = matchLine.split(/\t+/);
  if (parts.length < 3) {
    // Intentar con espacios múltiples
    const parts2 = matchLine.split(/\s{2,}/);
    if (parts2.length >= 3) {
      const equipoLocal = parts2[0].trim();
      const marcador = parts2[1].trim();
      const equipoVisita = parts2[2].trim();
      
      // Solo procesar si Sporting Cristal está involucrado
      if (equipoLocal !== 'Sporting Cristal' && equipoVisita !== 'Sporting Cristal') {
        return null;
      }
      
      return {
        equipoLocal: normalizeTeamName(equipoLocal),
        equipoVisita: normalizeTeamName(equipoVisita),
        marcador
      };
    }
    return null;
  }
  
  const equipoLocal = parts[0].trim();
  const marcador = parts[1].trim();
  const equipoVisita = parts[2].trim();
  
  // Solo procesar si Sporting Cristal está involucrado
  if (equipoLocal !== 'Sporting Cristal' && equipoVisita !== 'Sporting Cristal') {
    return null;
  }
  
  return {
    equipoLocal: normalizeTeamName(equipoLocal),
    equipoVisita: normalizeTeamName(equipoVisita),
    marcador
  };
}

// Función principal
function extractMatches() {
  console.log('📅 Extrayendo partidos de Sporting Cristal de los años 90...\n');
  
  const content = fs.readFileSync('./90s.html', 'utf8');
  const lines = content.split('\n');
  
  const allMatches = [];
  let currentYear = null;
  let currentTorneo = 'Descentralizado';
  let currentRound = null;
  let currentRoundNum = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detectar año
    const yearMatch = line.match(/^Peru\s+(\d{4})/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      currentTorneo = 'Descentralizado';
      console.log(`📆 Procesando año ${currentYear}...`);
      continue;
    }
    
    // Detectar cambio de torneo
    if (line.includes('Copa Libertadores') || (line.includes('Libertadores') && !line.includes('Liguilla'))) {
      currentTorneo = 'Copa Libertadores';
    } else if (line.includes('Sudamericana')) {
      currentTorneo = 'Copa Sudamericana';
    } else if (line.includes('Liguilla')) {
      if (line.includes('Libertadores') || line.includes('Pre-Libertadores')) {
        currentTorneo = 'Liguilla Pre-Libertadores';
      } else {
        currentTorneo = 'Liguilla';
      }
    } else if (line.includes('Playoff')) {
      currentTorneo = line.includes('Libertadores') ? 'Playoff Libertadores' : 'Playoff';
    } else if (line.includes('Descentralizado') || line.includes('Campeonato')) {
      currentTorneo = 'Descentralizado';
    } else if (line.match(/^Peru\s+\d{4}/)) {
      // Al cambiar de año, resetear a Descentralizado
      currentTorneo = 'Descentralizado';
    }
    
    // Detectar round
    const roundMatch = line.match(/Round\s+(\d+)\s+\[(\w+)\s+(\d+)(?:,(\d+))?\]/);
    if (roundMatch) {
      currentRoundNum = parseInt(roundMatch[1]);
      const monthStr = roundMatch[2];
      const day1 = parseInt(roundMatch[3]);
      const day2 = roundMatch[4] ? parseInt(roundMatch[4]) : null;
      
      const month = monthToNumber(monthStr);
      if (month && currentYear) {
        // Usar el primer día si hay dos
        const day = day1;
        currentRound = {
          fecha: `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          month,
          day,
          roundNum: currentRoundNum,
          day2: day2
        };
      }
      continue;
    }
    
    // Parsear partido (solo si hay un round activo y la línea contiene Sporting Cristal)
    if (currentYear && currentRound && line.trim() && line.includes('Sporting Cristal')) {
      const match = parseMatch(line, currentYear, currentRoundNum, currentTorneo);
      if (match) {
        // Si hay dos días en el round, necesitamos determinar cuál usar
        // Por ahora usamos el primer día, pero podríamos distribuir los partidos
        let fecha = currentRound.fecha;
        
        // Si hay dos días, podríamos usar el segundo día para algunos partidos
        // Por simplicidad, usaremos el primer día para todos
        const fechaObj = new Date(fecha);
        
        allMatches.push({
          Fecha: fecha,
          Torneo: currentTorneo,
          "Número de Fecha": currentRoundNum.toString(),
          "Equipo Local": match.equipoLocal,
          "Equipo Visita": match.equipoVisita,
          Marcador: match.marcador,
          "Goles (Solo SC)": "-" // No hay información de goles en el archivo
        });
      }
    }
  }
  
  console.log(`\n📊 Total de partidos extraídos: ${allMatches.length}\n`);
  
  // Agrupar por año para mostrar estadísticas
  const byYear = {};
  allMatches.forEach(m => {
    const year = new Date(m.Fecha).getFullYear();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(m);
  });
  
  console.log('📈 Partidos por año:');
  Object.keys(byYear).sort().forEach(year => {
    console.log(`   ${year}: ${byYear[year].length} partidos`);
  });
  
  // Guardar en archivo temporal
  fs.writeFileSync('matches-90s.json', JSON.stringify(allMatches, null, 2));
  console.log('\n✅ Archivo matches-90s.json creado');
  console.log('💡 Revisa el archivo y luego ejecuta el script de agregar datos');
  
  return allMatches;
}

// Ejecutar
extractMatches();


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
    if (visita > local) return 'V';
    if (visita < local) return 'D';
    return 'E';
  }
}

// Función para normalizar nombre de equipo
function normalizeTeamName(name) {
  if (!name) return name;
  
  let normalized = name.trim();
  
  // Normalizar "Dep." a "Deportivo"
  if (normalized.startsWith('Dep. ')) {
    normalized = normalized.replace(/^Dep\. /, 'Deportivo ');
  }
  
  // Normalizaciones específicas
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
    'Deportivo Sipesa': 'Deportivo Sipesa',
    'Ovacion Sipesa': 'Deportivo Sipesa',
    'Carlos A. Manucci': 'Carlos A. Mannucci',
    'Carlos A. Mannucci': 'Carlos A. Mannucci',
    'Defensor Lima': 'Defensor Lima',
    'Colegio Nac. de Iquitos': 'C.N.I.',
    'Univ.Técnica de Cajamarca': 'U.T.C.',
    'Melgar FBC': 'FBC Melgar',
    'Melgar': 'FBC Melgar'
  };
  
  return normalizations[normalized] || normalized;
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
    "Torneo": data.Torneo || 'Descentralizado',
    "Número de Fecha": data['Número de Fecha'] || '1',
    "Equipo Local": data['Equipo Local'],
    "Equipo Visita": data['Equipo Visita'],
    "Marcador": data.Marcador,
    "Resultado": getResultado(data.Marcador, data['Equipo Local']),
    "Goles (Solo SC)": data['Goles (Solo SC)'] || '-'
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
  let currentRoundDate = null;
  let currentRoundNum = 0;
  let matchIndexInRound = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detectar año
    const yearMatch = trimmed.match(/^Peru\s+(\d{4})/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      currentTorneo = 'Descentralizado';
      currentRoundDate = null;
      currentRoundNum = 0;
      matchIndexInRound = 0;
      console.log(`📆 Procesando año ${currentYear}...`);
      continue;
    }
    
    // Detectar cambio de torneo
    if (trimmed.includes('Copa Libertadores') && !trimmed.includes('Liguilla')) {
      currentTorneo = 'Copa Libertadores';
    } else if (trimmed.includes('Liguilla')) {
      if (trimmed.includes('Pre-Libertadores') || trimmed.includes('Libertadores')) {
        currentTorneo = 'Liguilla Pre-Libertadores';
      } else {
        currentTorneo = 'Liguilla';
      }
    } else if (trimmed.includes('Playoff')) {
      currentTorneo = trimmed.includes('Libertadores') ? 'Playoff Libertadores' : 'Playoff';
    } else if (trimmed.includes('Descentralizado') || trimmed.includes('Campeonato')) {
      currentTorneo = 'Descentralizado';
    }
    
    // Detectar round - formato: "Round X [Month Day,Day]" o "Round X [Month Day]"
    const roundMatch = trimmed.match(/Round\s+(\d+)\s+\[(\w+)\s+(\d+)(?:,(\d+))?\]/);
    if (roundMatch) {
      currentRoundNum = parseInt(roundMatch[1]);
      const monthStr = roundMatch[2];
      const day1 = parseInt(roundMatch[3]);
      const day2 = roundMatch[4] ? parseInt(roundMatch[4]) : null;
      
      const month = monthToNumber(monthStr);
      if (month && currentYear) {
        // Usar el primer día por defecto
        const day = day1;
        currentRoundDate = {
          fecha: `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          day2: day2,
          month: month,
          day: day
        };
        matchIndexInRound = 0;
      }
      continue;
    }
    
    // Parsear partido - buscar líneas que contengan "Sporting Cristal" y un marcador
    if (currentYear && trimmed.includes('Sporting Cristal')) {
      // Buscar marcador en formato X-Y
      const marcadorMatch = trimmed.match(/(\d+-\d+)/);
      if (marcadorMatch && currentRoundDate) {
        const marcador = marcadorMatch[1];
        
        // Dividir la línea en partes (usar tabs o espacios múltiples)
        let parts = trimmed.split(/\t+/);
        if (parts.length < 3) {
          parts = trimmed.split(/\s{2,}/);
        }
        
        // Si aún no funciona, dividir alrededor del marcador
        if (parts.length < 3) {
          const marcadorPos = trimmed.indexOf(marcador);
          const antes = trimmed.substring(0, marcadorPos).trim();
          const despues = trimmed.substring(marcadorPos + marcador.length).trim();
          parts = [antes, marcador, despues];
        }
        
        if (parts.length >= 3) {
          let equipoLocal = parts[0].trim();
          let equipoVisita = parts[2].trim();
          
          // Determinar fecha (si hay dos días, usar el segundo para partidos pares)
          let fecha = currentRoundDate.fecha;
          if (currentRoundDate.day2 && matchIndexInRound > 0 && matchIndexInRound % 2 === 1) {
            fecha = `${currentYear}-${String(currentRoundDate.month).padStart(2, '0')}-${String(currentRoundDate.day2).padStart(2, '0')}`;
          }
          
          // Normalizar nombres
          equipoLocal = normalizeTeamName(equipoLocal);
          equipoVisita = normalizeTeamName(equipoVisita);
          
          allMatches.push(createMatch({
            Fecha: fecha,
            Torneo: currentTorneo,
            "Número de Fecha": currentRoundNum.toString(),
            "Equipo Local": equipoLocal,
            "Equipo Visita": equipoVisita,
            Marcador: marcador,
            "Goles (Solo SC)": "-"
          }));
          
          matchIndexInRound++;
        }
      }
    }
  }
  
  console.log(`\n📊 Total de partidos extraídos: ${allMatches.length}\n`);
  
  // Estadísticas por año
  const byYear = {};
  allMatches.forEach(m => {
    if (!byYear[m.Año]) byYear[m.Año] = [];
    byYear[m.Año].push(m);
  });
  
  console.log('📈 Partidos por año:');
  Object.keys(byYear).sort().forEach(year => {
    console.log(`   ${year}: ${byYear[year].length} partidos`);
  });
  
  // Estadísticas por torneo
  const byTorneo = {};
  allMatches.forEach(m => {
    if (!byTorneo[m.Torneo]) byTorneo[m.Torneo] = [];
    byTorneo[m.Torneo].push(m);
  });
  
  console.log('\n🏆 Partidos por torneo:');
  Object.keys(byTorneo).sort().forEach(torneo => {
    console.log(`   ${torneo}: ${byTorneo[torneo].length} partidos`);
  });
  
  // Guardar
  fs.writeFileSync('matches-90s.json', JSON.stringify(allMatches, null, 4));
  console.log('\n✅ Archivo matches-90s.json creado');
  
  return allMatches;
}

extractMatches();



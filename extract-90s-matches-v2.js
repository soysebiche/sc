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

// Función para crear un objeto de partido en el formato correcto
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
    "Número de Fecha": data['Número de Fecha'] || data.NumeroFecha || '1',
    "Equipo Local": data['Equipo Local'] || data.EquipoLocal,
    "Equipo Visita": data['Equipo Visita'] || data.EquipoVisita,
    "Marcador": data.Marcador,
    "Resultado": data.Resultado || getResultado(data.Marcador, data['Equipo Local'] || data.EquipoLocal),
    "Goles (Solo SC)": data['Goles (Solo SC)'] || data.Goles || '-'
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
  let matchCounter = 0; // Contador para distribuir partidos entre días cuando hay dos
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Detectar año
    const yearMatch = trimmedLine.match(/^Peru\s+(\d{4})/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      currentTorneo = 'Descentralizado';
      currentRound = null;
      currentRoundNum = 0;
      matchCounter = 0;
      console.log(`📆 Procesando año ${currentYear}...`);
      continue;
    }
    
    // Detectar cambio de torneo
    if (trimmedLine.includes('Copa Libertadores') && !trimmedLine.includes('Liguilla')) {
      currentTorneo = 'Copa Libertadores';
    } else if (trimmedLine.includes('Liguilla')) {
      if (trimmedLine.includes('Pre-Libertadores') || trimmedLine.includes('Libertadores')) {
        currentTorneo = 'Liguilla Pre-Libertadores';
      } else {
        currentTorneo = 'Liguilla';
      }
    } else if (trimmedLine.includes('Playoff')) {
      currentTorneo = trimmedLine.includes('Libertadores') ? 'Playoff Libertadores' : 'Playoff';
    } else if (trimmedLine.includes('Descentralizado') || trimmedLine.includes('Campeonato')) {
      currentTorneo = 'Descentralizado';
    }
    
    // Detectar round - formato: "Round X [Month Day,Day]" o "Round X [Month Day]"
    const roundMatch = trimmedLine.match(/Round\s+(\d+)\s+\[(\w+)\s+(\d+)(?:,(\d+))?\]/);
    if (roundMatch) {
      currentRoundNum = parseInt(roundMatch[1]);
      const monthStr = roundMatch[2];
      const day1 = parseInt(roundMatch[3]);
      const day2 = roundMatch[4] ? parseInt(roundMatch[4]) : null;
      
      const month = monthToNumber(monthStr);
      if (month && currentYear) {
        const day = day1;
        currentRound = {
          fecha: `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          month,
          day,
          day2: day2,
          roundNum: currentRoundNum
        };
        matchCounter = 0; // Resetear contador para el nuevo round
      }
      continue;
    }
    
    // Parsear partido - solo si contiene "Sporting Cristal"
    if (currentYear && trimmedLine.includes('Sporting Cristal') && trimmedLine.match(/\d+-\d+/)) {
      // Intentar parsear con tabs primero
      let parts = trimmedLine.split(/\t+/);
      
      // Si no hay tabs, intentar con espacios múltiples
      if (parts.length < 3) {
        parts = trimmedLine.split(/\s{2,}/);
      }
      
      // Si aún no funciona, intentar encontrar el marcador y dividir alrededor
      if (parts.length < 3) {
        const marcadorMatch = trimmedLine.match(/(\d+-\d+)/);
        if (marcadorMatch) {
          const marcador = marcadorMatch[1];
          const marcadorIndex = trimmedLine.indexOf(marcador);
          const equipoLocal = trimmedLine.substring(0, marcadorIndex).trim();
          const equipoVisita = trimmedLine.substring(marcadorIndex + marcador.length).trim();
          parts = [equipoLocal, marcador, equipoVisita];
        }
      }
      
      if (parts.length >= 3) {
        const equipoLocal = normalizeTeamName(parts[0].trim());
        const marcador = parts[1].trim();
        const equipoVisita = normalizeTeamName(parts[2].trim());
        
        // Determinar fecha
        let fecha = null;
        if (currentRound) {
          // Si hay dos días en el round, distribuir los partidos
          if (currentRound.day2 && matchCounter > 0 && matchCounter % 2 === 0) {
            fecha = `${currentYear}-${String(currentRound.month).padStart(2, '0')}-${String(currentRound.day2).padStart(2, '0')}`;
          } else {
            fecha = currentRound.fecha;
          }
          matchCounter++;
        } else {
          // Si no hay round, intentar extraer fecha de la línea o usar una fecha por defecto
          console.log(`⚠️  Partido sin round: ${trimmedLine}`);
          continue;
        }
        
        if (fecha) {
          allMatches.push(createMatch({
            Fecha: fecha,
            Torneo: currentTorneo,
            "Número de Fecha": currentRoundNum.toString(),
            "Equipo Local": equipoLocal,
            "Equipo Visita": equipoVisita,
            Marcador: marcador,
            "Goles (Solo SC)": "-"
          }));
        }
      }
    }
  }
  
  console.log(`\n📊 Total de partidos extraídos: ${allMatches.length}\n`);
  
  // Agrupar por año para mostrar estadísticas
  const byYear = {};
  allMatches.forEach(m => {
    const year = m.Año;
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(m);
  });
  
  console.log('📈 Partidos por año:');
  Object.keys(byYear).sort().forEach(year => {
    console.log(`   ${year}: ${byYear[year].length} partidos`);
  });
  
  // Agrupar por torneo
  const byTorneo = {};
  allMatches.forEach(m => {
    const torneo = m.Torneo;
    if (!byTorneo[torneo]) byTorneo[torneo] = [];
    byTorneo[torneo].push(m);
  });
  
  console.log('\n🏆 Partidos por torneo:');
  Object.keys(byTorneo).sort().forEach(torneo => {
    console.log(`   ${torneo}: ${byTorneo[torneo].length} partidos`);
  });
  
  // Guardar en archivo
  fs.writeFileSync('matches-90s.json', JSON.stringify(allMatches, null, 4));
  console.log('\n✅ Archivo matches-90s.json creado');
  console.log('💡 Revisa el archivo y luego ejecuta el script de agregar datos');
  
  return allMatches;
}

// Ejecutar
extractMatches();



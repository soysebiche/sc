const fs = require('fs');
const path = require('path');

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
  // Manejar fecha "TBD"
  if (data.Fecha === "TBD") {
    return {
      "Año": data.Año || null,
      "Mes": "TBD",
      "Dia": null,
      "Día de la Semana": "TBD",
      "Fecha": "TBD",
      "Torneo": data.Torneo || 'Descentralizado',
      "Número de Fecha": data['Número de Fecha'] || '1',
      "Equipo Local": data['Equipo Local'],
      "Equipo Visita": data['Equipo Visita'],
      "Marcador": data.Marcador,
      "Resultado": getResultado(data.Marcador, data['Equipo Local']),
      "Goles (Solo SC)": data['Goles (Solo SC)'] || '-'
    };
  }
  
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

// Función principal para extraer partidos
function extractMatches() {
  console.log('📅 Extrayendo partidos de Sporting Cristal de los años 90...\n');
  
  if (!fs.existsSync('./90s.html')) {
    console.error('❌ Error: El archivo 90s.html no existe o no está guardado.');
    console.error('💡 Por favor, guarda el archivo 90s.html primero.');
    return [];
  }
  
  const stats = fs.statSync('./90s.html');
  if (stats.size === 0) {
    console.error('❌ Error: El archivo 90s.html está vacío (0 bytes).');
    console.error('💡 Por favor, guarda el archivo 90s.html en tu editor primero.');
    return [];
  }
  
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
    
    // Detectar round con fecha
    const roundMatch = trimmed.match(/Round\s+(\d+)\s+\[(\w+)\s+(\d+)(?:,(\d+))?\]/);
    if (roundMatch) {
      currentRoundNum = parseInt(roundMatch[1]);
      const monthStr = roundMatch[2];
      const day1 = parseInt(roundMatch[3]);
      const day2 = roundMatch[4] ? parseInt(roundMatch[4]) : null;
      
      const month = monthToNumber(monthStr);
      if (month && currentYear) {
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
    
    // Detectar round sin fecha (solo "Round X")
    const roundNoDateMatch = trimmed.match(/^Round\s+(\d+)$/);
    if (roundNoDateMatch && currentYear) {
      currentRoundNum = parseInt(roundNoDateMatch[1]);
      // Usar "TBD" cuando no hay fecha disponible
      currentRoundDate = {
        fecha: "TBD",
        day2: null,
        month: null,
        day: null
      };
      matchIndexInRound = 0;
      continue;
    }
    
    // Parsear partido - buscar "Sporting Cristal" o "Cristal" (sin contexto de otro equipo)
    const isCristalMatch = trimmed.includes('Sporting Cristal') || 
                          (trimmed.includes('Cristal') && !trimmed.includes('Sporting') && 
                           !trimmed.match(/\bCristal\s+(de|del|de la)/)); // Evitar falsos positivos
    
    // Ignorar líneas de tablas de clasificación (empiezan con número y punto, ej: "1.Sporting Cristal")
    if (trimmed.match(/^\d+\.\s/)) {
      continue; // Es una línea de tabla, no un partido
    }
    
    if (currentYear && isCristalMatch) {
      const marcadorMatch = trimmed.match(/(\d+-\d+)/);
      if (marcadorMatch && currentRoundDate && currentRoundNum > 0) {
        const marcador = marcadorMatch[1];
        
        // Validar que el marcador sea razonable (no más de 20 goles por lado)
        const [golesLocal, golesVisita] = marcador.split('-').map(Number);
        if (golesLocal > 20 || golesVisita > 20) {
          continue; // Probablemente es una línea de tabla, no un marcador
        }
        
        // Dividir la línea
        let parts = trimmed.split(/\t+/);
        if (parts.length < 3) {
          parts = trimmed.split(/\s{2,}/);
        }
        
        if (parts.length < 3) {
          const marcadorPos = trimmed.indexOf(marcador);
          const antes = trimmed.substring(0, marcadorPos).trim();
          const despues = trimmed.substring(marcadorPos + marcador.length).trim();
          parts = [antes, marcador, despues];
        }
        
        if (parts.length >= 3) {
          let equipoLocal = parts[0].trim();
          let equipoVisita = parts[2].trim();
          
          // Validar que los equipos tengan nombres razonables (no solo números o muy cortos)
          if (equipoLocal.match(/^\d+$/) || equipoVisita.match(/^\d+$/) || 
              equipoLocal.length < 3 || equipoVisita.length < 3) {
            continue; // No es un partido válido
          }
          
          // Ignorar si el equipo local empieza con número y punto (tabla de clasificación)
          if (equipoLocal.match(/^\d+\./)) {
            continue;
          }
          
          // Determinar fecha
          let fecha = currentRoundDate.fecha;
          if (fecha !== "TBD" && currentRoundDate.day2 && matchIndexInRound > 0 && matchIndexInRound % 2 === 1) {
            fecha = `${currentYear}-${String(currentRoundDate.month).padStart(2, '0')}-${String(currentRoundDate.day2).padStart(2, '0')}`;
          }
          
          // Normalizar nombres
          equipoLocal = normalizeTeamName(equipoLocal);
          equipoVisita = normalizeTeamName(equipoVisita);
          
          // Normalizar "Cristal" a "Sporting Cristal"
          if (equipoLocal === 'Cristal') equipoLocal = 'Sporting Cristal';
          if (equipoVisita === 'Cristal') equipoVisita = 'Sporting Cristal';
          
          allMatches.push(createMatch({
            Fecha: fecha,
            Año: currentYear, // Pasar el año para casos con TBD
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
  
  // Estadísticas
  const byYear = {};
  allMatches.forEach(m => {
    if (!byYear[m.Año]) byYear[m.Año] = [];
    byYear[m.Año].push(m);
  });
  
  console.log('📈 Partidos por año:');
  Object.keys(byYear).sort().forEach(year => {
    console.log(`   ${year}: ${byYear[year].length} partidos`);
  });
  
  const byTorneo = {};
  allMatches.forEach(m => {
    if (!byTorneo[m.Torneo]) byTorneo[m.Torneo] = [];
    byTorneo[m.Torneo].push(m);
  });
  
  console.log('\n🏆 Partidos por torneo:');
  Object.keys(byTorneo).sort().forEach(torneo => {
    console.log(`   ${torneo}: ${byTorneo[torneo].length} partidos`);
  });
  
  return allMatches;
}

// Función para agregar partidos a los archivos JSON
function addMatchesToJSON(newMatches) {
  console.log('\n📝 Agregando partidos a los archivos JSON...\n');
  
  const files = {
    completo: './data/historico_completo_sc.json',
    conmebol: './data/historico_conmebol_sc.json',
    inca: './data/historico_inca_sc.json'
  };
  
  // Separar partidos por tipo
  const partidosCompleto = [];
  const partidosConmebol = [];
  
  newMatches.forEach(match => {
    // Todos van a completo
    partidosCompleto.push(match);
    
    // Solo internacionales van a conmebol
    if (match.Torneo === 'Copa Libertadores' || 
        match.Torneo === 'Copa Sudamericana' ||
        match.Torneo === 'Liguilla Pre-Libertadores' ||
        match.Torneo === 'Playoff Libertadores') {
      partidosConmebol.push(match);
    }
  });
  
  // Agregar a historico_completo_sc.json
  if (fs.existsSync(files.completo)) {
    const completo = JSON.parse(fs.readFileSync(files.completo, 'utf8'));
    const existingDates = new Set(completo.map(m => `${m.Fecha}-${m['Equipo Local']}-${m['Equipo Visita']}`));
    
    let added = 0;
    partidosCompleto.forEach(match => {
      const key = `${match.Fecha}-${match['Equipo Local']}-${match['Equipo Visita']}`;
      if (!existingDates.has(key)) {
        completo.push(match);
        existingDates.add(key);
        added++;
      }
    });
    
    // Ordenar por fecha
    completo.sort((a, b) => {
      if (a.Fecha !== b.Fecha) return a.Fecha.localeCompare(b.Fecha);
      return a.Torneo.localeCompare(b.Torneo);
    });
    
    fs.writeFileSync(files.completo, JSON.stringify(completo, null, 4), 'utf8');
    console.log(`✅ ${added} partidos agregados a historico_completo_sc.json`);
  }
  
  // Agregar a historico_conmebol_sc.json
  if (fs.existsSync(files.conmebol)) {
    const conmebol = JSON.parse(fs.readFileSync(files.conmebol, 'utf8'));
    const existingDates = new Set(conmebol.map(m => `${m.Fecha}-${m['Equipo Local']}-${m['Equipo Visita']}`));
    
    let added = 0;
    partidosConmebol.forEach(match => {
      const key = `${match.Fecha}-${match['Equipo Local']}-${match['Equipo Visita']}`;
      if (!existingDates.has(key)) {
        conmebol.push(match);
        existingDates.add(key);
        added++;
      }
    });
    
    // Ordenar por fecha
    conmebol.sort((a, b) => {
      if (a.Fecha !== b.Fecha) return a.Fecha.localeCompare(b.Fecha);
      return a.Torneo.localeCompare(b.Torneo);
    });
    
    fs.writeFileSync(files.conmebol, JSON.stringify(conmebol, null, 4), 'utf8');
    console.log(`✅ ${added} partidos agregados a historico_conmebol_sc.json`);
  }
  
  console.log('\n✅ Proceso completado!');
}

// Ejecutar
const matches = extractMatches();
if (matches.length > 0) {
  addMatchesToJSON(matches);
} else {
  console.log('\n⚠️  No se encontraron partidos. Verifica que el archivo 90s.html esté guardado y tenga contenido.');
}


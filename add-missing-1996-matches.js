const fs = require('fs');

// Partidos faltantes de 1996 (todos con TBD porque no tienen fecha en el HTML)
const missingMatches = [
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "1",
    "Equipo Local": "Unión Minas",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "0-1",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "2",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Cienciano",
    "Marcador": "6-0",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "3",
    "Equipo Local": "Sport Boys",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "3-1",
    "Resultado": "D",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "11",
    "Equipo Local": "Alianza Atlético",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "1-2",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "12",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "FBC Melgar",
    "Marcador": "3-0",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "14",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Universitario",
    "Marcador": "1-2",
    "Resultado": "D",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "15",
    "Equipo Local": "Alianza Lima",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "0-0",
    "Resultado": "E",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "16",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Unión Minas",
    "Marcador": "7-1",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "17",
    "Equipo Local": "Cienciano",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "3-1",
    "Resultado": "D",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "18",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Sport Boys",
    "Marcador": "0-0",
    "Resultado": "E",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "21",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Aurich-Cañaña",
    "Marcador": "1-2",
    "Resultado": "D",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "26",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Alianza Atlético",
    "Marcador": "4-1",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "27",
    "Equipo Local": "FBC Melgar",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "1-1",
    "Resultado": "E",
    "Goles (Solo SC)": "-"
  },
  {
    "Año": 1996,
    "Mes": "TBD",
    "Dia": null,
    "Día de la Semana": "TBD",
    "Fecha": "TBD",
    "Torneo": "Descentralizado",
    "Número de Fecha": "30",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Alianza Lima",
    "Marcador": "2-1",
    "Resultado": "V",
    "Goles (Solo SC)": "-"
  }
];

// Función para verificar si un partido ya existe
function matchExists(existingMatch, newMatch) {
  return existingMatch.Año === newMatch.Año &&
         existingMatch['Equipo Local'] === newMatch['Equipo Local'] &&
         existingMatch['Equipo Visita'] === newMatch['Equipo Visita'] &&
         existingMatch.Marcador === newMatch.Marcador &&
         existingMatch['Número de Fecha'] === newMatch['Número de Fecha'];
}

// Agregar partidos faltantes
function addMissingMatches() {
  console.log('📝 Agregando partidos faltantes de 1996...\n');
  
  const files = {
    completo: './data/historico_completo_sc.json',
    conmebol: './data/historico_conmebol_sc.json'
  };
  
  for (const [type, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const originalLength = data.length;
    
    // Agregar solo los partidos que no existen
    let added = 0;
    missingMatches.forEach(newMatch => {
      const exists = data.some(existingMatch => matchExists(existingMatch, newMatch));
      if (!exists) {
        data.push(newMatch);
        added++;
      }
    });
    
    // Ordenar por año y fecha
    data.sort((a, b) => {
      if (a.Año !== b.Año) return a.Año - b.Año;
      if (a.Fecha === 'TBD' && b.Fecha !== 'TBD') return 1;
      if (a.Fecha !== 'TBD' && b.Fecha === 'TBD') return -1;
      if (a.Fecha !== 'TBD' && b.Fecha !== 'TBD') {
        return new Date(a.Fecha) - new Date(b.Fecha);
      }
      return parseInt(a['Número de Fecha']) - parseInt(b['Número de Fecha']);
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`✅ ${type}: ${originalLength} → ${data.length} partidos (+${added})`);
  }
  
  console.log('\n✅ Partidos faltantes agregados correctamente');
}

addMissingMatches();


// Script para agregar partidos de 1993-1999 al archivo histórico
const fs = require('fs');

// Leer archivo matches-1992.json
const matchesFile = './matches-1992.json';
const historicoFile = './data/historico_completo_sc.json';

console.log('📖 Leyendo archivos...\n');

const matchesData = JSON.parse(fs.readFileSync(matchesFile, 'utf8'));
const historicoData = JSON.parse(fs.readFileSync(historicoFile, 'utf8'));

// Filtrar partidos de 1993-1999
const matches1993_1999 = matchesData.filter(m => m.Año >= 1993 && m.Año <= 1999);

console.log(`Partidos encontrados (1993-1999): ${matches1993_1999.length}`);

// Remover campos "Condicion" y "Estadio" para que coincida con el formato del histórico
const matchesFormatted = matches1993_1999.map(match => {
  const { Condicion, Estadio, ...rest } = match;
  return rest;
});

// Verificar si ya existen partidos de estos años en el histórico
const existingYears = historicoData.filter(m => m.Año >= 1993 && m.Año <= 1999);
if (existingYears.length > 0) {
  console.log(`⚠️  Ya existen ${existingYears.length} partidos de 1993-1999 en el histórico.`);
  console.log('Verificando si faltan algunos...\n');
  
  // Verificar cada partido nuevo
  const nuevosPartidos = matchesFormatted.filter(nuevo => {
    return !historicoData.some(existente => 
      existente.Año === nuevo.Año &&
      existente.Fecha === nuevo.Fecha &&
      existente['Equipo Local'] === nuevo['Equipo Local'] &&
      existente['Equipo Visita'] === nuevo['Equipo Visita']
    );
  });
  
  if (nuevosPartidos.length > 0) {
    console.log(`Agregando ${nuevosPartidos.length} partidos faltantes...`);
    // Insertar al inicio (antes de 2000)
    const partidos2000EnAdelante = historicoData.filter(m => m.Año >= 2000);
    historicoData.length = 0;
    historicoData.push(...nuevosPartidos, ...partidos2000EnAdelante);
  } else {
    console.log('✅ Todos los partidos de 1993-1999 ya están en el histórico.');
    process.exit(0);
  }
} else {
  console.log(`Agregando ${matchesFormatted.length} partidos de 1993-1999...`);
  // Insertar al inicio (antes de 2000)
  const partidos2000EnAdelante = historicoData.filter(m => m.Año >= 2000);
  historicoData.length = 0;
  historicoData.push(...matchesFormatted, ...partidos2000EnAdelante);
}

// Ordenar todos por fecha
historicoData.sort((a, b) => {
  const dateA = new Date(a.Fecha);
  const dateB = new Date(b.Fecha);
  if (dateA - dateB !== 0) return dateA - dateB;
  return a.Año - b.Año;
});

// Guardar archivo actualizado
fs.writeFileSync(historicoFile, JSON.stringify(historicoData, null, 4), 'utf8');

// Calcular estadísticas
const totalPartidos = historicoData.length;
const partidos1993_1999 = historicoData.filter(m => m.Año >= 1993 && m.Año <= 1999);
const partidos2000EnAdelante = historicoData.filter(m => m.Año >= 2000);

console.log('\n📊 RESUMEN ACTUALIZADO\n');
console.log(`Total de partidos en histórico: ${totalPartidos}`);
console.log(`Partidos 1993-1999: ${partidos1993_1999.length}`);
console.log(`Partidos 2000 en adelante: ${partidos2000EnAdelante.length}\n`);

// Estadísticas por año
const años = [1993, 1994, 1995, 1996, 1997, 1998, 1999];
años.forEach(año => {
  const partidosAño = historicoData.filter(m => m.Año === año);
  if (partidosAño.length > 0) {
    const victorias = partidosAño.filter(m => m.Resultado === 'V').length;
    const empates = partidosAño.filter(m => m.Resultado === 'E').length;
    const derrotas = partidosAño.filter(m => m.Resultado === 'D').length;
    console.log(`${año}: ${partidosAño.length} partidos (V:${victorias} E:${empates} D:${derrotas})`);
  }
});

console.log(`\n✅ Archivo histórico actualizado: ${historicoFile}`);


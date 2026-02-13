const fs = require('fs');

// Leer el archivo de normalización
const normalizationMap = JSON.parse(fs.readFileSync('./normalization-map.json', 'utf8'));
const normalization = normalizationMap.normalization;

console.log('🔄 Aplicando normalización de nombres de equipos...\n');

// Función para normalizar un nombre de equipo
function normalizeTeamName(teamName) {
  if (!teamName) return teamName;
  
  // Normalización automática: "Dep." -> "Deportivo"
  let normalizedName = teamName;
  if (teamName.startsWith('Dep. ')) {
    normalizedName = teamName.replace(/^Dep\. /, 'Deportivo ');
  }
  
  // Buscar en el mapa de normalización (usar el nombre ya normalizado si hubo cambio)
  const nameToLookup = normalizedName !== teamName ? normalizedName : teamName;
  if (normalization[nameToLookup]) {
    return normalization[nameToLookup];
  }
  
  // Si hubo normalización automática, devolver el nombre normalizado
  if (normalizedName !== teamName) {
    return normalizedName;
  }
  
  // Si no está en el mapa, devolver el nombre original
  return teamName;
}

// Función para procesar un archivo
function normalizeFile(filePath) {
  try {
    console.log(`📄 Procesando: ${filePath}`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changesCount = 0;
    
    data.forEach(match => {
      const originalLocal = match['Equipo Local'];
      const originalVisita = match['Equipo Visita'];
      
      const normalizedLocal = normalizeTeamName(originalLocal);
      const normalizedVisita = normalizeTeamName(originalVisita);
      
      if (originalLocal !== normalizedLocal) {
        match['Equipo Local'] = normalizedLocal;
        changesCount++;
      }
      
      if (originalVisita !== normalizedVisita) {
        match['Equipo Visita'] = normalizedVisita;
        changesCount++;
      }
    });
    
    // Guardar el archivo normalizado
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    
    console.log(`   ✅ ${changesCount} cambios aplicados\n`);
    return changesCount;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return 0;
  }
}

// Procesar todos los archivos
const files = [
  './data/historico_completo_sc.json',
  './data/historico_conmebol_sc.json',
  './data/historico_inca_sc.json'
];

let totalChanges = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    const changes = normalizeFile(file);
    totalChanges += changes;
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file}\n`);
  }
});

console.log('🎯 RESUMEN:');
console.log(`   Total de cambios aplicados: ${totalChanges}`);
console.log('\n✅ Normalización completada!');
console.log('💡 Revisa los archivos y haz commit de los cambios si todo está correcto.');


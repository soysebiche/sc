const fs = require('fs');

// Leer los archivos JSON
const completoData = JSON.parse(fs.readFileSync('./data/historico_completo_sc.json', 'utf8'));
const conmebolData = JSON.parse(fs.readFileSync('./data/historico_conmebol_sc.json', 'utf8'));
const incaData = JSON.parse(fs.readFileSync('./data/historico_inca_sc.json', 'utf8'));

// Combinar todos los datos
const allData = [...completoData, ...conmebolData, ...incaData];

console.log('🔍 Extrayendo todos los rivales históricos de Sporting Cristal...\n');

// Extraer todos los equipos únicos
const rivals = new Set();

allData.forEach(match => {
  // Agregar equipo local si no es Sporting Cristal
  if (match['Equipo Local'] && match['Equipo Local'] !== 'Sporting Cristal') {
    rivals.add(match['Equipo Local']);
  }
  
  // Agregar equipo visitante si no es Sporting Cristal
  if (match['Equipo Visita'] && match['Equipo Visita'] !== 'Sporting Cristal') {
    rivals.add(match['Equipo Visita']);
  }
});

// Convertir a array y ordenar alfabéticamente
const rivalsArray = Array.from(rivals).sort();

console.log(`📊 Total de equipos únicos encontrados: ${rivalsArray.length}\n`);

// Detectar posibles variaciones (nombres similares)
function findSimilarNames(name, allNames) {
  const similar = [];
  const nameLower = name.toLowerCase();
  
  allNames.forEach(otherName => {
    if (otherName !== name) {
      const otherLower = otherName.toLowerCase();
      
      // Detectar si comparten palabras clave
      const nameWords = nameLower.split(/\s+/);
      const otherWords = otherLower.split(/\s+/);
      
      // Si comparten al menos 2 palabras o una palabra clave importante
      const commonWords = nameWords.filter(word => 
        otherWords.includes(word) && word.length > 3
      );
      
      if (commonWords.length >= 1) {
        // Verificar si son muy similares
        if (nameLower.includes(otherLower) || otherLower.includes(nameLower)) {
          similar.push(otherName);
        } else if (commonWords.length >= 2) {
          similar.push(otherName);
        }
      }
    }
  });
  
  return similar;
}

// Crear lista con posibles variaciones
const rivalsWithVariations = rivalsArray.map(rival => {
  const similar = findSimilarNames(rival, rivalsArray);
  return {
    name: rival,
    similar: similar.length > 0 ? similar : null
  };
});

// Mostrar resultados
console.log('📋 LISTA COMPLETA DE RIVALES:\n');
rivalsWithVariations.forEach((rival, index) => {
  console.log(`${(index + 1).toString().padStart(3, ' ')}. ${rival.name}`);
  if (rival.similar && rival.similar.length > 0) {
    console.log(`     ⚠️  Posibles variaciones: ${rival.similar.join(', ')}`);
  }
});

// Crear archivo JSON con la lista
const output = {
  total: rivalsArray.length,
  rivals: rivalsArray,
  rivalsWithVariations: rivalsWithVariations.filter(r => r.similar && r.similar.length > 0)
};

fs.writeFileSync('rivals-list.json', JSON.stringify(output, null, 2));
console.log('\n✅ Archivo rivals-list.json creado con la lista completa');

// Crear archivo de normalización template
const normalizationTemplate = {
  comment: "Mapeo de nombres de equipos a nombres normalizados",
  normalization: {}
};

// Agregar algunos ejemplos de normalización común
rivalsWithVariations.forEach(rival => {
  if (rival.similar && rival.similar.length > 0) {
    // Sugerir el nombre más corto o más común como normalizado
    const allNames = [rival.name, ...rival.similar];
    const normalized = allNames.reduce((a, b) => a.length <= b.length ? a : b);
    normalizationTemplate.normalization[rival.name] = normalized;
    rival.similar.forEach(sim => {
      normalizationTemplate.normalization[sim] = normalized;
    });
  } else {
    normalizationTemplate.normalization[rival.name] = rival.name;
  }
});

fs.writeFileSync('normalization-template.json', JSON.stringify(normalizationTemplate, null, 2));
console.log('✅ Archivo normalization-template.json creado con sugerencias de normalización');

// Estadísticas adicionales
console.log('\n📊 ESTADÍSTICAS:');
console.log(`   - Total de partidos analizados: ${allData.length}`);
console.log(`   - Equipos únicos: ${rivalsArray.length}`);
console.log(`   - Equipos con posibles variaciones: ${rivalsWithVariations.filter(r => r.similar && r.similar.length > 0).length}`);




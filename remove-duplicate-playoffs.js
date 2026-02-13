const fs = require('fs');

// Leer el archivo completo
const filePath = './src/data/historico_completo_sc.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`📊 Total de partidos antes: ${data.length}`);

// Filtrar los partidos de playoffs (solo deben estar en historico_conmebol_sc.json)
const filteredData = data.filter(match => {
  // Mantener todos los partidos EXCEPTO los de Copa Libertadores 2026 Playoff
  return match.Torneo !== 'Copa Libertadores 2026 Playoff';
});

const removedCount = data.length - filteredData.length;

console.log(`🗑️  Partidos de playoffs eliminados: ${removedCount}`);
console.log(`📊 Total de partidos después: ${filteredData.length}`);

// Guardar el archivo actualizado
fs.writeFileSync(filePath, JSON.stringify(filteredData, null, 4), 'utf8');

console.log(`✅ Archivo ${filePath} actualizado`);
console.log('💡 Los partidos de playoffs ahora solo están en historico_conmebol_sc.json');




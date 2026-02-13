const fs = require('fs');

// Leer archivos
const historicoPath = './src/data/historico_completo_sc.json';
const libertadoresPath = './libertadores-1962-1999.json';

const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));
const libertadores = JSON.parse(fs.readFileSync(libertadoresPath, 'utf8'));

console.log(`📊 Partidos actuales en histórico: ${historico.length}`);
console.log(`🏆 Partidos de Libertadores a agregar: ${libertadores.length}`);

// Combinar
const dataCompleta = [...historico, ...libertadores];

// Ordenar por fecha
dataCompleta.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

// Guardar
fs.writeFileSync(historicoPath, JSON.stringify(dataCompleta, null, 4), 'utf8');

console.log(`✅ Total de partidos ahora: ${dataCompleta.length}`);
console.log(`📈 Partidos agregados: ${libertadores.length}`);

const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const conmebolPath = path.join(__dirname, 'public/historico_conmebol_sc.json');
const conmebol = JSON.parse(fs.readFileSync(conmebolPath, 'utf8'));

// Create a key for each match to detect duplicates
const existingKeys = new Set(historico.map(m => m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'] + '|' + m.Marcador));

// Filter new matches that don't exist
const newMatches = conmebol.filter(m => !existingKeys.has(m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'] + '|' + m.Marcador));

console.log('Existing matches:', historico.length);
console.log('New matches to add:', newMatches.length);

const allMatches = [...historico, ...newMatches];
allMatches.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

fs.writeFileSync(historicoPath, JSON.stringify(allMatches, null, 2));
console.log('Total after merge:', allMatches.length);

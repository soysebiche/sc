const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const conmebolPath = path.join(__dirname, 'public/historico_conmebol_sc.json');
const conmebol = JSON.parse(fs.readFileSync(conmebolPath, 'utf8'));

// Filter valid scores
const validConmebol = conmebol.filter(m => {
  if (!m.Marcador) return false;
  const parts = m.Marcador.split('-');
  if (parts.length !== 2) return false;
  const g1 = parseInt(parts[0]);
  const g2 = parseInt(parts[1]);
  return !isNaN(g1) && !isNaN(g2) && g1 >= 0 && g2 >= 0 && g1 <= 20 && g2 <= 20;
});

console.log('Valid new matches:', validConmebol.length);

// Create map of valid new matches by key
const validMap = {};
validConmebol.forEach(m => {
  const key = m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'];
  validMap[key] = m;
});

// Remove old broken matches and add new valid ones
const filtered = historico.filter(m => {
  const key = m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'];
  const isBroken = m.Marcador && m.Marcador.includes('20') && m.Marcador.split('-').length === 3;
  return !(isBroken && validMap[key]);
});

console.log('After removing broken:', filtered.length);

// Add new valid matches
const newMatches = validConmebol.filter(m => {
  const key = m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'];
  return !filtered.some(f => f.Año + '|' + f['Equipo Local'] + '|' + f['Equipo Visita'] === key);
});

console.log('Adding new valid matches:', newMatches.length);

const allMatches = [...filtered, ...newMatches];
allMatches.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

fs.writeFileSync(historicoPath, JSON.stringify(allMatches, null, 2));
console.log('Total:', allMatches.length);

// Verify
const d = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));
const lib = d.filter(m => m.Año === 2000 && m.Torneo === 'Copa Libertadores');
console.log('Libertadores 2000:', lib.length, 'Sample:', lib[0] && lib[0].Marcador);

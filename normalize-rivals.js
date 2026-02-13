const fs = require('fs');

const csv = fs.readFileSync('./rivales-para-normalizar.csv', 'utf8');
const lines = csv.split('\n').slice(1);

const mappings = {};
lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    mappings[parts[0].trim()] = parts[1].trim();
  }
});

console.log('Mappings loaded:', Object.keys(mappings).length);

const historicoPath = './src/data/historico_completo_sc.json';
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

let updated = 0;
historico = historico.map(match => {
  ['Equipo Local', 'Equipo Visita'].forEach(field => {
    const original = match[field];
    if (mappings[original]) {
      match[field] = mappings[original];
      updated++;
    }
  });
  return match;
});

fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
console.log('Updated:', updated);

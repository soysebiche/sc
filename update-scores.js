const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const conmebolPath = path.join(__dirname, 'public/historico_conmebol_sc.json');
const conmebol = JSON.parse(fs.readFileSync(conmebolPath, 'utf8'));

let updated = 0;

// Create map of conmebol matches by key
const conmebolMap = {};
conmebol.forEach(m => {
    const key = m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'];
    conmebolMap[key] = m;
});

// Update historico with correct scores
historico.forEach(m => {
    const key = m.Año + '|' + m['Equipo Local'] + '|' + m['Equipo Visita'];
    if (conmebolMap[key]) {
        if (m.Marcador !== conmebolMap[key].Marcador) {
            console.log(`Updating score: ${m.Marcador} -> ${conmebolMap[key].Marcador}`);
            m.Marcador = conmebolMap[key].Marcador;
            updated++;
        }
    }
});

fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
console.log(`Updated ${updated} matches`);

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/historico_conmebol_sc.json', 'utf8'));

const fixedData = data.map(match => {
    const marcador = match.Marcador;
    
    if (marcador && marcador.includes('-')) {
        const parts = marcador.split('-');
        if (parts.length === 3 && parts[0].length >= 2 && parts[1].length === 2 && parts[2].length === 2) {
            const local = parseInt(parts[1], 10);
            const visita = parseInt(parts[2], 10);
            if (!isNaN(local) && !isNaN(visita) && parts[0].startsWith('20')) {
                match.Marcador = `${local}-${visita}`;
                console.log(`Fixed: ${marcador} -> ${match.Marcador}`);
            }
        }
    }
    return match;
});

fs.writeFileSync('./public/historico_conmebol_sc.json', JSON.stringify(fixedData, null, 4));
console.log('Done!');

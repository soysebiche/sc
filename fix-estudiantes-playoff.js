const fs = require('fs');

console.log('🔧 Corrigiendo partidos de Playoff Libertadores 2001...\n');

const filePath = './data/historico_completo_sc.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
let changesCount = 0;

data.forEach(match => {
  // Buscar partidos de 2001 con torneo "Playoff Libertadores" y equipo "Estudiantes"
  if (match.Año === 2001 && 
      match.Torneo === 'Playoff Libertadores' && 
      (match['Equipo Local'] === 'Estudiantes' || match['Equipo Visita'] === 'Estudiantes')) {
    
    if (match['Equipo Local'] === 'Estudiantes') {
      match['Equipo Local'] = 'Estudiantes de Medicina';
      changesCount++;
      console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (${match.Torneo})`);
    }
    
    if (match['Equipo Visita'] === 'Estudiantes') {
      match['Equipo Visita'] = 'Estudiantes de Medicina';
      changesCount++;
      console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (${match.Torneo})`);
    }
  }
});

// Guardar el archivo actualizado
fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');

console.log(`\n📊 ${changesCount} cambios aplicados`);
console.log('✅ Corrección completada!');




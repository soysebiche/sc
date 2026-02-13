const fs = require('fs');

console.log('🔧 Corrigiendo nombres de "Estudiantes" según el contexto...\n');

// Función para procesar un archivo
function fixEstudiantes(filePath) {
  try {
    console.log(`📄 Procesando: ${filePath}`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changesCount = 0;
    
    data.forEach(match => {
      const año = match.Año;
      const torneo = match.Torneo || '';
      const isCopaLibertadores = torneo.includes('Libertadores');
      
      // Cambiar "Estudiantes" a "Estudiantes de La Plata" en Copa Libertadores 2006 y 2009
      if (isCopaLibertadores && (año === 2006 || año === 2009)) {
        if (match['Equipo Local'] === 'Estudiantes') {
          match['Equipo Local'] = 'Estudiantes de La Plata';
          changesCount++;
          console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (Copa Libertadores ${año})`);
        }
        if (match['Equipo Visita'] === 'Estudiantes') {
          match['Equipo Visita'] = 'Estudiantes de La Plata';
          changesCount++;
          console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (Copa Libertadores ${año})`);
        }
      }
      
      // Cambiar "Estudiantes" a "Estudiantes de Medicina" en partidos de 2001 (liga peruana)
      if (año === 2001 && !isCopaLibertadores) {
        if (match['Equipo Local'] === 'Estudiantes') {
          match['Equipo Local'] = 'Estudiantes de Medicina';
          changesCount++;
          console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (${torneo} ${año})`);
        }
        if (match['Equipo Visita'] === 'Estudiantes') {
          match['Equipo Visita'] = 'Estudiantes de Medicina';
          changesCount++;
          console.log(`   ✅ ${match.Fecha} - ${match['Equipo Local']} vs ${match['Equipo Visita']} (${torneo} ${año})`);
        }
      }
    });
    
    // Guardar el archivo actualizado
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    
    console.log(`   📊 ${changesCount} cambios aplicados\n`);
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
    const changes = fixEstudiantes(file);
    totalChanges += changes;
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file}\n`);
  }
});

console.log('🎯 RESUMEN:');
console.log(`   Total de cambios aplicados: ${totalChanges}`);
console.log('\n✅ Corrección completada!');
console.log('💡 Los partidos de Copa Libertadores 2006 y 2009 ahora tienen "Estudiantes de La Plata"');
console.log('💡 Los partidos de liga peruana 2001 ahora tienen "Estudiantes de Medicina"');




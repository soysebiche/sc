// Script para agregar campos Condicion y Estadio a partidos 2000-2025
const fs = require('fs');

const historicoFile = './src/data/historico_completo_sc.json';

console.log('📖 Leyendo archivo histórico...\n');

const historicoData = JSON.parse(fs.readFileSync(historicoFile, 'utf8'));

let actualizados = 0;
let yaTienenCampos = 0;

// Procesar cada partido
historicoData.forEach((match, index) => {
  // Solo procesar partidos de 2000 en adelante
  if (match.Año >= 2000) {
    // Verificar si ya tiene los campos
    const tieneCondicion = match.hasOwnProperty('Condicion');
    const tieneEstadio = match.hasOwnProperty('Estadio');
    
    if (!tieneCondicion || !tieneEstadio) {
      // Determinar condición
      let condicion = 'Neutral';
      if (match['Equipo Local'] === 'Sporting Cristal') {
        condicion = 'Local';
      } else if (match['Equipo Visita'] === 'Sporting Cristal') {
        condicion = 'Visitante';
      }
      
      // Agregar campos
      if (!tieneCondicion) {
        match.Condicion = condicion;
      }
      if (!tieneEstadio) {
        match.Estadio = 'TBD';
      }
      
      actualizados++;
    } else {
      yaTienenCampos++;
    }
  }
});

// Guardar archivo actualizado
fs.writeFileSync(historicoFile, JSON.stringify(historicoData, null, 4), 'utf8');

// Calcular estadísticas
const partidos2000EnAdelante = historicoData.filter(m => m.Año >= 2000);
const partidos1993_1999 = historicoData.filter(m => m.Año >= 1993 && m.Año <= 1999);

console.log('📊 RESUMEN DE ACTUALIZACIÓN\n');
console.log(`Partidos 2000-2025: ${partidos2000EnAdelante.length}`);
console.log(`Partidos actualizados: ${actualizados}`);
console.log(`Partidos que ya tenían campos: ${yaTienenCampos}\n`);

// Verificar que todos tienen los campos ahora
const sinCondicion = partidos2000EnAdelante.filter(m => !m.hasOwnProperty('Condicion')).length;
const sinEstadio = partidos2000EnAdelante.filter(m => !m.hasOwnProperty('Estadio')).length;

if (sinCondicion === 0 && sinEstadio === 0) {
  console.log('✅ Todos los partidos de 2000-2025 ahora tienen los campos Condicion y Estadio');
} else {
  console.log(`⚠️  Aún faltan campos:`);
  console.log(`   - Sin Condicion: ${sinCondicion}`);
  console.log(`   - Sin Estadio: ${sinEstadio}`);
}

// Verificar distribución de condiciones
const locales = partidos2000EnAdelante.filter(m => m.Condicion === 'Local').length;
const visitantes = partidos2000EnAdelante.filter(m => m.Condicion === 'Visitante').length;
const neutrales = partidos2000EnAdelante.filter(m => m.Condicion === 'Neutral').length;

console.log(`\nDistribución de condiciones (2000-2025):`);
console.log(`   Local: ${locales}`);
console.log(`   Visitante: ${visitantes}`);
console.log(`   Neutral: ${neutrales}\n`);

console.log(`✅ Archivo histórico actualizado: ${historicoFile}`);
console.log(`Total de partidos en histórico: ${historicoData.length}`);


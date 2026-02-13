const fs = require('fs');
const path = require('path');

// Función para obtener el día de la semana en español
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

// Función para obtener el mes en español
function getMonthName(monthNumber) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthNumber - 1];
}

// Función para determinar el resultado (V, D, E)
function getResultado(marcador, equipoLocal) {
  if (!marcador || marcador === '-') return 'E';
  
  const [local, visita] = marcador.split('-').map(Number);
  
  if (equipoLocal === 'Sporting Cristal') {
    if (local > visita) return 'V';
    if (local < visita) return 'D';
    return 'E';
  } else {
    // Si SC es visitante
    if (visita > local) return 'V';
    if (visita < local) return 'D';
    return 'E';
  }
}

// Función para crear un objeto de partido
function createMatch(data) {
  const fecha = new Date(data.Fecha);
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  
  return {
    "Año": año,
    "Mes": getMonthName(mes),
    "Dia": dia,
    "Día de la Semana": getDayOfWeek(data.Fecha),
    "Fecha": data.Fecha,
    "Torneo": data.Torneo || 'Apertura',
    "Número de Fecha": data['Número de Fecha'] || data.NumeroFecha || '1',
    "Equipo Local": data['Equipo Local'] || data.EquipoLocal,
    "Equipo Visita": data['Equipo Visita'] || data.EquipoVisita,
    "Marcador": data.Marcador,
    "Resultado": data.Resultado || getResultado(data.Marcador, data['Equipo Local'] || data.EquipoLocal),
    "Goles (Solo SC)": data['Goles (Solo SC)'] || data.Goles || '-'
  };
}

// Función para agregar datos a un archivo JSON
function addDataToFile(filePath, newMatches, tournamentType = 'completo') {
  try {
    console.log(`\n🔄 Procesando: ${filePath}`);
    
    // Leer el archivo existente
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Convertir nuevos partidos al formato correcto
    const formattedMatches = newMatches.map(match => createMatch(match));
    
    // Filtrar solo partidos del 2025
    const matches2025 = formattedMatches.filter(m => m.Año === 2025);
    
    if (matches2025.length === 0) {
      console.log('⚠️ No se encontraron partidos del 2025 en los datos proporcionados');
      return;
    }
    
    // Verificar si ya existen partidos del 2025
    const existing2025 = existingData.filter(m => m.Año === 2025);
    if (existing2025.length > 0) {
      console.log(`⚠️ Ya existen ${existing2025.length} partidos del 2025 en este archivo`);
      console.log('¿Deseas reemplazarlos o agregar nuevos? (Por defecto: agregar nuevos)');
    }
    
    // Combinar con datos existentes (evitar duplicados por fecha)
    const existingDates = new Set(existingData.map(m => m.Fecha));
    const newMatchesToAdd = matches2025.filter(m => !existingDates.has(m.Fecha));
    
    if (newMatchesToAdd.length === 0) {
      console.log('⚠️ Todos los partidos del 2025 ya existen en el archivo');
      return;
    }
    
    const combinedData = [...existingData, ...newMatchesToAdd];
    
    // Ordenar por fecha
    combinedData.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    // Guardar el archivo
    fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 4), 'utf8');
    
    console.log(`✅ ${newMatchesToAdd.length} partidos del 2025 agregados a ${filePath}`);
    console.log(`📊 Total de partidos en el archivo: ${combinedData.length}`);
    
    return newMatchesToAdd.length;
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

// Función principal
function main() {
  console.log('📅 Agregando datos del 2025 a los archivos JSON...\n');
  
  // Verificar si existe un archivo con los datos del 2025
  const data2025Path = './data-2025.json';
  
  if (!fs.existsSync(data2025Path)) {
    console.log('⚠️ No se encontró el archivo data-2025.json');
    console.log('\n📝 INSTRUCCIONES:');
    console.log('1. Crea un archivo llamado "data-2025.json" en la raíz del proyecto');
    console.log('2. Agrega tus partidos del 2025 en formato JSON');
    console.log('3. Ejemplo de formato:');
    console.log(`
[
  {
    "Fecha": "2025-01-15",
    "Torneo": "Apertura",
    "Número de Fecha": "1",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Alianza Lima",
    "Marcador": "2-1",
    "Goles (Solo SC)": "Jugador1 (10'), Jugador2 (45')"
  }
]
    `);
    console.log('\n💡 Una vez creado el archivo, ejecuta este script nuevamente.');
    return;
  }
  
  // Leer los datos del 2025
  const data2025 = JSON.parse(fs.readFileSync(data2025Path, 'utf8'));
  
  if (!Array.isArray(data2025)) {
    console.error('❌ El archivo data-2025.json debe contener un array de partidos');
    return;
  }
  
  console.log(`📊 Se encontraron ${data2025.length} partidos en data-2025.json\n`);
  
  // Determinar a qué archivo(s) agregar los datos
  const filesToUpdate = [];
  
  // Verificar si hay partidos de Conmebol
  const conmebolMatches = data2025.filter(m => 
    m.Torneo && (
      m.Torneo.includes('Libertadores') || 
      m.Torneo.includes('Sudamericana') ||
      m.Torneo.includes('Conmebol')
    )
  );
  
  // Verificar si hay partidos de Copa del Inca
  const incaMatches = data2025.filter(m => 
    m.Torneo && m.Torneo.includes('Inca')
  );
  
  // Agregar a historico_completo_sc.json (siempre)
  filesToUpdate.push({
    path: './src/data/historico_completo_sc.json',
    data: data2025,
    type: 'completo'
  });
  
  // Agregar a historico_conmebol_sc.json (si hay partidos de Conmebol)
  if (conmebolMatches.length > 0) {
    filesToUpdate.push({
      path: './src/data/historico_conmebol_sc.json',
      data: conmebolMatches,
      type: 'conmebol'
    });
  }
  
  // Agregar a historico_inca_sc.json (si hay partidos de Copa del Inca)
  if (incaMatches.length > 0) {
    filesToUpdate.push({
      path: './src/data/historico_inca_sc.json',
      data: incaMatches,
      type: 'inca'
    });
  }
  
  // Procesar cada archivo
  let totalAdded = 0;
  filesToUpdate.forEach(file => {
    const added = addDataToFile(file.path, file.data, file.type);
    totalAdded += added || 0;
  });
  
  console.log('\n🎯 RESUMEN:');
  console.log(`Total de partidos agregados: ${totalAdded}`);
  console.log(`Archivos actualizados: ${filesToUpdate.length}`);
  console.log('\n✅ Proceso completado!');
  console.log('💡 Ahora puedes hacer commit y push de los cambios.');
}

// Ejecutar el script
main();




const fs = require('fs');

// Datos de la temporada 1996 proporcionados por el usuario
const partidos1996 = [
  // FASE 1
  {
    fecha: "1996-03-17",
    numeroFecha: "1",
    equipoLocal: "Unión Minas",
    equipoVisita: "Sporting Cristal",
    marcador: "0-1",
    golesSC: "Julinho",
    diaSemana: "Domingo",
    mes: "Marzo",
    dia: 17
  },
  {
    fecha: "1996-03-23",
    numeroFecha: "2",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Cienciano",
    marcador: "6-0",
    golesSC: "Palacios, Pinillos, Zegarra (2), Hidalgo, Julinho",
    diaSemana: "Sábado",
    mes: "Marzo",
    dia: 23
  },
  {
    fecha: "1996-03-29",
    numeroFecha: "3",
    equipoLocal: "Sport Boys",
    equipoVisita: "Sporting Cristal",
    marcador: "3-1",
    golesSC: "Lazo",
    diaSemana: "Viernes",
    mes: "Marzo",
    dia: 29
  },
  {
    fecha: "1996-04-28",
    numeroFecha: "5",
    equipoLocal: "Dep. Pesquero",
    equipoVisita: "Sporting Cristal",
    marcador: "3-0",
    golesSC: "-",
    diaSemana: "Domingo",
    mes: "Abril",
    dia: 28
  },
  {
    fecha: "1996-05-19",
    numeroFecha: "8",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "San Agustín",
    marcador: "3-1",
    golesSC: "Garay, Palacios, Maestri",
    diaSemana: "Domingo",
    mes: "Mayo",
    dia: 19
  },
  {
    fecha: "1996-05-26",
    numeroFecha: "9",
    equipoLocal: "Atlético Torino",
    equipoVisita: "Sporting Cristal",
    marcador: "0-2",
    golesSC: "Maestri, Solano",
    diaSemana: "Domingo",
    mes: "Mayo",
    dia: 26
  },
  {
    fecha: "1996-06-06",
    numeroFecha: "4",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Ciclista Lima",
    marcador: "6-2",
    golesSC: "Maestri, Autogol, Rivera (2), Soto, Palacios",
    diaSemana: "Jueves",
    mes: "Junio",
    dia: 6
  },
  {
    fecha: "1996-06-09",
    numeroFecha: "10",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "La Loretana",
    marcador: "2-0",
    golesSC: "Zegarra, Pinillos",
    diaSemana: "Domingo",
    mes: "Junio",
    dia: 9
  },
  {
    fecha: "1996-06-16",
    numeroFecha: "6",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Juan Aurich",
    marcador: "2-0",
    golesSC: "Rivera, José Soto",
    diaSemana: "Domingo",
    mes: "Junio",
    dia: 16
  },
  {
    fecha: "1996-06-19",
    numeroFecha: "11",
    equipoLocal: "Alianza Atlético",
    equipoVisita: "Sporting Cristal",
    marcador: "1-2",
    golesSC: "Solano, Hidalgo",
    diaSemana: "Miércoles",
    mes: "Junio",
    dia: 19
  },
  {
    fecha: "1996-06-23",
    numeroFecha: "12",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Melgar",
    marcador: "3-0",
    golesSC: "Garay, Asteggiano, Lazo",
    diaSemana: "Domingo",
    mes: "Junio",
    dia: 23
  },
  {
    fecha: "1996-06-30",
    numeroFecha: "13",
    equipoLocal: "Municipal",
    equipoVisita: "Sporting Cristal",
    marcador: "0-2",
    golesSC: "Solano, Lazo",
    diaSemana: "Domingo",
    mes: "Junio",
    dia: 30
  },
  {
    fecha: "1996-07-10",
    numeroFecha: "7",
    equipoLocal: "Guardia Republicana",
    equipoVisita: "Sporting Cristal",
    marcador: "0-2",
    golesSC: "Solano (2)",
    diaSemana: "Miércoles",
    mes: "Julio",
    dia: 10
  },
  {
    fecha: "1996-07-14",
    numeroFecha: "14",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Universitario",
    marcador: "1-2",
    golesSC: "Julinho",
    diaSemana: "Domingo",
    mes: "Julio",
    dia: 14
  },
  {
    fecha: "1996-07-20",
    numeroFecha: "15",
    equipoLocal: "Alianza Lima",
    equipoVisita: "Sporting Cristal",
    marcador: "0-0",
    golesSC: "-",
    diaSemana: "Sábado",
    mes: "Julio",
    dia: 20
  },
  // REVANCHAS
  {
    fecha: "1996-07-25",
    numeroFecha: "16",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Unión Minas",
    marcador: "7-1",
    golesSC: "Palacios (2), Bonnet, Rivera, Rebagliati, Pinillos, Julinho",
    diaSemana: "Jueves",
    mes: "Julio",
    dia: 25
  },
  {
    fecha: "1996-07-31",
    numeroFecha: "17",
    equipoLocal: "Cienciano",
    equipoVisita: "Sporting Cristal",
    marcador: "3-1",
    golesSC: "Bonnet",
    diaSemana: "Miércoles",
    mes: "Julio",
    dia: 31
  },
  {
    fecha: "1996-08-04",
    numeroFecha: "18",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Sport Boys",
    marcador: "0-0",
    golesSC: "-",
    diaSemana: "Domingo",
    mes: "Agosto",
    dia: 4
  },
  {
    fecha: "1996-08-11",
    numeroFecha: "19",
    equipoLocal: "Ciclista Lima",
    equipoVisita: "Sporting Cristal",
    marcador: "2-4",
    golesSC: "Lente (2), Solano, Palacios",
    diaSemana: "Domingo",
    mes: "Agosto",
    dia: 11
  },
  {
    fecha: "1996-08-18",
    numeroFecha: "20",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Dep. Pesquero",
    marcador: "3-1",
    golesSC: "Solano (2), Bonnet",
    diaSemana: "Domingo",
    mes: "Agosto",
    dia: 18
  },
  {
    fecha: "1996-09-08",
    numeroFecha: "21",
    equipoLocal: "Juan Aurich",
    equipoVisita: "Sporting Cristal",
    marcador: "2-1",
    golesSC: "Autogol",
    diaSemana: "Domingo",
    mes: "Septiembre",
    dia: 8
  },
  {
    fecha: "1996-09-15",
    numeroFecha: "22",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Guardia Republicana",
    marcador: "1-0",
    golesSC: "Julinho",
    diaSemana: "Domingo",
    mes: "Septiembre",
    dia: 15
  },
  {
    fecha: "1996-09-22",
    numeroFecha: "23",
    equipoLocal: "San Agustín",
    equipoVisita: "Sporting Cristal",
    marcador: "0-3",
    golesSC: "Solano, Soto, Julinho",
    diaSemana: "Domingo",
    mes: "Septiembre",
    dia: 22
  },
  {
    fecha: "1996-09-25",
    numeroFecha: "24",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Atlético Torino",
    marcador: "2-0",
    golesSC: "Julinho, Magallanes",
    diaSemana: "Miércoles",
    mes: "Septiembre",
    dia: 25
  },
  {
    fecha: "1996-09-29",
    numeroFecha: "25",
    equipoLocal: "La Loretana",
    equipoVisita: "Sporting Cristal",
    marcador: "0-2",
    golesSC: "Julinho, Solano",
    diaSemana: "Domingo",
    mes: "Septiembre",
    dia: 29
  },
  {
    fecha: "1996-10-06",
    numeroFecha: "26",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Alianza Atlético",
    marcador: "4-1",
    golesSC: "Garay, Soto, Bonnet, Pinillos",
    diaSemana: "Domingo",
    mes: "Octubre",
    dia: 6
  },
  {
    fecha: "1996-10-13",
    numeroFecha: "27",
    equipoLocal: "Melgar",
    equipoVisita: "Sporting Cristal",
    marcador: "1-1",
    golesSC: "Garay",
    diaSemana: "Domingo",
    mes: "Octubre",
    dia: 13
  },
  {
    fecha: "1996-10-20",
    numeroFecha: "28",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Municipal",
    marcador: "5-2",
    golesSC: "Solano (2), Palacios, Julinho, Soto",
    diaSemana: "Domingo",
    mes: "Octubre",
    dia: 20
  },
  {
    fecha: "1996-10-27",
    numeroFecha: "29",
    equipoLocal: "Universitario",
    equipoVisita: "Sporting Cristal",
    marcador: "1-1",
    golesSC: "Soto",
    diaSemana: "Domingo",
    mes: "Octubre",
    dia: 27
  },
  {
    fecha: "1996-11-03",
    numeroFecha: "30",
    equipoLocal: "Sporting Cristal",
    equipoVisita: "Alianza Lima",
    marcador: "2-1",
    golesSC: "Palacios, Autogol",
    diaSemana: "Domingo",
    mes: "Noviembre",
    dia: 3
  }
];

// Función para determinar el resultado
function getResultado(marcador, esLocal) {
  const [golesLocal, golesVisita] = marcador.split('-').map(Number);
  if (golesLocal === golesVisita) return 'E';
  if (esLocal) {
    return golesLocal > golesVisita ? 'V' : 'D';
  } else {
    return golesVisita > golesLocal ? 'V' : 'D';
  }
}

// Convertir al formato del proyecto
const partidosFormateados = partidos1996.map(partido => {
  const esLocal = partido.equipoLocal === "Sporting Cristal";
  return {
    "Año": 1996,
    "Mes": partido.mes,
    "Dia": partido.dia,
    "Día de la Semana": partido.diaSemana,
    "Fecha": partido.fecha,
    "Torneo": "Apertura",
    "Número de Fecha": partido.numeroFecha,
    "Equipo Local": partido.equipoLocal,
    "Equipo Visita": partido.equipoVisita,
    "Marcador": partido.marcador,
    "Resultado": getResultado(partido.marcador, esLocal),
    "Goles (Solo SC)": partido.golesSC
  };
});

// Leer el archivo actual
const dataPath = './src/data/historico_completo_sc.json';
let dataActual = [];
try {
  const contenido = fs.readFileSync(dataPath, 'utf8');
  dataActual = JSON.parse(contenido);
} catch (error) {
  console.log('Archivo no existe o está vacío, creando nuevo...');
}

// Filtrar para eliminar datos de 1996 existentes (para actualizar)
dataActual = dataActual.filter(p => p.Año !== 1996);

// Agregar los nuevos datos de 1996
const dataActualizada = [...partidosFormateados, ...dataActual];

// Ordenar por fecha
dataActualizada.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

// Guardar el archivo
fs.writeFileSync(dataPath, JSON.stringify(dataActualizada, null, 4), 'utf8');

console.log(`✅ Se han actualizado ${partidosFormateados.length} partidos de 1996`);
console.log(`📊 Total de partidos en la base de datos: ${dataActualizada.length}`);

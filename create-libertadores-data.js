const fs = require('fs');

// Todos los partidos de Copa Libertadores 1962-1999
const partidosLibertadores = [
  // 1962 - GRUPO 2
  { fecha: "1962-02-10", mes: "Febrero", dia: 10, diaSemana: "Sábado", numFecha: "1", local: "Nacional (URU)", visita: "Sporting Cristal", marcador: "3-2", goles: "Gallardo (2)" },
  { fecha: "1962-02-14", mes: "Febrero", dia: 14, diaSemana: "Miércoles", numFecha: "2", local: "Racing Club (ARG)", visita: "Sporting Cristal", marcador: "2-1", goles: "Del Castillo" },
  { fecha: "1962-02-17", mes: "Febrero", dia: 17, diaSemana: "Sábado", numFecha: "3", local: "Sporting Cristal", visita: "Nacional (URU)", marcador: "0-1", goles: "-" },
  { fecha: "1962-02-20", mes: "Febrero", dia: 20, diaSemana: "Martes", numFecha: "4", local: "Sporting Cristal", visita: "Racing Club (ARG)", marcador: "2-1", goles: "Flores, Gallardo" },
  
  // 1968 - GRUPO 1
  { fecha: "1968-01-24", mes: "Enero", dia: 24, diaSemana: "Miércoles", numFecha: "1", local: "Jorge Wilstermann (BOL)", visita: "Sporting Cristal", marcador: "0-1", goles: "Del Castillo" },
  { fecha: "1968-01-28", mes: "Enero", dia: 28, diaSemana: "Domingo", numFecha: "2", local: "Always Ready (BOL)", visita: "Sporting Cristal", marcador: "1-4", goles: "Gonzáles Pajuelo (2), Aquije, Del Castillo" },
  { fecha: "1968-02-15", mes: "Febrero", dia: 15, diaSemana: "Jueves", numFecha: "3", local: "Universitario", visita: "Sporting Cristal", marcador: "1-1", goles: "Aquije" },
  { fecha: "1968-02-19", mes: "Febrero", dia: 19, diaSemana: "Lunes", numFecha: "4", local: "Sporting Cristal", visita: "Jorge Wilstermann (BOL)", marcador: "2-0", goles: "Risco, Del Castillo" },
  { fecha: "1968-02-24", mes: "Febrero", dia: 24, diaSemana: "Sábado", numFecha: "5", local: "Sporting Cristal", visita: "Always Ready (BOL)", marcador: "1-1", goles: "Gallardo" },
  { fecha: "1968-03-02", mes: "Marzo", dia: 2, diaSemana: "Sábado", numFecha: "6", local: "Sporting Cristal", visita: "Universitario", marcador: "2-2", goles: "Aquije, Gallardo" },
  // Cuartos 1968
  { fecha: "1968-03-17", mes: "Marzo", dia: 17, diaSemana: "Domingo", numFecha: "C1", local: "Emelec (ECU)", visita: "Sporting Cristal", marcador: "0-2", goles: "Mifflin, Aquije" },
  { fecha: "1968-03-20", mes: "Marzo", dia: 20, diaSemana: "Miércoles", numFecha: "C2", local: "Dep. Portugués (VEN)", visita: "Sporting Cristal", marcador: "1-1", goles: "Gonzáles Pajuelo" },
  { fecha: "1968-03-25", mes: "Marzo", dia: 25, diaSemana: "Lunes", numFecha: "C3", local: "Sporting Cristal", visita: "Peñarol (URU)", marcador: "0-0", goles: "-" },
  { fecha: "1968-03-28", mes: "Marzo", dia: 28, diaSemana: "Jueves", numFecha: "C4", local: "Sporting Cristal", visita: "Dep. Portugués (VEN)", marcador: "2-0", goles: "Gallardo (2)" },
  { fecha: "1968-04-01", mes: "Abril", dia: 1, diaSemana: "Lunes", numFecha: "C5", local: "Sporting Cristal", visita: "Emelec (ECU)", marcador: "1-1", goles: "Gallardo" },
  { fecha: "1968-04-10", mes: "Abril", dia: 10, diaSemana: "Miércoles", numFecha: "C6", local: "Peñarol (URU)", visita: "Sporting Cristal", marcador: "1-1", goles: "Risco" },
  
  // 1969 - GRUPO 2
  { fecha: "1969-02-26", mes: "Febrero", dia: 26, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Juan Aurich", marcador: "3-3", goles: "Autogol, Gallardo, Gonzáles Pajuelo" },
  { fecha: "1969-03-01", mes: "Marzo", dia: 1, diaSemana: "Sábado", numFecha: "2", local: "Sporting Cristal", visita: "Santiago Wanderers (CHI)", marcador: "2-1", goles: "Gallardo, F. Gonzales" },
  { fecha: "1969-03-03", mes: "Marzo", dia: 3, diaSemana: "Lunes", numFecha: "3", local: "Sporting Cristal", visita: "Univ. Católica (CHI)", marcador: "2-0", goles: "Campos, Gonzáles Pajuelo" },
  { fecha: "1969-03-06", mes: "Marzo", dia: 6, diaSemana: "Jueves", numFecha: "4", local: "Juan Aurich", visita: "Sporting Cristal", marcador: "2-2", goles: "F. Gonzales (2)" },
  { fecha: "1969-03-11", mes: "Marzo", dia: 11, diaSemana: "Martes", numFecha: "5", local: "Santiago Wanderers (CHI)", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  { fecha: "1969-03-13", mes: "Marzo", dia: 13, diaSemana: "Jueves", numFecha: "6", local: "Univ. Católica (CHI)", visita: "Sporting Cristal", marcador: "3-2", goles: "F. Gonzales, Aquije" },
  // Definición 1969
  { fecha: "1969-03-18", mes: "Marzo", dia: 18, diaSemana: "Martes", numFecha: "D1", local: "Santiago Wanderers (CHI)", visita: "Sporting Cristal", marcador: "1-1", goles: "Gallardo" },
  { fecha: "1969-03-20", mes: "Marzo", dia: 20, diaSemana: "Jueves", numFecha: "D2", local: "Sporting Cristal", visita: "Univ. Católica (CHI)", marcador: "1-2", goles: "Aquije" },
  
  // 1971 - GRUPO 1
  { fecha: "1971-02-13", mes: "Febrero", dia: 13, diaSemana: "Sábado", numFecha: "1", local: "Sporting Cristal", visita: "Universitario", marcador: "0-0", goles: "-" },
  { fecha: "1971-02-23", mes: "Febrero", dia: 23, diaSemana: "Martes", numFecha: "2", local: "Sporting Cristal", visita: "Rosario Central (ARG)", marcador: "1-2", goles: "Mifflin" },
  { fecha: "1971-03-01", mes: "Marzo", dia: 1, diaSemana: "Lunes", numFecha: "3", local: "Sporting Cristal", visita: "Boca Junior (ARG)", marcador: "2-0", goles: "Orbegoso, Autogol" },
  { fecha: "1971-03-17", mes: "Marzo", dia: 17, diaSemana: "Miércoles", numFecha: "4", local: "Boca Junior (ARG)", visita: "Sporting Cristal", marcador: "2-2", goles: "Orbegoso, Gonzáles Pajuelo" },
  { fecha: "1971-03-25", mes: "Marzo", dia: 25, diaSemana: "Jueves", numFecha: "5", local: "Rosario Central (ARG)", visita: "Sporting Cristal", marcador: "4-0", goles: "-" },
  { fecha: "1971-03-31", mes: "Marzo", dia: 31, diaSemana: "Miércoles", numFecha: "6", local: "Universitario", visita: "Sporting Cristal", marcador: "3-0", goles: "-" },
  
  // 1973 - GRUPO 5
  { fecha: "1973-02-02", mes: "Febrero", dia: 2, diaSemana: "Viernes", numFecha: "1", local: "Sporting Cristal", visita: "Universitario", marcador: "2-2", goles: "Del Castillo, Jaime" },
  { fecha: "1973-02-17", mes: "Febrero", dia: 17, diaSemana: "Sábado", numFecha: "2", local: "Sporting Cristal", visita: "Olimpia (PAR)", marcador: "1-0", goles: "De Souza" },
  { fecha: "1973-02-22", mes: "Febrero", dia: 22, diaSemana: "Jueves", numFecha: "3", local: "Sporting Cristal", visita: "Cerro Porteño (PAR)", marcador: "1-1", goles: "Del Castillo" },
  { fecha: "1973-03-02", mes: "Marzo", dia: 2, diaSemana: "Viernes", numFecha: "4", local: "Universitario", visita: "Sporting Cristal", marcador: "0-1", goles: "De Souza" },
  { fecha: "1973-03-16", mes: "Marzo", dia: 16, diaSemana: "Viernes", numFecha: "5", local: "Olimpia (PAR)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1973-03-20", mes: "Marzo", dia: 20, diaSemana: "Martes", numFecha: "6", local: "Cerro Porteño (PAR)", visita: "Sporting Cristal", marcador: "5-0", goles: "-" },
  
  // 1974 - GRUPO 4
  { fecha: "1974-02-17", mes: "Febrero", dia: 17, diaSemana: "Domingo", numFecha: "1", local: "Defensor Lima", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  { fecha: "1974-03-03", mes: "Marzo", dia: 3, diaSemana: "Domingo", numFecha: "2", local: "Univ. Católica (ECU)", visita: "Sporting Cristal", marcador: "0-0", goles: "-" },
  { fecha: "1974-03-06", mes: "Marzo", dia: 6, diaSemana: "Miércoles", numFecha: "3", local: "El Nacional (ECU)", visita: "Sporting Cristal", marcador: "3-0", goles: "-" },
  { fecha: "1974-03-13", mes: "Marzo", dia: 13, diaSemana: "Miércoles", numFecha: "4", local: "Sporting Cristal", visita: "Defensor Lima", marcador: "0-2", goles: "-" },
  { fecha: "1974-03-30", mes: "Marzo", dia: 30, diaSemana: "Sábado", numFecha: "5", local: "Sporting Cristal", visita: "El Nacional (ECU)", marcador: "1-3", goles: "Jaime" },
  { fecha: "1974-04-03", mes: "Abril", dia: 3, diaSemana: "Miércoles", numFecha: "6", local: "Sporting Cristal", visita: "Univ. Católica (ECU)", marcador: "2-1", goles: "Jaime, Palacios" },
  
  // 1978 - GRUPO 2
  { fecha: "1978-07-05", mes: "Julio", dia: 5, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Alianza Lima", marcador: "2-2", goles: "Mosquera, Carbonell" },
  { fecha: "1978-07-12", mes: "Julio", dia: 12, diaSemana: "Miércoles", numFecha: "2", local: "The Strongest (BOL)", visita: "Sporting Cristal", marcador: "3-1", goles: "Oblitas" },
  { fecha: "1978-07-16", mes: "Julio", dia: 16, diaSemana: "Domingo", numFecha: "3", local: "Oriente Petrolero (BOL)", visita: "Sporting Cristal", marcador: "0-1", goles: "Mosquera" },
  { fecha: "1978-07-21", mes: "Julio", dia: 21, diaSemana: "Viernes", numFecha: "4", local: "Alianza Lima", visita: "Sporting Cristal", marcador: "4-1", goles: "Aparicio" },
  { fecha: "1978-07-25", mes: "Julio", dia: 25, diaSemana: "Martes", numFecha: "5", local: "Sporting Cristal", visita: "Oriente Petrolero (BOL)", marcador: "1-0", goles: "Ramírez" },
  { fecha: "1978-08-01", mes: "Agosto", dia: 1, diaSemana: "Martes", numFecha: "6", local: "Sporting Cristal", visita: "The Strongest (BOL)", marcador: "3-0", goles: "Ramírez (2), Oblitas" },
  
  // 1980 - GRUPO 1
  { fecha: "1980-02-06", mes: "Febrero", dia: 6, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Atlético Chalaco", marcador: "0-0", goles: "-" },
  { fecha: "1980-03-11", mes: "Marzo", dia: 11, diaSemana: "Martes", numFecha: "2", local: "River Plate (ARG)", visita: "Sporting Cristal", marcador: "3-2", goles: "Rojas, Uribe" },
  { fecha: "1980-03-14", mes: "Marzo", dia: 14, diaSemana: "Viernes", numFecha: "3", local: "Vélez Sarsfield (ARG)", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  { fecha: "1980-04-09", mes: "Abril", dia: 9, diaSemana: "Miércoles", numFecha: "4", local: "Sporting Cristal", visita: "Vélez Sarsfield (ARG)", marcador: "0-1", goles: "-" },
  { fecha: "1980-04-15", mes: "Abril", dia: 15, diaSemana: "Martes", numFecha: "5", local: "Sporting Cristal", visita: "River Plate (ARG)", marcador: "1-2", goles: "Chumpitaz" },
  { fecha: "1980-04-25", mes: "Abril", dia: 25, diaSemana: "Viernes", numFecha: "6", local: "Atlético Chalaco", visita: "Sporting Cristal", marcador: "1-2", goles: "Ramírez (2)" },
  
  // 1981 - GRUPO 2
  { fecha: "1981-03-18", mes: "Marzo", dia: 18, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Atlético Torino", marcador: "2-1", goles: "Uribe (2)" },
  { fecha: "1981-03-24", mes: "Marzo", dia: 24, diaSemana: "Martes", numFecha: "2", local: "Sporting Cristal", visita: "Univ. de Chile (CHI)", marcador: "3-2", goles: "Uribe, Ramírez, Gutierrez" },
  { fecha: "1981-03-27", mes: "Marzo", dia: 27, diaSemana: "Viernes", numFecha: "3", local: "Sporting Cristal", visita: "Cobreloa (CHI)", marcador: "0-0", goles: "-" },
  { fecha: "1981-04-07", mes: "Abril", dia: 7, diaSemana: "Martes", numFecha: "4", local: "Atlético Torino", visita: "Sporting Cristal", marcador: "0-2", goles: "Uribe, Ramírez" },
  { fecha: "1981-04-10", mes: "Abril", dia: 10, diaSemana: "Viernes", numFecha: "5", local: "Univ. de Chile (CHI)", visita: "Sporting Cristal", marcador: "1-1", goles: "Uribe" },
  { fecha: "1981-04-14", mes: "Abril", dia: 14, diaSemana: "Martes", numFecha: "6", local: "Cobreloa (CHI)", visita: "Sporting Cristal", marcador: "6-1", goles: "Ramírez" },
  
  // 1984 - GRUPO 5
  { fecha: "1984-03-11", mes: "Marzo", dia: 11, diaSemana: "Domingo", numFecha: "1", local: "Sporting Cristal", visita: "Melgar Fc.", marcador: "3-2", goles: "Loyola, Hirano, Ruiz" },
  { fecha: "1984-03-21", mes: "Marzo", dia: 21, diaSemana: "Miércoles", numFecha: "2", local: "Portuguesa (VEN)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1984-03-25", mes: "Marzo", dia: 25, diaSemana: "Domingo", numFecha: "3", local: "Univ. Los Andes (VEN)", visita: "Sporting Cristal", marcador: "0-1", goles: "Hirano" },
  { fecha: "1984-04-01", mes: "Abril", dia: 1, diaSemana: "Domingo", numFecha: "4", local: "Melgar Fc.", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  { fecha: "1984-04-04", mes: "Abril", dia: 4, diaSemana: "Miércoles", numFecha: "5", local: "Sporting Cristal", visita: "Portuguesa (VEN)", marcador: "2-1", goles: "Hirano, Mora" },
  { fecha: "1984-04-08", mes: "Abril", dia: 8, diaSemana: "Domingo", numFecha: "6", local: "Sporting Cristal", visita: "Univ. Los Andes (VEN)", marcador: "2-0", goles: "Mora, Loyola" },
  // Definición 1984
  { fecha: "1984-05-11", mes: "Mayo", dia: 11, diaSemana: "Viernes", numFecha: "D1", local: "Univ. Los Andes (VEN)", visita: "Sporting Cristal", marcador: "2-1", goles: "Caballero" },
  
  // 1989 - GRUPO 4
  { fecha: "1989-02-12", mes: "Febrero", dia: 12, diaSemana: "Domingo", numFecha: "1", local: "Sporting Cristal", visita: "Universitario", marcador: "1-0", goles: "Dall'Orso" },
  { fecha: "1989-02-23", mes: "Febrero", dia: 23, diaSemana: "Jueves", numFecha: "2", local: "Sporting Cristal", visita: "Boca Junior (ARG)", marcador: "1-0", goles: "Arrelucea" },
  { fecha: "1989-03-02", mes: "Marzo", dia: 2, diaSemana: "Jueves", numFecha: "3", local: "Sporting Cristal", visita: "Racing Club (ARG)", marcador: "1-2", goles: "Manassero" },
  { fecha: "1989-03-08", mes: "Marzo", dia: 8, diaSemana: "Miércoles", numFecha: "4", local: "Universitario", visita: "Sporting Cristal", marcador: "4-0", goles: "-" },
  { fecha: "1989-03-21", mes: "Marzo", dia: 21, diaSemana: "Martes", numFecha: "5", local: "Boca Junior (ARG)", visita: "Sporting Cristal", marcador: "4-3", goles: "Lobo (2), Manassero" },
  { fecha: "1989-03-24", mes: "Marzo", dia: 24, diaSemana: "Viernes", numFecha: "6", local: "Racing Club (ARG)", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  
  // 1990 - GRUPO 3
  { fecha: "1990-04-11", mes: "Abril", dia: 11, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Unión Huaral", marcador: "0-0", goles: "-" },
  { fecha: "1990-04-17", mes: "Abril", dia: 17, diaSemana: "Martes", numFecha: "2", local: "Sporting Cristal", visita: "Univ. Católica (CHI)", marcador: "0-0", goles: "-" },
  { fecha: "1990-04-24", mes: "Abril", dia: 24, diaSemana: "Martes", numFecha: "3", local: "Sporting Cristal", visita: "Colo-Colo (CHI)", marcador: "1-2", goles: "Cincunegui" },
  { fecha: "1990-05-04", mes: "Mayo", dia: 4, diaSemana: "Viernes", numFecha: "4", local: "Unión Huaral", visita: "Sporting Cristal", marcador: "0-3", goles: "Olivares, Loyola, Novella" },
  { fecha: "1990-05-08", mes: "Mayo", dia: 8, diaSemana: "Martes", numFecha: "5", local: "Univ. Católica (CHI)", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  { fecha: "1990-05-12", mes: "Mayo", dia: 12, diaSemana: "Sábado", numFecha: "6", local: "Colo-Colo (CHI)", visita: "Sporting Cristal", marcador: "2-0", goles: "-" },
  
  // 1992 - GRUPO 4
  { fecha: "1992-02-26", mes: "Febrero", dia: 26, diaSemana: "Miércoles", numFecha: "1", local: "Sport Boys", visita: "Sporting Cristal", marcador: "1-1", goles: "Baldessari" },
  { fecha: "1992-03-17", mes: "Marzo", dia: 17, diaSemana: "Martes", numFecha: "2", local: "América de Cali (COL)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1992-03-20", mes: "Marzo", dia: 20, diaSemana: "Viernes", numFecha: "3", local: "Atlético Nacional (COL)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1992-03-25", mes: "Marzo", dia: 25, diaSemana: "Miércoles", numFecha: "4", local: "Sporting Cristal", visita: "Sport Boys", marcador: "2-0", goles: "Baldessari, Palacios" },
  { fecha: "1992-04-03", mes: "Abril", dia: 3, diaSemana: "Viernes", numFecha: "5", local: "Sporting Cristal", visita: "América de Cali (COL)", marcador: "3-1", goles: "Prado, Avilés, Baldessari" },
  { fecha: "1992-04-10", mes: "Abril", dia: 10, diaSemana: "Viernes", numFecha: "6", local: "Sporting Cristal", visita: "Atlético Nacional (COL)", marcador: "0-3", goles: "-" },
  // Octavos 1992
  { fecha: "1992-04-28", mes: "Abril", dia: 28, diaSemana: "Martes", numFecha: "O1", local: "Sporting Cristal", visita: "Criciúma (BRA)", marcador: "1-2", goles: "Navarro" },
  { fecha: "1992-05-05", mes: "Mayo", dia: 5, diaSemana: "Martes", numFecha: "O2", local: "Criciúma (BRA)", visita: "Sporting Cristal", marcador: "3-2", goles: "Antón, Prado" },
  
  // 1993 - GRUPO 1
  { fecha: "1993-02-10", mes: "Febrero", dia: 10, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Universitario", marcador: "1-3", goles: "Torres" },
  { fecha: "1993-02-16", mes: "Febrero", dia: 16, diaSemana: "Martes", numFecha: "2", local: "Sporting Cristal", visita: "Caracas Fc. (VEN)", marcador: "0-1", goles: "-" },
  { fecha: "1993-03-02", mes: "Marzo", dia: 2, diaSemana: "Martes", numFecha: "3", local: "Sporting Cristal", visita: "Minervén (VEN)", marcador: "6-2", goles: "Maestri (3), Rivera (2), Marquinho" },
  { fecha: "1993-03-10", mes: "Marzo", dia: 10, diaSemana: "Miércoles", numFecha: "4", local: "Universitario", visita: "Sporting Cristal", marcador: "2-2", goles: "Maestri, Marquinho" },
  { fecha: "1993-03-16", mes: "Marzo", dia: 16, diaSemana: "Martes", numFecha: "5", local: "Caracas Fc. (VEN)", visita: "Sporting Cristal", marcador: "1-3", goles: "Marquinho, Soto, Ávila" },
  { fecha: "1993-03-19", mes: "Marzo", dia: 19, diaSemana: "Viernes", numFecha: "6", local: "Minervén (VEN)", visita: "Sporting Cristal", marcador: "0-1", goles: "Maestri" },
  // Octavos 1993
  { fecha: "1993-04-07", mes: "Abril", dia: 7, diaSemana: "Miércoles", numFecha: "O1", local: "El Nacional (ECU)", visita: "Sporting Cristal", marcador: "3-0", goles: "-" },
  { fecha: "1993-04-14", mes: "Abril", dia: 14, diaSemana: "Miércoles", numFecha: "O2", local: "Sporting Cristal", visita: "El Nacional (ECU)", marcador: "4-0", goles: "Zegarra, Olivares, Maestri, Marquinho" },
  // Cuartos 1993
  { fecha: "1993-04-21", mes: "Abril", dia: 21, diaSemana: "Miércoles", numFecha: "C1", local: "América de Cali (COL)", visita: "Sporting Cristal", marcador: "2-2", goles: "Ávila (2)" },
  { fecha: "1993-04-28", mes: "Abril", dia: 28, diaSemana: "Miércoles", numFecha: "C2", local: "Sporting Cristal", visita: "América de Cali (COL)", marcador: "2-3", goles: "Julinho (2)" },
  
  // 1995 - GRUPO 5
  { fecha: "1995-02-08", mes: "Febrero", dia: 8, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Alianza Lima", marcador: "3-0", goles: "Palacios, Julinho, Maestri" },
  { fecha: "1995-02-21", mes: "Febrero", dia: 21, diaSemana: "Martes", numFecha: "2", local: "Jorge Wilstermann (BOL)", visita: "Sporting Cristal", marcador: "2-2", goles: "Pinillos, Palacios" },
  { fecha: "1995-02-24", mes: "Febrero", dia: 24, diaSemana: "Viernes", numFecha: "3", local: "Bolívar (BOL)", visita: "Sporting Cristal", marcador: "1-1", goles: "Bica" },
  { fecha: "1995-03-08", mes: "Marzo", dia: 8, diaSemana: "Miércoles", numFecha: "4", local: "Alianza Lima", visita: "Sporting Cristal", marcador: "1-1", goles: "Palacios" },
  { fecha: "1995-03-17", mes: "Marzo", dia: 17, diaSemana: "Viernes", numFecha: "5", local: "Sporting Cristal", visita: "Jorge Wilstermann (BOL)", marcador: "7-0", goles: "Palacios (3), Earl, Soto, Solano, Bica" },
  { fecha: "1995-03-24", mes: "Marzo", dia: 24, diaSemana: "Viernes", numFecha: "6", local: "Sporting Cristal", visita: "Bolívar (BOL)", marcador: "1-0", goles: "Bica" },
  // Octavos 1995
  { fecha: "1995-04-26", mes: "Abril", dia: 26, diaSemana: "Miércoles", numFecha: "O1", local: "Caracas Fc. (VEN)", visita: "Sporting Cristal", marcador: "2-2", goles: "Solano, Julinho" },
  { fecha: "1995-05-04", mes: "Mayo", dia: 4, diaSemana: "Jueves", numFecha: "O2", local: "Sporting Cristal", visita: "Caracas Fc. (VEN)", marcador: "6-3", goles: "Julinho (2), Maestri, Solano, Soto, Palacios" },
  // Cuartos 1995
  { fecha: "1995-07-26", mes: "Julio", dia: 26, diaSemana: "Miércoles", numFecha: "C1", local: "Emelec (ECU)", visita: "Sporting Cristal", marcador: "3-1", goles: "Asteggiano" },
  { fecha: "1995-08-02", mes: "Agosto", dia: 2, diaSemana: "Miércoles", numFecha: "C2", local: "Sporting Cristal", visita: "Emelec (ECU)", marcador: "1-1", goles: "Pinillos" },
  
  // 1996 - GRUPO 2
  { fecha: "1996-03-13", mes: "Marzo", dia: 13, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Universitario", marcador: "0-2", goles: "-" },
  { fecha: "1996-03-26", mes: "Marzo", dia: 26, diaSemana: "Martes", numFecha: "2", local: "Sporting Cristal", visita: "Peñarol (URU)", marcador: "3-3", goles: "Zegarra (2), Julinho" },
  { fecha: "1996-04-02", mes: "Abril", dia: 2, diaSemana: "Martes", numFecha: "3", local: "Sporting Cristal", visita: "Defensor Sporting (URU)", marcador: "0-0", goles: "-" },
  { fecha: "1996-04-07", mes: "Abril", dia: 7, diaSemana: "Domingo", numFecha: "4", local: "Universitario", visita: "Sporting Cristal", marcador: "1-2", goles: "Solano, Palacios" },
  { fecha: "1996-04-13", mes: "Abril", dia: 13, diaSemana: "Sábado", numFecha: "5", local: "Peñarol (URU)", visita: "Sporting Cristal", marcador: "1-1", goles: "Palacios" },
  { fecha: "1996-04-17", mes: "Abril", dia: 17, diaSemana: "Miércoles", numFecha: "6", local: "Sporting Cristal", visita: "Defensor Sporting (URU)", marcador: "0-0", goles: "-" },
  // Octavos 1996
  { fecha: "1996-05-01", mes: "Mayo", dia: 1, diaSemana: "Miércoles", numFecha: "O1", local: "Sporting Cristal", visita: "River Plate (ARG)", marcador: "2-1", goles: "Solano, Julinho" },
  { fecha: "1996-05-08", mes: "Mayo", dia: 8, diaSemana: "Miércoles", numFecha: "O2", local: "River Plate (ARG)", visita: "Sporting Cristal", marcador: "5-2", goles: "Solano, Julinho" },
  
  // 1997 - GRUPO 4
  { fecha: "1997-02-19", mes: "Febrero", dia: 19, diaSemana: "Miércoles", numFecha: "1", local: "Sporting Cristal", visita: "Alianza Lima", marcador: "0-0", goles: "-" },
  { fecha: "1997-02-28", mes: "Febrero", dia: 28, diaSemana: "Viernes", numFecha: "2", local: "Sporting Cristal", visita: "Cruzeiro (BRA)", marcador: "1-0", goles: "Julinho" },
  { fecha: "1997-03-07", mes: "Marzo", dia: 7, diaSemana: "Viernes", numFecha: "3", local: "Sporting Cristal", visita: "Gremio (BRA)", marcador: "1-0", goles: "Solano" },
  { fecha: "1997-03-12", mes: "Marzo", dia: 12, diaSemana: "Miércoles", numFecha: "4", local: "Alianza Lima", visita: "Sporting Cristal", marcador: "1-1", goles: "Julinho" },
  { fecha: "1997-04-11", mes: "Abril", dia: 11, diaSemana: "Viernes", numFecha: "5", local: "Cruzeiro (BRA)", visita: "Sporting Cristal", marcador: "2-1", goles: "Bonnet" },
  { fecha: "1997-04-15", mes: "Abril", dia: 15, diaSemana: "Martes", numFecha: "6", local: "Gremio (BRA)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  // Octavos 1997
  { fecha: "1997-04-23", mes: "Abril", dia: 23, diaSemana: "Miércoles", numFecha: "O1", local: "Sporting Cristal", visita: "Vélez Sarsfield (ARG)", marcador: "0-0", goles: "-" },
  { fecha: "1997-05-08", mes: "Mayo", dia: 8, diaSemana: "Jueves", numFecha: "O2", local: "Vélez Sarsfield (ARG)", visita: "Sporting Cristal", marcador: "0-1", goles: "Soto" },
  // Cuartos 1997
  { fecha: "1997-05-21", mes: "Mayo", dia: 21, diaSemana: "Miércoles", numFecha: "C1", local: "Bolívar (BOL)", visita: "Sporting Cristal", marcador: "2-1", goles: "Bonnet" },
  { fecha: "1997-05-28", mes: "Mayo", dia: 28, diaSemana: "Miércoles", numFecha: "C2", local: "Sporting Cristal", visita: "Bolívar (BOL)", marcador: "3-0", goles: "Solano, Soto, Amoako" },
  // Semifinal 1997
  { fecha: "1997-07-23", mes: "Julio", dia: 23, diaSemana: "Miércoles", numFecha: "S1", local: "Racing Club (ARG)", visita: "Sporting Cristal", marcador: "3-2", goles: "Soto, Bonnet" },
  { fecha: "1997-07-30", mes: "Julio", dia: 30, diaSemana: "Miércoles", numFecha: "S2", local: "Sporting Cristal", visita: "Racing Club (ARG)", marcador: "4-1", goles: "Bonnet (2), Rivera, Solano" },
  // Final 1997
  { fecha: "1997-08-06", mes: "Agosto", dia: 6, diaSemana: "Miércoles", numFecha: "F1", local: "Sporting Cristal", visita: "Cruzeiro (BRA)", marcador: "0-0", goles: "-" },
  { fecha: "1997-08-13", mes: "Agosto", dia: 13, diaSemana: "Miércoles", numFecha: "F2", local: "Cruzeiro (BRA)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  
  // 1998 - GRUPO 5
  { fecha: "1998-03-04", mes: "Marzo", dia: 4, diaSemana: "Miércoles", numFecha: "1", local: "Alianza Lima", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1998-03-11", mes: "Marzo", dia: 11, diaSemana: "Miércoles", numFecha: "2", local: "Atlético Colón (ARG)", visita: "Sporting Cristal", marcador: "1-0", goles: "-" },
  { fecha: "1998-03-19", mes: "Marzo", dia: 19, diaSemana: "Jueves", numFecha: "3", local: "Sporting Cristal", visita: "River Plate (ARG)", marcador: "2-3", goles: "Ferreira, Mendoza" },
  { fecha: "1998-03-25", mes: "Marzo", dia: 25, diaSemana: "Miércoles", numFecha: "4", local: "Sporting Cristal", visita: "Alianza Lima", marcador: "3-2", goles: "Nilson (2), Mendoza" },
  { fecha: "1998-04-02", mes: "Abril", dia: 2, diaSemana: "Jueves", numFecha: "5", local: "River Plate (ARG)", visita: "Sporting Cristal", marcador: "3-1", goles: "Nilson" },
  { fecha: "1998-04-08", mes: "Abril", dia: 8, diaSemana: "Miércoles", numFecha: "6", local: "Sporting Cristal", visita: "Atlético Colón (ARG)", marcador: "1-1", goles: "Soto" },
  
  // 1999 - GRUPO 4
  { fecha: "1999-02-24", mes: "Febrero", dia: 24, diaSemana: "Miércoles", numFecha: "1", local: "Universitario", visita: "Sporting Cristal", marcador: "2-1", goles: "Gonzales" },
  { fecha: "1999-03-03", mes: "Marzo", dia: 3, diaSemana: "Miércoles", numFecha: "2", local: "Univ. Católica (CHI)", visita: "Sporting Cristal", marcador: "1-1", goles: "Ferreira" },
  { fecha: "1999-03-11", mes: "Marzo", dia: 11, diaSemana: "Jueves", numFecha: "3", local: "Sporting Cristal", visita: "Colo-Colo (CHI)", marcador: "1-1", goles: "Salazar" },
  { fecha: "1999-03-17", mes: "Marzo", dia: 17, diaSemana: "Miércoles", numFecha: "4", local: "Sporting Cristal", visita: "Universitario", marcador: "2-2", goles: "Olcese, Ferreira" },
  { fecha: "1999-03-25", mes: "Marzo", dia: 25, diaSemana: "Jueves", numFecha: "5", local: "Sporting Cristal", visita: "Univ. Católica (CHI)", marcador: "1-1", goles: "Olcese" },
  { fecha: "1999-04-07", mes: "Abril", dia: 7, diaSemana: "Miércoles", numFecha: "6", local: "Colo-Colo (CHI)", visita: "Sporting Cristal", marcador: "1-1", goles: "Ferreira" }
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
const partidosFormateados = partidosLibertadores.map((partido, index) => {
  const esLocal = partido.local === "Sporting Cristal";
  const año = parseInt(partido.fecha.split('-')[0]);
  
  return {
    "Año": año,
    "Mes": partido.mes,
    "Dia": partido.dia,
    "Día de la Semana": partido.diaSemana,
    "Fecha": partido.fecha,
    "Torneo": "Copa Libertadores",
    "Número de Fecha": partido.numFecha,
    "Equipo Local": partido.local,
    "Equipo Visita": partido.visita,
    "Marcador": partido.marcador,
    "Resultado": getResultado(partido.marcador, esLocal),
    "Goles (Solo SC)": partido.goles
  };
});

// Guardar archivo JSON separado
fs.writeFileSync('./libertadores-1962-1999.json', JSON.stringify(partidosFormateados, null, 4), 'utf8');

console.log(`✅ Se han creado ${partidosFormateados.length} partidos de Copa Libertadores (1962-1999)`);
console.log(`📁 Archivo guardado: libertadores-1962-1999.json`);

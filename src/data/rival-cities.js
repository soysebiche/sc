/**
 * City-level geography for the archive map.
 *
 * The published match JSON has no stadium, venue, or neutral-ground field —
 * only Equipo Local / Equipo Visita and País (see data-contract.md). Upcoming
 * fixtures may carry a `venue` string, but that file is not the historical
 * archive and is empty between seasons. Do not treat these coordinates as
 * grounds: they are city centroids.
 *
 * Coordinates (WGS84, 4 decimal degrees, ~11 m) are city centroids from
 * GeoNames (https://www.geonames.org/) and Wikipedia city infoboxes, consulted
 * 2026-11. Club → city is the club's documented home city (Wikipedia club
 * pages and Liga 1 / CONMEBOL club lists), a stable public fact, not the
 * stadium of any given match. Temporary relocations and neutrals are omitted
 * because the archive cannot support them.
 *
 * Lookup key: `${canonicalizeRival(name)}|${country}`. Two archive names exist
 * in more than one country and MUST be disambiguated by País:
 *   Estudiantes        → Ica (Perú, 2001) / La Plata (Argentina)
 *   Universidad Católica → Santiago (Chile) / Quito (Ecuador, 1974)
 * Internazionale (1987, Torneo Regional Zona Metropolitana) is the Lima club,
 * not Inter Milan. América is Club América (México). Nacional is Uruguay.
 * Pirata (1970) is left unmapped: that name is not among the 1970
 * Descentralizado participants listed by Wikipedia, so the city is not a
 * public fact we can cite.
 */

export const CITY_COORDS = Object.freeze({
  lima: { id: 'lima', name: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428 },
  callao: { id: 'callao', name: 'Callao', country: 'Perú', lat: -12.0566, lng: -77.1181 },
  arequipa: { id: 'arequipa', name: 'Arequipa', country: 'Perú', lat: -16.3988, lng: -71.5369 },
  cusco: { id: 'cusco', name: 'Cusco', country: 'Perú', lat: -13.5319, lng: -71.9675 },
  trujillo: { id: 'trujillo', name: 'Trujillo', country: 'Perú', lat: -8.1116, lng: -79.0288 },
  chiclayo: { id: 'chiclayo', name: 'Chiclayo', country: 'Perú', lat: -6.7714, lng: -79.8409 },
  piura: { id: 'piura', name: 'Piura', country: 'Perú', lat: -5.1945, lng: -80.6328 },
  iquitos: { id: 'iquitos', name: 'Iquitos', country: 'Perú', lat: -3.7491, lng: -73.2538 },
  huancayo: { id: 'huancayo', name: 'Huancayo', country: 'Perú', lat: -12.0651, lng: -75.2049 },
  cajamarca: { id: 'cajamarca', name: 'Cajamarca', country: 'Perú', lat: -7.1638, lng: -78.5003 },
  huanuco: { id: 'huanuco', name: 'Huánuco', country: 'Perú', lat: -9.9306, lng: -76.2422 },
  huaraz: { id: 'huaraz', name: 'Huaraz', country: 'Perú', lat: -9.5278, lng: -77.5278 },
  ayacucho: { id: 'ayacucho', name: 'Ayacucho', country: 'Perú', lat: -13.1588, lng: -74.2232 },
  puno: { id: 'puno', name: 'Puno', country: 'Perú', lat: -15.8402, lng: -70.0219 },
  tacna: { id: 'tacna', name: 'Tacna', country: 'Perú', lat: -18.0066, lng: -70.2463 },
  ica: { id: 'ica', name: 'Ica', country: 'Perú', lat: -14.0678, lng: -75.7286 },
  sullana: { id: 'sullana', name: 'Sullana', country: 'Perú', lat: -4.9039, lng: -80.6853 },
  chimbote: { id: 'chimbote', name: 'Chimbote', country: 'Perú', lat: -9.0853, lng: -78.5783 },
  moquegua: { id: 'moquegua', name: 'Moquegua', country: 'Perú', lat: -17.1939, lng: -70.9349 },
  tarma: { id: 'tarma', name: 'Tarma', country: 'Perú', lat: -11.4197, lng: -75.6908 },
  huaral: { id: 'huaral', name: 'Huaral', country: 'Perú', lat: -11.4950, lng: -77.2078 },
  cutervo: { id: 'cutervo', name: 'Cutervo', country: 'Perú', lat: -6.3799, lng: -78.8187 },
  andahuaylas: { id: 'andahuaylas', name: 'Andahuaylas', country: 'Perú', lat: -13.6556, lng: -73.3872 },
  'nueva-cajamarca': { id: 'nueva-cajamarca', name: 'Nueva Cajamarca', country: 'Perú', lat: -5.9361, lng: -77.3100 },
  'cerro-de-pasco': { id: 'cerro-de-pasco', name: 'Cerro de Pasco', country: 'Perú', lat: -10.6675, lng: -76.2569 },
  pucallpa: { id: 'pucallpa', name: 'Pucallpa', country: 'Perú', lat: -8.3791, lng: -74.5539 },
  talara: { id: 'talara', name: 'Talara', country: 'Perú', lat: -4.5772, lng: -81.2719 },
  sechura: { id: 'sechura', name: 'Sechura', country: 'Perú', lat: -5.5569, lng: -80.8222 },
  matucana: { id: 'matucana', name: 'Matucana', country: 'Perú', lat: -11.8447, lng: -76.3860 },
  lambayeque: { id: 'lambayeque', name: 'Lambayeque', country: 'Perú', lat: -6.7011, lng: -79.9061 },
  chongoyape: { id: 'chongoyape', name: 'Chongoyape', country: 'Perú', lat: -6.6406, lng: -79.3853 },
  'puerto-eten': { id: 'puerto-eten', name: 'Puerto Eten', country: 'Perú', lat: -6.9258, lng: -79.8644 },
  tuman: { id: 'tuman', name: 'Tumán', country: 'Perú', lat: -6.7514, lng: -79.7292 },
  yurimaguas: { id: 'yurimaguas', name: 'Yurimaguas', country: 'Perú', lat: -5.9003, lng: -76.1222 },
  huaura: { id: 'huaura', name: 'Huaura', country: 'Perú', lat: -11.0697, lng: -77.5992 },
  canete: { id: 'canete', name: 'San Vicente de Cañete', country: 'Perú', lat: -13.0778, lng: -76.3875 },
  chancay: { id: 'chancay', name: 'Chancay', country: 'Perú', lat: -11.5625, lng: -77.2703 },
  'san-ramon': { id: 'san-ramon', name: 'San Ramón', country: 'Perú', lat: -11.1225, lng: -75.3586 },
  llacuabamba: { id: 'llacuabamba', name: 'Llacuabamba', country: 'Perú', lat: -7.8470, lng: -77.5430 },
  unicachi: { id: 'unicachi', name: 'Unicachi', country: 'Perú', lat: -16.2167, lng: -68.9833 },
  desaguadero: { id: 'desaguadero', name: 'Desaguadero', country: 'Perú', lat: -16.5656, lng: -69.0419 },

  'buenos-aires': { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
  'la-plata': { id: 'la-plata', name: 'La Plata', country: 'Argentina', lat: -34.9215, lng: -57.9545 },
  rosario: { id: 'rosario', name: 'Rosario', country: 'Argentina', lat: -32.9468, lng: -60.6393 },
  cordoba: { id: 'cordoba', name: 'Córdoba', country: 'Argentina', lat: -31.4201, lng: -64.1888 },
  'godoy-cruz': { id: 'godoy-cruz', name: 'Godoy Cruz', country: 'Argentina', lat: -32.9286, lng: -68.8351 },
  'santa-fe': { id: 'santa-fe', name: 'Santa Fe', country: 'Argentina', lat: -31.6333, lng: -60.7000 },
  avellaneda: { id: 'avellaneda', name: 'Avellaneda', country: 'Argentina', lat: -34.6627, lng: -58.3653 },
  sarandi: { id: 'sarandi', name: 'Sarandí', country: 'Argentina', lat: -34.6806, lng: -58.3406 },
  lanus: { id: 'lanus', name: 'Lanús', country: 'Argentina', lat: -34.7078, lng: -58.3911 },
  tigre: { id: 'tigre', name: 'Tigre', country: 'Argentina', lat: -34.4264, lng: -58.5797 },

  'rio-de-janeiro': { id: 'rio-de-janeiro', name: 'Río de Janeiro', country: 'Brasil', lat: -22.9068, lng: -43.1729 },
  'sao-paulo': { id: 'sao-paulo', name: 'São Paulo', country: 'Brasil', lat: -23.5505, lng: -46.6333 },
  santos: { id: 'santos', name: 'Santos', country: 'Brasil', lat: -23.9608, lng: -46.3336 },
  'porto-alegre': { id: 'porto-alegre', name: 'Porto Alegre', country: 'Brasil', lat: -30.0346, lng: -51.2177 },
  'belo-horizonte': { id: 'belo-horizonte', name: 'Belo Horizonte', country: 'Brasil', lat: -19.9167, lng: -43.9345 },
  curitiba: { id: 'curitiba', name: 'Curitiba', country: 'Brasil', lat: -25.4284, lng: -49.2733 },
  criciuma: { id: 'criciuma', name: 'Criciúma', country: 'Brasil', lat: -28.6775, lng: -49.3697 },
  belem: { id: 'belem', name: 'Belém', country: 'Brasil', lat: -1.4558, lng: -48.4902 },
  'braganca-paulista': { id: 'braganca-paulista', name: 'Bragança Paulista', country: 'Brasil', lat: -22.9520, lng: -46.5419 },

  santiago: { id: 'santiago', name: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
  valparaiso: { id: 'valparaiso', name: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127 },
  calama: { id: 'calama', name: 'Calama', country: 'Chile', lat: -22.4624, lng: -68.9272 },
  concepcion: { id: 'concepcion', name: 'Concepción', country: 'Chile', lat: -36.8270, lng: -73.0503 },

  bogota: { id: 'bogota', name: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721 },
  medellin: { id: 'medellin', name: 'Medellín', country: 'Colombia', lat: 6.2476, lng: -75.5658 },
  cali: { id: 'cali', name: 'Cali', country: 'Colombia', lat: 3.4516, lng: -76.5320 },
  barranquilla: { id: 'barranquilla', name: 'Barranquilla', country: 'Colombia', lat: 10.9685, lng: -74.7813 },

  guayaquil: { id: 'guayaquil', name: 'Guayaquil', country: 'Ecuador', lat: -2.1894, lng: -79.8891 },
  quito: { id: 'quito', name: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678 },
  cuenca: { id: 'cuenca', name: 'Cuenca', country: 'Ecuador', lat: -2.9001, lng: -79.0059 },

  'ciudad-de-mexico': { id: 'ciudad-de-mexico', name: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332 },
  pachuca: { id: 'pachuca', name: 'Pachuca', country: 'México', lat: 20.1011, lng: -98.7591 },
  morelia: { id: 'morelia', name: 'Morelia', country: 'México', lat: 19.7029, lng: -101.1920 },
  torreon: { id: 'torreon', name: 'Torreón', country: 'México', lat: 25.5428, lng: -103.4068 },

  asuncion: { id: 'asuncion', name: 'Asunción', country: 'Paraguay', lat: -25.2637, lng: -57.5759 },
  'pedro-juan-caballero': { id: 'pedro-juan-caballero', name: 'Pedro Juan Caballero', country: 'Paraguay', lat: -22.5472, lng: -55.7333 },

  montevideo: { id: 'montevideo', name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645 },

  'kansas-city': { id: 'kansas-city', name: 'Kansas City', country: 'USA', lat: 39.0997, lng: -94.5786 },

  caracas: { id: 'caracas', name: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036 },
  valencia: { id: 'valencia', name: 'Valencia', country: 'Venezuela', lat: 10.1620, lng: -68.0078 },
  'san-cristobal': { id: 'san-cristobal', name: 'San Cristóbal', country: 'Venezuela', lat: 7.7669, lng: -72.2250 },
  'ciudad-guayana': { id: 'ciudad-guayana', name: 'Ciudad Guayana', country: 'Venezuela', lat: 8.3114, lng: -62.7186 },
  merida: { id: 'merida', name: 'Mérida', country: 'Venezuela', lat: 8.5897, lng: -71.1561 },
  acarigua: { id: 'acarigua', name: 'Acarigua', country: 'Venezuela', lat: 9.5545, lng: -69.1956 },
  maracaibo: { id: 'maracaibo', name: 'Maracaibo', country: 'Venezuela', lat: 10.6427, lng: -71.6125 },

  'la-paz': { id: 'la-paz', name: 'La Paz', country: 'Bolivia', lat: -16.5000, lng: -68.1500 },
  'el-alto': { id: 'el-alto', name: 'El Alto', country: 'Bolivia', lat: -16.5042, lng: -68.1856 },
  cochabamba: { id: 'cochabamba', name: 'Cochabamba', country: 'Bolivia', lat: -17.3895, lng: -66.1568 },
  'santa-cruz': { id: 'santa-cruz', name: 'Santa Cruz de la Sierra', country: 'Bolivia', lat: -17.7833, lng: -63.1821 },
});

const RIVAL_CITY_ROWS = Object.freeze([
  ['A.D.T.', 'Perú', 'tarma'],
  ['Academia Cantolao', 'Perú', 'callao'],
  ['AELU', 'Perú', 'lima'],
  ['Alcides Vigo', 'Perú', 'lima'],
  ['Alfonso Ugarte', 'Perú', 'puno'],
  ['Alianza Atlético', 'Perú', 'sullana'],
  ['Alianza Lima', 'Perú', 'lima'],
  ['Alianza Unicachi', 'Perú', 'unicachi'],
  ['Alianza Universidad', 'Perú', 'huanuco'],
  ['Atlético Chalaco', 'Perú', 'callao'],
  ['Atlético Grau', 'Perú', 'piura'],
  ['Atlético Minero', 'Perú', 'matucana'],
  ['Atlético Torino', 'Perú', 'talara'],
  ['Atlético Universidad', 'Perú', 'arequipa'],
  ['Ayacucho FC', 'Perú', 'ayacucho'],
  ['Bentín Tacna Heroica', 'Perú', 'tacna'],
  ['Bolognesi', 'Perú', 'tacna'],
  ['C.N.I.', 'Perú', 'iquitos'],
  ['Carlos A. Mannucci', 'Perú', 'trujillo'],
  ['Carlos Concha', 'Perú', 'callao'],
  ['Centro Iqueño', 'Perú', 'lima'],
  ['César Vallejo', 'Perú', 'trujillo'],
  ['Ciclista Lima', 'Perú', 'lima'],
  ['Cienciano', 'Perú', 'cusco'],
  ['Cobresol FBC', 'Perú', 'moquegua'],
  ['Comerciantes FC', 'Perú', 'iquitos'],
  ['Comerciantes Unidos', 'Perú', 'cutervo'],
  ['Coopsol', 'Perú', 'canete'],
  ['Coronel Bolognesi', 'Perú', 'tacna'],
  ['Cusco FC', 'Perú', 'cusco'],
  ['Defensor Arica', 'Perú', 'lima'],
  ['Defensor La Bocana', 'Perú', 'sechura'],
  ['Defensor Lima', 'Perú', 'lima'],
  ['Dep. Los Chankas', 'Perú', 'andahuaylas'],
  ['Dep. Moquegua', 'Perú', 'moquegua'],
  ['Deportivo Garcilaso', 'Perú', 'cusco'],
  ['Deportivo Junín', 'Perú', 'huancayo'],
  ['Deportivo Llacuabamba', 'Perú', 'llacuabamba'],
  ['Deportivo Municipal', 'Perú', 'lima'],
  ['Deportivo Pesquero', 'Perú', 'chimbote'],
  ['Deportivo Pucallpa', 'Perú', 'pucallpa'],
  ['Deportivo San Agustín', 'Perú', 'lima'],
  ['Deportivo Sipesa', 'Perú', 'chimbote'],
  ['Deportivo Wanka', 'Perú', 'huancayo'],
  ['EMD Binacional', 'Perú', 'desaguadero'],
  ['Estudiantes', 'Perú', 'ica'],
  ['Estudiantes CNI', 'Perú', 'iquitos'],
  ['Estudiantes de Medicina', 'Perú', 'ica'],
  ['FBC Melgar', 'Perú', 'arequipa'],
  ['FC Cajamarca', 'Perú', 'cajamarca'],
  ['FC Carlos Stein', 'Perú', 'lambayeque'],
  ['Grau Estudiantes', 'Perú', 'piura'],
  ['Guardia Republicana', 'Perú', 'lima'],
  ['Huancayo FC', 'Perú', 'huancayo'],
  ['Hungaritos Agustinos', 'Perú', 'iquitos'],
  ['IMI F.C.', 'Perú', 'talara'],
  ['Internazionale', 'Perú', 'lima'],
  ['Inti Gas', 'Perú', 'ayacucho'],
  ['José Gálvez', 'Perú', 'chimbote'],
  ['Juan Aurich', 'Perú', 'chiclayo'],
  ['Juan Pablo II', 'Perú', 'chongoyape'],
  ['Juventud La Joya', 'Perú', 'chancay'],
  ['KDT Nacional', 'Perú', 'callao'],
  ['La Loretana', 'Perú', 'pucallpa'],
  ['La Palma', 'Perú', 'huaura'],
  ['Lawn Tennis', 'Perú', 'lima'],
  ['León de Huánuco', 'Perú', 'huanuco'],
  ['Los Caimanes', 'Perú', 'puerto-eten'],
  ['Mariscal Sucre', 'Perú', 'lima'],
  ['Mina San Vicente', 'Perú', 'san-ramon'],
  ['Municipal', 'Perú', 'lima'],
  ['Octavio Espinoza', 'Perú', 'ica'],
  ['Pacifico FC', 'Perú', 'lima'],
  ['Pirata FC', 'Perú', 'chiclayo'],
  ['Porvenir Miraflores', 'Perú', 'lima'],
  ['Real Garcilaso', 'Perú', 'cusco'],
  ['San Agustín', 'Perú', 'lima'],
  ['San Simón', 'Perú', 'moquegua'],
  ['SIMA', 'Perú', 'callao'],
  ['Sport Áncash', 'Perú', 'huaraz'],
  ['Sport Boys', 'Perú', 'callao'],
  ['Sport Huancayo', 'Perú', 'huancayo'],
  ['Sport Loreto', 'Perú', 'pucallpa'],
  ['Sport Rosario', 'Perú', 'huaraz'],
  ['Total Chalaco', 'Perú', 'callao'],
  ['Total Clean', 'Perú', 'arequipa'],
  ['Tumán', 'Perú', 'tuman'],
  ['U.P.A.O.', 'Perú', 'trujillo'],
  ['U.T.C.', 'Perú', 'cajamarca'],
  ['Unión Comercio', 'Perú', 'nueva-cajamarca'],
  ['Unión Huaral', 'Perú', 'huaral'],
  ['Unión Minas', 'Perú', 'cerro-de-pasco'],
  ['Universidad César Vallejo', 'Perú', 'trujillo'],
  ['Universidad San Martín', 'Perú', 'lima'],
  ['Universidad San Martín de Porres', 'Perú', 'lima'],
  ['Universitario', 'Perú', 'lima'],
  ['Wanka', 'Perú', 'huancayo'],
  ['Yurimaguas', 'Perú', 'yurimaguas'],

  ['Arsenal de Sarandí', 'Argentina', 'sarandi'],
  ['Atlético Colón', 'Argentina', 'santa-fe'],
  ['Boca Juniors', 'Argentina', 'buenos-aires'],
  ['Estudiantes', 'Argentina', 'la-plata'],
  ['Godoy Cruz', 'Argentina', 'godoy-cruz'],
  ['Huracán', 'Argentina', 'buenos-aires'],
  ['Lanús', 'Argentina', 'lanus'],
  ['Racing Club', 'Argentina', 'avellaneda'],
  ['River Plate', 'Argentina', 'buenos-aires'],
  ['Rosario Central', 'Argentina', 'rosario'],
  ['Talleres', 'Argentina', 'cordoba'],
  ['Tigre', 'Argentina', 'tigre'],
  ['Vélez Sarsfield', 'Argentina', 'buenos-aires'],

  ['Always Ready', 'Bolivia', 'el-alto'],
  ['Bolívar', 'Bolivia', 'la-paz'],
  ['Jorge Wilstermann', 'Bolivia', 'cochabamba'],
  ['Oriente Petrolero', 'Bolivia', 'santa-cruz'],
  ['The Strongest', 'Bolivia', 'la-paz'],

  ['Athletico Paranaense', 'Brasil', 'curitiba'],
  ['Coritiba', 'Brasil', 'curitiba'],
  ['Criciúma', 'Brasil', 'criciuma'],
  ['Cruzeiro', 'Brasil', 'belo-horizonte'],
  ['Flamengo', 'Brasil', 'rio-de-janeiro'],
  ['Fluminense', 'Brasil', 'rio-de-janeiro'],
  ['Gremio', 'Brasil', 'porto-alegre'],
  ['Palmeiras', 'Brasil', 'sao-paulo'],
  ['Paysandu', 'Brasil', 'belem'],
  ['Red Bull Bragantino', 'Brasil', 'braganca-paulista'],
  ['Santos', 'Brasil', 'santos'],
  ['São Paulo', 'Brasil', 'sao-paulo'],

  ['Cobreloa', 'Chile', 'calama'],
  ['Colo-Colo', 'Chile', 'santiago'],
  ['Santiago Wanderers', 'Chile', 'valparaiso'],
  ['Unión Española', 'Chile', 'santiago'],
  ['Universidad Católica', 'Chile', 'santiago'],
  ['Universidad de Chile', 'Chile', 'santiago'],
  ['Universidad de Concepción', 'Chile', 'concepcion'],

  ['América de Cali', 'Colombia', 'cali'],
  ['Atlético Nacional', 'Colombia', 'medellin'],
  ['Independiente Santa Fe', 'Colombia', 'bogota'],
  ['Junior', 'Colombia', 'barranquilla'],
  ['Millonarios', 'Colombia', 'bogota'],

  ['Barcelona SC', 'Ecuador', 'guayaquil'],
  ['Deportivo Cuenca', 'Ecuador', 'cuenca'],
  ['El Nacional', 'Ecuador', 'quito'],
  ['Emelec', 'Ecuador', 'guayaquil'],
  ['Universidad Católica', 'Ecuador', 'quito'],

  ['América', 'México', 'ciudad-de-mexico'],
  ['Morelia', 'México', 'morelia'],
  ['Pachuca', 'México', 'pachuca'],
  ['Santos Laguna', 'México', 'torreon'],

  ['2 de Mayo', 'Paraguay', 'pedro-juan-caballero'],
  ['Atlético Colegiales', 'Paraguay', 'asuncion'],
  ['Cerro Porteño', 'Paraguay', 'asuncion'],
  ['Guaraní', 'Paraguay', 'asuncion'],
  ['Libertad', 'Paraguay', 'asuncion'],
  ['Olimpia', 'Paraguay', 'asuncion'],

  ['Defensor Sporting', 'Uruguay', 'montevideo'],
  ['Nacional', 'Uruguay', 'montevideo'],
  ['Peñarol', 'Uruguay', 'montevideo'],
  ['Rentistas', 'Uruguay', 'montevideo'],

  ['Kansas City Wizards', 'USA', 'kansas-city'],

  ['Carabobo', 'Venezuela', 'valencia'],
  ['Caracas FC', 'Venezuela', 'caracas'],
  ['Deportivo Portugués', 'Venezuela', 'caracas'],
  ['Deportivo Táchira', 'Venezuela', 'san-cristobal'],
  ['Minervén', 'Venezuela', 'ciudad-guayana'],
  ['Portuguesa', 'Venezuela', 'acarigua'],
  ['Universidad Los Andes', 'Venezuela', 'merida'],
  ['Zulia FC', 'Venezuela', 'maracaibo'],
]);

export const RIVAL_HOME_CITY = Object.freeze(Object.fromEntries(
  RIVAL_CITY_ROWS.map(([name, country, cityId]) => [`${name}|${country}`, cityId]),
));

export const CITY_IDS = Object.freeze(Object.keys(CITY_COORDS));

export const UNMAPPED_RIVAL_KEYS = Object.freeze(['Pirata|Perú']);

export function isKnownCityId(value) {
  return Object.prototype.hasOwnProperty.call(CITY_COORDS, value);
}

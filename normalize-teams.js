const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const nameMappings = {
  'Boca Junior': 'Boca Juniors',
  'Boca Juniors': 'Boca Juniors',
  'Club Nacional': 'Nacional',
  'Nacional (URU)': 'Nacional',
  'Nacional': 'Nacional',
  'América de Cali (COL)': 'América de Cali',
  'América de Cali': 'América de Cali',
  'Atlético Nacional (COL)': 'Atlético Nacional',
  'Atlético Nacional': 'Atlético Nacional',
  'Cerro Porteño (PAR)': 'Cerro Porteño',
  'Cerro Porteño': 'Cerro Porteño',
  'Always Ready (BOL)': 'Always Ready',
  'Always Ready': 'Always Ready',
  'Bolívar (BOL)': 'Bolívar',
  'Bolívar': 'Bolívar',
  'The Strongest (BOL)': 'The Strongest',
  'The Strongest': 'The Strongest',
  'Olimpia (PAR)': 'Olimpia',
  'Olimpia': 'Olimpia',
  'Peñarol (URU)': 'Peñarol',
  'Peñarol': 'Peñarol',
  'River Plate (ARG)': 'River Plate',
  'River Plate': 'River Plate',
  'Racing Club (ARG)': 'Racing Club',
  'Racing Club': 'Racing Club',
  'Rosario Central (ARG)': 'Rosario Central',
  'Rosario Central': 'Rosario Central',
  'Emelec (ECU)': 'Emelec',
  'Emelec': 'Emelec',
  'Barcelona (ECU)': 'Barcelona SC',
  'Barcelona': 'Barcelona SC',
  'Univ. Católica (CHI)': 'Universidad Católica',
  'Univ. Católica': 'Universidad Católica',
  'Univ. de Chile (CHI)': 'Universidad de Chile',
  'Univ. de Chile': 'Universidad de Chile',
  'Colo-Colo (CHI)': 'Colo-Colo',
  'Colo-Colo': 'Colo-Colo',
  'Cobreloa (CHI)': 'Cobreloa',
  'Cobreloa': 'Cobreloa',
  'Santiago Wanderers (CHI)': 'Santiago Wanderers',
  'El Nacional (ECU)': 'El Nacional',
  'Deportivo Táchira': 'Deportivo Táchira',
  'Dep. Portugués (VEN)': 'Deportivo Portugués',
  'Caracas Fc. (VEN)': 'Caracas FC',
  'Zulia FC': 'Zulia FC',
  'Unión Española': 'Unión Española',
  'Lanús': 'Lanús',
  'Arsenal de Sarandí': 'Arsenal de Sarandí',
  'Pachuca CF': 'Pachuca',
  'Pachuca': 'Pachuca',
  'Santos Laguna': 'Santos Laguna',
  'Morelia': 'Morelia',
  'Kansas City Wizards': 'Kansas City Wizards',
  'Oriente Petrolero (BOL)': 'Oriente Petrolero',
  'Estudiantes': 'Estudiantes',
  'Talleres': 'Talleres',
  'Godoy Cruz': 'Godoy Cruz',
  'Huracán': 'Huracán',
  'Tigre': 'Tigre',
  'Vélez Sarsfield (ARG)': 'Vélez Sarsfield',
  'Vélez Sarsfield': 'Vélez Sarsfield',
  'Atlético Colón (ARG)': 'Atlético Colón',
  'Coritiba FC': 'Coritiba',
  'Cruzeiro (BRA)': 'Cruzeiro',
  'Cruzeiro': 'Cruzeiro',
  'Gremio (BRA)': 'Grêmio',
  'Flamengo': 'Flamengo',
  'Fluminense FC': 'Fluminense',
  'Palmeiras': 'Palmeiras',
  'Santos': 'Santos',
  'São Paulo': 'São Paulo',
  'Atlético Paranaense': 'Athletico Paranaense',
  'Criciúma (BRA)': 'Criciúma',
  'Paysandu': 'Paysandu',
  'Libertad': 'Libertad',
  'Guaraní': 'Guaraní',
  'Atl. Colegiales': 'Atlético Colegiales',
  'Indep. Santa Fe': 'Independiente Santa Fe',
  'Deportivo Cuenca': 'Deportivo Cuenca',
  'Rentistas': 'Rentistas',
  'Univ. Los Andes (VEN)': 'Universidad Los Andes',
  'Univ. de Concepción': 'Universidad de Concepción',
  'Minervén (VEN)': 'Minervén',
};

let normalized = 0;

historico = historico.map(match => {
  ['Equipo Local', 'Equipo Visita'].forEach(field => {
    const original = match[field];
    const normalizedName = nameMappings[original] || original.replace(/\s*\([A-Z]{3}\)\s*$/, '').trim();
    if (original !== normalizedName) {
      match[field] = normalizedName;
      normalized++;
    }
  });
  return match;
});

let teamsAfter = new Set([...historico.map(m=>m['Equipo Local']),...historico.map(m=>m['Equipo Visita'])]).size;

fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));

console.log(`Normalized ${normalized} team references`);
console.log(`Unique teams: ${teamsAfter}`);

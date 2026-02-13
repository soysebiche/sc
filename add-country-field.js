const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

// Map of team names to countries
const teamCountries = {
  'Always Ready (BOL)': 'Bolivia',
  'América de Cali (COL)': 'Colombia',
  'Atlético Colón (ARG)': 'Argentina',
  'Atlético Nacional (COL)': 'Colombia',
  'Boca Junior (ARG)': 'Argentina',
  'Bolívar (BOL)': 'Bolivia',
  'Caracas Fc. (VEN)': 'Venezuela',
  'Cerro Porteño (PAR)': 'Paraguay',
  'Cobreloa (CHI)': 'Chile',
  'Colo-Colo (CHI)': 'Chile',
  'Criciúma (BRA)': 'Brasil',
  'Cruzeiro (BRA)': 'Brasil',
  'Defensor Sporting (URU)': 'Uruguay',
  'Dep. Portugués (VEN)': 'Venezuela',
  'El Nacional (ECU)': 'Ecuador',
  'Emelec (ECU)': 'Ecuador',
  'Gremio (BRA)': 'Brasil',
  'Jorge Wilstermann (BOL)': 'Bolivia',
  'Minervén (VEN)': 'Venezuela',
  'Nacional (URU)': 'Uruguay',
  'Olimpia (PAR)': 'Paraguay',
  'Oriente Petrolero (BOL)': 'Bolivia',
  'Peñarol (URU)': 'Uruguay',
  'Portuguesa (VEN)': 'Venezuela',
  'Racing Club (ARG)': 'Argentina',
  'River Plate (ARG)': 'Argentina',
  'Rosario Central (ARG)': 'Argentina',
  'Santiago Wanderers (CHI)': 'Chile',
  'The Strongest (BOL)': 'Bolivia',
  'Univ. Católica (CHI)': 'Chile',
  'Univ. Católica (ECU)': 'Ecuador',
  'Univ. Los Andes (VEN)': 'Venezuela',
  'Univ. de Chile (CHI)': 'Chile',
  'Vélez Sarsfield (ARG)': 'Argentina'
};

// Function to get country from team name
const getCountry = (teamName) => {
  if (!teamName) return 'Perú';
  if (teamCountries[teamName]) return teamCountries[teamName];
  
  // Check if team has parentheses with country code
  const match = teamName.match(/\(([A-Z]{3})\)/);
  if (match) {
    const codes = {
      'ARG': 'Argentina', 'BOL': 'Bolivia', 'BRA': 'Brasil',
      'CHI': 'Chile', 'COL': 'Colombia', 'ECU': 'Ecuador',
      'PAR': 'Paraguay', 'URU': 'Uruguay', 'VEN': 'Venezuela', 'MEX': 'México', 'USA': 'Estados Unidos'
    };
    return codes[match[1]] || match[1];
  }
  
  return 'Perú';
};

// Add country field to each match
const updated = historico.map(match => ({
  ...match,
  'País': match.Torneo && ['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte', 'Copa América', 'Copa Iberoamericana'].includes(match.Torneo) 
    ? getCountry(match['Equipo Local'] === 'Sporting Cristal' ? match['Equipo Visita'] : match['Equipo Local'])
    : 'Perú'
}));

fs.writeFileSync(historicoPath, JSON.stringify(updated, null, 2));
console.log(`Added country field to ${updated.length} matches`);

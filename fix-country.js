const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const intlTournaments = ['Libertadores', 'Sudamericana', 'Merconorte', 'Iberoamericana', 'Copa América'];

function getCountry(teamName, tournament, isHome) {
  const isInternational = tournament && intlTournaments.some(t => tournament.includes(t));
  if (!isInternational) return 'Perú';
  
  // For international matches, if Sporting Cristal is playing away, the home team is foreign
  // If Sporting Cristal is home, we need to check the away team
  // So we just need to return the country of the other team
  
  if (!teamName) return 'Perú';
  
  // Check for country code in parentheses
  const match = teamName.match(/\(([A-Z]{3})\)/);
  if (match) {
    const codes = {
      'ARG': 'Argentina', 'BOL': 'Bolivia', 'BRA': 'Brasil',
      'CHI': 'Chile', 'COL': 'Colombia', 'ECU': 'Ecuador',
      'PAR': 'Paraguay', 'URU': 'Uruguay', 'VEN': 'Venezuela'
    };
    return codes[match[1]] || match[1];
  }
  
  // If no parentheses but it's a known foreign team, return the country
  const foreignTeams = {
    'Rosario Central': 'Argentina',
    'Nacional': 'Uruguay',
    'Peñarol': 'Uruguay',
    'Boca Junior': 'Argentina',
    'River Plate': 'Argentina',
    'Racing Club': 'Argentina',
    'Colo-Colo': 'Chile',
    'Cobreloa': 'Chile',
    'Univ. de Chile': 'Chile',
    'Emelec': 'Ecuador',
    'El Nacional': 'Ecuador',
    'Bolívar': 'Bolivia',
    'The Strongest': 'Bolivia',
    'Olimpia': 'Paraguay',
    'Cerro Porteño': 'Paraguay',
    'Gremio': 'Brasil',
    'Cruzeiro': 'Brasil'
  };
  
  if (foreignTeams[teamName]) return foreignTeams[teamName];
  
  return 'Perú';
}

historico = historico.map(match => {
  const rival = match['Equipo Local'] === 'Sporting Cristal' ? match['Equipo Visita'] : match['Equipo Local'];
  const isHome = match['Equipo Local'] === 'Sporting Cristal';
  return { ...match, 'País': getCountry(rival, match.Torneo, isHome) };
});

fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));

const intl = historico.filter(m => m['País'] && m['País'] !== 'Perú');
const years = [...new Set(intl.map(m => m.Año))].sort((a,b) => a-b);
console.log('Total matches:', historico.length);
console.log('Intl matches:', intl.length, 'Years:', years);

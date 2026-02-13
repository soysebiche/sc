const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, 'src/data/historico_completo_sc.json');
let historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));

const teamCountries = {
  'Alianza Lima': 'Perú',
  'Always Ready': 'Bolivia',
  'América': 'Colombia',
  'América de Cali': 'Colombia',
  'Atl. Colegiales': 'Paraguay',
  'Atlético Chalaco': 'Perú',
  'Atlético Nacional': 'Colombia',
  'Atlético Paranaense': 'Brasil',
  'Atlético Torino': 'Perú',
  'Barcelona': 'Ecuador',
  'Boca Juniors': 'Argentina',
  'Cerro Porteño': 'Paraguay',
  'Club Nacional': 'Uruguay',
  'Coritiba FC': 'Brasil',
  'Cruzeiro': 'Brasil',
  'Defensor Lima': 'Perú',
  'Deportivo Cuenca': 'Ecuador',
  'Deportivo Táchira': 'Venezuela',
  'Emelec': 'Ecuador',
  'Estudiantes': 'Argentina',
  'Flamengo': 'Brasil',
  'Fluminense FC': 'Brasil',
  'Godoy Cruz': 'Argentina',
  'Guaraní': 'Paraguay',
  'Huracán': 'Argentina',
  'Indep. Santa Fe': 'Colombia',
  'Juan Aurich': 'Perú',
  'Libertad': 'Paraguay',
  'Melgar Fc.': 'Perú',
  'Morelia': 'México',
  'Nacional': 'Uruguay',
  'Olimpia': 'Paraguay',
  'Pachuca CF': 'México',
  'Palmeiras': 'Brasil',
  'Paysandu': 'Brasil',
  'Peñarol': 'Uruguay',
  'Racing Club': 'Argentina',
  'Rentistas': 'Uruguay',
  'River Plate': 'Argentina',
  'Rosario Central': 'Argentina',
  'Santos': 'Brasil',
  'São Paulo': 'Brasil',
  'Talleres': 'Argentina',
  'The Strongest': 'Bolivia',
  'Tigre': 'Argentina',
  'Univ. Católica': 'Chile',
  'Univ. de Concepción': 'Chile',
  'Universitario': 'Perú',
  'Unión Huaral': 'Perú',
  'Vélez Sarsfield': 'Argentina',
  'Bolívar': 'Bolivia',
  'Sport Boys': 'Perú'
};

const intlTournaments = ['Libertadores', 'Sudamericana', 'Merconorte', 'Iberoamericana', 'Copa América'];

let updated = 0;

historico = historico.map(match => {
  const isIntl = match.Torneo && intlTournaments.some(t => match.Torneo.includes(t));
  if (!isIntl) return match;
  
  const rival = match['Equipo Local'] === 'Sporting Cristal' ? match['Equipo Visita'] : match['Equipo Local'];
  
  if (teamCountries[rival]) {
    if (match['País'] !== teamCountries[rival]) {
      match['País'] = teamCountries[rival];
      updated++;
    }
  }
  
  return match;
});

fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));

const intl = historico.filter(m => m['País'] && m['País'] !== 'Perú');
const countries = [...new Set(intl.map(m => m['País']))].sort();
console.log('Updated:', updated);
console.log('Countries:', countries.join(', '));

// Service para cargar datos históricos de Sporting Cristal
import completoData from '../data/historico_completo_sc.json';
import incaData from '../data/historico_inca_sc.json';
import conmebolData from '../data/historico_conmebol_sc.json';

class VercelDataService {
  // Los datos se cargan directamente desde archivos JSON locales incluidos en el bundle
  // Sin async para evitar delay de carga

  fetchConmebolData() {
    return conmebolData;
  }

  fetchIncaData() {
    return incaData;
  }

  fetchCompleteData() {
    return completoData;
  }

  fetchAllData() {
    return {
      conmebol: conmebolData,
      inca: incaData,
      completo: completoData
    };
  }
}

const vercelDataService = new VercelDataService();
export default vercelDataService;

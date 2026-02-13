// Service para cargar datos históricos de Sporting Cristal
import completoData from '../data/historico_completo_sc.json';

class VercelDataService {
  fetchCompleteData() {
    return completoData;
  }

  fetchAllData() {
    return {
      completo: completoData
    };
  }
}

const vercelDataService = new VercelDataService();
export default vercelDataService;

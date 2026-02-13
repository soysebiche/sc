// Service para cargar datos históricos de Sporting Cristal
import completoData from '../data/historico_completo_sc.json';
import incaData from '../data/historico_inca_sc.json';
import conmebolData from '../data/historico_conmebol_sc.json';

class VercelDataService {
  // Los datos se cargan desde archivos JSON locales incluidos en el bundle

  // Obtener datos de Conmebol
  async fetchConmebolData() {
    // Usar datos locales siempre (archivos JSON incluidos en el bundle)
    console.log('📦 Usando datos locales de Conmebol');
    return conmebolData;
  }

  // Obtener datos de Copa del Inca
  async fetchIncaData() {
    // Usar datos locales siempre (archivos JSON incluidos en el bundle)
    console.log('📦 Usando datos locales de Inca');
    return incaData;
  }

  // Obtener datos completos
  async fetchCompleteData() {
    // Usar datos locales siempre (archivos JSON incluidos en el bundle)
    console.log('📦 Usando datos locales completos');
    return completoData;
  }

  // Obtener todos los tipos de datos
  async fetchAllData() {
    try {
      const [conmebol, inca, completo] = await Promise.all([
        this.fetchConmebolData(),
        this.fetchIncaData(),
        this.fetchCompleteData()
      ]);

      return {
        conmebol,
        inca,
        completo
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    }
  }
}

const vercelDataService = new VercelDataService();
export default vercelDataService;

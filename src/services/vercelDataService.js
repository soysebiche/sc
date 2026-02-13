// Datos locales para desarrollo
import completoData from '../data/historico_completo_sc.json';
import incaData from '../data/historico_inca_sc.json';
import conmebolData from '../data/historico_conmebol_sc.json';

class VercelDataService {
  constructor() {
    this.apiBaseUrl = '/api/data';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Obtener datos de Conmebol
  async fetchConmebolData() {
    // En desarrollo, usar datos locales
    if (this.isDevelopment) {
      console.log('📦 Usando datos locales de Conmebol');
      return conmebolData;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}?type=conmebol`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener datos de Conmebol');
      }
    } catch (error) {
      console.error('Error fetching Conmebol data:', error);
      throw error;
    }
  }

  // Obtener datos de Copa del Inca
  async fetchIncaData() {
    // En desarrollo, usar datos locales
    if (this.isDevelopment) {
      console.log('📦 Usando datos locales de Inca');
      return incaData;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}?type=inca`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener datos de Copa del Inca');
      }
    } catch (error) {
      console.error('Error fetching Inca data:', error);
      throw error;
    }
  }

  // Obtener datos completos
  async fetchCompleteData() {
    // En desarrollo, usar datos locales
    if (this.isDevelopment) {
      console.log('📦 Usando datos locales completos');
      return completoData;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}?type=completo`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al obtener datos completos');
      }
    } catch (error) {
      console.error('Error fetching complete data:', error);
      throw error;
    }
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

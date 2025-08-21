class VercelDataService {
  constructor() {
    this.apiBaseUrl = '/api/data';
  }

  // Obtener datos de Conmebol
  async fetchConmebolData() {
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

export default new VercelDataService();

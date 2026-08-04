class VercelDataService {
  async fetchCompleteData() {
    const module = await import('../data/historico_completo_sc.json');
    return module.default;
  }

  async fetchAllData() {
    const completo = await this.fetchCompleteData();
    return {
      completo,
    };
  }
}

const vercelDataService = new VercelDataService();
export default vercelDataService;

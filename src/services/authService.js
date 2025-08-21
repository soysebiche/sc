class AuthService {
  constructor() {
    this.token = localStorage.getItem('sc_api_token');
    this.apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
  }

  // Obtener token (en producción esto vendría de un login)
  getToken() {
    return this.token;
  }

  // Establecer token
  setToken(token) {
    this.token = token;
    localStorage.setItem('sc_api_token', token);
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('sc_api_token');
  }

  // Obtener headers de autorización
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Hacer request autenticado
  async authenticatedRequest(url, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Token expirado o inválido');
    }

    return response;
  }
}

export default new AuthService();

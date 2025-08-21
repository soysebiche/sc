import React, { useState } from 'react';
import authService from '../services/authService';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validar que el token no esté vacío
      if (!token.trim()) {
        throw new Error('Por favor ingresa un token válido');
      }

      // Establecer el token
      authService.setToken(token.trim());
      
      // Notificar éxito
      onLoginSuccess();
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 Acceso a Datos</h2>
          <p>Ingresa tu token para acceder a las estadísticas</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="token">Token de Acceso:</label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa tu token aquí..."
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : '🔓 Acceder'}
          </button>
        </form>
        
        <div className="login-help">
          <p>
            <strong>¿No tienes token?</strong><br/>
            Contacta al administrador para obtener acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

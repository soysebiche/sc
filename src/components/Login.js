import React, { useState } from 'react';
import authService from '../services/authService';
import { getIcon } from '../utils/icons';
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
      <div className="login-card animate-scaleIn">
        {/* Header con Icono */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <span className="login-icon">{getIcon('login')}</span>
          </div>
          <h2>Acceso a Datos</h2>
          <p>Ingresa tu token para acceder a las estadísticas</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="token">
              {getIcon('key')} Token de Acceso
            </label>
            <div className="input-wrapper">
              <span className="input-icon">{getIcon('lock')}</span>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingresa tu token aquí..."
                required
                disabled={isLoading}
                className={error ? 'input-error' : ''}
              />
            </div>
          </div>
          
          {error && (
            <div className="error-message animate-fadeInUp">
              <span>{getIcon('error')}</span>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`btn btn-primary btn-full btn-lg ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && (
              <>
                {getIcon('unlock')} Acceder
              </>
            )}
          </button>
        </form>
        
        <div className="login-help">
          <p>
            <strong>{getIcon('help')} ¿No tienes token?</strong><br/>
            Contacta al administrador para obtener acceso.
          </p>
        </div>
      </div>
      
      {/* Decoración de fondo */}
      <div className="login-decoration">
        <span className="decoration-icon icon-1">⚽</span>
        <span className="decoration-icon icon-2">🏆</span>
        <span className="decoration-icon icon-3">⭐</span>
        <span className="decoration-icon icon-4">🔵</span>
      </div>
    </div>
  );
};

export default Login;

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
      if (!token.trim()) {
        throw new Error('Por favor ingresa un token válido');
      }

      authService.setToken(token.trim());
      onLoginSuccess();
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1B265C 0%, #2A3A7A 50%, #1B265C 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] text-9xl opacity-5 animate-float"
          style={{ animationDelay: '0s' }}>⚽</div>
        <div className="absolute top-[20%] right-[10%] text-9xl opacity-5 animate-float"
          style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-[20%] left-[10%] text-9xl opacity-5 animate-float"
          style={{ animationDelay: '2s' }}>⭐</div>
        <div className="absolute bottom-[15%] right-[5%] text-9xl opacity-5 animate-float"
          style={{ animationDelay: '3s' }}>🔵</div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="card card-glass p-8 md:p-12 animate-scaleIn"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{
                background: 'linear-gradient(135deg, #3CBEEF 0%, #1A9FD1 100%)',
                boxShadow: '0 10px 25px -5px rgba(60, 190, 239, 0.4)'
              }}
            >
              <span className="text-4xl">{getIcon('login')}</span>
            </div>            
            <h2 className="title-card mb-2">Acceso a Datos</h2>            
            <p className="text-body">Ingresa tu token para acceder a las estadísticas</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="stack-4">
            <div>
              <label className="form-label flex items-center gap-2">
                {getIcon('key')} Token de Acceso
              </label>              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {getIcon('lock')}
                </span>                
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Ingresa tu token aquí..."
                  required
                  disabled={isLoading}
                  className={`form-input pl-12 ${error ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
            </div>            
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-fadeInUp"
              >
                <span className="text-xl">{getIcon('error')}</span>
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
          {/* Help */}
          <div className="mt-8 p-6 rounded-xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(60, 190, 239, 0.1) 0%, rgba(60, 190, 239, 0.05) 100%)',
              border: '1px solid rgba(60, 190, 239, 0.2)'
            }}
          >
            <p className="text-body-sm">
              <strong className="flex items-center justify-center gap-2 mb-2">
                {getIcon('help')} ¿No tienes token?
              </strong>
              Contacta al administrador para obtener acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

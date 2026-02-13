import React, { useState } from 'react';
import authService from '../services/authService';

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
        throw new Error('Por favor ingresa un token valido');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1B265C] to-[#2A3A7A]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3CBEEF] rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1B265C]">Acceso a Datos</h2>
          <p className="text-gray-500 mt-2">Ingresa tu token para acceder a las estadisticas</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token de Acceso</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa tu token aqui..."
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3CBEEF] focus:border-transparent ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-[#3CBEEF] text-white font-semibold py-3 rounded-lg hover:bg-[#2AA8D8] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Acceder'}
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-[#3CBEEF]/10 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            No tienes token? Contacta al administrador para obtener acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

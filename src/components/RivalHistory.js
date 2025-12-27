import React, { useState, useEffect, useMemo } from 'react';

function RivalHistory({ data }) {
  const [selectedRival, setSelectedRival] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [rivals, setRivals] = useState([]);
  const [years, setYears] = useState([]);

  // Extraer lista de rivales únicos y años
  useEffect(() => {
    if (!data || data.length === 0) return;

    const rivalSet = new Set();
    const yearSet = new Set();

    data.forEach(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" 
        ? match["Equipo Visita"] 
        : match["Equipo Local"];
      rivalSet.add(rival);
      
      // Usar campo Año directamente o extraer de fecha si no está disponible
      let year;
      if (match.Año && typeof match.Año === 'number') {
        year = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      if (year) {
        yearSet.add(year);
      }
    });

    setRivals([...rivalSet].sort());
    setYears([...yearSet].sort((a, b) => b - a));
  }, [data]);

  // Filtrar partidos contra el rival seleccionado
  const filteredMatches = useMemo(() => {
    if (!selectedRival || !data) return [];

    return data.filter(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" 
        ? match["Equipo Visita"] 
        : match["Equipo Local"];
      
      // Usar campo Año directamente o extraer de fecha si no está disponible
      let matchYear;
      if (match.Año && typeof match.Año === 'number') {
        matchYear = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      const yearMatch = selectedYear ? 
        (matchYear && matchYear.toString() === selectedYear) : true;

      return rival === selectedRival && yearMatch;
    }).sort((a, b) => {
      // Ordenar por fecha, manejando TBD
      const dateA = a.Fecha === 'TBD' ? new Date(0) : new Date(a.Fecha);
      const dateB = b.Fecha === 'TBD' ? new Date(0) : new Date(b.Fecha);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    });
  }, [data, selectedRival, selectedYear]);

  // Calcular estadísticas del historial
  const stats = useMemo(() => {
    if (filteredMatches.length === 0) {
      return {
        total: 0,
        victories: 0,
        draws: 0,
        defeats: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    }

    let victories = 0;
    let draws = 0;
    let defeats = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    filteredMatches.forEach(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);

      goalsFor += scGoals;
      goalsAgainst += opponentGoals;

      if (scGoals > opponentGoals) {
        victories++;
      } else if (scGoals < opponentGoals) {
        defeats++;
      } else {
        draws++;
      }
    });

    return {
      total: filteredMatches.length,
      victories,
      draws,
      defeats,
      goalsFor,
      goalsAgainst,
      winPercentage: ((victories / filteredMatches.length) * 100).toFixed(1),
      drawPercentage: ((draws / filteredMatches.length) * 100).toFixed(1),
      defeatPercentage: ((defeats / filteredMatches.length) * 100).toFixed(1)
    };
  }, [filteredMatches]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
  };

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏟️ Historial vs Rivales
        </h2>
        <p className="text-lg text-gray-600">
          Descubre el historial completo contra cualquier rival
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
        <div className="flex items-center space-x-2">
          <label htmlFor="rival-select" className="text-sm font-medium text-gray-700">
            Seleccionar rival:
          </label>
          <select
            id="rival-select"
            value={selectedRival}
            onChange={(e) => setSelectedRival(e.target.value)}
            className="min-w-0 flex-1 rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
          >
            <option value="">-- Selecciona un equipo --</option>
            {rivals.map(rival => (
              <option key={rival} value={rival}>{rival}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Filtrar por año:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
            disabled={!selectedRival}
          >
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedRival && (
        <>
          {/* Balance estadístico */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Balance vs {selectedRival}
              {selectedYear && ` (${selectedYear})`}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 text-center shadow-lg">
                <h4 className="text-sm font-bold text-blue-800 mb-1">Total</h4>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-xs text-blue-700">partidos</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 text-center shadow-lg">
                <h4 className="text-sm font-bold text-green-800 mb-1">Ganados</h4>
                <p className="text-3xl font-bold text-green-900">{stats.victories}</p>
                <p className="text-xs text-green-700">{stats.winPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 text-center shadow-lg">
                <h4 className="text-sm font-bold text-yellow-800 mb-1">Empatados</h4>
                <p className="text-3xl font-bold text-yellow-900">{stats.draws}</p>
                <p className="text-xs text-yellow-700">{stats.drawPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4 text-center shadow-lg">
                <h4 className="text-sm font-bold text-red-800 mb-1">Perdidos</h4>
                <p className="text-3xl font-bold text-red-900">{stats.defeats}</p>
                <p className="text-xs text-red-700">{stats.defeatPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 text-center shadow-lg">
                <h4 className="text-sm font-bold text-purple-800 mb-1">Goles</h4>
                <p className="text-2xl font-bold text-purple-900">{stats.goalsFor} - {stats.goalsAgainst}</p>
                <p className="text-xs text-purple-700">a favor - en contra</p>
              </div>
            </div>

            {/* Barra de progreso visual */}
            {stats.total > 0 && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h4 className="text-lg font-semibold mb-3 text-center">Distribución de resultados</h4>
                <div className="flex rounded-full overflow-hidden h-8 shadow-inner">
                  <div 
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.winPercentage}%` }}
                  >
                    {stats.winPercentage > 15 && `${stats.winPercentage}%`}
                  </div>
                  <div 
                    className="bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.drawPercentage}%` }}
                  >
                    {stats.drawPercentage > 15 && `${stats.drawPercentage}%`}
                  </div>
                  <div 
                    className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.defeatPercentage}%` }}
                  >
                    {stats.defeatPercentage > 15 && `${stats.defeatPercentage}%`}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>🏆 Victorias ({stats.victories})</span>
                  <span>🤝 Empates ({stats.draws})</span>
                  <span>❌ Derrotas ({stats.defeats})</span>
                </div>
              </div>
            )}
          </div>

          {/* Lista de partidos */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-sky-600">
              📋 Historial de encuentros ({filteredMatches.length} partidos)
            </h3>
            
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, index) => {
                  // Obtener año de manera segura
                  let matchYear;
                  if (match.Año && typeof match.Año === 'number') {
                    matchYear = match.Año;
                  } else if (match.Fecha && match.Fecha !== 'TBD') {
                    const date = new Date(match.Fecha);
                    matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
                  }
                  
                  const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                    ? parseInt(match.Marcador.split('-')[0]) 
                    : parseInt(match.Marcador.split('-')[1]);
                  const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                    ? parseInt(match.Marcador.split('-')[1]) 
                    : parseInt(match.Marcador.split('-')[0]);
                  
                  const result = scGoals > opponentGoals ? 'Victoria' : 
                               (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                  const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                     (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');
                  const resultIcon = result === 'Victoria' ? '🏆' : 
                                    (result === 'Derrota' ? '❌' : '🤝');

                  return (
                    <div key={index} className={`card bg-white rounded-lg shadow-md p-4 border-l-4 ${resultClass} hover:shadow-lg transition-shadow`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500 font-medium">
                          {formatDate(match.Fecha)}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800 flex items-center`}>
                          {resultIcon} {result}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="font-bold text-lg text-center">
                          {match["Equipo Local"]} 
                          <span className="mx-2 text-sky-600">vs</span> 
                          {match["Equipo Visita"]}
                        </p>
                        <p className="text-3xl font-bold text-center my-2 text-gray-800">
                          {match.Marcador}
                        </p>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600 mb-2">
                        <p className="font-medium">{match.Torneo}</p>
                        <p>{matchYear || 'TBD'}</p>
                      </div>
                      
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <div className="border-t pt-2">
                          <h4 className="font-semibold text-sm mb-1 text-sky-700">⚽ Goles de Sporting Cristal:</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{match["Goles (Solo SC)"]}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  No se encontraron partidos contra {selectedRival}
                  {selectedYear && ` en ${selectedYear}`}.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedRival && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏟️</div>
          <p className="text-gray-500 text-lg">
            Selecciona un rival para ver el historial completo de enfrentamientos
          </p>
        </div>
      )}
    </div>
  );
}

export default RivalHistory;
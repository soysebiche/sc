import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui';

function RivalHistory({ data }) {
  const [selectedRival, setSelectedRival] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [rivals, setRivals] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const rivalSet = new Set();
    const yearSet = new Set();

    data.forEach(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" 
        ? match["Equipo Visita"] 
        : match["Equipo Local"];
      rivalSet.add(rival);
      
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

  const filteredMatches = useMemo(() => {
    if (!selectedRival || !data) return [];

    return data.filter(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" 
        ? match["Equipo Visita"] 
        : match["Equipo Local"];
      
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
      const dateA = a.Fecha === 'TBD' ? new Date(0) : new Date(a.Fecha);
      const dateB = b.Fecha === 'TBD' ? new Date(0) : new Date(b.Fecha);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    });
  }, [data, selectedRival, selectedYear]);

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1B265C] mb-2">Historial vs Rivales</h2>
        <p className="text-gray-600">Descubre el historial completo contra cualquier rival</p>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar rival</label>
            <select
              value={selectedRival}
              onChange={(e) => setSelectedRival(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecciona un equipo</option>
              {rivals.map(rival => (
                <option key={rival} value={rival}>{rival}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por ano (opcional)</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={!selectedRival}
            >
              <option value="">Todos los anos</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedRival && (
        <>
          {/* Balance estadistico */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-[#1B265C] mb-4">
              Balance vs {selectedRival}
              {selectedYear && ` (${selectedYear})`}
            </h3>            
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-sky-50 rounded-lg p-4 text-center">
                <p className="text-sm text-sky-700 mb-1">Total</p>
                <p className="text-3xl font-bold text-sky-900">{stats.total}</p>
                <p className="text-xs text-sky-600">partidos</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Ganados</p>
                <p className="text-3xl font-bold text-green-900">{stats.victories}</p>
                <p className="text-xs text-green-600">{stats.winPercentage}%</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-700 mb-1">Empatados</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.draws}</p>
                <p className="text-xs text-yellow-600">{stats.drawPercentage}%</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-red-700 mb-1">Perdidos</p>
                <p className="text-3xl font-bold text-red-900">{stats.defeats}</p>
                <p className="text-xs text-red-600">{stats.defeatPercentage}%</p>
              </div>
              
              <div className="bg-violet-50 rounded-lg p-4 text-center">
                <p className="text-sm text-violet-700 mb-1">Goles</p>
                <p className="text-xl font-bold text-violet-900">{stats.goalsFor} - {stats.goalsAgainst}</p>
                <p className="text-xs text-violet-600">a favor - en contra</p>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-3 text-center">Distribucion de resultados</p>
                <div className="flex rounded-full overflow-hidden h-8">
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
                  <span>Victorias ({stats.victories})</span>
                  <span>Empates ({stats.draws})</span>
                  <span>Derrotas ({stats.defeats})</span>
                </div>
              </div>
            )}
          </Card>

          {/* Lista de partidos */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-[#1B265C] mb-4">Historial de encuentros ({filteredMatches.length} partidos)</h3>            
            
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, index) => {
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

                  return (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">{formatDate(match.Fecha)}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          result === 'Victoria' ? 'bg-green-100 text-green-700' :
                          result === 'Derrota' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result}
                        </span>
                      </div>
                      
                      <p className="font-semibold">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
                      <p className="text-xl font-bold text-[#3CBEEF] text-center my-2">{match.Marcador}</p>
                      
                      <div className="text-center mt-2">
                        <p className="text-sm text-gray-600">{match.Torneo}</p>
                        <p className="text-xs text-gray-400">{matchYear || 'TBD'}</p>
                      </div>
                      
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-1">Goles de Sporting Cristal:</p>
                          <p className="text-sm text-gray-600">{match["Goles (Solo SC)"]}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron partidos contra {selectedRival}
                  {selectedYear && ` en ${selectedYear}`}.
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {!selectedRival && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Selecciona un rival para ver el historial completo de enfrentamientos
          </p>
        </div>
      )}
    </div>
  );
}

export default RivalHistory;

import React, { useState, useEffect, useMemo } from 'react';
import { getIcon } from '../utils/icons';
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
    <div className="animate-fadeInUp">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg mb-4">
          <span className="text-3xl">{getIcon('rivals')}</span>
        </div>
        <h2 className="title-section mb-2">Historial vs Rivales</h2>
        <p className="text-body-lg">
          Descubre el historial completo contra cualquier rival
        </p>
      </div>

      {/* Filtros */}
      <Card variant="elevated" className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Seleccionar rival</label>
            <select
              value={selectedRival}
              onChange={(e) => setSelectedRival(e.target.value)}
              className="form-input form-select"
            >
              <option value="">-- Selecciona un equipo --</option>
              {rivals.map(rival => (
                <option key={rival} value={rival}>{rival}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Filtrar por año (opcional)</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-input form-select"
              disabled={!selectedRival}
            >
              <option value="">Todos los años</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedRival && (
        <>
          {/* Balance estadístico */}
          <section className="editorial-card mb-8">
            <h3 className="editorial-card-title">
              Balance vs {selectedRival}
              {selectedYear && ` (${selectedYear})`}
            </h3>            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl p-4 text-center">
                <h4 className="text-sm font-bold text-sky-800 mb-1">Total</h4>
                <p className="text-3xl font-bold text-sky-900 font-editorial">{stats.total}</p>
                <p className="text-xs text-sky-700">partidos</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl p-4 text-center">
                <h4 className="text-sm font-bold text-emerald-800 mb-1">Ganados</h4>
                <p className="text-3xl font-bold text-emerald-900 font-editorial">{stats.victories}</p>
                <p className="text-xs text-emerald-700">{stats.winPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-4 text-center">
                <h4 className="text-sm font-bold text-amber-800 mb-1">Empatados</h4>
                <p className="text-3xl font-bold text-amber-900 font-editorial">{stats.draws}</p>
                <p className="text-xs text-amber-700">{stats.drawPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl p-4 text-center">
                <h4 className="text-sm font-bold text-rose-800 mb-1">Perdidos</h4>
                <p className="text-3xl font-bold text-rose-900 font-editorial">{stats.defeats}</p>
                <p className="text-xs text-rose-700">{stats.defeatPercentage}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl p-4 text-center">
                <h4 className="text-sm font-bold text-violet-800 mb-1">Goles</h4>
                <p className="text-2xl font-bold text-violet-900 font-editorial">{stats.goalsFor} - {stats.goalsAgainst}</p>
                <p className="text-xs text-violet-700">a favor - en contra</p>
              </div>
            </div>

            {/* Barra de progreso visual */}
            {stats.total > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-3 text-center">Distribución de resultados</h4>
                <div className="flex rounded-full overflow-hidden h-8 shadow-inner">
                  <div 
                    className="bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.winPercentage}%` }}
                  >
                    {stats.winPercentage > 15 && `${stats.winPercentage}%`}
                  </div>
                  <div 
                    className="bg-amber-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.drawPercentage}%` }}
                  >
                    {stats.drawPercentage > 15 && `${stats.drawPercentage}%`}
                  </div>
                  <div 
                    className="bg-rose-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${stats.defeatPercentage}%` }}
                  >
                    {stats.defeatPercentage > 15 && `${stats.defeatPercentage}%`}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{getIcon('victory')} Victorias ({stats.victories})</span>
                  <span>{getIcon('draw')} Empates ({stats.draws})</span>
                  <span>{getIcon('defeat')} Derrotas ({stats.defeats})</span>
                </div>
              </div>
            )}
          </section>

          {/* Lista de partidos */}
          <section className="editorial-card">
            <h3 className="editorial-card-title">
              {getIcon('document')} Historial de encuentros ({filteredMatches.length} partidos)
            </h3>            
            {filteredMatches.length > 0 ? (
              <div className="grid-matches">
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
                    <Card
                      key={index}
                      variant={result.toLowerCase()}
                      isAnimated={true}
                      animationDelay={index % 5}
                      className="match-card-premium"
                    >
                      <div className="match-header">
                        <div className="text-label">
                          {formatDate(match.Fecha)}
                        </div>
                        <span className={`badge badge-${result.toLowerCase()}`}>
                          {getIcon(result.toLowerCase())} {result}
                        </span>
                      </div>
                      
                      <p className="match-teams">
                        {match["Equipo Local"]} vs {match["Equipo Visita"]}
                      </p>
                      <div className="match-score">
                        {match.Marcador}
                      </div>
                      
                      <div className="text-center mt-2">
                        <p className="text-body-sm">{match.Torneo}</p>
                        <p className="text-label">{matchYear || 'TBD'}</p>
                      </div>
                      
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-label mb-2">{getIcon('goal')} Goles de Sporting Cristal:</p>
                          <p className="text-body-sm">{match["Goles (Solo SC)"]}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-body">
                  No se encontraron partidos contra {selectedRival}
                  {selectedYear && ` en ${selectedYear}`}.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {!selectedRival && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{getIcon('stadium')}</div>
          <p className="text-body-lg">
            Selecciona un rival para ver el historial completo de enfrentamientos
          </p>
        </div>
      )}
    </div>
  );
}

export default RivalHistory;

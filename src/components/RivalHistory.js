import React, { useState, useEffect, useMemo } from 'react';

function RivalHistory({ data }) {
  const [selectedRival, setSelectedRival] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [rivals, setRivals] = useState([]);
  const [years, setYears] = useState([]);
  const [rivalCountryMap, setRivalCountryMap] = useState({});

  useEffect(() => {
    if (!data || data.length === 0) return;

    const rivalSet = new Set();
    const rivalCountryMap = {};
    const yearSet = new Set();

    data.forEach(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
      rivalSet.add(rival);
      if (match["País"]) rivalCountryMap[rival] = match["País"];
      
      let year;
      if (match.Año && typeof match.Año === 'number') year = match.Año;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      if (year) yearSet.add(year);
    });

    setRivals([...rivalSet].sort());
    setYears([...yearSet].sort((a, b) => b - a));
    setRivalCountryMap(rivalCountryMap);
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedRival || !data) return [];

    return data.filter(match => {
      const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
      
      let matchYear;
      if (match.Año && typeof match.Año === 'number') matchYear = match.Año;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
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
      return { total: 0, victories: 0, draws: 0, defeats: 0, goalsFor: 0, goalsAgainst: 0 };
    }

    let victories = 0, draws = 0, defeats = 0, goalsFor = 0, goalsAgainst = 0;

    filteredMatches.forEach(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);

      goalsFor += scGoals;
      goalsAgainst += opponentGoals;

      if (scGoals > opponentGoals) victories++;
      else if (scGoals < opponentGoals) defeats++;
      else draws++;
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

  const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!data || data.length === 0) {
    return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">HISTORIAL VS RIVALES</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Descubre el historial completo contra cualquier rival</p>
      </div>

      <div className="card-static p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Seleccionar rival</label>
            <select value={selectedRival} onChange={(e) => setSelectedRival(e.target.value)} className="w-full">
              <option value="">Selecciona un equipo</option>
              {rivals.map(rival => (
                <option key={rival} value={rival}>
                  {rival}{rivalCountryMap[rival] && rivalCountryMap[rival] !== 'Perú' ? ` (${rivalCountryMap[rival]})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Filtrar por año (opcional)</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full" disabled={!selectedRival}>
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedRival && (
        <>
          <div className="card-static p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Balance vs {selectedRival}
              {selectedYear && ` (${selectedYear})`}
            </h3>            
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-cyan)' }}>Total</p>
                <p className="text-3xl stat-number text-white">{stats.total}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>partidos</p>
              </div>
              
              <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-green)' }}>Ganados</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--accent-green)' }}>{stats.victories}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.winPercentage}%</p>
              </div>
              
              <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-yellow)' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-yellow)' }}>Empatados</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--accent-yellow)' }}>{stats.draws}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.drawPercentage}%</p>
              </div>
              
              <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-red)' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-red)' }}>Perdidos</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--accent-red)' }}>{stats.defeats}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.defeatPercentage}%</p>
              </div>
              
              <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-blue)' }}>Goles</p>
                <p className="text-xl stat-number text-white">{stats.goalsFor} - {stats.goalsAgainst}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>a favor - en contra</p>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="p-4" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>Distribución de resultados</p>
                <div className="flex rounded-xl overflow-hidden h-10" style={{ background: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-center text-sm font-bold text-black" style={{ width: `${stats.winPercentage}%`, background: 'var(--accent-green)' }}>
                    {stats.winPercentage > 10 && `${stats.winPercentage}%`}
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold text-black" style={{ width: `${stats.drawPercentage}%`, background: 'var(--accent-yellow)' }}>
                    {stats.drawPercentage > 10 && `${stats.drawPercentage}%`}
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold text-white" style={{ width: `${stats.defeatPercentage}%`, background: 'var(--accent-red)' }}>
                    {stats.defeatPercentage > 10 && `${stats.defeatPercentage}%`}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <span style={{ color: 'var(--accent-green)' }}>Victorias ({stats.victories})</span>
                  <span style={{ color: 'var(--accent-yellow)' }}>Empates ({stats.draws})</span>
                  <span style={{ color: 'var(--accent-red)' }}>Derrotas ({stats.defeats})</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-static p-6">
            <h3 className="text-xl font-bold text-white mb-4">Historial de encuentros ({filteredMatches.length} partidos)</h3>            
            
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, index) => {
                  const scGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
                  const opponentGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
                  const result = scGoals > opponentGoals ? 'Victoria' : scGoals < opponentGoals ? 'Derrota' : 'Empate';

                  return (
                    <div key={index} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(match.Fecha)}</span>
                        <span className={`badge ${result === 'Victoria' ? 'badge-green' : result === 'Empate' ? 'badge-yellow' : 'badge-red'}`}>{result}</span>
                      </div>
                      <p className="font-semibold text-white">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
                      <p className="text-xl font-bold text-center my-2" style={{ color: 'var(--accent-cyan)' }}>{match.Marcador}</p>
                      <p className="text-xs text-center mb-1" style={{ color: 'var(--text-secondary)' }}>{match.Torneo}</p>
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <p className="text-xs" style={{ color: 'var(--accent-cyan)' }}>Goles: {match["Goles (Solo SC)"]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>No se encontraron partidos contra {selectedRival}{selectedYear && ` en ${selectedYear}`}.</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedRival && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Selecciona un rival para ver el historial completo de enfrentamientos</p>
        </div>
      )}
    </div>
  );
}

export default RivalHistory;

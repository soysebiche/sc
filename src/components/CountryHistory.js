import React, { useState, useEffect, useMemo } from 'react';

function CountryHistory({ data }) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const countrySet = new Set();
    const yearSet = new Set();

    data.forEach(match => {
      const country = match["País"];
      if (country && country !== 'Perú') countrySet.add(country);
      
      let year;
      if (match.Año && typeof match.Año === 'number') year = match.Año;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      if (year) yearSet.add(year);
    });

    setCountries([...countrySet].sort());
    setYears([...yearSet].sort((a, b) => b - a));
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedCountry || !data) return [];

    return data.filter(match => {
      const country = match["País"];
      
      let matchYear;
      if (match.Año && typeof match.Año === 'number') matchYear = match.Año;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
      return country === selectedCountry && yearMatch;
    }).sort((a, b) => {
      const dateA = a.Fecha === 'TBD' ? new Date(0) : new Date(a.Fecha);
      const dateB = b.Fecha === 'TBD' ? new Date(0) : new Date(b.Fecha);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    });
  }, [data, selectedCountry, selectedYear]);

  const stats = useMemo(() => {
    if (filteredMatches.length === 0) {
      return { total: 0, victories: 0, draws: 0, defeats: 0, goalsFor: 0, goalsAgainst: 0 };
    }

    let victories = 0, draws = 0, defeats = 0, goalsFor = 0, goalsAgainst = 0;

    filteredMatches.forEach(match => {
      const isHome = match["Equipo Local"] === "Sporting Cristal";
      const scGoals = isHome ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = isHome ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);

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
        <h2 className="text-3xl font-bold text-white mb-2">HISTORIAL VS PAÍSES</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Descubre el historial completo contra selecciones y equipos de otros países</p>
      </div>

      <div className="card-static p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Seleccionar País</label>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full">
              <option value="">Selecciona un país</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Filtrar por año (opcional)</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full" disabled={!selectedCountry}>
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedCountry && (
        <>
          <div className="card-static p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Balance vs {selectedCountry}
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
                  const isHome = match["Equipo Local"] === "Sporting Cristal";
                  const scGoals = isHome ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
                  const opponentGoals = isHome ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
                  const result = scGoals > opponentGoals ? 'Victoria' : scGoals < opponentGoals ? 'Derrota' : 'Empate';

                  let matchYear;
                  if (match.Año && typeof match.Año === 'number') matchYear = match.Año;
                  else if (match.Fecha && match.Fecha !== 'TBD') {
                    const date = new Date(match.Fecha);
                    matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
                  }

                  return (
                    <div key={index} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(match.Fecha)}</span>
                        <span className={`badge ${result === 'Victoria' ? 'badge-green' : result === 'Empate' ? 'badge-yellow' : 'badge-red'}`}>{result}</span>
                      </div>
                      <p className="font-semibold text-white">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
                      <p className="text-xl font-bold text-center my-2" style={{ color: 'var(--accent-cyan)' }}>{match.Marcador}</p>
                      <div className="text-center mt-2">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{match.Torneo}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{matchYear || 'TBD'}</p>
                      </div>
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Goles de Sporting Cristal:</p>
                          <p className="text-sm" style={{ color: 'var(--accent-cyan)' }}>{match["Goles (Solo SC)"]}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>No se encontraron partidos contra equipos de {selectedCountry}{selectedYear && ` en ${selectedYear}`}.</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedCountry && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Selecciona un país para ver el historial completo de enfrentamientos</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Países disponibles: {countries.length}</p>
        </div>
      )}
    </div>
  );
}

export default CountryHistory;

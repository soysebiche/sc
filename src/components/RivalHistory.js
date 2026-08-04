import React, { useState, useEffect, useMemo } from 'react';
import { canonicalizeRival, formatMatchDate, getOpponent, getScore, getUniqueYears, getYearFromMatch } from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

function RivalHistory({ data }) {
  const [rivalParam, setRivalParam] = useUrlState('rival', '');
  const [selectedYear, setSelectedYear] = useUrlState('rivalYear', '');
  const [rivals, setRivals] = useState([]);
  const [years, setYears] = useState([]);
  const [rivalCountryMap, setRivalCountryMap] = useState({});
  const selectedRival = canonicalizeRival(rivalParam);
  const setSelectedRival = value => setRivalParam(canonicalizeRival(value));

  useEffect(() => {
    if (rivalParam !== selectedRival) setRivalParam(selectedRival);
  }, [rivalParam, selectedRival, setRivalParam]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const rivalSet = new Set();
    const rivalCountryMap = {};
    const yearSet = new Set();

    data.forEach(match => {
      const rival = getOpponent(match);
      rivalSet.add(rival);
      if (match["País"]) rivalCountryMap[rival] = match["País"];
    });

    setRivals([...rivalSet].sort());
    getUniqueYears(data).forEach(year => yearSet.add(year));
    setYears([...yearSet]);
    setRivalCountryMap(rivalCountryMap);
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedRival || !data) return [];

    return data.filter(match => {
      const rival = getOpponent(match);
      const matchYear = getYearFromMatch(match);
      
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
      const { scGoals, opponentGoals } = getScore(match);

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

  const formatDate = (dateString) => formatMatchDate(dateString, { year: 'numeric', month: 'long', day: 'numeric' });

  if (!data || data.length === 0) {
    return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>HISTORIAL VS RIVALES</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Descubre el historial completo contra cualquier rival</p>
      </div>

      <div className="card-static p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rival-search" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Buscar rival</label>
            <input
              id="rival-search"
              type="search"
              list="rival-options"
              value={selectedRival}
              onChange={(e) => setSelectedRival(canonicalizeRival(e.target.value))}
              placeholder="Escribe un equipo"
              className="w-full"
              aria-describedby="rival-search-help"
            />
            <datalist id="rival-options">
              {rivals.map(rival => (
                <option key={rival} value={rival}>
                  {rivalCountryMap[rival] && rivalCountryMap[rival] !== 'Perú' ? rivalCountryMap[rival] : ''}
                </option>
              ))}
            </datalist>
            <p id="rival-search-help" className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{rivals.length} rivales canónicos disponibles</p>
          </div>
          <div>
            <label htmlFor="rival-year" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Filtrar por año (opcional)</label>
            <select id="rival-year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full" disabled={!selectedRival}>
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedRival && (
        <>
          <div className="card-static p-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Balance vs {selectedRival}
              {selectedYear && ` (${selectedYear})`}
            </h3>            
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="stat-tile" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="stat-label" style={{ color: 'var(--color-celeste)' }}>Total</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>partidos</p>
              </div>
              
              <div className="stat-tile" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="stat-label" style={{ color: 'var(--color-win)' }}>Ganados</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--color-win)' }}>{stats.victories}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.winPercentage}%</p>
              </div>
              
              <div className="stat-tile" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="stat-label" style={{ color: 'var(--color-draw)' }}>Empatados</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--color-draw)' }}>{stats.draws}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.drawPercentage}%</p>
              </div>
              
              <div className="stat-tile" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="stat-label" style={{ color: 'var(--color-loss)' }}>Perdidos</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--color-loss)' }}>{stats.defeats}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.defeatPercentage}%</p>
              </div>
              
              <div className="stat-tile" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="stat-label" style={{ color: 'var(--color-celeste)' }}>Goles</p>
                <p className="text-xl stat-number" style={{ color: 'var(--text-primary)' }}>{stats.goalsFor} - {stats.goalsAgainst}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>a favor - en contra</p>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="p-4" style={{ background: 'var(--bg-inset)', borderRadius: '8px' }}>
                <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>Distribución de resultados</p>
                <div className="distribution-bar" style={{ background: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-center text-sm font-bold" style={{ width: `${stats.winPercentage}%`, background: 'var(--color-win-bar)', color: 'var(--text-on-result)' }}>
                    {stats.winPercentage > 10 && `${stats.winPercentage}%`}
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold" style={{ width: `${stats.drawPercentage}%`, background: 'var(--color-draw-bar)', color: 'var(--text-on-result)' }}>
                    {stats.drawPercentage > 10 && `${stats.drawPercentage}%`}
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold" style={{ width: `${stats.defeatPercentage}%`, background: 'var(--color-loss-bar)', color: 'var(--text-on-result)' }}>
                    {stats.defeatPercentage > 10 && `${stats.defeatPercentage}%`}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <span style={{ color: 'var(--color-win)' }}>Victorias ({stats.victories})</span>
                  <span style={{ color: 'var(--color-draw)' }}>Empates ({stats.draws})</span>
                  <span style={{ color: 'var(--color-loss)' }}>Derrotas ({stats.defeats})</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-static p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Historial de encuentros ({filteredMatches.length} partidos)</h3>            
            
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, index) => {
                  const { scGoals, opponentGoals } = getScore(match);
                  const result = scGoals > opponentGoals ? 'V' : scGoals < opponentGoals ? 'P' : 'E';

                  return (
                    <article key={`${match.Fecha}-${match['Equipo Local']}-${match['Equipo Visita']}-${index}`} className="match-card">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(match.Fecha)}</span>
                        <span className={`badge ${result === 'V' ? 'badge-green' : result === 'E' ? 'badge-yellow' : 'badge-red'}`} aria-label={result === 'V' ? 'Victoria' : result === 'E' ? 'Empate' : 'Derrota'}>{result}</span>
                      </div>
                      <p className="match-teams">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
                      <p className="match-score text-center my-2" style={{ color: 'var(--color-celeste)' }}>{match.Marcador}</p>
                      <p className="text-xs text-center mb-1" style={{ color: 'var(--text-secondary)' }}>{match.Torneo}</p>
                      {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
                        <p className="text-xs" style={{ color: 'var(--color-celeste)' }}>Goles: {match["Goles (Solo SC)"]}</p>
                      )}
                    </article>
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

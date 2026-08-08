import { useMemo } from 'react';
import BalanceSummary from './BalanceSummary';
import PaginatedMatchList from './PaginatedMatchList';
import { canonicalizeRival, getOpponent, getUniqueYears, getYearFromMatch, sortMatchesNewest, summarizeMatches } from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

function RivalHistory({ data }) {
  const [rivalParam, setRivalParam] = useUrlState('rival', '');
  const [selectedYear, setSelectedYear] = useUrlState('rivalYear', '');
  const [rivalPage, setRivalPage] = useUrlState('rivalPage', '1');
  const selectedRival = canonicalizeRival(rivalParam);
  const setSelectedRival = value => {
    setRivalParam(canonicalizeRival(value));
    setRivalPage('1');
  };

  const { rivals, years, rivalCountryMap } = useMemo(() => {
    const rivalSet = new Set();
    const countryMap = {};

    data.forEach(match => {
      const rival = getOpponent(match);
      rivalSet.add(rival);
      if (match["País"]) countryMap[rival] = match["País"];
    });

    return {
      rivals: [...rivalSet].sort(),
      years: getUniqueYears(data),
      rivalCountryMap: countryMap,
    };
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedRival || !data) return [];

    return sortMatchesNewest(data.filter(match => {
      const rival = getOpponent(match);
      const matchYear = getYearFromMatch(match);
      
      const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
      return rival === selectedRival && yearMatch;
    }));
  }, [data, selectedRival, selectedYear]);

  const stats = useMemo(() => summarizeMatches(filteredMatches), [filteredMatches]);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-4">
      <div className="view-intro">
        <h2 className="section-title">HISTORIAL VS RIVALES</h2>
        <p className="section-subtitle">El registro completo frente a cada rival</p>
      </div>

      <section className="archive-section">
        <div className="filter-bar">
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
            <select id="rival-year" value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setRivalPage('1'); }} className="w-full" disabled={!selectedRival}>
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </section>

      {selectedRival && (
        <>
          <BalanceSummary title={`Balance vs ${selectedRival}${selectedYear ? ` (${selectedYear})` : ''}`} stats={stats} />

          <section className="archive-section">
            <h3 className="collection-title">Historial de encuentros</h3>
            <PaginatedMatchList
              matches={filteredMatches}
              page={rivalPage}
              setPage={setRivalPage}
              label={`Paginación del historial contra ${selectedRival}`}
              emptyMessage={`No hay partidos contra ${selectedRival}${selectedYear ? ` en ${selectedYear}` : ''}.`}
            />
          </section>
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

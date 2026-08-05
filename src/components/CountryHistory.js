import { useMemo } from 'react';
import BalanceSummary from './BalanceSummary';
import PaginatedMatchList from './PaginatedMatchList';
import { getUniqueYears, getYearFromMatch, sortMatchesNewest, summarizeMatches } from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

function CountryHistory({ data }) {
  const [selectedCountry, setSelectedCountry] = useUrlState('country', '');
  const [selectedYear, setSelectedYear] = useUrlState('countryYear', '');
  const [countryPage, setCountryPage] = useUrlState('countryPage', '1');
  const { countries, years } = useMemo(() => {
    const countrySet = new Set();

    data.forEach(match => {
      const country = match["País"];
      if (country && country !== 'Perú') countrySet.add(country);
    });

    return { countries: [...countrySet].sort(), years: getUniqueYears(data) };
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedCountry || !data) return [];

    return sortMatchesNewest(data.filter(match => {
      const country = match["País"];
      
      const matchYear = getYearFromMatch(match);
      
      const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
      return country === selectedCountry && yearMatch;
    }));
  }, [data, selectedCountry, selectedYear]);

  const stats = useMemo(() => summarizeMatches(filteredMatches), [filteredMatches]);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-4">
      <div className="view-intro">
        <h2 className="section-title">HISTORIAL VS PAÍSES</h2>
        <p className="section-subtitle">El registro internacional contra selecciones y clubes</p>
      </div>

      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor="country-select" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Seleccionar país</label>
            <select id="country-select" value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setCountryPage('1'); }} className="w-full">
              <option value="">Selecciona un país</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country-year" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Filtrar por año (opcional)</label>
            <select id="country-year" value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setCountryPage('1'); }} className="w-full" disabled={!selectedCountry}>
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </section>

      {selectedCountry && (
        <>
          <BalanceSummary title={`Balance vs ${selectedCountry}${selectedYear ? ` (${selectedYear})` : ''}`} stats={stats} />

          <section className="archive-section">
            <h3 className="collection-title">Historial de encuentros</h3>
            <PaginatedMatchList
              matches={filteredMatches}
              page={countryPage}
              setPage={setCountryPage}
              label={`Paginación del historial de ${selectedCountry}`}
              emptyMessage={`No hay partidos contra equipos de ${selectedCountry}${selectedYear ? ` en ${selectedYear}` : ''}.`}
            />
          </section>
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

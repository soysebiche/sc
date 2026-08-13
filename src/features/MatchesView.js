import { useMemo } from 'react';
import PaginatedMatchList from '../components/PaginatedMatchList';
import { filterMatchesByYearAndMonth, getUniqueMonths, getUniqueYears } from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

function MatchesView({ matches }) {
  const [selectedYear, setSelectedYear] = useUrlState('year', '');
  const [selectedMonth, setSelectedMonth] = useUrlState('month', '');
  const [page, setPage] = useUrlState('page', '1');
  const years = useMemo(() => getUniqueYears(matches), [matches]);
  const months = useMemo(() => getUniqueMonths(matches), [matches]);
  const filtered = useMemo(
    () => filterMatchesByYearAndMonth(matches, selectedYear, selectedMonth),
    [matches, selectedMonth, selectedYear]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor="matches-year" className="block text-sm font-medium mb-2">Año</label>
            <select
              id="matches-year"
              value={selectedYear}
              onChange={event => setSelectedYear(event.target.value, { page: { value: '1', defaultValue: '1' } })}
              className="w-full"
            >
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="matches-month" className="block text-sm font-medium mb-2">Mes</label>
            <select
              id="matches-month"
              value={selectedMonth}
              onChange={event => setSelectedMonth(event.target.value, { page: { value: '1', defaultValue: '1' } })}
              className="w-full"
            >
              <option value="">Todos los meses</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
        </div>

        <PaginatedMatchList
          matches={filtered}
          page={page}
          setPage={setPage}
          label="Paginación del archivo de partidos"
          emptyTitle="No hay partidos con esos filtros"
          emptyMessage="Prueba otro año o mes."
        />
      </section>
    </div>
  );
}

export default MatchesView;

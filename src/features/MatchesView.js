import PaginatedMatchList from '../components/PaginatedMatchList';

function MatchesView({
  years,
  months,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  matches,
  page,
  setPage,
}) {
  const changeYear = event => { setSelectedYear(event.target.value); setPage('1'); };
  const changeMonth = event => { setSelectedMonth(event.target.value); setPage('1'); };

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor="matches-year" className="block text-sm font-medium mb-2">Año</label>
            <select id="matches-year" value={selectedYear} onChange={changeYear} className="w-full">
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="matches-month" className="block text-sm font-medium mb-2">Mes</label>
            <select id="matches-month" value={selectedMonth} onChange={changeMonth} className="w-full">
              <option value="">Todos los meses</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
        </div>

        <PaginatedMatchList
          matches={matches}
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

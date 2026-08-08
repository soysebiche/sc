import MatchRow from '../components/MatchRow';
import Pagination from '../components/Pagination';

function MatchesView({
  years,
  months,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  matches,
  pagination,
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

        {matches.length > 0 ? (
          <>
            <p className="archive-kicker" role="status" aria-live="polite">
              Mostrando {pagination.start}–{pagination.end} de {matches.length} partidos · página {pagination.currentPage} de {pagination.totalPages}
            </p>
            <div className="match-list match-list--catalog">
              {pagination.items.map(match => <MatchRow key={`${match.Fecha}-${match['Equipo Local']}-${match['Equipo Visita']}`} match={match} />)}
            </div>
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={page => setPage(String(page))} />
          </>
        ) : (
          <div className="archive-empty-state">
            <h3>No hay partidos con esos filtros</h3>
            <p>Prueba otro año o mes.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default MatchesView;

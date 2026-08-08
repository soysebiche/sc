import MatchRow from './MatchRow';
import Pagination from './Pagination';
import { paginateMatches } from '../domain/matches';

function PaginatedMatchList({
  matches,
  page,
  setPage,
  label,
  emptyTitle = 'No se encontraron partidos',
  emptyMessage,
}) {
  const pagination = paginateMatches(matches, page);

  if (matches.length === 0) {
    return (
      <div className="archive-empty-state">
        <h3>{emptyTitle}</h3>
        {emptyMessage && <p>{emptyMessage}</p>}
      </div>
    );
  }

  return (
    <>
      <p className="archive-kicker" role="status" aria-live="polite" aria-atomic="true">
        Mostrando {pagination.start}–{pagination.end} de {matches.length} partidos · página {pagination.currentPage} de {pagination.totalPages}
      </p>
      <div className="match-list match-list--catalog">
        {pagination.items.map((match, index) => (
          <MatchRow key={`${match.Fecha}-${match['Equipo Local']}-${match['Equipo Visita']}-${index}`} match={match} />
        ))}
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={nextPage => setPage(String(nextPage))}
        label={label}
      />
    </>
  );
}

export default PaginatedMatchList;

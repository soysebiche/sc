function Pagination({ currentPage, totalPages, onPageChange, label = 'Paginación de partidos' }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}

export default Pagination;

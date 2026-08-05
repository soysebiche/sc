import { lazy, Suspense } from 'react';
import StatTile from '../components/StatTile';

const YearChart = lazy(() => import('../components/YearChart'));

const COLUMNS = [
  { key: 'year', label: 'AÑO' },
  { key: 'total', label: 'PJ' },
  { key: 'victories', label: 'V' },
  { key: 'draws', label: 'E' },
  { key: 'defeats', label: 'P' },
  { key: 'winPercentage', label: '%' },
  { key: 'goalsFor', label: 'GF' },
  { key: 'goalsAgainst', label: 'GC' },
];

function AnnualAnalysisView({
  decades,
  selectedDecade,
  setSelectedDecade,
  tournamentFilter,
  setTournamentFilter,
  chartData,
  stats,
  currentYearStats,
  selectedYear,
  setSelectedYear,
  sortConfig,
  setSortConfig,
}) {
  const sortBy = key => setSortConfig({
    key,
    direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="annual-toolbar">
        <h2 className="section-title">Análisis por año</h2>
        <div className="annual-toolbar__filters">
          <div>
            <label htmlFor="year-decade" className="block text-sm font-medium mb-2">Década</label>
            <select id="year-decade" value={selectedDecade} onChange={event => setSelectedDecade(event.target.value)}>
              <option value="all">Todas las décadas</option>
              {decades.map(decade => <option key={decade} value={decade}>{decade}s</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year-tournament" className="block text-sm font-medium mb-2">Torneo</label>
            <select id="year-tournament" value={tournamentFilter} onChange={event => setTournamentFilter(event.target.value)}>
              <option value="todos">Todos los torneos</option>
              <option value="local">Solo locales</option>
              <option value="internacional">Solo internacionales</option>
            </select>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="chart-skeleton" role="status" aria-label="Cargando gráfico anual" />}>
        <YearChart data={chartData} />
      </Suspense>

      {currentYearStats && (
        <section className="archive-section" key={currentYearStats.year}>
          <h3 className="balance-title">Resumen {currentYearStats.year}</h3>
          <div className="stat-strip stat-strip--5">
            <StatTile label="Partidos" value={currentYearStats.total} color="var(--color-celeste)" />
            <StatTile label="Victorias" value={currentYearStats.victories} detail={`${currentYearStats.winPercentage}%`} color="var(--color-win)" />
            <StatTile label="Empates" value={currentYearStats.draws} detail={`${currentYearStats.drawPercentage}%`} color="var(--color-draw)" />
            <StatTile label="Derrotas" value={currentYearStats.defeats} detail={`${currentYearStats.defeatPercentage}%`} color="var(--color-loss)" />
            <StatTile label="Goles" value={`${currentYearStats.goalsFor} - ${currentYearStats.goalsAgainst}`} color="var(--color-celeste)" />
          </div>
        </section>
      )}

      <div className="data-table-shell"><div className="overflow-x-auto">
        <table>
          <thead><tr>{COLUMNS.map(column => (
            <th key={column.key} scope="col" aria-sort={sortConfig.key === column.key ? (sortConfig.direction === 'desc' ? 'descending' : 'ascending') : 'none'}>
              <button type="button" className="table-sort-button" onClick={() => sortBy(column.key)} aria-label={`Ordenar por ${column.label}${sortConfig.key === column.key ? `, orden ${sortConfig.direction === 'desc' ? 'descendente' : 'ascendente'}` : ''}`}>
                {column.label} {sortConfig.key === column.key && (sortConfig.direction === 'desc' ? '↓' : '↑')}
              </button>
            </th>
          ))}</tr></thead>
          <tbody>{stats.map(yearData => (
            <tr key={yearData.year} style={{ background: selectedYear === yearData.year ? 'var(--color-celeste-soft)' : undefined }}>
              <td><button type="button" className="year-select-button" onClick={() => setSelectedYear(yearData.year)} aria-pressed={selectedYear === yearData.year} aria-label={`Mostrar resumen de ${yearData.year}`}>{yearData.year}</button></td>
              <td className="text-center">{yearData.total}</td>
              <td className="text-center font-semibold text-victory">{yearData.victories}</td>
              <td className="text-center text-draw">{yearData.draws}</td>
              <td className="text-center text-defeat">{yearData.defeats}</td>
              <td className="text-center font-bold text-accent">{yearData.winPercentage}%</td>
              <td className="text-center">{yearData.goalsFor}</td>
              <td className="text-center">{yearData.goalsAgainst}</td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>
    </div>
  );
}

export default AnnualAnalysisView;

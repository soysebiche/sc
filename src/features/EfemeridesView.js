import BalanceSummary from '../components/BalanceSummary';
import MatchRow from '../components/MatchRow';
import UpcomingMatches from '../components/UpcomingMatches';

function EfemeridesView({ selectedDate, setSelectedDate, matches, stats }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <UpcomingMatches />

      <section className="query-panel">
        <h2 className="section-title">Partidos jugados en esta fecha</h2>
        <div className="query-panel__control">
          <label htmlFor="efemerides-date" className="block text-sm font-medium mb-2">Fecha para consultar</label>
          <input id="efemerides-date" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} className="w-full" />
        </div>
      </section>

      {matches.length > 0 ? (
        <>
          <BalanceSummary title="Balance del día" stats={stats} />
          <section className="archive-section archive-section--matches">
            <p className="archive-kicker">
              {matches.length} partido{matches.length === 1 ? '' : 's'} jugado{matches.length === 1 ? '' : 's'} un {new Date(`${matches[0].Fecha}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
            <div className="match-list">
              {matches.map((match, index) => <MatchRow key={`${match.Fecha}-${match['Equipo Local']}-${index}`} match={match} />)}
            </div>
          </section>
        </>
      ) : (
        <div className="archive-section archive-empty"><p>No hay partido registrado para esta fecha</p></div>
      )}
    </div>
  );
}

export default EfemeridesView;

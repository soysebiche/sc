import { useMemo } from 'react';
import BalanceSummary from '../components/BalanceSummary';
import MatchRow from '../components/MatchRow';
import UpcomingMatches from '../components/UpcomingMatches';
import { getMatchesForDayMonth, summarizeMatches } from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

function EfemeridesView({ matches }) {
  const [selectedDate, setSelectedDate] = useUrlState('date', getToday());
  const dayMatches = useMemo(() => getMatchesForDayMonth(matches, selectedDate), [matches, selectedDate]);
  const stats = useMemo(() => summarizeMatches(dayMatches), [dayMatches]);

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

      {dayMatches.length > 0 ? (
        <>
          <BalanceSummary title="Balance del día" stats={stats} />
          <section className="archive-section archive-section--matches">
            <p className="archive-kicker">
              {dayMatches.length} partido{dayMatches.length === 1 ? '' : 's'} jugado{dayMatches.length === 1 ? '' : 's'} un {new Date(`${dayMatches[0].Fecha}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
            <div className="match-list">
              {dayMatches.map((match, index) => <MatchRow key={`${match.Fecha}-${match['Equipo Local']}-${index}`} match={match} />)}
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

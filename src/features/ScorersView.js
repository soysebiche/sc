import { lazy, Suspense, useMemo, useState } from 'react';
import { useUrlState } from '../hooks/useUrlState';
import aliases from '../data/scorer-aliases.json';
import { listDecades, listTournaments, rankScorers, SCORER_COMPLETE_FROM } from '../domain/stats';

const PAGE = 50;
const ScorerProfile = lazy(() => import('./ScorerProfile'));

function ScorersView({ matches }) {
  const [player, setPlayer] = useUrlState('jugador', '', { history: 'push' });
  const [tournament, setTournament] = useState('');
  const [decade, setDecade] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const tournaments = useMemo(() => listTournaments(matches), [matches]);
  const decades = useMemo(() => listDecades(matches), [matches]);
  const ranking = useMemo(() => rankScorers(matches, aliases, { tournament, decade }), [matches, tournament, decade]);
  const totalGoals = ranking.reduce((sum, p) => sum + p.goals, 0);

  if (player) {
    return (
      <Suspense fallback={<div className="archive-skeleton" role="status"><span>Cargando perfil…</span></div>}>
        <ScorerProfile matches={matches} name={player} onBack={() => setPlayer('')} />
      </Suspense>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Goleadores</h2>
        <p className="section-subtitle">Ranking histórico con nombres normalizados. Antes de {SCORER_COMPLETE_FROM} faltan goleadores en el archivo: esos totales son un mínimo (*).</p>
      </div>
      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor="scorers-tournament" className="block text-sm font-medium mb-2 copy-secondary">Torneo</label>
            <select id="scorers-tournament" className="w-full" value={tournament} onChange={e => { setTournament(e.target.value); setLimit(PAGE); }}>
              <option value="">Todos los torneos</option>
              {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scorers-decade" className="block text-sm font-medium mb-2 copy-secondary">Década</label>
            <select id="scorers-decade" className="w-full" value={decade} onChange={e => { setDecade(e.target.value); setLimit(PAGE); }}>
              <option value="">Todas las décadas</option>
              {decades.map(d => <option key={d} value={d}>{`${d}s`}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs mt-2 copy-muted">{ranking.length} goleadores · {totalGoals} goles registrados (sin autogoles)</p>
      </section>
      {ranking.length === 0 ? (
        <p className="p-4 text-center copy-secondary">No hay goles registrados para este filtro.</p>
      ) : (
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table>
            <thead><tr>
              <th scope="col">#</th><th scope="col">Jugador</th><th scope="col">Goles</th><th scope="col">Partidos con gol</th><th scope="col">Años</th>
            </tr></thead>
            <tbody>{ranking.slice(0, limit).map((p, i) => (
              <tr key={p.name}>
                <td className="text-center">{i + 1}</td>
                <td><a className="link-accent" href={`?view=goleadores&jugador=${encodeURIComponent(p.name)}`} onClick={e => { e.preventDefault(); setPlayer(p.name); window.scrollTo?.(0, 0); }}>{p.name}</a></td>
                <td className="text-center font-bold text-accent">{p.goals}{p.lowerBound ? '*' : ''}</td>
                <td className="text-center">{p.matches}</td>
                <td className="text-center">{p.first === p.last ? p.first : `${p.first}–${p.last}`}</td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
      )}
      {ranking.length > limit && (
        <div className="text-center"><button type="button" className="btn btn-primary" onClick={() => setLimit(limit + PAGE)}>Ver más</button></div>
      )}
    </div>
  );
}

export default ScorersView;

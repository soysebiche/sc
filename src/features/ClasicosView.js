import { useMemo } from 'react';
import aliases from '../data/scorer-aliases.json';
import { MatchList, ScorerList, StreakStrip, TotalsStrip } from '../components/HeadToHead';
import { CLASICOS, headToHead } from '../domain/rivals';
import ShareButton from '../components/ShareButton';
import { useUrlState } from '../hooks/useUrlState';

const isValid = v => CLASICOS.includes(v);

function DecadeTable({ rows }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">Por década</h3>
      <div className="data-table-shell"><div className="overflow-x-auto">
        <table>
          <thead><tr>{['Década', 'PJ', 'V', 'E', 'P', 'GF', 'GC', '%V'].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.decade}>
              <td>{r.decade}s</td><td className="text-center">{r.played}</td>
              <td className="text-center text-victory">{r.V}</td><td className="text-center text-draw">{r.E}</td><td className="text-center text-defeat">{r.P}</td>
              <td className="text-center">{r.goalsFor}</td><td className="text-center">{r.goalsAgainst}</td>
              <td className="text-center font-bold text-accent">{r.winRate}%</td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>
    </section>
  );
}

function ClasicosView({ matches }) {
  const [rival, setRival] = useUrlState('clasico', CLASICOS[0], { validate: isValid });
  const h2h = useMemo(() => headToHead(matches, rival, aliases, { lastN: 10 }), [matches, rival]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Clásicos</h2>
        <p className="section-subtitle">Cristal frente a los otros dos grandes, partido a partido desde 1956.</p>
        <div className="mt-3"><ShareButton type="h2h" rival={rival} label="Compartir historial" /></div>
      </div>
      <div className="primary-nav primary-nav--on-surface" role="group" aria-label="Elegir clásico">
        {CLASICOS.map(r => (
          <button type="button" key={r} className={`tab ${r === rival ? 'tab-active' : 'tab-inactive'}`} aria-pressed={r === rival} onClick={() => setRival(r)}>vs. {r}</button>
        ))}
      </div>
      <TotalsStrip total={h2h.total} />
      <section className="archive-section">
        <h3 className="collection-title">Rachas en el clásico</h3>
        <StreakStrip streaks={h2h.streaks} rival={rival} />
      </section>
      <DecadeTable rows={h2h.byDecade} />
      <ScorerList title="Goleadores celestes en el clásico" scorers={h2h.topScorers} />
      <MatchList title="Últimos 10" rows={h2h.last} />
      <MatchList title="Mayores victorias" rows={h2h.biggestWins} />
      <MatchList title="Peores derrotas" rows={h2h.biggestLosses} />
    </div>
  );
}

export default ClasicosView;

import { formatMatchDate } from '../domain/matches';
import StatTile from './StatTile';

const BADGE = { V: ['badge-green', 'V'], E: ['badge-yellow', 'E'], P: ['badge-red', 'P'] };
export function ResultBadge({ code }) {
  const [cls, label] = BADGE[code] || ['', '?'];
  return <span className={`badge ${cls}`} aria-label={{ V: 'Victoria', E: 'Empate', P: 'Derrota' }[code]}>{label}</span>;
}

export const recordLine = r => `${r.V}V ${r.E}E ${r.P}P · ${r.goalsFor}-${r.goalsAgainst}`;
const range = s => (s ? `${formatMatchDate(s.start)} – ${formatMatchDate(s.end)}` : '—');

export function TotalsStrip({ total }) {
  return (
    <div className="stat-strip stat-strip--4">
      <StatTile label="Partidos" value={total.played} tone="celeste" />
      <StatTile label="Victorias" value={total.V} detail={`${total.winRate}%`} tone="win" />
      <StatTile label="Empates" value={total.E} tone="draw" />
      <StatTile label="Derrotas" value={total.P} detail={`Goles ${total.goalsFor}-${total.goalsAgainst}`} tone="loss" />
    </div>
  );
}

export function MatchList({ title, rows, empty = 'Sin partidos.' }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      {rows.length === 0 ? <p className="copy-secondary">{empty}</p> : (
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table>
            <thead><tr><th scope="col">Fecha</th><th scope="col">Partido</th><th scope="col">Marcador</th><th scope="col">Torneo</th></tr></thead>
            <tbody>{rows.map(m => (
              <tr key={`${m.date}-${m.home}-${m.away}`}>
                <td>{formatMatchDate(m.date)}</td>
                <td>{m.home} vs {m.away}</td>
                <td className="text-center font-bold"><ResultBadge code={m.resultCode} /> {m.scoreLabel}</td>
                <td>{m.tournament}</td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
      )}
    </section>
  );
}

export function ScorerList({ title, scorers }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      {scorers.length === 0 ? <p className="copy-secondary">Sin goleadores registrados.</p> : (
        <ol className="space-y-1">
          {scorers.map((s, i) => (
            <li key={s.name}><span className="copy-secondary">{i + 1}.</span> <strong>{s.name}</strong> — {s.goals} {s.goals === 1 ? 'gol' : 'goles'}{s.lowerBound ? '*' : ''}</li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function StreakStrip({ streaks, rival }) {
  return (
    <div className="stat-strip stat-strip--3 stat-strip--context">
      <StatTile label="Invicto · récord" value={streaks.unbeaten.record?.length ?? 0} detail={range(streaks.unbeaten.record)} align="left" tone="celeste" />
      <StatTile label="Victorias seguidas · récord" value={streaks.winning.record?.length ?? 0} detail={range(streaks.winning.record)} align="left" tone="win" />
      <StatTile label={`${rival} sin perder · récord`} value={streaks.rivalUnbeaten.record?.length ?? 0} detail={range(streaks.rivalUnbeaten.record)} align="left" tone="loss" />
    </div>
  );
}

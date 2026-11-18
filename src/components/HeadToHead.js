import { formatMatchDate } from '../domain/matches';
import { matchKey } from '../domain/publicRoutes';
import { usePublicCatalog } from './PublicCatalog';
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

function MatchFixture({ match }) {
  const { matchPathByKey } = usePublicCatalog();
  const href = matchPathByKey.get(matchKey(match));
  const label = `${match.home} vs ${match.away}`;
  return href ? <a className="link-accent" href={href}>{label}</a> : label;
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
                <td><MatchFixture match={m} /></td>
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

function ScorerName({ name }) {
  const { playerPathByName } = usePublicCatalog();
  const href = playerPathByName?.get(name);
  if (!href) return name;
  return <a className="link-accent" href={href}>{name}</a>;
}

export function ScorerList({ title, scorers }) {
  return (
    <section className="archive-section">
      <h3 className="collection-title">{title}</h3>
      {scorers.length === 0 ? <p className="copy-secondary">Sin goleadores registrados.</p> : (
        <ol className="space-y-1">
          {scorers.map((s, i) => (
            <li key={s.name}><span className="copy-secondary">{i + 1}.</span> <strong><ScorerName name={s.name} /></strong> — {s.goals} {s.goals === 1 ? 'gol' : 'goles'}{s.lowerBound ? '*' : ''}</li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function StreakStrip({ streaks }) {
  const winless = streaks.winless || streaks.rivalUnbeaten;
  return (
    <div className="stat-strip stat-strip--3 stat-strip--context">
      <StatTile label="Invicto · récord" value={streaks.unbeaten.record?.length ?? 0} detail={range(streaks.unbeaten.record)} align="left" tone="celeste" />
      <StatTile label="Victorias seguidas · récord" value={streaks.winning.record?.length ?? 0} detail={range(streaks.winning.record)} align="left" tone="win" />
      <StatTile label="Sin ganar · récord" value={winless?.record?.length ?? 0} detail={range(winless?.record)} align="left" tone="loss" />
    </div>
  );
}

export function VenueStrip({ home, away, neutral }) {
  const tiles = [
    <StatTile key="home" label="Local" value={home.played} detail={home.played ? recordLine(home) : 'Sin partidos'} align="left" tone="celeste" />,
    <StatTile key="away" label="Visita" value={away.played} detail={away.played ? recordLine(away) : 'Sin partidos'} align="left" />,
  ];
  if (neutral?.played) {
    tiles.push(<StatTile key="neutral" label="Neutral" value={neutral.played} detail={recordLine(neutral)} align="left" />);
  }
  return <div className={`stat-strip ${neutral?.played ? 'stat-strip--3' : 'stat-strip--2'} stat-strip--context`}>{tiles}</div>;
}

import { formatMatchDate, getResultCode } from '../domain/matches';

const RESULT_META = {
  V: { label: 'Victoria', badge: 'badge-green', className: 'match-row--win' },
  E: { label: 'Empate', badge: 'badge-yellow', className: 'match-row--draw' },
  P: { label: 'Derrota', badge: 'badge-red', className: 'match-row--loss' },
};

function MatchRow({ match }) {
  const result = getResultCode(match);
  const resultMeta = RESULT_META[result];
  const goals = match['Goles (Solo SC)'];
  const hasGoals = goals && goals !== '-';

  return (
    <article className={`match-row ${resultMeta?.className || ''}`}>
      <div className="match-row__date">
        {resultMeta && (
          <span
            className={`badge ${resultMeta.badge}`}
            aria-label={resultMeta.label}
            title={resultMeta.label}
          >
            {result}
          </span>
        )}
        <time dateTime={match.Fecha !== 'TBD' ? match.Fecha : undefined}>
          {formatMatchDate(match.Fecha)}
        </time>
      </div>

      <div className="match-row__fixture">
        <p className="match-teams">{match['Equipo Local']} vs {match['Equipo Visita']}</p>
        {hasGoals && <p className="match-goals"><span>Goles</span> · {goals}</p>}
      </div>

      <div className="match-row__outcome">
        <p className="match-score">{match.Marcador}</p>
        <p className="match-tournament">{match.Torneo}</p>
      </div>
    </article>
  );
}

export default MatchRow;

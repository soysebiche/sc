import { formatMatchDate } from '../domain/matches';

const RESULT_META = {
  V: { label: 'Victoria', badge: 'badge-green', className: 'match-row--win' },
  E: { label: 'Empate', badge: 'badge-yellow', className: 'match-row--draw' },
  P: { label: 'Derrota', badge: 'badge-red', className: 'match-row--loss' },
};

function MatchRow({ match }) {
  const resultMeta = RESULT_META[match.resultCode];
  const hasGoals = Boolean(match.goalsNote);

  return (
    <article className={`match-row ${resultMeta?.className || ''}`}>
      <div className="match-row__date">
        {resultMeta && (
          <span
            className={`badge ${resultMeta.badge}`}
            aria-label={resultMeta.label}
            title={resultMeta.label}
          >
            {match.resultCode}
          </span>
        )}
        <time dateTime={match.date !== 'TBD' ? match.date : undefined}>
          {formatMatchDate(match.date)}
        </time>
      </div>

      <div className="match-row__fixture">
        <p className="match-teams">{match.home} vs {match.away}</p>
        {hasGoals && <p className="match-goals"><span>Goles</span> · {match.goalsNote}</p>}
      </div>

      <div className="match-row__outcome">
        <p className="match-score">{match.scoreLabel}</p>
        <p className="match-tournament">{match.tournament}</p>
      </div>
    </article>
  );
}

export default MatchRow;

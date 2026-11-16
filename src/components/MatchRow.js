import { formatMatchDate } from '../domain/matches';
import { matchKey } from '../domain/publicRoutes';
import { usePublicCatalog } from './PublicCatalog';

const RESULT_META = {
  V: { label: 'Victoria', badge: 'badge-green', className: 'match-row--win' },
  E: { label: 'Empate', badge: 'badge-yellow', className: 'match-row--draw' },
  P: { label: 'Derrota', badge: 'badge-red', className: 'match-row--loss' },
};

function MatchRow({ match }) {
  const resultMeta = RESULT_META[match.resultCode];
  const hasGoals = Boolean(match.goalsNote);
  const { matchPathByKey } = usePublicCatalog();
  const href = matchPathByKey.get(matchKey(match));
  const fixture = `${match.home} vs ${match.away}`;

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
        <p className="match-teams">{href ? <a href={href}>{fixture}</a> : fixture}</p>
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

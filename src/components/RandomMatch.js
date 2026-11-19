import { useMemo, useState } from 'react';
import { matchKey } from '../domain/publicRoutes';
import {
  emptyRandomFilters,
  pickRandomMatch,
  randomMatchHref,
  writeStoredFilters,
} from '../domain/randomMatch';
import { listDecades } from '../domain/stats';
import { usePublicCatalog } from './PublicCatalog';

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function openMatch(path) {
  if (path) window.location.assign(path);
}

export function RandomMatchNavLink({ auto = true }) {
  return (
    <a href={randomMatchHref(emptyRandomFilters(), { auto })}>Partido al azar</a>
  );
}

export function RandomMatchLaunch({ matches = [], rng = Math.random, navigate = openMatch }) {
  const { matchPathByKey } = usePublicCatalog();
  const [status, setStatus] = useState('');

  const onClick = () => {
    const entries = matches.map(match => ({ match, path: matchPathByKey.get(matchKey(match)) }));
    const { pick } = pickRandomMatch(entries, emptyRandomFilters(), rng);
    if (!pick?.path) {
      setStatus('No hay partidos para mostrar.');
      return;
    }
    writeStoredFilters(emptyRandomFilters());
    navigate(pick.path);
  };

  return (
    <div className="random-match-launch">
      <button type="button" className="random-match-launch__btn" onClick={onClick} disabled={!matches.length}>
        <DiceIcon />
        <span>Partido al azar</span>
      </button>
      {status ? <p className="random-match__status" role="status">{status}</p> : null}
    </div>
  );
}

export function RandomMatchPanel({ matches = [], rng = Math.random, navigate = openMatch }) {
  const { matchPathByKey } = usePublicCatalog();
  const [filters, setFilters] = useState(emptyRandomFilters);
  const [status, setStatus] = useState('');
  const decades = useMemo(() => listDecades(matches), [matches]);
  const entries = useMemo(
    () => matches.map(match => ({ match, path: matchPathByKey.get(matchKey(match)) })),
    [matchPathByKey, matches],
  );

  const onSubmit = event => {
    event.preventDefault();
    const { pick, pool } = pickRandomMatch(entries, filters, rng);
    if (!pick?.path) {
      setStatus(pool.length === 0 ? 'No hay partidos con esos filtros.' : 'No hay partidos para mostrar.');
      return;
    }
    writeStoredFilters(filters);
    navigate(pick.path);
  };

  return (
    <section className="random-match" aria-labelledby="random-match-title">
      <div className="random-match__copy">
        <p className="random-match__eyebrow">Del archivo</p>
        <h2 id="random-match-title" className="section-title">Partido al azar</h2>
        <p className="section-subtitle">Un cruce cualquiera de Sporting Cristal. Cada partido con ficha pesa igual.</p>
      </div>
      <form className="random-match__form" onSubmit={onSubmit}>
        <fieldset className="random-match__filters">
          <legend className="sr-only">Filtros opcionales</legend>
          <label className="random-match__check">
            <input
              type="checkbox"
              name="wins"
              checked={filters.winsOnly}
              onChange={event => setFilters(current => ({ ...current, winsOnly: event.target.checked }))}
            />
            Solo victorias
          </label>
          <label className="random-match__check">
            <input
              type="checkbox"
              name="clasico"
              checked={filters.clasicosOnly}
              onChange={event => setFilters(current => ({ ...current, clasicosOnly: event.target.checked }))}
            />
            Solo clásicos (Alianza o Universitario)
          </label>
          <label className="random-match__decade">
            <span>Década</span>
            <select
              name="decade"
              value={filters.decade ?? ''}
              onChange={event => setFilters(current => ({
                ...current,
                decade: event.target.value ? Number(event.target.value) : null,
              }))}
            >
              <option value="">Todas</option>
              {decades.map(decade => (
                <option key={decade} value={decade}>{`${decade}s`}</option>
              ))}
            </select>
          </label>
        </fieldset>
        {status ? <p className="random-match__status" role="status">{status}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={!matches.length}>
          Partido al azar
        </button>
      </form>
    </section>
  );
}

export default RandomMatchPanel;

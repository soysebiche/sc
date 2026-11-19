import { useMemo } from 'react';
import DistributionBar from '../components/DistributionBar';
import PaginatedMatchList from '../components/PaginatedMatchList';
import { usePublicCatalog } from '../components/PublicCatalog';
import StatTile from '../components/StatTile';
import aliases from '../data/scorer-aliases.json';
import { formatMatchDate, getUniqueYears } from '../domain/matches';
import { matchKey } from '../domain/publicRoutes';
import {
  SEARCH_PARAMS,
  SEARCH_PRESETS,
  SEARCH_VIEW,
  activeStreaks,
  clipStreakMatches,
  filterMatches,
  hasSearchFilters,
  listSearchCompetitions,
  listSearchPhases,
  listSearchRivals,
  listSearchScorers,
  presetIsActive,
  readSearchQuery,
  searchHref,
  searchStreaks,
  searchUpdates,
  matchNoun,
  streakCountLabel,
  summarizeSearch,
} from '../domain/search';
import { useUrlStore } from '../hooks/useUrlState';

const SEDE_OPTIONS = [
  { value: '', label: 'Local y visita' },
  { value: 'local', label: 'Local' },
  { value: 'visita', label: 'Visita' },
];

const RESULT_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'V', label: 'Victoria' },
  { value: 'E', label: 'Empate' },
  { value: 'P', label: 'Derrota' },
];

const GFMIN_OPTIONS = ['', '1', '2', '3', '4', '5'];

function setField(assign, query, key, value) {
  assign(searchUpdates(query, { [key]: value, sp: '1' }));
}

function StreakMatches({ streak, matchPathByKey, cap = 10 }) {
  if (!streak?.matches?.length) return <p className="copy-muted text-sm">—</p>;
  const { shown, hidden, split } = clipStreakMatches(streak.matches, cap);
  return (
    <ol className="search-streak-matches">
      {shown.map((match, index) => {
        const href = matchPathByKey.get(matchKey(match));
        const label = `${formatMatchDate(match.date)} · ${match.scoreLabel}`;
        return (
          <li key={matchKey(match)}>
            {split && index === 4 && <span className="copy-muted" aria-hidden="true">… </span>}
            {href ? <a href={href}>{label}</a> : label}
          </li>
        );
      })}
      {hidden > 0 && (
        <li className="copy-muted">{`y ${hidden} más en la lista de partidos`}</li>
      )}
    </ol>
  );
}

function streakSpan(streak) {
  if (!streak) return '';
  if (streak.start === streak.end) return formatMatchDate(streak.start);
  return `${formatMatchDate(streak.start)} – ${formatMatchDate(streak.end)}`;
}

function StreakBlock({ title, streak, empty, matchPathByKey }) {
  return (
    <div>
      <h4 className="font-bold mt-1 mb-2">{title}</h4>
      {streak ? (
        <>
          <p className="text-sm mb-2">
            <strong className="stat-number">{streak.length}</strong>
            <span className="copy-muted"> {matchNoun(streak.length)} · {streakSpan(streak)}</span>
          </p>
          <StreakMatches streak={streak} matchPathByKey={matchPathByKey} />
        </>
      ) : <p className="copy-muted text-sm">{empty}</p>}
    </div>
  );
}

function SearchView({ matches = [] }) {
  const { search, assign } = useUrlStore();
  const query = useMemo(() => readSearchQuery(search), [search]);
  const { matchPathByKey } = usePublicCatalog();

  const rivals = useMemo(() => listSearchRivals(matches), [matches]);
  const competitions = useMemo(() => listSearchCompetitions(matches), [matches]);
  const phases = useMemo(() => listSearchPhases(matches), [matches]);
  const scorers = useMemo(() => listSearchScorers(matches, aliases), [matches]);
  const years = useMemo(() => getUniqueYears(matches), [matches]);

  const filtered = useMemo(() => filterMatches(matches, query, aliases), [matches, query]);
  const stats = useMemo(() => summarizeSearch(filtered), [filtered]);
  const streaks = useMemo(() => searchStreaks(filtered), [filtered]);
  const current = useMemo(() => activeStreaks(streaks), [streaks]);
  const featured = current[0] || null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">Búsqueda y rachas</h2>
        <p className="section-subtitle">
          Filtra el archivo completo. Totales y rachas salen solo del conjunto filtrado, en orden cronológico.
          Los autogoles cuentan en el marcador, no como goleadores de Cristal. El archivo no registra estadio ni cancha neutral.
        </p>
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Ejemplos</h3>
        <div className="search-presets">
          {SEARCH_PRESETS.map(preset => {
            const active = presetIsActive(query, preset);
            return (
              <a
                key={preset.id}
                className={`search-preset${active ? ' is-active' : ''}`}
                href={searchHref(preset.params)}
                rel="nofollow"
                aria-current={active ? 'true' : undefined}
                onClick={event => {
                  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  assign(searchUpdates(preset.params), { history: 'replace' });
                }}
              >
                {preset.label}
              </a>
            );
          })}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Filtros</h3>
        <form
          className="filter-bar filter-bar--search"
          onSubmit={event => event.preventDefault()}
        >
          <div>
            <label htmlFor="search-vs" className="block text-sm font-medium mb-2 copy-secondary">Rival</label>
            <input
              id="search-vs"
              type="search"
              list="search-vs-options"
              value={query.vs}
              onChange={event => setField(assign, query, 'vs', event.target.value)}
              placeholder="Alianza Lima, A.D.T.…"
              className="w-full"
            />
            <datalist id="search-vs-options">
              {rivals.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="search-comp" className="block text-sm font-medium mb-2 copy-secondary">Competición</label>
            <select
              id="search-comp"
              className="w-full"
              value={query.comp}
              onChange={event => setField(assign, query, 'comp', event.target.value)}
            >
              <option value="">Todas</option>
              {competitions.map(item => (
                <option key={item.family} value={item.family}>{item.family}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-fase" className="block text-sm font-medium mb-2 copy-secondary">Fase</label>
            <select
              id="search-fase"
              className="w-full"
              value={query.fase}
              onChange={event => setField(assign, query, 'fase', event.target.value)}
            >
              <option value="">Todas</option>
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>{phase.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-sede" className="block text-sm font-medium mb-2 copy-secondary">Condición</label>
            <select
              id="search-sede"
              className="w-full"
              value={query.sede}
              onChange={event => setField(assign, query, 'sede', event.target.value)}
            >
              {SEDE_OPTIONS.map(option => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-from" className="block text-sm font-medium mb-2 copy-secondary">Desde temporada</label>
            <select
              id="search-from"
              className="w-full"
              value={/^\d{4}$/.test(query.from) ? query.from : ''}
              onChange={event => setField(assign, query, 'from', event.target.value)}
            >
              <option value="">Inicio del archivo</option>
              {years.map(year => <option key={year} value={String(year)}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="search-to" className="block text-sm font-medium mb-2 copy-secondary">Hasta temporada</label>
            <select
              id="search-to"
              className="w-full"
              value={/^\d{4}$/.test(query.to) ? query.to : ''}
              onChange={event => setField(assign, query, 'to', event.target.value)}
            >
              <option value="">Hoy</option>
              {years.map(year => <option key={year} value={String(year)}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="search-res" className="block text-sm font-medium mb-2 copy-secondary">Resultado</label>
            <select
              id="search-res"
              className="w-full"
              value={query.res}
              onChange={event => setField(assign, query, 'res', event.target.value)}
            >
              {RESULT_OPTIONS.map(option => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-gfmin" className="block text-sm font-medium mb-2 copy-secondary">Goles de Cristal</label>
            <select
              id="search-gfmin"
              className="w-full"
              value={query.gfmin}
              onChange={event => setField(assign, query, 'gfmin', event.target.value)}
            >
              <option value="">Cualquiera</option>
              {GFMIN_OPTIONS.filter(Boolean).map(value => (
                <option key={value} value={value}>{value}+</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-gamax" className="block text-sm font-medium mb-2 copy-secondary">Goles en contra</label>
            <select
              id="search-gamax"
              className="w-full"
              value={query.gamax}
              onChange={event => setField(assign, query, 'gamax', event.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="0">Valla invicta</option>
              <option value="1">1 o menos</option>
            </select>
          </div>
          <div>
            <label htmlFor="search-score" className="block text-sm font-medium mb-2 copy-secondary">Marcador (Cristal-rival)</label>
            <input
              id="search-score"
              type="search"
              inputMode="numeric"
              value={query.score}
              onChange={event => setField(assign, query, 'score', event.target.value)}
              placeholder="ej. 4-0"
              className="w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="search-goleador" className="block text-sm font-medium mb-2 copy-secondary">Goleador</label>
            <input
              id="search-goleador"
              type="search"
              list="search-goleador-options"
              value={query.goleador}
              onChange={event => setField(assign, query, 'goleador', event.target.value)}
              placeholder="Jorge Soto…"
              className="w-full"
            />
            <datalist id="search-goleador-options">
              {scorers.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>
        </form>
        <div className="search-filter-actions">
          {hasSearchFilters(query) && (
            <a
              className="btn btn-ghost"
              href={`/?view=${SEARCH_VIEW}`}
              rel="nofollow"
              onClick={event => {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                assign(searchUpdates(SEARCH_PARAMS));
              }}
            >
              Limpiar filtros
            </a>
          )}
          <p className="copy-muted text-xs">Los filtros quedan en la URL para compartir esta búsqueda.</p>
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Totales del conjunto</h3>
        <div className="stat-strip stat-strip--3 mb-3">
          <StatTile label="PJ" value={stats.total} detail="partidos" tone="celeste" />
          <StatTile label="Puntos" value={stats.points} detail="3 por victoria" />
          <StatTile label="Goles" value={`${stats.goalsFor} - ${stats.goalsAgainst}`} detail="a favor - en contra" />
        </div>
        <div className="stat-strip stat-strip--3 mb-4">
          <StatTile label="Victorias" value={stats.victories} detail={`${stats.winPercentage}%`} tone="win" />
          <StatTile label="Empates" value={stats.draws} detail={`${stats.drawPercentage}%`} tone="draw" />
          <StatTile label="Derrotas" value={stats.defeats} detail={`${stats.defeatPercentage}%`} tone="loss" />
        </div>
        <DistributionBar stats={stats} />
      </section>

      {featured && (
        <section className="archive-section search-active-streak">
          <h3 className="collection-title">Racha activa</h3>
          <p className="section-subtitle">
            {featured.label}: {streakCountLabel(featured.current.length)} ({streakSpan(featured.current)}).
            Sigue abierta al último partido de este conjunto.
          </p>
          {current.length > 1 && (
            <p className="copy-muted text-sm mt-2">
              También abiertas: {current.slice(1).map(item => `${item.label} (${item.current.length})`).join(' · ')}
            </p>
          )}
          <StreakMatches streak={featured.current} matchPathByKey={matchPathByKey} cap={24} />
        </section>
      )}

      <section className="archive-section">
        <h3 className="collection-title">Rachas más largas</h3>
        <div className="curio-grid">
          {Object.values(streaks).map(streak => (
            <StreakBlock
              key={streak.id}
              title={streak.label}
              streak={streak.record}
              empty="Sin racha en este conjunto."
              matchPathByKey={matchPathByKey}
            />
          ))}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Rachas vigentes en el conjunto</h3>
        <div className="curio-grid">
          {Object.values(streaks).map(streak => (
            <StreakBlock
              key={streak.id}
              title={streak.label}
              streak={streak.current}
              empty="Cerrada."
              matchPathByKey={matchPathByKey}
            />
          ))}
        </div>
      </section>

      <section className="archive-section">
        <h3 className="collection-title">Partidos</h3>
        <PaginatedMatchList
          matches={filtered}
          page={query.sp}
          setPage={page => assign({ sp: { value: String(page), defaultValue: '1' } })}
          label="Paginación de la búsqueda"
          emptyTitle="Ningún partido coincide"
          emptyMessage="Prueba otro filtro o uno de los ejemplos."
        />
      </section>
    </div>
  );
}

export default SearchView;

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import PaginatedMatchList from '../components/PaginatedMatchList';
import StatTile from '../components/StatTile';
import { isKnownCityId, isLimaSide, isMapScope, aggregateCities, filterCities } from '../domain/venues.js';
import { usePublicCatalog } from '../components/PublicCatalog';
import { useUrlState } from '../hooks/useUrlState';

const CityMap = lazy(() => import('./CityMap'));

const SCOPE_LABEL = {
  todos: 'Todas las ciudades',
  peru: 'Perú',
  internacional: 'Internacional',
};

function RecordStrip({ record, label }) {
  if (!record?.played) {
    return <p className="copy-secondary">Sin partidos {label}.</p>;
  }
  return (
    <div className="stat-strip stat-strip--5">
      <StatTile label="PJ" value={record.played} tone="celeste" />
      <StatTile label="V" value={record.V} tone="win" />
      <StatTile label="E" value={record.E} tone="draw" />
      <StatTile label="P" value={record.P} tone="loss" />
      <StatTile label="GF–GC" value={`${record.goalsFor}–${record.goalsAgainst}`} tone="celeste" />
    </div>
  );
}

function MapView({ matches }) {
  const { rivalPathByName } = usePublicCatalog();
  const { cities, unmapped } = useMemo(() => aggregateCities(matches), [matches]);
  const [scope, setScope] = useUrlState('mapaAmbito', 'todos', { validate: isMapScope });
  const [cityId, setCityId] = useUrlState('ciudad', '', { validate: isKnownCityId });
  const [side, setSide] = useUrlState('mapaLado', '', { validate: value => value === '' || isLimaSide(value) });
  const [page, setPage] = useUrlState('mapaPage', '1');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const scoped = filterCities(cities, scope);
    const needle = query.trim().toLowerCase();
    if (!needle) return scoped;
    return scoped.filter((city) => {
      const haystack = [
        city.name,
        city.country,
        ...city.clubs.map(club => club.name),
      ].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [cities, scope, query]);

  const selected = visible.find(city => city.id === cityId) || cities.find(city => city.id === cityId) || null;
  const limaSide = selected?.id === 'lima' ? (side || 'local') : 'visita';
  const activeMatches = selected
    ? (limaSide === 'local' ? selected.homeMatches : selected.awayMatches)
    : [];

  useEffect(() => {
    const active = document.querySelector('.city-list__item--active');
    if (typeof active?.scrollIntoView === 'function') {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const selectCity = (id) => {
    setCityId(id, {
      mapaPage: { value: '1', defaultValue: '1' },
      mapaLado: { value: id === 'lima' ? (side || 'local') : '', defaultValue: '' },
    });
  };

  const changeScope = (next) => {
    setScope(next, {
      ciudad: { value: '', defaultValue: '' },
      mapaPage: { value: '1', defaultValue: '1' },
      mapaLado: { value: '', defaultValue: '' },
    });
  };

  if (!matches.length) {
    return <div className="p-4 text-center copy-secondary">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro city-map-intro">
        <div>
          <h2 className="section-title">Mapa por ciudades</h2>
          <p className="section-subtitle">Récord de Sporting Cristal según la ciudad del rival. No es un mapa de estadios.</p>
        </div>
      </div>

      <aside className="archive-section city-map-note" aria-label="Alcance de los datos">
        <p>
          El archivo histórico no registra estadios ni sedes neutrales: cada partido solo indica local o visita y el país.
          Este mapa agrupa las <strong>visitas por la ciudad del club rival</strong> y el récord <strong>como local en Lima</strong>,
          ciudad de Sporting Cristal. Un mapa de recintos requiere un campo de estadio (y sede neutral) por partido.
        </p>
      </aside>

      <div className="city-map-toolbar">
        <div className="primary-nav primary-nav--on-surface" role="group" aria-label="Ámbito del mapa">
          {Object.entries(SCOPE_LABEL).map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={`tab ${scope === id ? 'tab-active' : 'tab-inactive'}`}
              aria-pressed={scope === id}
              onClick={() => changeScope(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="city-search" className="block text-sm font-medium mb-2 copy-secondary">Filtrar ciudades o rivales</label>
          <input
            id="city-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Tarma, A.D.T., Buenos Aires…"
            className="w-full"
          />
        </div>
      </div>

      <div className="city-map-layout">
        <section className="archive-section city-list-panel" aria-label="Ciudades">
          <p className="archive-kicker">{visible.length} ciudades · visita agrupada por ciudad del rival</p>
          <ul className="city-list">
            {visible.map((city, index) => {
              const active = city.id === selected?.id;
              return (
                <li key={city.id} style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}>
                  <button
                    type="button"
                    className={`city-list__item ${active ? 'city-list__item--active' : ''}`}
                    aria-pressed={active}
                    onClick={() => selectCity(city.id)}
                  >
                    <span className="city-list__place">
                      <strong>{city.name}</strong>
                      <span>{city.country}{city.id === 'lima' ? ' · local y visita' : ''}</span>
                    </span>
                    <span className="city-list__record">
                      {city.id === 'lima' && city.home.played
                        ? <span>Local {city.home.played} PJ</span>
                        : null}
                      <span>{city.away.V}V {city.away.E}E {city.away.P}P</span>
                      <span className="city-list__pj">{city.away.played} PJ visita</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && <p className="copy-secondary">Ninguna ciudad coincide con el filtro.</p>}
        </section>

        <Suspense fallback={<div className="city-map-frame city-map-skeleton" role="status">Cargando mapa…</div>}>
          <CityMap cities={visible} selectedId={selected?.id || ''} onSelect={selectCity} />
        </Suspense>
      </div>

      {selected ? (
        <section className="archive-section space-y-4">
          <h3 className="collection-title">{selected.name}, {selected.country}</h3>
          {selected.id === 'lima' && (
            <div className="primary-nav primary-nav--on-surface" role="group" aria-label="Condición en Lima">
              <button
                type="button"
                className={`tab ${limaSide === 'local' ? 'tab-active' : 'tab-inactive'}`}
                aria-pressed={limaSide === 'local'}
                onClick={() => setSide('local', { mapaPage: { value: '1', defaultValue: '1' } })}
              >
                Como local
              </button>
              <button
                type="button"
                className={`tab ${limaSide === 'visita' ? 'tab-active' : 'tab-inactive'}`}
                aria-pressed={limaSide === 'visita'}
                onClick={() => setSide('visita', { mapaPage: { value: '1', defaultValue: '1' } })}
              >
                Como visita en Lima
              </button>
            </div>
          )}
          <RecordStrip
            record={limaSide === 'local' ? selected.home : selected.away}
            label={limaSide === 'local' ? 'como local' : 'como visita'}
          />
          {limaSide === 'visita' && selected.clubs.length > 0 && (
            <div>
              <h4 className="city-clubs-title">Rivales con sede en {selected.name}</h4>
              <ul className="city-clubs">
                {selected.clubs.map(club => {
                  const href = rivalPathByName.get(club.name);
                  return (
                    <li key={club.name}>
                      {href ? <a href={href}>{club.name}</a> : club.name}
                      <span>{club.played} PJ · {club.V}V {club.E}E {club.P}P · {club.goalsFor}–{club.goalsAgainst}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <h4 className="city-clubs-title">Partidos</h4>
          <PaginatedMatchList
            matches={activeMatches}
            page={page}
            setPage={setPage}
            label={`Paginación de partidos en ${selected.name}`}
            emptyMessage={limaSide === 'local'
              ? 'No hay partidos como local atribuidos a Lima.'
              : `No hay partidos de visita agrupados en ${selected.name}.`}
          />
        </section>
      ) : (
        <p className="copy-secondary text-center py-6">Elige una ciudad en la lista o en el mapa para ver el récord y los partidos.</p>
      )}

      {unmapped.clubs.length > 0 && (
        <section className="archive-section">
          <h3 className="collection-title">Rivales sin ciudad asignada</h3>
          <p className="section-subtitle mb-3">
            No hay una ciudad pública inequívoca para estos nombres del archivo. No se inventa una sede.
          </p>
          <ul className="city-clubs">
            {unmapped.clubs.map(club => (
              <li key={`${club.name}|${club.country}`}>
                <span>{club.name}{club.country ? ` (${club.country})` : ''}</span>
                <span>{club.played} PJ · {club.V}V {club.E}E {club.P}P</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default MapView;

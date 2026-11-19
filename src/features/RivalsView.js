import { useMemo, useState } from 'react';
import PaginatedMatchList from '../components/PaginatedMatchList';
import { MatchList, ScorerList, StreakStrip, TotalsStrip, VenueStrip } from '../components/HeadToHead';
import ShareButton from '../components/ShareButton';
import StatTile from '../components/StatTile';
import { usePublicCatalog } from '../components/PublicCatalog';
import aliases from '../data/scorer-aliases.json';
import { clubOf, formatMatchDate, getUniqueYears, sortMatchesNewest } from '../domain/matches';
import { filterRivals, headToHead, listRivals, sortRivals } from '../domain/rivals';
import { matchKey } from '../domain/publicRoutes';
import { useUrlState } from '../hooks/useUrlState';

function MatchHref({ match, children }) {
  const { matchPathByKey } = usePublicCatalog();
  const href = matchPathByKey.get(matchKey(match));
  if (!href) return children;
  return <a className="link-accent" href={href}>{children}</a>;
}

function RivalIndex({ rivals, onSelect }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('played');
  const visible = useMemo(() => sortRivals(filterRivals(rivals, query), sort), [rivals, query, sort]);

  return (
    <>
      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor="rival-index-search" className="block text-sm font-medium mb-2 copy-secondary">Buscar rival</label>
            <input
              id="rival-index-search"
              type="search"
              className="w-full"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Nombre del club"
            />
          </div>
          <div>
            <label htmlFor="rival-index-sort" className="block text-sm font-medium mb-2 copy-secondary">Ordenar por</label>
            <select id="rival-index-sort" className="w-full" value={sort} onChange={event => setSort(event.target.value)}>
              <option value="played">Partidos jugados</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>
        <p className="text-xs copy-muted">{visible.length} rivales · el orden por defecto es partidos jugados</p>
      </section>

      {visible.length === 0 ? (
        <p className="p-4 text-center copy-secondary">Ningún rival coincide con la búsqueda.</p>
      ) : (
        <div className="data-table-shell"><div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Rival</th>
                <th scope="col">PJ</th>
                <th scope="col">V</th>
                <th scope="col">E</th>
                <th scope="col">P</th>
                <th scope="col">Goles</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(rival => (
                <tr key={rival.name}>
                  <td>
                    <button type="button" className="link-accent" onClick={() => onSelect(rival.name)}>{rival.name}</button>
                    {rival.path && <>{' · '}<a className="copy-muted" href={rival.path}>ficha</a></>}
                  </td>
                  <td className="text-center font-bold">{rival.played}</td>
                  <td className="text-center text-victory">{rival.V}</td>
                  <td className="text-center text-draw">{rival.E}</td>
                  <td className="text-center text-defeat">{rival.P}</td>
                  <td className="text-center">{rival.goalsFor}-{rival.goalsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
    </>
  );
}

function TieList({ ties }) {
  if (!ties.length) return null;
  return (
    <section className="archive-section">
      <h3 className="collection-title">Eliminatorias ida y vuelta</h3>
      <p className="copy-secondary text-sm mb-2">Solo se agrupan llaves que el archivo marca como ida y vuelta de la misma serie.</p>
      <div className="data-table-shell"><div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th scope="col">Llave</th>
              <th scope="col">Ida</th>
              <th scope="col">Vuelta</th>
              <th scope="col">Global</th>
              <th scope="col">Clasificó</th>
            </tr>
          </thead>
          <tbody>
            {ties.map(tie => (
              <tr key={`${tie.ida.date}-${tie.vuelta.date}`}>
                <td>{tie.label}</td>
                <td>
                  <MatchHref match={tie.ida}>{formatMatchDate(tie.ida.date)} · {tie.ida.scoreLabel}</MatchHref>
                </td>
                <td>
                  <MatchHref match={tie.vuelta}>{formatMatchDate(tie.vuelta.date)} · {tie.vuelta.scoreLabel}</MatchHref>
                </td>
                <td className="text-center font-bold">{tie.scoreLabel}</td>
                <td>{tie.advanced || 'El archivo no registra quién avanzó'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </section>
  );
}

function RivalDetail({ matches, rival, years, selectedYear, setSelectedYear, page, setPage, onBack, publicPath }) {
  const h2h = useMemo(() => headToHead(matches, rival, aliases, { lastN: 5 }), [matches, rival]);
  const filteredMatches = useMemo(() => sortMatchesNewest(matches.filter(match => {
    if (clubOf(match.opponent) !== rival) return false;
    return selectedYear ? String(match.year) === selectedYear : true;
  })), [matches, rival, selectedYear]);
  const lineage = h2h.names.filter(name => name !== rival);
  const first = h2h.firstMatch;
  const last = h2h.lastMatch;

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" className="btn btn-ghost" onClick={onBack}>← Todos los rivales</button>
        {publicPath && <a className="link-accent" href={publicPath}>Ficha pública vs. {rival}</a>}
        <ShareButton type="h2h" rival={rival} label="Compartir historial" />
      </div>

      {lineage.length > 0 && (
        <p className="copy-secondary text-sm">Incluye partidos publicados como {lineage.join(', ')}.</p>
      )}

      <TotalsStrip total={h2h.total} />
      <section className="archive-section">
        <h3 className="collection-title">Local, visita{h2h.neutral.played ? ' y neutral' : ''}</h3>
        <VenueStrip home={h2h.home} away={h2h.away} neutral={h2h.neutral} />
        {!h2h.neutral.played && <p className="copy-muted text-xs mt-2">El archivo no distingue sedes neutrales: local y visita salen de quién figura como equipo local.</p>}
      </section>

      <div className="stat-strip stat-strip--2 stat-strip--context">
        <StatTile
          label="Primer cruce"
          value={first ? <MatchHref match={first}>{formatMatchDate(first.date)}</MatchHref> : '—'}
          detail={first ? `${first.home} ${first.scoreLabel} ${first.away}` : ''}
          align="left"
        />
        <StatTile
          label="Último cruce"
          value={last ? <MatchHref match={last}>{formatMatchDate(last.date)}</MatchHref> : '—'}
          detail={last ? `${last.home} ${last.scoreLabel} ${last.away}` : ''}
          align="left"
        />
      </div>

      <section className="archive-section">
        <h3 className="collection-title">Rachas</h3>
        <StreakStrip streaks={h2h.streaks} />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <MatchList title="Mayor victoria" rows={h2h.biggestWins.slice(0, 1)} empty="Sin victorias en el archivo." />
        <MatchList title="Peor derrota" rows={h2h.biggestLosses.slice(0, 1)} empty="Sin derrotas en el archivo." />
      </div>

      {h2h.byCompetition.length > 0 && (
        <section className="archive-section">
          <h3 className="collection-title">Por competición</h3>
          <div className="data-table-shell"><div className="overflow-x-auto">
            <table>
              <thead><tr>{['Competición', 'PJ', 'V', 'E', 'P', 'GF', 'GC', '%V'].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {h2h.byCompetition.map(row => (
                  <tr key={row.family}>
                    <td title={row.variants.join(' · ')}>{row.family}</td>
                    <td className="text-center">{row.played}</td>
                    <td className="text-center text-victory">{row.V}</td>
                    <td className="text-center text-draw">{row.E}</td>
                    <td className="text-center text-defeat">{row.P}</td>
                    <td className="text-center">{row.goalsFor}</td>
                    <td className="text-center">{row.goalsAgainst}</td>
                    <td className="text-center font-bold text-accent">{row.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        </section>
      )}

      <TieList ties={h2h.ties} />
      <ScorerList title={`Goleadores celestes vs. ${rival}`} scorers={h2h.topScorers} />

      <section className="archive-section">
        <h3 className="collection-title">Historial de encuentros</h3>
        <div className="filter-bar">
          <div>
            <label htmlFor="rival-year" className="block text-sm font-medium mb-2 copy-secondary">Filtrar por año (opcional)</label>
            <select
              id="rival-year"
              className="w-full"
              value={selectedYear}
              onChange={event => setSelectedYear(event.target.value)}
            >
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <PaginatedMatchList
          matches={filteredMatches}
          page={page}
          setPage={setPage}
          label={`Paginación del historial contra ${rival}`}
          emptyMessage={`No hay partidos contra ${rival}${selectedYear ? ` en ${selectedYear}` : ''}.`}
        />
      </section>
    </>
  );
}

function RivalsView({ matches = [] }) {
  const { rivalPathByName } = usePublicCatalog();
  const rivals = useMemo(() => {
    const listed = listRivals(matches);
    return listed.map(rival => ({
      ...rival,
      path: rivalPathByName.get(rival.name),
    }));
  }, [matches, rivalPathByName]);
  const rivalNames = useMemo(() => new Set(rivals.map(rival => rival.name)), [rivals]);
  const [rivalParam, setRivalParam] = useUrlState('rival', '');
  const [selectedYear, setSelectedYear] = useUrlState('rivalYear', '');
  const [page, setPage] = useUrlState('rivalPage', '1');
  const selected = clubOf(rivalParam);
  const rival = rivalNames.has(selected) ? selected : '';

  const setRival = value => {
    const next = clubOf(value);
    setRivalParam(next, {
      rivalPage: { value: '1', defaultValue: '1' },
      rivalYear: { value: '', defaultValue: '' },
    });
  };

  const years = useMemo(() => {
    if (!rival) return [];
    return getUniqueYears(matches.filter(match => clubOf(match.opponent) === rival));
  }, [matches, rival]);

  if (!matches.length) {
    return <div className="p-4 text-center copy-secondary">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="view-intro">
        <h2 className="section-title">HISTORIAL VS RIVALES</h2>
        <p className="section-subtitle">El registro completo frente a cada rival</p>
      </div>

      {rival ? (
        <>
          <section className="archive-section">
            <label htmlFor="rival-search" className="block text-sm font-medium mb-2 copy-secondary">Buscar rival</label>
            <input
              id="rival-search"
              type="search"
              list="rival-options"
              value={rival}
              onChange={event => setRival(event.target.value)}
              className="w-full"
            />
            <datalist id="rival-options">
              {rivals.map(option => <option key={option.name} value={option.name} />)}
            </datalist>
          </section>
          <h3 className="collection-title">Balance vs {rival}</h3>
          <RivalDetail
            matches={matches}
            rival={rival}
            years={years}
            selectedYear={selectedYear}
            setSelectedYear={value => setSelectedYear(value, { rivalPage: { value: '1', defaultValue: '1' } })}
            page={page}
            setPage={setPage}
            onBack={() => setRival('')}
            publicPath={rivalPathByName.get(rival)}
          />
        </>
      ) : (
        <RivalIndex
          rivals={rivals}
          onSelect={name => {
            setRival(name);
            window.scrollTo?.(0, 0);
          }}
        />
      )}
    </div>
  );
}

export default RivalsView;

import { useMemo } from 'react';
import BalanceSummary from '../components/BalanceSummary';
import PaginatedMatchList from '../components/PaginatedMatchList';
import {
  canonicalizeRival,
  getUniqueYears,
  sortMatchesNewest,
  summarizeMatches,
} from '../domain/matches';
import { useUrlState } from '../hooks/useUrlState';

function collectRivals(matches) {
  const options = new Set();
  const countryMap = {};
  matches.forEach(match => {
    const rival = match.opponent;
    options.add(rival);
    if (match.country) countryMap[rival] = match.country;
  });
  return { options: [...options].sort(), years: getUniqueYears(matches), meta: countryMap };
}

function collectCountries(matches) {
  const options = new Set();
  matches.forEach(match => {
    if (match.country && match.country !== 'Perú') options.add(match.country);
  });
  return { options: [...options].sort(), years: getUniqueYears(matches), meta: {} };
}

export const RIVALS_HISTORY = {
  title: 'HISTORIAL VS RIVALES',
  subtitle: 'El registro completo frente a cada rival',
  entityKey: 'rival',
  yearKey: 'rivalYear',
  pageKey: 'rivalPage',
  control: 'combobox',
  entityId: 'rival-search',
  yearId: 'rival-year',
  listId: 'rival-options',
  helpId: 'rival-search-help',
  entityLabel: 'Buscar rival',
  yearLabel: 'Filtrar por año (opcional)',
  placeholder: 'Escribe un equipo',
  emptyPrompt: 'Selecciona un rival para ver el historial completo de enfrentamientos',
  help: count => `${count} rivales canónicos disponibles`,
  paginationLabel: entity => `Paginación del historial contra ${entity}`,
  emptyMessage: (entity, year) => `No hay partidos contra ${entity}${year ? ` en ${year}` : ''}.`,
  canonicalize: canonicalizeRival,
  collect: collectRivals,
  matches: (match, selected) => match.opponent === selected,
  optionCaption: (option, meta) => (meta[option] && meta[option] !== 'Perú' ? meta[option] : ''),
};

export const COUNTRIES_HISTORY = {
  title: 'HISTORIAL VS PAÍSES',
  subtitle: 'El registro internacional contra selecciones y clubes',
  entityKey: 'country',
  yearKey: 'countryYear',
  pageKey: 'countryPage',
  control: 'select',
  entityId: 'country-select',
  yearId: 'country-year',
  entityLabel: 'Seleccionar país',
  yearLabel: 'Filtrar por año (opcional)',
  selectPlaceholder: 'Selecciona un país',
  emptyPrompt: 'Selecciona un país para ver el historial completo de enfrentamientos',
  emptyCount: count => `Países disponibles: ${count}`,
  paginationLabel: entity => `Paginación del historial de ${entity}`,
  emptyMessage: (entity, year) => `No hay partidos contra equipos de ${entity}${year ? ` en ${year}` : ''}.`,
  collect: collectCountries,
  matches: (match, selected) => match.country === selected,
};

function EntityHistory({ matches = [], config }) {
  const canonicalize = config.canonicalize || (value => value);
  const [entityParam, setEntityParam] = useUrlState(config.entityKey, '');
  const [selectedYear, setSelectedYear] = useUrlState(config.yearKey, '');
  const [page, setPage] = useUrlState(config.pageKey, '1');
  const selectedEntity = canonicalize(entityParam);

  const setSelectedEntity = value => {
    setEntityParam(canonicalize(value), {
      [config.pageKey]: { value: '1', defaultValue: '1' },
    });
  };

  const { options, years, meta } = useMemo(() => config.collect(matches), [config, matches]);

  const filteredMatches = useMemo(() => {
    if (!selectedEntity) return [];
    return sortMatchesNewest(matches.filter(match => {
      const yearMatch = selectedYear ? String(match.year) === selectedYear : true;
      return config.matches(match, selectedEntity) && yearMatch;
    }));
  }, [config, matches, selectedEntity, selectedYear]);

  const stats = useMemo(() => summarizeMatches(filteredMatches), [filteredMatches]);

  if (!matches.length) {
    return <div className="p-4 text-center copy-secondary">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-4">
      <div className="view-intro">
        <h2 className="section-title">{config.title}</h2>
        <p className="section-subtitle">{config.subtitle}</p>
      </div>

      <section className="archive-section">
        <div className="filter-bar">
          <div>
            <label htmlFor={config.entityId} className="block text-sm font-medium mb-2 copy-secondary">{config.entityLabel}</label>
            {config.control === 'combobox' ? (
              <>
                <input
                  id={config.entityId}
                  type="search"
                  list={config.listId}
                  value={selectedEntity}
                  onChange={event => setSelectedEntity(event.target.value)}
                  placeholder={config.placeholder}
                  className="w-full"
                  aria-describedby={config.helpId}
                />
                <datalist id={config.listId}>
                  {options.map(option => (
                    <option key={option} value={option}>{config.optionCaption(option, meta)}</option>
                  ))}
                </datalist>
                <p id={config.helpId} className="text-xs mt-2 copy-muted">{config.help(options.length)}</p>
              </>
            ) : (
              <select id={config.entityId} value={selectedEntity} onChange={event => setSelectedEntity(event.target.value)} className="w-full">
                <option value="">{config.selectPlaceholder}</option>
                {options.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            )}
          </div>
          <div>
            <label htmlFor={config.yearId} className="block text-sm font-medium mb-2 copy-secondary">{config.yearLabel}</label>
            <select
              id={config.yearId}
              value={selectedYear}
              onChange={event => setSelectedYear(event.target.value, { [config.pageKey]: { value: '1', defaultValue: '1' } })}
              className="w-full"
              disabled={!selectedEntity}
            >
              <option value="">Todos los años</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </section>

      {selectedEntity ? (
        <>
          <BalanceSummary title={`Balance vs ${selectedEntity}${selectedYear ? ` (${selectedYear})` : ''}`} stats={stats} />
          <section className="archive-section">
            <h3 className="collection-title">Historial de encuentros</h3>
            <PaginatedMatchList
              matches={filteredMatches}
              page={page}
              setPage={setPage}
              label={config.paginationLabel(selectedEntity)}
              emptyMessage={config.emptyMessage(selectedEntity, selectedYear)}
            />
          </section>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg copy-secondary">{config.emptyPrompt}</p>
          {config.emptyCount && (
            <p className="text-sm mt-2 copy-muted">{config.emptyCount(options.length)}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default EntityHistory;

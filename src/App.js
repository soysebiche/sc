import { useEffect, useMemo, useState } from 'react';
import ArchiveProvenance from './components/ArchiveProvenance';
import MeasurementConsent, { STORAGE_KEY as MEASUREMENT_STORAGE_KEY } from './components/MeasurementConsent';
import { CalendarSubscribeLink } from './components/UpcomingMatches';
import archiveMetadata from './data/archive-metadata.json';
import {
  calculateArchiveOverview,
  calculateYearlyStats,
  filterMatchesByYearAndMonth,
  getMatchesForDayMonth,
  getUniqueMonths,
  getUniqueYears,
  summarizeMatches,
} from './domain/matches';
import AnnualAnalysisView from './features/AnnualAnalysisView';
import DashboardView from './features/DashboardView';
import EfemeridesView from './features/EfemeridesView';
import EntityHistory, { COUNTRIES_HISTORY, RIVALS_HISTORY } from './features/EntityHistory';
import MatchesView from './features/MatchesView';
import { useUrlState } from './hooks/useUrlState';
import { disableAnalytics, enableAnalytics, trackDataLoadError, trackPageView, trackThemeChange } from './services/analytics';
import { loadArchive } from './services/archive';
import { setWebVitalsConsent, startWebVitals } from './observability/webVitals';

const TABS = [
  { id: 'efemerides', label: 'EFEMÉRIDES' },
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'partidos', label: 'PARTIDOS' },
  { id: 'analisis-anual', label: 'AÑO' },
  { id: 'rivales', label: 'RIVALES' },
  { id: 'paises', label: 'PAÍSES' },
];

const TAB_IDS = new Set(TABS.map(tab => tab.id));
const isValidTab = value => TAB_IDS.has(value);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

function App() {
  const [data, setData] = useState([]);
  const [dataStatus, setDataStatus] = useState('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [measurementChoice, setMeasurementChoice] = useState(() => localStorage.getItem(MEASUREMENT_STORAGE_KEY));
  const [theme, setTheme] = useState(() => localStorage.getItem('sc-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const [activeTab, setActiveTab] = useUrlState('view', 'efemerides', { validate: isValidTab, history: 'push' });
  const [selectedDate, setSelectedDate] = useUrlState('date', getToday());
  const [selectedYear, setSelectedYear] = useUrlState('year', '');
  const [selectedMonth, setSelectedMonth] = useUrlState('month', '');
  const [matchesPage, setMatchesPage] = useUrlState('page', '1');
  const [tournamentFilter, setTournamentFilter] = useUrlState('tournament', 'todos');
  const [selectedDecade, setSelectedDecade] = useUrlState('decade', 'all');
  const [yearSortConfig, setYearSortConfig] = useState({ key: 'year', direction: 'desc' });
  const [selectedYearForStats, setSelectedYearForStats] = useState(null);

  useEffect(() => {
    let isActive = true;
    loadArchive()
      .then(records => {
        if (!isActive) return;
        setData(records);
        setDataStatus('ready');
      })
      .catch(() => {
        if (isActive) {
          setDataStatus('error');
          trackDataLoadError();
        }
      });
    return () => { isActive = false; };
  }, [loadAttempt]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.revision = archiveMetadata.datasetRevision;
    localStorage.setItem('sc-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (measurementChoice === 'accepted') {
      enableAnalytics();
      setWebVitalsConsent(true);
      startWebVitals();
      trackPageView(activeTab);
    } else {
      setWebVitalsConsent(false);
      disableAnalytics();
    }
  }, [activeTab, measurementChoice]);

  const overview = useMemo(() => calculateArchiveOverview(data), [data]);
  const years = useMemo(() => getUniqueYears(data), [data]);
  const months = useMemo(() => getUniqueMonths(data), [data]);
  const matches = useMemo(() => filterMatchesByYearAndMonth(data, selectedYear, selectedMonth), [data, selectedMonth, selectedYear]);
  const efemeridesMatches = useMemo(() => getMatchesForDayMonth(data, selectedDate), [data, selectedDate]);
  const efemeridesStats = useMemo(() => summarizeMatches(efemeridesMatches), [efemeridesMatches]);
  const decades = useMemo(() => [...new Set(years.map(year => Math.floor(year / 10) * 10))].sort((a, b) => b - a), [years]);
  const yearlyStats = useMemo(() => calculateYearlyStats(data, tournamentFilter).sort((a, b) => {
    const aValue = a[yearSortConfig.key];
    const bValue = b[yearSortConfig.key];
    return yearSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  }), [data, tournamentFilter, yearSortConfig]);
  const filteredYearlyStats = useMemo(() => selectedDecade === 'all'
    ? yearlyStats
    : yearlyStats.filter(item => Math.floor(item.year / 10) * 10 === Number.parseInt(selectedDecade, 10)), [selectedDecade, yearlyStats]);
  const chartData = useMemo(() => [...filteredYearlyStats].sort((a, b) => a.year - b.year), [filteredYearlyStats]);
  const effectiveSelectedYear = filteredYearlyStats.some(item => item.year === selectedYearForStats)
    ? selectedYearForStats
    : filteredYearlyStats[0]?.year || null;
  const currentYearStats = filteredYearlyStats.find(item => item.year === effectiveSelectedYear) || null;

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    setTheme(current => {
      const nextTheme = current === 'light' ? 'dark' : 'light';
      trackThemeChange(nextTheme);
      return nextTheme;
    });
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 350);
  };

  const retryDataLoad = () => {
    setDataStatus('loading');
    setLoadAttempt(attempt => attempt + 1);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <header className="app-header">
        <div className="app-header__inner"><div className="app-header__layout">
          <div className="brand-lockup">
            <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo noche'} title={theme === 'dark' ? 'Modo claro' : 'Modo noche'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="brand-copy">
              <img src="/sebiche-celeste-logo.webp" alt="Sebiche Celeste" width="512" height="233" fetchPriority="high" className="brand-logo" />
              <p className="header-subtitle">Archivo Histórico &middot; {archiveMetadata.recordCount} Partidos</p>
            </div>
          </div>
          <nav className="primary-nav" aria-label="Secciones principales">
            {TABS.map(tab => (
              <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`} aria-current={activeTab === tab.id ? 'page' : undefined}>
                {tab.label}
              </button>
            ))}
          </nav>
          <CalendarSubscribeLink compact />
        </div></div>
      </header>

      <main id="main-content" className="w-full max-w-7xl mx-auto px-4 py-6 flex-1" tabIndex="-1">
        <h1 className="sr-only">Sebiche Celeste — Archivo Histórico de Sporting Cristal</h1>
        {dataStatus === 'loading' && <div className="archive-skeleton" role="status"><span>Cargando archivo histórico…</span></div>}
        {dataStatus === 'error' && (
          <div className="archive-section archive-empty-state" role="alert">
            <h2 className="section-title">No pudimos cargar el archivo</h2>
            <p>El contenido local no respondió. Puedes intentarlo de nuevo.</p>
            <button type="button" className="btn btn-primary" onClick={retryDataLoad}>Reintentar</button>
          </div>
        )}
        {dataStatus === 'ready' && activeTab === 'dashboard' && <DashboardView overview={overview} />}
        {dataStatus === 'ready' && activeTab === 'efemerides' && <EfemeridesView selectedDate={selectedDate} setSelectedDate={setSelectedDate} matches={efemeridesMatches} stats={efemeridesStats} />}
        {dataStatus === 'ready' && activeTab === 'partidos' && <MatchesView years={years} months={months} selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} matches={matches} page={matchesPage} setPage={setMatchesPage} />}
        {dataStatus === 'ready' && activeTab === 'analisis-anual' && <AnnualAnalysisView decades={decades} selectedDecade={selectedDecade} setSelectedDecade={setSelectedDecade} tournamentFilter={tournamentFilter} setTournamentFilter={setTournamentFilter} chartData={chartData} stats={filteredYearlyStats} currentYearStats={currentYearStats} selectedYear={effectiveSelectedYear} setSelectedYear={setSelectedYearForStats} sortConfig={yearSortConfig} setSortConfig={setYearSortConfig} />}
        {dataStatus === 'ready' && activeTab === 'rivales' && <EntityHistory matches={data} config={RIVALS_HISTORY} />}
        {dataStatus === 'ready' && activeTab === 'paises' && <EntityHistory matches={data} config={COUNTRIES_HISTORY} />}
      </main>

      {dataStatus !== 'loading' && (
        <footer className="app-footer mt-10"><div className="footer-inner">
          <MeasurementConsent choice={measurementChoice} onChange={setMeasurementChoice} />
          <ArchiveProvenance metadata={archiveMetadata} />
          <div className="footer-meta">
            <p className="footer-signature">Sebiche Celeste &middot; {archiveMetadata.datasetRevision}</p>
            <a href="/privacidad.html">Privacidad y medición</a>
          </div>
        </div></footer>
      )}
    </div>
  );
}

export default App;

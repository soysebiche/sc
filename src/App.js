import { useCallback, useEffect, useRef, useState } from 'react';
import ArchiveProvenance from './components/ArchiveProvenance';
import MeasurementConsent, { STORAGE_KEY as MEASUREMENT_STORAGE_KEY } from './components/MeasurementConsent';
import { CalendarSubscribeLink } from './components/UpcomingMatches';
import archiveMetadata from './data/archive-metadata.json';
import AnnualAnalysisView from './features/AnnualAnalysisView';
import DashboardView from './features/DashboardView';
import EfemeridesView from './features/EfemeridesView';
import EntityHistory, { COUNTRIES_HISTORY, RIVALS_HISTORY } from './features/EntityHistory';
import MatchesView from './features/MatchesView';
import { UrlStateProvider, useUrlState } from './hooks/useUrlState';
import { disableAnalytics, enableAnalytics, trackDataLoadError, trackPageView, trackThemeChange, trackUrlControl } from './services/analytics';
import { loadArchive } from './services/archive';
import { setWebVitalsConsent, startWebVitals } from './observability/webVitals';

const TABS = [
  { id: 'efemerides', label: 'EFEMÉRIDES', View: EfemeridesView },
  { id: 'dashboard', label: 'DASHBOARD', View: DashboardView },
  { id: 'partidos', label: 'PARTIDOS', View: MatchesView },
  { id: 'analisis-anual', label: 'AÑO', View: AnnualAnalysisView },
  { id: 'rivales', label: 'RIVALES', View: props => <EntityHistory {...props} config={RIVALS_HISTORY} /> },
  { id: 'paises', label: 'PAÍSES', View: props => <EntityHistory {...props} config={COUNTRIES_HISTORY} /> },
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

function readInitialTheme() {
  return document.documentElement.getAttribute('data-theme')
    || localStorage.getItem('sc-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);
  const timeoutRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.revision = archiveMetadata.datasetRevision;
    localStorage.setItem('sc-theme', theme);
  }, [theme]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 350);
    setTheme(current => {
      const nextTheme = current === 'light' ? 'dark' : 'light';
      trackThemeChange(nextTheme);
      return nextTheme;
    });
  };

  return [theme, toggleTheme];
}

function ArchiveShell() {
  const [matches, setMatches] = useState([]);
  const [dataStatus, setDataStatus] = useState('loading');
  const [measurementChoice, setMeasurementChoice] = useState(() => localStorage.getItem(MEASUREMENT_STORAGE_KEY));
  const [theme, toggleTheme] = useTheme();
  const [activeTab, setActiveTab] = useUrlState('view', 'efemerides', { validate: isValidTab, history: 'push' });
  const loadGeneration = useRef(0);

  const applyArchive = useCallback((generation, records) => {
    if (generation !== loadGeneration.current) return;
    setMatches(records);
    setDataStatus('ready');
  }, []);

  const failArchive = useCallback(generation => {
    if (generation !== loadGeneration.current) return;
    setDataStatus('error');
    trackDataLoadError();
  }, []);

  useEffect(() => {
    const generation = ++loadGeneration.current;
    loadArchive().then(records => applyArchive(generation, records)).catch(() => failArchive(generation));
    return () => { loadGeneration.current += 1; };
  }, [applyArchive, failArchive]);

  const retryDataLoad = () => {
    const generation = ++loadGeneration.current;
    setDataStatus('loading');
    loadArchive().then(records => applyArchive(generation, records)).catch(() => failArchive(generation));
  };

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

  const ActiveView = TABS.find(tab => tab.id === activeTab)?.View;

  return (
    <div className="app-shell">
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
        {dataStatus === 'ready' && ActiveView && <ActiveView matches={matches} />}
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

function App() {
  return (
    <UrlStateProvider onUserChange={trackUrlControl}>
      <ArchiveShell />
    </UrlStateProvider>
  );
}

export default App;

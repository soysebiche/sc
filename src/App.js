import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import vercelDataService from './services/vercelDataService';
import RivalHistory from './components/RivalHistory';
import CountryHistory from './components/CountryHistory';

const initialData = vercelDataService.fetchAllData().completo;

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function App() {
  const [data] = useState(initialData);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sc-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sc-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 350);
  };
  
  const getYearFromMatch = (match) => {
    if (match.Año && typeof match.Año === 'number') return match.Año;
    if (match.Fecha && match.Fecha !== 'TBD') {
      const date = new Date(match.Fecha);
      return !isNaN(date.getTime()) ? date.getFullYear() : null;
    }
    return null;
  };

  const getUniqueYears = (data) => {
    return [...new Set(data.map(match => getYearFromMatch(match)).filter(year => year !== null))].sort((a, b) => b - a);
  };
  
  const initialYears = getUniqueYears(initialData);
  const initialSelectedYear = initialYears.length > 0 ? initialYears[0] : null;
  
  const [selectedMonth, setSelectedMonth] = useState(''); // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('efemerides');
  const [selectedMinute, setSelectedMinute] = useState(''); // eslint-disable-line no-unused-vars
  const [tournamentFilter, setTournamentFilter] = useState('todos');
  const [yearSortConfig, setYearSortConfig] = useState({ key: 'year', direction: 'desc' });
  const [selectedDecade, setSelectedDecade] = useState('all');
  const [selectedYearForStats, setSelectedYearForStats] = useState(initialSelectedYear);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonthLocal, setSelectedMonthLocal] = useState('');

  const getUniqueMonths = (data) => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const uniqueMonths = [...new Set(data.map(match => {
      if (match.Mes && match.Mes !== 'TBD' && monthNames.includes(match.Mes)) return match.Mes;
      if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        if (!isNaN(date.getTime())) return monthNames[date.getMonth()];
      }
      return null;
    }).filter(month => month !== null))];
    return monthNames.filter(month => uniqueMonths.includes(month));
  };

  const calculateCuriosidades = (data) => {
    let victories = 0, defeats = 0, draws = 0;
    let totalScGoals = 0, totalOpponentGoals = 0;
    let maxScGoals = 0;
    const countryStats = {};
    const rivalStats = {};
    
    data.forEach(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      
      if (scGoals > opponentGoals) victories++;
      else if (scGoals < opponentGoals) defeats++;
      else draws++;
      
      totalScGoals += scGoals;
      totalOpponentGoals += opponentGoals;
      
      if (scGoals > maxScGoals) { maxScGoals = scGoals; }
      
      const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
      if (!rivalStats[rival]) rivalStats[rival] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 };
      rivalStats[rival].jugados++;
      if (scGoals > opponentGoals) rivalStats[rival].ganados++;
      else if (scGoals < opponentGoals) rivalStats[rival].perdidos++;
      else rivalStats[rival].empatados++;
      
      if (match["País"] && match["País"] !== 'Perú') {
        if (!countryStats[match["País"]]) countryStats[match["País"]] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 };
        countryStats[match["País"]].jugados++;
        if (scGoals > opponentGoals) countryStats[match["País"]].ganados++;
        else if (scGoals < opponentGoals) countryStats[match["País"]].perdidos++;
        else countryStats[match["País"]].empatados++;
      }
    });
    
    const bestRival = Object.entries(rivalStats).reduce((best, [rival, stats]) => {
      if (stats.jugados >= 5 && (!best || stats.ganados/stats.jugados > best.ganados/best.jugados)) return { name: rival, ...stats };
      return best;
    }, null);
    
    const worstRival = Object.entries(rivalStats).reduce((worst, [rival, stats]) => {
      if (stats.jugados >= 5 && (!worst || stats.perdidos/stats.jugados > worst.perdidos/worst.jugados)) return { name: rival, ...stats };
      return worst;
    }, null);
    
    return {
      totalMatches: data.length,
      victories,
      defeats,
      draws,
      totalScGoals,
      totalOpponentGoals,
      maxScGoals,
      bestRival,
      worstRival,
      totalIntlCountries: Object.keys(countryStats).length
    };
  };

  const calculateYearlyStats = (data, filter = 'todos') => {
    let filteredData = data;
    if (filter === 'local') {
      filteredData = data.filter(match => !['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte'].includes(match.Torneo));
    } else if (filter === 'internacional') {
      filteredData = data.filter(match => ['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte'].includes(match.Torneo));
    }
    const yearlyData = {};
    
    filteredData.forEach(match => {
      let year;
      if (match.Año && typeof match.Año === 'number') year = match.Año;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      } else return;
      if (!year) return;
      
      const scGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
      
      if (!yearlyData[year]) yearlyData[year] = { year, victories: 0, draws: 0, defeats: 0, total: 0, goalsFor: 0, goalsAgainst: 0 };
      yearlyData[year].total++;
      yearlyData[year].goalsFor += scGoals;
      yearlyData[year].goalsAgainst += opponentGoals;
      if (scGoals > opponentGoals) yearlyData[year].victories++;
      else if (scGoals < opponentGoals) yearlyData[year].defeats++;
      else yearlyData[year].draws++;
    });
    
    return Object.values(yearlyData).map(yearData => ({
      ...yearData,
      winPercentage: ((yearData.victories / yearData.total) * 100).toFixed(1),
      drawPercentage: ((yearData.draws / yearData.total) * 100).toFixed(1),
      defeatPercentage: ((yearData.defeats / yearData.total) * 100).toFixed(1)
    }));
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [curiosidades, setCuriosidades] = useState({});
  const [yearlyStats, setYearlyStats] = useState([]);

  useEffect(() => {
    setCuriosidades(calculateCuriosidades(data));
    const stats = calculateYearlyStats(data, tournamentFilter);
    const sortedStats = [...stats].sort((a, b) => {
      const aValue = a[yearSortConfig.key];
      const bValue = b[yearSortConfig.key];
      return yearSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    setYearlyStats(sortedStats);
  }, [data, tournamentFilter, yearSortConfig]);

  const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filteredMatches = data.filter(match => {
    const matchYear = getYearFromMatch(match);
    const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
    let monthMatch = true;
    if (selectedMonthLocal) {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthIndex = monthNames.indexOf(selectedMonthLocal);
      if (match.Mes && monthNames.includes(match.Mes)) monthMatch = monthNames.indexOf(match.Mes) === monthIndex;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const matchDate = new Date(match.Fecha);
        monthMatch = !isNaN(matchDate.getTime()) ? matchDate.getMonth() === monthIndex : false;
      } else monthMatch = false;
    }
    return yearMatch && monthMatch;
  }).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

  const getMatchesForDayMonth = (dateStr) => {
    if (!dateStr || dateStr === 'TBD') return [];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return [];
    const month = parts[1];
    const day = parts[2];
    return data.filter(m => {
      if (!m.Fecha || m.Fecha === 'TBD') return false;
      const mParts = m.Fecha.split('-');
      return mParts[1] === month && mParts[2] === day;
    }).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
  };
  
  const efemeridesMatches = getMatchesForDayMonth(selectedDate);
  
  const efemeridesStats = (() => {
    if (efemeridesMatches.length === 0) return { total: 0, victories: 0, draws: 0, defeats: 0, goalsFor: 0, goalsAgainst: 0 };
    let victories = 0, draws = 0, defeats = 0, goalsFor = 0, goalsAgainst = 0;
    efemeridesMatches.forEach(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
      goalsFor += scGoals;
      goalsAgainst += opponentGoals;
      if (scGoals > opponentGoals) victories++;
      else if (scGoals < opponentGoals) defeats++;
      else draws++;
    });
    return {
      total: efemeridesMatches.length,
      victories, draws, defeats, goalsFor, goalsAgainst,
      winPercentage: ((victories / efemeridesMatches.length) * 100).toFixed(1),
      drawPercentage: ((draws / efemeridesMatches.length) * 100).toFixed(1),
      defeatPercentage: ((defeats / efemeridesMatches.length) * 100).toFixed(1)
    };
  })();

  const years = getUniqueYears(initialData);
  const months = getUniqueMonths(initialData);
  const decades = [...new Set(years.map(y => Math.floor(y / 10) * 10))].sort((a, b) => b - a);
  
  const filteredYearlyStats = selectedDecade === 'all' 
    ? yearlyStats 
    : yearlyStats.filter(y => Math.floor(y.year / 10) * 10 === parseInt(selectedDecade));
  
  const chartData = filteredYearlyStats
    .sort((a, b) => a.year - b.year)
    .map(y => ({
      year: y.year,
      victories: y.victories,
      draws: y.draws,
      defeats: y.defeats,
      winPercentage: parseFloat(y.winPercentage)
    }));

  const currentYearStats = selectedYearForStats 
    ? yearlyStats.find(y => y.year === selectedYearForStats) || null
    : (yearlyStats.length > 0 ? yearlyStats[0] : null);

  const tabs = [
    { id: 'efemerides', label: 'EFEMERIDES' },
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'partidos', label: 'PARTIDOS' },
    { id: 'analisis-anual', label: 'AÑO' },
    { id: 'rivales', label: 'RIVALES' },
    { id: 'paises', label: 'PAISES' }
  ];

  const MatchCard = ({ match }) => {
    const isHome = match["Equipo Local"] === "Sporting Cristal";
    const scGoals = isHome ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
    const oppGoals = isHome ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
    const result = scGoals > oppGoals ? 'V' : scGoals < oppGoals ? 'P' : 'E';
    return (
      <div className="match-card">
        <div className="flex justify-between items-start mb-2">
          <span className="match-meta">{formatDate(match.Fecha)}</span>
          <span className={`badge ${result === 'V' ? 'badge-green' : result === 'E' ? 'badge-yellow' : 'badge-red'}`}>{result}</span>
        </div>
        <p className="match-teams">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
        <p className="match-score text-center my-2">{match.Marcador}</p>
        <p className="match-meta text-center mb-1">{match.Torneo}</p>
        {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && match["Goles (Solo SC)"] !== null && (
          <p className="match-goals">Goles: {match["Goles (Solo SC)"]}</p>
        )}
      </div>
    );
  };

  const StatTile = ({ label, value, sub, colorVar, borderClass }) => (
    <div className={`stat-tile ${borderClass || ''}`}>
      <p className="stat-label" style={{ color: colorVar || 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl stat-number" style={{ color: colorVar || 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );

  const DistributionBar = ({ wins, draws, losses, total }) => {
    if (!total) return null;
    const wPct = ((wins / total) * 100).toFixed(1);
    const dPct = ((draws / total) * 100).toFixed(1);
    const lPct = ((losses / total) * 100).toFixed(1);
    return (
      <div>
        <div className="distribution-bar">
          <div style={{ width: `${wPct}%`, background: 'var(--color-win)', color: '#fff' }}>
            {wPct > 10 && `${wPct}%`}
          </div>
          <div style={{ width: `${dPct}%`, background: 'var(--color-draw)', color: '#fff' }}>
            {dPct > 10 && `${dPct}%`}
          </div>
          <div style={{ width: `${lPct}%`, background: 'var(--color-loss)', color: '#fff' }}>
            {lPct > 10 && `${lPct}%`}
          </div>
        </div>
        <div className="flex justify-between mt-3 text-xs font-medium">
          <span style={{ color: 'var(--color-win)' }}>V: {wins}</span>
          <span style={{ color: 'var(--color-draw)' }}>E: {draws}</span>
          <span style={{ color: 'var(--color-loss)' }}>P: {losses}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="app-header p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo noche'}
                title={theme === 'dark' ? 'Modo claro' : 'Modo noche'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <div className="flex flex-col">
                <img 
                  src="/SebicheCeleste logo copy.png" 
                  alt="Sebiche Celeste" 
                  className="h-16 md:h-20 w-auto"
                />
                <p className="header-subtitle mt-2">Archivo Historico &middot; {data.length} Partidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatTile label="Partidos" value={curiosidades.totalMatches || 0} colorVar="var(--color-celeste)" />
              <StatTile label="Victorias" value={curiosidades.victories || 0} sub={`${curiosidades.totalMatches > 0 ? ((curiosidades.victories / curiosidades.totalMatches) * 100).toFixed(1) : 0}%`} colorVar="var(--color-win)" borderClass="stat-tile-win" />
              <StatTile label="Empates" value={curiosidades.draws || 0} sub={`${curiosidades.totalMatches > 0 ? ((curiosidades.draws / curiosidades.totalMatches) * 100).toFixed(1) : 0}%`} colorVar="var(--color-draw)" borderClass="stat-tile-draw" />
              <StatTile label="Derrotas" value={curiosidades.defeats || 0} sub={`${curiosidades.totalMatches > 0 ? ((curiosidades.defeats / curiosidades.totalMatches) * 100).toFixed(1) : 0}%`} colorVar="var(--color-loss)" borderClass="stat-tile-loss" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatTile label="Goles a Favor" value={curiosidades.totalScGoals || 0} colorVar="var(--color-celeste)" />
              <StatTile label="Goles en Contra" value={curiosidades.totalOpponentGoals || 0} />
              <div className="stat-tile col-span-2 md:col-span-1">
                <p className="stat-label" style={{ color: 'var(--color-celeste)' }}>Diferencia de Goles</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--color-celeste)' }}>
                  +{(curiosidades.totalScGoals || 0) - (curiosidades.totalOpponentGoals || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-tile text-left">
                <p className="stat-label" style={{ color: 'var(--text-muted)' }}>Mejor Rival</p>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{curiosidades.bestRival?.name || '-'}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-win)' }}>
                  {curiosidades.bestRival ? `${curiosidades.bestRival.ganados}V · ${curiosidades.bestRival.empatados}E · ${curiosidades.bestRival.perdidos}P` : '-'}
                </p>
              </div>
              <div className="stat-tile text-left">
                <p className="stat-label" style={{ color: 'var(--text-muted)' }}>Rival mas Dificil</p>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{curiosidades.worstRival?.name || '-'}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-loss)' }}>
                  {curiosidades.worstRival ? `${curiosidades.worstRival.ganados}V · ${curiosidades.worstRival.empatados}E · ${curiosidades.worstRival.perdidos}P` : '-'}
                </p>
              </div>
              <div className="stat-tile text-left">
                <p className="stat-label" style={{ color: 'var(--text-muted)' }}>Paises Jugados</p>
                <p className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{curiosidades.totalIntlCountries || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>selecciones y equipos</p>
              </div>
            </div>

            <div className="card-static p-6">
              <p className="stat-label mb-4" style={{ color: 'var(--text-muted)' }}>Distribucion de Resultados</p>
              <DistributionBar wins={curiosidades.victories} draws={curiosidades.draws} losses={curiosidades.defeats} total={curiosidades.totalMatches} />
            </div>
          </div>
        )}

        {/* EFEMERIDES */}
        {activeTab === 'efemerides' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-static p-6">
              <h2 className="section-title mb-4">Partidos Jugados en Esta Fecha</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>

            {efemeridesMatches.length > 0 && (
              <>
                <div className="card-static p-6">
                  <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Balance del Dia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatTile label="Total" value={efemeridesStats.total} sub="partidos" colorVar="var(--color-celeste)" />
                    <StatTile label="Ganados" value={efemeridesStats.victories} sub={`${efemeridesStats.winPercentage}%`} colorVar="var(--color-win)" borderClass="stat-tile-win" />
                    <StatTile label="Empatados" value={efemeridesStats.draws} sub={`${efemeridesStats.drawPercentage}%`} colorVar="var(--color-draw)" borderClass="stat-tile-draw" />
                    <StatTile label="Perdidos" value={efemeridesStats.defeats} sub={`${efemeridesStats.defeatPercentage}%`} colorVar="var(--color-loss)" borderClass="stat-tile-loss" />
                    <StatTile label="Goles" value={`${efemeridesStats.goalsFor} - ${efemeridesStats.goalsAgainst}`} sub="a favor - en contra" colorVar="var(--color-celeste)" />
                  </div>
                  <DistributionBar wins={efemeridesStats.victories} draws={efemeridesStats.draws} losses={efemeridesStats.defeats} total={efemeridesStats.total} />
                </div>

                <div className="card-static p-6">
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{efemeridesMatches.length} partido(s) jugados un {efemeridesMatches[0]?.Fecha ? new Date(efemeridesMatches[0].Fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : ''}</p>
                  <div className="space-y-4">
                    {efemeridesMatches.map((match, idx) => (
                      <MatchCard key={idx} match={match} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {efemeridesMatches.length === 0 && (
              <div className="card-static p-6">
                <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No hay partido registrado para esta fecha</p>
              </div>
            )}
          </div>
        )}

        {/* PARTIDOS */}
        {activeTab === 'partidos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-static p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="flex-1 min-w-[150px]">
                  <option value="">Todos los años</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={selectedMonthLocal} onChange={(e) => setSelectedMonthLocal(e.target.value)} className="flex-1 min-w-[150px]">
                  <option value="">Todos los meses</option>
                  {months.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.slice(0, 50).map((match, index) => (
                  <MatchCard key={index} match={match} />
                ))}
              </div>
              {filteredMatches.length > 50 && (
                <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Mostrando 50 de {filteredMatches.length} partidos</p>
              )}
            </div>
          </div>
        )}

        {/* ANALISIS ANUAL */}
        {activeTab === 'analisis-anual' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <h2 className="section-title">Analisis por Año</h2>
              <div className="flex gap-4">
                <select value={selectedDecade} onChange={(e) => setSelectedDecade(e.target.value)}>
                  <option value="all">Todas las decadas</option>
                  {decades.map(d => <option key={d} value={d}>{d}s</option>)}
                </select>
                <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)}>
                  <option value="todos">Todos los torneos</option>
                  <option value="local">Solo locales</option>
                  <option value="internacional">Solo internacionales</option>
                </select>
              </div>
            </div>

            <div className="chart-container">
              <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Evolucion por Año</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    formatter={(value, name) => [value, name === 'victories' ? 'Victorias' : name === 'draws' ? 'Empates' : 'Derrotas']}
                  />
                  <Legend />
                  <Bar dataKey="victories" name="Victorias" stackId="a" fill="var(--color-win)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="draws" name="Empates" stackId="a" fill="var(--color-draw)" />
                  <Bar dataKey="defeats" name="Derrotas" stackId="a" fill="var(--color-loss)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {currentYearStats ? (
              <div className="card-static p-6" key={currentYearStats.year}>
                <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Stats {currentYearStats.year}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatTile label="Partidos" value={currentYearStats.total} colorVar="var(--color-celeste)" />
                  <StatTile label="Victorias" value={currentYearStats.victories} sub={`${currentYearStats.winPercentage}%`} colorVar="var(--color-win)" borderClass="stat-tile-win" />
                  <StatTile label="Empates" value={currentYearStats.draws} sub={`${currentYearStats.drawPercentage}%`} colorVar="var(--color-draw)" borderClass="stat-tile-draw" />
                  <StatTile label="Derrotas" value={currentYearStats.defeats} sub={`${currentYearStats.defeatPercentage}%`} colorVar="var(--color-loss)" borderClass="stat-tile-loss" />
                  <StatTile label="Goles" value={`${currentYearStats.goalsFor} - ${currentYearStats.goalsAgainst}`} colorVar="var(--color-celeste)" />
                </div>
              </div>
            ) : null}

            <div className="card-static overflow-hidden">
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {[
                        { key: 'year', label: 'AÑO' },
                        { key: 'total', label: 'PJ' },
                        { key: 'victories', label: 'V' },
                        { key: 'draws', label: 'E' },
                        { key: 'defeats', label: 'P' },
                        { key: 'winPercentage', label: '%' },
                        { key: 'goalsFor', label: 'GF' },
                        { key: 'goalsAgainst', label: 'GC' }
                      ].map(col => (
                        <th key={col.key} onClick={() => setYearSortConfig({ key: col.key, direction: yearSortConfig.key === col.key && yearSortConfig.direction === 'desc' ? 'asc' : 'desc' })}>
                          {col.label} {yearSortConfig.key === col.key && (yearSortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyStats.map((yearData) => (
                      <tr 
                        key={yearData.year} 
                        onClick={() => setSelectedYearForStats(yearData.year)}
                        style={{ cursor: 'pointer', background: selectedYearForStats === yearData.year ? 'var(--color-celeste-soft)' : undefined }}
                      >
                        <td className="font-bold" style={{ color: 'var(--text-primary)' }}>{yearData.year}</td>
                        <td className="text-center">{yearData.total}</td>
                        <td className="text-center font-semibold" style={{ color: 'var(--color-win)' }}>{yearData.victories}</td>
                        <td className="text-center" style={{ color: 'var(--color-draw)' }}>{yearData.draws}</td>
                        <td className="text-center" style={{ color: 'var(--color-loss)' }}>{yearData.defeats}</td>
                        <td className="text-center font-bold" style={{ color: 'var(--color-celeste)' }}>{yearData.winPercentage}%</td>
                        <td className="text-center">{yearData.goalsFor}</td>
                        <td className="text-center">{yearData.goalsAgainst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rivales' && <RivalHistory data={data} />}
        {activeTab === 'paises' && <CountryHistory data={data} />}
      </main>

      <footer className="app-footer py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Sebiche Celeste &middot; 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

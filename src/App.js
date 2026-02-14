import React, { useState, useEffect } from 'react';
import vercelDataService from './services/vercelDataService';
import RivalHistory from './components/RivalHistory';
import CountryHistory from './components/CountryHistory';

const initialData = vercelDataService.fetchAllData().completo;

function App() {
  const [data] = useState(initialData);
  const [selectedMonth, setSelectedMonth] = useState(''); // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('efemerides');
  const [selectedMinute, setSelectedMinute] = useState(''); // eslint-disable-line no-unused-vars
  const [tournamentFilter, setTournamentFilter] = useState('todos');
  const [yearSortConfig, setYearSortConfig] = useState({ key: 'year', direction: 'desc' });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonthLocal, setSelectedMonthLocal] = useState('');

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
    
    const mostPlayedRival = Object.entries(rivalStats).reduce((most, [rival, stats]) => {
      return (!most || stats.jugados > most.jugados) ? { name: rival, ...stats } : most;
    }, null);
    
    const bestCountry = Object.entries(countryStats).reduce((best, [country, stats]) => {
      if (stats.jugados >= 3 && (!best || stats.ganados/stats.jugados > best.ganados/best.jugados)) return { name: country, ...stats };
      return best;
    }, null);
    
    const worstCountry = Object.entries(countryStats).reduce((worst, [country, stats]) => {
      if (stats.jugados >= 3 && (!worst || stats.perdidos/stats.jugados > worst.perdidos/worst.jugados)) return { name: country, ...stats };
      return worst;
    }, null);
    
    const mostPlayedCountry = Object.entries(countryStats).reduce((most, [country, stats]) => {
      return (!most || stats.jugados > most.jugados) ? { name: country, ...stats } : most;
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
      mostPlayedRival,
      bestCountry,
      worstCountry,
      mostPlayedCountry,
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
      winPercentage: ((yearData.victories / yearData.total) * 100).toFixed(1)
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
    if (selectedMonth) {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthIndex = monthNames.indexOf(selectedMonth);
      if (match.Mes && monthNames.includes(match.Mes)) monthMatch = monthNames.indexOf(match.Mes) === monthIndex;
      else if (match.Fecha && match.Fecha !== 'TBD') {
        const matchDate = new Date(match.Fecha);
        monthMatch = !isNaN(matchDate.getTime()) ? matchDate.getMonth() === monthIndex : false;
      } else monthMatch = false;
    }
    return yearMatch && monthMatch;
  }).sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

  // Find all matches on the same day/month (any year)
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
  
  // Calculate stats for efemerides
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
      victories,
      draws,
      defeats,
      goalsFor,
      goalsAgainst,
      winPercentage: ((victories / efemeridesMatches.length) * 100).toFixed(1),
      drawPercentage: ((draws / efemeridesMatches.length) * 100).toFixed(1),
      defeatPercentage: ((defeats / efemeridesMatches.length) * 100).toFixed(1)
    };
  })();

  const years = getUniqueYears(initialData);
  const months = getUniqueMonths(initialData);

  const tabs = [
    { id: 'efemerides', label: 'EFEMÉRIDES' },
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'partidos', label: 'PARTIDOS' },
    { id: 'analisis-anual', label: 'AÑO' },
    { id: 'rivales', label: 'RIVALES' },
    { id: 'paises', label: 'PAÍSES' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="card-static border-b-0 rounded-b-2xl p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col">
                <img 
                  src="/SebicheCeleste logo copy.png" 
                  alt="Sebiche Celeste" 
                  className="h-16 md:h-20 w-auto"
                />
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Archivo Histórico • {data.length} Partidos</p>
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stats - Bento Grid */}
            <div className="bento-grid grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-static p-6 hover-lift">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Partidos</p>
                <p className="text-4xl stat-number text-white">{curiosidades.totalMatches || 0}</p>
              </div>
              <div className="card-static p-6 hover-lift" style={{ borderColor: 'var(--accent-green)', borderWidth: '2px' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent-green)' }}>Victorias</p>
                <p className="text-4xl stat-number" style={{ color: 'var(--accent-green)' }}>{curiosidades.victories || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {curiosidades.totalMatches > 0 ? ((curiosidades.victories / curiosidades.totalMatches) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="card-static p-6 hover-lift" style={{ borderColor: 'var(--accent-yellow)', borderWidth: '2px' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent-yellow)' }}>Empates</p>
                <p className="text-4xl stat-number" style={{ color: 'var(--accent-yellow)' }}>{curiosidades.draws || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {curiosidades.totalMatches > 0 ? ((curiosidades.draws / curiosidades.totalMatches) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="card-static p-6 hover-lift" style={{ borderColor: 'var(--accent-red)', borderWidth: '2px' }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent-red)' }}>Derrotas</p>
                <p className="text-4xl stat-number" style={{ color: 'var(--accent-red)' }}>{curiosidades.defeats || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {curiosidades.totalMatches > 0 ? ((curiosidades.defeats / curiosidades.totalMatches) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Goals Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="card-static p-6">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent-cyan)' }}>Goles a Favor</p>
                <p className="text-3xl stat-number text-white">{curiosidades.totalScGoals || 0}</p>
              </div>
              <div className="card-static p-6">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Goles en Contra</p>
                <p className="text-3xl stat-number text-white">{curiosidades.totalOpponentGoals || 0}</p>
              </div>
              <div className="card-static p-6 md:col-span-1 col-span-2">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent-blue)' }}>Diferencia de Goles</p>
                <p className="text-3xl stat-number" style={{ color: 'var(--accent-blue)' }}>
                  {(curiosidades.totalScGoals || 0) - (curiosidades.totalOpponentGoals || 0)}
                </p>
              </div>
            </div>

            {/* Quick Facts - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🏆</span>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Mejor Rival</p>
                </div>
                <p className="text-xl font-bold text-white">{curiosidades.bestRival?.name || '-'}</p>
                <p className="text-sm" style={{ color: 'var(--accent-green)' }}>
                  {curiosidades.bestRival ? `${curiosidades.bestRival.ganados}V - ${curiosidades.bestRival.empatados}E - ${curiosidades.bestRival.perdidos}P` : '-'}
                </p>
              </div>
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚠️</span>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Peor Rival</p>
                </div>
                <p className="text-xl font-bold text-white">{curiosidades.worstRival?.name || '-'}</p>
                <p className="text-sm" style={{ color: 'var(--accent-red)' }}>
                  {curiosidades.worstRival ? `${curiosidades.worstRival.ganados}V - ${curiosidades.worstRival.empatados}E - ${curiosidades.worstRival.perdidos}P` : '-'}
                </p>
              </div>
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🌎</span>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Países Jugados</p>
                </div>
                <p className="text-xl font-bold text-white">{curiosidades.totalIntlCountries || 0}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>selecciones y equipos</p>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="card-static p-6">
              <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Distribución de Resultados</p>
              <div className="flex rounded-xl overflow-hidden h-10" style={{ background: 'var(--border-subtle)' }}>
                {curiosidades.totalMatches > 0 && (
                  <>
                    <div 
                      className="flex items-center justify-center text-sm font-bold text-black"
                      style={{ width: `${(curiosidades.victories / curiosidades.totalMatches) * 100}%`, background: 'var(--accent-green)' }}
                    >
                      {(curiosidades.victories / curiosidades.totalMatches) * 100 > 10 && `${((curiosidades.victories / curiosidades.totalMatches) * 100).toFixed(0)}%`}
                    </div>
                    <div 
                      className="flex items-center justify-center text-sm font-bold text-black"
                      style={{ width: `${(curiosidades.draws / curiosidades.totalMatches) * 100}%`, background: 'var(--accent-yellow)' }}
                    >
                      {(curiosidades.draws / curiosidades.totalMatches) * 100 > 10 && `${((curiosidades.draws / curiosidades.totalMatches) * 100).toFixed(0)}%`}
                    </div>
                    <div 
                      className="flex items-center justify-center text-sm font-bold text-white"
                      style={{ width: `${(curiosidades.defeats / curiosidades.totalMatches) * 100}%`, background: 'var(--accent-red)' }}
                    >
                      {(curiosidades.defeats / curiosidades.totalMatches) * 100 > 10 && `${((curiosidades.defeats / curiosidades.totalMatches) * 100).toFixed(0)}%`}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span style={{ color: 'var(--accent-green)' }}>V: {curiosidades.victories || 0}</span>
                <span style={{ color: 'var(--accent-yellow)' }}>E: {curiosidades.draws || 0}</span>
                <span style={{ color: 'var(--accent-red)' }}>P: {curiosidades.defeats || 0}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'efemerides' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-static p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Partidos Jugados en Esta Fecha</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', fontSize: '16px', height: '46px' }}
              />
            </div>

            {efemeridesMatches.length > 0 && (
              <>
                <div className="card-static p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Balance del Día</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-cyan)' }}>Total</p>
                      <p className="text-3xl stat-number text-white">{efemeridesStats.total}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>partidos</p>
                    </div>
                    <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-green)' }}>Ganados</p>
                      <p className="text-3xl stat-number" style={{ color: 'var(--accent-green)' }}>{efemeridesStats.victories}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{efemeridesStats.winPercentage}%</p>
                    </div>
                    <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-yellow)' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-yellow)' }}>Empatados</p>
                      <p className="text-3xl stat-number" style={{ color: 'var(--accent-yellow)' }}>{efemeridesStats.draws}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{efemeridesStats.drawPercentage}%</p>
                    </div>
                    <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '3px solid var(--accent-red)' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-red)' }}>Perdidos</p>
                      <p className="text-3xl stat-number" style={{ color: 'var(--accent-red)' }}>{efemeridesStats.defeats}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{efemeridesStats.defeatPercentage}%</p>
                    </div>
                    <div className="p-4 text-center" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--accent-blue)' }}>Goles</p>
                      <p className="text-xl stat-number text-white">{efemeridesStats.goalsFor} - {efemeridesStats.goalsAgainst}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>a favor - en contra</p>
                    </div>
                  </div>
                  <div className="p-4" style={{ background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                    <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>Distribución de resultados</p>
                    <div className="flex rounded-xl overflow-hidden h-10" style={{ background: 'var(--border-subtle)' }}>
                      <div className="flex items-center justify-center text-sm font-bold text-black" style={{ width: `${efemeridesStats.winPercentage}%`, background: 'var(--accent-green)' }}>
                        {efemeridesStats.winPercentage > 10 && `${efemeridesStats.winPercentage}%`}
                      </div>
                      <div className="flex items-center justify-center text-sm font-bold text-black" style={{ width: `${efemeridesStats.drawPercentage}%`, background: 'var(--accent-yellow)' }}>
                        {efemeridesStats.drawPercentage > 10 && `${efemeridesStats.drawPercentage}%`}
                      </div>
                      <div className="flex items-center justify-center text-sm font-bold text-white" style={{ width: `${efemeridesStats.defeatPercentage}%`, background: 'var(--accent-red)' }}>
                        {efemeridesStats.defeatPercentage > 10 && `${efemeridesStats.defeatPercentage}%`}
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                      <span style={{ color: 'var(--accent-green)' }}>Victorias ({efemeridesStats.victories})</span>
                      <span style={{ color: 'var(--accent-yellow)' }}>Empates ({efemeridesStats.draws})</span>
                      <span style={{ color: 'var(--accent-red)' }}>Derrotas ({efemeridesStats.defeats})</span>
                    </div>
                  </div>
                </div>

                <div className="card-static p-6">
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{efemeridesMatches.length} partido(s) jugados un {efemeridesMatches[0]?.Fecha ? new Date(efemeridesMatches[0].Fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : ''}</p>
                  <div className="space-y-4">
                    {efemeridesMatches.map((match, idx) => {
                      const isHome = match["Equipo Local"] === "Sporting Cristal";
                      const scGoals = isHome ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
                      const oppGoals = isHome ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
                      const result = scGoals > oppGoals ? 'V' : scGoals < oppGoals ? 'P' : 'E';
                      return (
                        <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold" style={{ color: 'var(--accent-cyan)' }}>{match.Año}</span>
                            <span className={`badge ${result === 'V' ? 'badge-green' : result === 'E' ? 'badge-yellow' : 'badge-red'}`}>{result}</span>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-xl font-bold">
                            <span className="text-white">{match["Equipo Local"]}</span>
                            <span style={{ color: 'var(--accent-cyan)' }}>{match.Marcador}</span>
                            <span className="text-white">{match["Equipo Visita"]}</span>
                          </div>
                          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>{match.Torneo}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {efemeridesMatches.length === 0 && (
              <div className="card-static p-6">
                <p className="mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>No hay partido registrado para esta fecha</p>
              </div>
            )}
          </div>
        )}

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
                {filteredMatches.slice(0, 50).map((match, index) => {
                  const isHome = match["Equipo Local"] === "Sporting Cristal";
                  const scGoals = isHome ? parseInt(match.Marcador.split('-')[0]) : parseInt(match.Marcador.split('-')[1]);
                  const oppGoals = isHome ? parseInt(match.Marcador.split('-')[1]) : parseInt(match.Marcador.split('-')[0]);
                  const result = scGoals > oppGoals ? 'V' : scGoals < oppGoals ? 'P' : 'E';
                  return (
                    <div key={index} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(match.Fecha)}</span>
                        <span className={`badge ${result === 'V' ? 'badge-green' : result === 'E' ? 'badge-yellow' : 'badge-red'}`}>{result}</span>
                      </div>
                      <p className="font-semibold text-white">{match["Equipo Local"]} vs {match["Equipo Visita"]}</p>
                      <p className="text-2xl font-bold text-center my-2" style={{ color: 'var(--accent-cyan)' }}>{match.Marcador}</p>
                      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{match.Torneo}</p>
                    </div>
                  );
                })}
              </div>
              {filteredMatches.length > 50 && (
                <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>Mostrando 50 de {filteredMatches.length} partidos</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analisis-anual' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-white">ANÁLISIS POR AÑO</h2>
              <select value={tournamentFilter} onChange={(e) => setTournamentFilter(e.target.value)}>
                <option value="todos">Todos los torneos</option>
                <option value="local">Solo locales</option>
                <option value="internacional">Solo internacionales</option>
              </select>
            </div>
            
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
                      <tr key={yearData.year}>
                        <td className="font-bold text-white">{yearData.year}</td>
                        <td className="text-center text-white">{yearData.total}</td>
                        <td className="text-center font-semibold" style={{ color: 'var(--accent-green)' }}>{yearData.victories}</td>
                        <td className="text-center" style={{ color: 'var(--accent-yellow)' }}>{yearData.draws}</td>
                        <td className="text-center" style={{ color: 'var(--accent-red)' }}>{yearData.defeats}</td>
                        <td className="text-center font-bold" style={{ color: 'var(--accent-blue)' }}>{yearData.winPercentage}%</td>
                        <td className="text-center text-white">{yearData.goalsFor}</td>
                        <td className="text-center text-white">{yearData.goalsAgainst}</td>
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

      <footer className="card-static border-t-0 rounded-t-2xl py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>Sebiche Celeste - 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

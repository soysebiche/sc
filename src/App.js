import React, { useState, useEffect } from 'react';
import vercelDataService from './services/vercelDataService';
import { useAnalytics } from './hooks/useAnalytics';
import { getIcon } from './utils/icons';
import RivalHistory from './components/RivalHistory';
import Trivia from './components/Trivia';
import { Card, StatCard } from './components/ui';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [activeTab, setActiveTab] = useState('efemerides');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [curiosidades, setCuriosidades] = useState({});
  const [yearlyStats, setYearlyStats] = useState([]);
  const [tournamentFilter, setTournamentFilter] = useState('todos');
  
  const analytics = useAnalytics();

  const getYearFromMatch = (match) => {
    if (match.Año && typeof match.Año === 'number') {
      return match.Año;
    }
    if (match.Fecha && match.Fecha !== 'TBD') {
      const date = new Date(match.Fecha);
      return !isNaN(date.getTime()) ? date.getFullYear() : null;
    }
    return null;
  };

  const getDateForSorting = (match) => {
    if (match.Fecha && match.Fecha !== 'TBD') {
      const date = new Date(match.Fecha);
      return !isNaN(date.getTime()) ? date : new Date(0);
    }
    return new Date(0);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setYearlyStats(calculateYearlyStats(data, tournamentFilter));
    }
  }, [data, tournamentFilter]);

  const loadData = async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);
      
      const allData = await vercelDataService.fetchAllData();
      
      const combinedData = [
        ...allData.completo,
        ...allData.inca,
        ...allData.conmebol
      ].sort((a, b) => getDateForSorting(a) - getDateForSorting(b));
      
      setData(combinedData);

      const uniqueYears = [...new Set(combinedData.map(match => getYearFromMatch(match)).filter(year => year !== null))].sort((a, b) => b - a);
      setYears(uniqueYears);
      if (uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0].toString());
      }

      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const uniqueMonths = [...new Set(combinedData.map(match => {
        if (match.Mes && match.Mes !== 'TBD' && monthNames.includes(match.Mes)) {
          return match.Mes;
        }
        if (match.Fecha && match.Fecha !== 'TBD') {
          const date = new Date(match.Fecha);
          if (!isNaN(date.getTime())) {
            return monthNames[date.getMonth()];
          }
        }
        return null;
      }).filter(month => month !== null))];
      const sortedMonths = monthNames.filter(month => uniqueMonths.includes(month));
      setMonths(sortedMonths);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);

      setCuriosidades(calculateCuriosidades(combinedData));

      const loadTime = performance.now() - startTime;
      analytics.trackLoadTime(loadTime);
      analytics.trackEvent('data_load_success', {
        data_count: combinedData.length,
        load_time_ms: loadTime
      });

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error);
      analytics.trackError('data_load_error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
  };

  const getDayName = () => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const today = new Date();
    return days[today.getDay()];
  };

  const getCurrentDateText = () => {
    const today = new Date();
    const day = today.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[today.getMonth()];
    return `${getDayName()} ${day} de ${month}`;
  };

  const filteredMatches = data.filter(match => {
    const matchYear = getYearFromMatch(match);
    const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
    
    let monthMatch = true;
    if (selectedMonth) {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthIndex = monthNames.indexOf(selectedMonth);
      if (match.Mes && match.Mes !== 'TBD' && monthNames.includes(match.Mes)) {
        monthMatch = monthNames.indexOf(match.Mes) === monthIndex;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const matchDate = new Date(match.Fecha);
        if (!isNaN(matchDate.getTime())) {
          monthMatch = matchDate.getMonth() === monthIndex;
        } else {
          monthMatch = false;
        }
      } else {
        monthMatch = false;
      }
    }
    return yearMatch && monthMatch;
  });

  const getMatchesForDate = (date) => {
    if (!date) return [];
    const [, month, day] = date.split('-');
    const searchMonthDay = `${month}-${day}`;
    return data.filter(match => match.Fecha.substring(5) === searchMonthDay);
  };

  const getGoalsForMinute = (minute) => {
    if (!minute) return [];
    const goals = [];
    data.forEach(match => {
      if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
        const allParenthesizedContents = [...match["Goles (Solo SC)"].matchAll(/\(([^)]+)\)/g)]
          .map(m => m[1]);
        
        allParenthesizedContents.forEach(content => {
          const individualMinuteStrings = content.split(/,\s*/);
          individualMinuteStrings.forEach(minuteStr => {
            const numericalMinuteMatch = minuteStr.match(/^(\d+\+?\d*)/);
            if (numericalMinuteMatch) {
              const parsedMinute = parseInt(numericalMinuteMatch[1], 10);
              if (parsedMinute === parseInt(minute, 10)) {
                goals.push({
                  fecha: match.Fecha,
                  equipoLocal: match["Equipo Local"],
                  equipoVisita: match["Equipo Visita"],
                  marcador: match.Marcador,
                  torneo: match.Torneo,
                  año: match.Año,
                  goles: match["Goles (Solo SC)"],
                  resultado: match.Resultado,
                  rival: match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"],
                  minuto: parsedMinute
                });
              }
            }
          });
        });
      }
    });
    return goals;
  };

  const calculateCuriosidades = (data) => {
    const victories = [];
    const defeats = [];
    const draws = [];
    const dayVictories = {};
    const dayDefeats = {};
    const dayByNumber = {};
    const monthStats = {};
    const monthVictories = {};
    const monthDefeats = {};
    const scoreStats = {};
    const minuteStats = {};
    let totalScGoals = 0;
    let totalOpponentGoals = 0;
    let maxScGoals = 0;
    let maxScGoalsMatch = null;
    let minScGoals = Infinity;
    let minScGoalsMatch = null;
    
    data.forEach(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      
      totalScGoals += scGoals;
      totalOpponentGoals += opponentGoals;
      
      if (scGoals > maxScGoals) {
        maxScGoals = scGoals;
        maxScGoalsMatch = match;
      }
      if (scGoals < minScGoals && scGoals > 0) {
        minScGoals = scGoals;
        minScGoalsMatch = match;
      }
      
      let dayName, dayNumber, monthName;
      if (match['Día de la Semana'] && match['Día de la Semana'] !== 'TBD') {
        dayName = match['Día de la Semana'];
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        if (!isNaN(date.getTime())) {
          dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
        }
      }
      
      if (match.Dia && match.Dia !== null) {
        dayNumber = match.Dia;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        if (!isNaN(date.getTime())) {
          dayNumber = date.getDate();
        }
      }
      
      if (match.Mes && match.Mes !== 'TBD') {
        monthName = match.Mes;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        if (!isNaN(date.getTime())) {
          monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];
        }
      }
      
      if (!dayName || !dayNumber || !monthName) return;
      
      if (scGoals > opponentGoals) {
        victories.push(match);
        dayVictories[dayName] = (dayVictories[dayName] || 0) + 1;
        dayByNumber[dayNumber] = (dayByNumber[dayNumber] || {victories: 0, defeats: 0});
        dayByNumber[dayNumber].victories++;
        monthVictories[monthName] = (monthVictories[monthName] || 0) + 1;
      } else if (scGoals < opponentGoals) {
        defeats.push(match);
        dayDefeats[dayName] = (dayDefeats[dayName] || 0) + 1;
        dayByNumber[dayNumber] = (dayByNumber[dayNumber] || {victories: 0, defeats: 0});
        dayByNumber[dayNumber].defeats++;
        monthDefeats[monthName] = (monthDefeats[monthName] || 0) + 1;
      } else {
        draws.push(match);
      }
      
      monthStats[monthName] = (monthStats[monthName] || 0) + 1;
      scoreStats[match.Marcador] = (scoreStats[match.Marcador] || 0) + 1;
      
      if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
        const allParenthesizedContents = [...match["Goles (Solo SC)"].matchAll(/\(([^)]+)\)/g)]
          .map(m => m[1]);
        
        allParenthesizedContents.forEach(content => {
          const individualMinuteStrings = content.split(/,\s*/);
          individualMinuteStrings.forEach(minuteStr => {
            const numericalMinuteMatch = minuteStr.match(/^(\d+\+?\d*)/);
            if (numericalMinuteMatch) {
              const minute = parseInt(numericalMinuteMatch[1], 10);
              if (minute >= 1 && minute <= 90) {
                minuteStats[minute] = (minuteStats[minute] || 0) + 1;
              }
            }
          });
        });
      }
    });

    const bestVictoryDay = Object.keys(dayVictories).length > 0 
      ? Object.keys(dayVictories).reduce((a, b) => dayVictories[a] > dayVictories[b] ? a : b)
      : 'N/A';
    const worstVictoryDay = Object.keys(dayVictories).length > 0
      ? Object.keys(dayVictories).reduce((a, b) => dayVictories[a] < dayVictories[b] ? a : b)
      : 'N/A';
    const bestDefeatDay = Object.keys(dayDefeats).length > 0
      ? Object.keys(dayDefeats).reduce((a, b) => dayDefeats[a] > dayDefeats[b] ? a : b)
      : 'N/A';
    const worstDefeatDay = Object.keys(dayDefeats).length > 0
      ? Object.keys(dayDefeats).reduce((a, b) => dayDefeats[a] < dayDefeats[b] ? a : b)
      : 'N/A';
    
    const dayNumberVictories = Object.keys(dayByNumber).map(day => ({
      day: parseInt(day),
      victories: dayByNumber[day].victories
    })).sort((a, b) => b.victories - a.victories);
    
    const dayNumberDefeats = Object.keys(dayByNumber).map(day => ({
      day: parseInt(day),
      defeats: dayByNumber[day].defeats
    })).sort((a, b) => b.defeats - a.defeats);
    
    const minuteEntries = Object.keys(minuteStats).map(minute => ({
      minute: parseInt(minute),
      goals: minuteStats[minute]
    }));
    
    const mostGoalsMinute = minuteEntries.length > 0 
      ? minuteEntries.reduce((a, b) => a.goals > b.goals ? a : b)
      : {minute: 'N/A', goals: 0};
    const leastGoalsMinute = minuteEntries.length > 0
      ? minuteEntries.reduce((a, b) => a.goals < b.goals ? a : b)
      : {minute: 'N/A', goals: 0};
    
    const bestDay = Object.keys(monthStats).reduce((a, b) => monthStats[a] > monthStats[b] ? a : b);
    const bestDayMatches = monthStats[bestDay] || 0;
    const bestMonth = Object.keys(monthStats).reduce((a, b) => monthStats[a] > monthStats[b] ? a : b);
    const victoryMonthEntries = Object.entries(monthVictories);
    const defeatMonthEntries = Object.entries(monthDefeats);
    
    const bestVictoryMonth = victoryMonthEntries.length > 0 
      ? victoryMonthEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'N/A';
    const bestDefeatMonth = defeatMonthEntries.length > 0
      ? defeatMonthEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'N/A';
    const worstDefeatMonth = defeatMonthEntries.length > 0
      ? defeatMonthEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0]
      : 'N/A';
    const worstDefeatMonthCount = worstDefeatMonth !== 'N/A' ? 
      (defeatMonthEntries.find(([month, count]) => month === worstDefeatMonth)?.[1] || 0) : 0;
    const mostCommonScore = Object.keys(scoreStats).reduce((a, b) => scoreStats[a] > scoreStats[b] ? a : b);
    
    const averageGoals = (totalScGoals / data.length).toFixed(2);
    const averageGoalsAgainst = (totalOpponentGoals / data.length).toFixed(2);
    
    return {
      totalMatches: data.length,
      victories: victories.length,
      defeats: defeats.length,
      draws: draws.length,
      bestDay,
      bestDayMatches,
      bestMonth,
      bestMonthMatches: monthStats[bestMonth] || 0,
      bestVictoryMonth,
      bestVictoryMonthCount: bestVictoryMonth !== 'N/A' ? 
        (victoryMonthEntries.find(([month, count]) => month === bestVictoryMonth)?.[1] || 0) : 0,
      bestDefeatMonth,
      bestDefeatMonthCount: bestDefeatMonth !== 'N/A' ? 
        (defeatMonthEntries.find(([month, count]) => month === bestDefeatMonth)?.[1] || 0) : 0,
      worstDefeatMonth,
      worstDefeatMonthCount,
      mostCommonScore,
      winPercentage: ((victories.length / data.length) * 100).toFixed(1),
      defeatPercentage: ((defeats.length / data.length) * 100).toFixed(1),
      drawPercentage: ((draws.length / data.length) * 100).toFixed(1),
      averageGoals,
      averageGoalsAgainst,
      maxGoals: maxScGoals,
      maxGoalsMatch: maxScGoalsMatch,
      minGoals: minScGoals,
      minGoalsMatch: minScGoalsMatch,
      bestVictoryDay,
      worstVictoryDay,
      bestDefeatDay,
      worstDefeatDay,
      bestVictoryDayNumber: dayNumberVictories[0]?.day || 'N/A',
      bestVictoryDayNumberCount: dayNumberVictories[0]?.victories || 0,
      worstVictoryDayNumber: dayNumberVictories[dayNumberVictories.length - 1]?.day || 'N/A',
      worstVictoryDayNumberCount: dayNumberVictories[dayNumberVictories.length - 1]?.victories || 0,
      bestDefeatDayNumber: dayNumberDefeats[0]?.day || 'N/A',
      bestDefeatDayNumberCount: dayNumberDefeats[0]?.defeats || 0,
      worstDefeatDayNumber: dayNumberDefeats[dayNumberDefeats.length - 1]?.day || 'N/A',
      worstDefeatDayNumberCount: dayNumberDefeats[dayNumberDefeats.length - 1]?.defeats || 0,
      mostGoalsMinute: mostGoalsMinute.minute,
      mostGoalsMinuteCount: mostGoalsMinute.goals,
      leastGoalsMinute: leastGoalsMinute.minute,
      leastGoalsMinuteCount: leastGoalsMinute.goals
    };
  };

  const calculateYearlyStats = (data, filter = 'todos') => {
    let filteredData = data;
    if (filter === 'local') {
      filteredData = data.filter(match => 
        !['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte'].includes(match.Torneo)
      );
    } else if (filter === 'internacional') {
      filteredData = data.filter(match => 
        ['Copa Libertadores', 'Copa Sudamericana', 'Copa Merconorte'].includes(match.Torneo)
      );
    }
    const yearlyData = {};
    
    filteredData.forEach(match => {
      let year;
      if (match.Año && typeof match.Año === 'number') {
        year = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      } else {
        return;
      }
      
      if (!year) return;
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);

      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          victories: 0,
          draws: 0,
          defeats: 0,
          total: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }

      yearlyData[year].total++;
      yearlyData[year].goalsFor += scGoals;
      yearlyData[year].goalsAgainst += opponentGoals;

      if (scGoals > opponentGoals) {
        yearlyData[year].victories++;
      } else if (scGoals < opponentGoals) {
        yearlyData[year].defeats++;
      } else {
        yearlyData[year].draws++;
      }
    });

    return Object.values(yearlyData)
      .sort((a, b) => a.year - b.year)
      .map(yearData => ({
        ...yearData,
        winPercentage: ((yearData.victories / yearData.total) * 100).toFixed(1),
        avgGoalsFor: (yearData.goalsFor / yearData.total).toFixed(2),
        avgGoalsAgainst: (yearData.goalsAgainst / yearData.total).toFixed(2)
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando estadísticas...</p>
          <p className="text-body-sm text-gray-500 mt-2">Preparando la historia celeste</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card variant="glass" className="p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{getIcon('error')}</span>
          </div>
          <h2 className="title-card text-red-600 mb-2">Error al cargar datos</h2>
          <p className="text-body mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-lg"
          >
            {getIcon('refresh')} Recargar página
          </button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'efemerides', label: 'Efemérides', icon: 'calendar', mobileLabel: 'Efemérides' },
    { id: 'temporadas', label: 'Temporadas', icon: 'ball', mobileLabel: 'Temporadas' },
    { id: 'minutos', label: 'Goles por Minuto', icon: 'timer', mobileLabel: 'Minutos' },
    { id: 'curiosidades', label: 'Datos Curiosos', icon: 'chart', mobileLabel: 'Datos' },
    { id: 'analisis-anual', label: 'Análisis por Año', icon: 'statistics', mobileLabel: 'Años' },
    { id: 'rivales', label: 'Historial vs Rivales', icon: 'rivals', mobileLabel: 'Rivales' },
    { id: 'trivia', label: 'Trivia Celeste', icon: 'star', mobileLabel: 'Trivia' },
  ];

  return (
    <div className="app-wrapper">
      {/* Header Premium */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-6">
            <span className="text-5xl">{getIcon('celeste')}</span>
          </div>
          <h1 className="hero-title">
            CRISTAL
            <span className="hero-title-accent">ARCHIVE</span>
          </h1>
          <div className="hero-line"></div>
          <p className="hero-subtitle">
            {getIcon('calendar')} Desde 1993, toda la historia celeste {getIcon('trophy')}
          </p>
        </div>
      </header>

      <main className="content-section">
        {/* Tabs Navigation */}
        <Card variant="elevated" className="p-2 mb-8">
          <nav className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  analytics.trackTabNavigation(tab.id);
                }}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <span>{getIcon(tab.icon)}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                </span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'efemerides' && (
              <div className="animate-fadeInUp">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg mb-4">
                    <span className="text-3xl">{getIcon('calendar')}</span>
                  </div>
                  <h2 className="title-section mb-2">
                    ¡Hola Sebichero! {getIcon('celeste')}
                  </h2>
                  <p className="text-label text-celeste mb-2">
                    {getCurrentDateText()}
                  </p>
                  <p className="text-body-lg">
                    Descubre qué partidos se jugaron en esta fecha histórica
                  </p>
                </div>
                
                <div className="year-selector-editorial mb-8">
                  <label className="year-label">Busca partidos en una fecha específica</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="year-select"
                  />
                </div>

                <div>
                  {getMatchesForDate(selectedDate).length > 0 ? (
                    <>
                      <h3 className="title-card text-center mb-6">
                        El {formatDate(selectedDate)} se jugaron {getMatchesForDate(selectedDate).length} partidos
                      </h3>
                      <div className="grid-matches">
                        {getMatchesForDate(selectedDate).map((match, index) => {
                          const matchYear = getYearFromMatch(match);
                          const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                            ? parseInt(match.Marcador.split('-')[0]) 
                            : parseInt(match.Marcador.split('-')[1]);
                          const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                            ? parseInt(match.Marcador.split('-')[1]) 
                            : parseInt(match.Marcador.split('-')[0]);
                          const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');

                          return (
                            <Card
                              key={index}
                              variant={result.toLowerCase()}
                              isAnimated={true}
                              animationDelay={index % 5}
                              className="match-card-premium"
                            >
                              <div className="match-header">
                                <div className="text-label">
                                  {matchYear || 'TBD'} • {match.Torneo}
                                </div>
                                <span className={`badge badge-${result.toLowerCase()}`}>
                                  {result}
                                </span>
                              </div>
                              <p className="match-teams">
                                {match["Equipo Local"]} vs {match["Equipo Visita"]}
                              </p>
                              <div className="match-score">
                                {match.Marcador}
                              </div>
                              {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-label mb-2">Goles SC</p>
                                  <p className="text-body-sm">{match["Goles (Solo SC)"]}</p>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-body text-center">
                      No se encontraron partidos de Sporting Cristal para esta fecha.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'temporadas' && (
              <div className="animate-fadeInUp">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="title-card mb-4 sm:mb-0">Resultados de Sporting Cristal</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="year-selector-editorial">
                      <label className="year-label">Año</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value);
                          analytics.trackFilter('year', e.target.value);
                        }}
                        className="year-select"
                      >
                        <option value="">Todos</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="year-selector-editorial">
                      <label className="year-label">Mes</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          analytics.trackFilter('month', e.target.value);
                        }}
                        className="year-select"
                      >
                        <option value="">Todos</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid-matches">
                  {filteredMatches.map((match, index) => {
                    const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                      ? parseInt(match.Marcador.split('-')[0]) 
                      : parseInt(match.Marcador.split('-')[1]);
                    const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                      ? parseInt(match.Marcador.split('-')[1]) 
                      : parseInt(match.Marcador.split('-')[0]);
                    const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');

                    return (
                      <Card
                        key={index}
                        variant={result.toLowerCase()}
                        isAnimated={true}
                        animationDelay={index % 5}
                        className="match-card-premium"
                      >
                        <div className="match-header">
                          <div className="text-label">
                            {match.Fecha === 'TBD' ? 'Fecha TBD' : formatDate(match.Fecha)}
                          </div>
                          <span className={`badge badge-${result.toLowerCase()}`}>
                            {result}
                          </span>
                        </div>
                        <p className="match-teams">
                          {match["Equipo Local"]} vs {match["Equipo Visita"]}
                        </p>
                        <div className="match-score">
                          {match.Marcador}
                        </div>
                        <p className="match-meta text-center mt-2">{match.Torneo}</p>
                        
                        {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-label mb-2">Goles SC</p>
                            <p className="text-body-sm">{match["Goles (Solo SC)"]}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'minutos' && (
              <div className="animate-fadeInUp">
                <h2 className="title-section mb-6">Goles por Minuto</h2>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                  <label htmlFor="minute-input" className="text-body">
                    Busca goles anotados en un minuto específico:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="minute-input"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Ej: 15"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="form-input w-24"
                      aria-label="Minuto del partido"
                    />
                    <button
                      onClick={() => {}}
                      className="btn btn-primary"
                      aria-label="Buscar goles en este minuto"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <div>
                  {selectedMinute && getGoalsForMinute(selectedMinute).length > 0 ? (
                    <>
                      <h3 className="title-card text-center mb-6">
                        En el minuto {selectedMinute} se anotaron {getGoalsForMinute(selectedMinute).length} goles
                      </h3>
                      <div className="grid-matches">
                        {getGoalsForMinute(selectedMinute).map((goal, index) => {
                          const scGoals = goal.equipoLocal === "Sporting Cristal" 
                            ? parseInt(goal.marcador.split('-')[0]) 
                            : parseInt(goal.marcador.split('-')[1]);
                          const opponentGoals = goal.equipoLocal === "Sporting Cristal" 
                            ? parseInt(goal.marcador.split('-')[1]) 
                            : parseInt(goal.marcador.split('-')[0]);
                          const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');

                          return (
                            <Card
                              key={index}
                              variant={result.toLowerCase()}
                              isAnimated={true}
                              animationDelay={index % 5}
                              className="match-card-premium"
                            >
                              <div className="match-header">
                                <div className="text-label">
                                  {goal.año} • {goal.torneo}
                                </div>
                                <span className={`badge badge-${result.toLowerCase()}`}>
                                  {result}
                                </span>
                              </div>
                              <p className="match-teams">
                                {goal.equipoLocal} vs {goal.equipoVisita}
                              </p>
                              <div className="match-score">
                                {goal.marcador}
                              </div>
                              {goal.goles && goal.goles !== '-' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-label mb-2">Goles SC</p>
                                  <p className="text-body-sm">{goal.goles}</p>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  ) : selectedMinute ? (
                    <p className="text-body text-center">
                      No se encontraron goles de Sporting Cristal en el minuto {selectedMinute}.
                    </p>
                  ) : (
                    <p className="text-body text-center">
                      Ingresa un minuto para buscar goles.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'curiosidades' && (
              <div className="animate-fadeInUp">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl">{getIcon('chart')}</span>
                  <h2 className="title-section">Datos Curiosos</h2>
                </div>                
                <section className="editorial-card mb-8">
                  <h3 className="editorial-card-title">{getIcon('chart')} Estadísticas Generales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                      title="Total Partidos" 
                      value={curiosidades.totalMatches} 
                      icon={getIcon('ball')} 
                      color="primary" 
                    />
                    <StatCard 
                      title="Victorias" 
                      value={curiosidades.victories} 
                      subtitle={`${curiosidades.winPercentage}%`}
                      icon={getIcon('victory')} 
                      color="success" 
                    />
                    <StatCard 
                      title="Derrotas" 
                      value={curiosidades.defeats} 
                      subtitle={`${curiosidades.defeatPercentage}%`}
                      icon={getIcon('defeat')} 
                      color="error" 
                    />
                    <StatCard 
                      title="Empates" 
                      value={curiosidades.draws} 
                      subtitle={`${curiosidades.drawPercentage}%`}
                      icon={getIcon('draw')} 
                      color="warning" 
                    />
                  </div>
                </section>

                <section className="editorial-card mb-8">
                  <h3 className="editorial-card-title">{getIcon('goal')} Estadísticas de Goles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                      title="Promedio GF" 
                      value={curiosidades.averageGoals} 
                      subtitle="por partido"
                      icon={getIcon('chartUp')} 
                      color="blue" 
                    />
                    <StatCard 
                      title="Máxima Goleada" 
                      value={curiosidades.maxGoals} 
                      subtitle="goles"
                      icon={getIcon('trophy')} 
                      color="emerald" 
                    />
                    <StatCard 
                      title="Promedio GC" 
                      value={curiosidades.averageGoalsAgainst} 
                      subtitle="por partido"
                      icon={getIcon('chartDown')} 
                      color="orange" 
                    />
                    <StatCard 
                      title="Marcador más común" 
                      value={curiosidades.mostCommonScore} 
                      icon={getIcon('data')} 
                      color="cyan" 
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'analisis-anual' && (
              <div className="animate-fadeInUp">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <span className="text-3xl">{getIcon('statistics')}</span>
                    <h2 className="title-section">Análisis por Año</h2>
                  </div>
                  <div className="year-selector-editorial">
                    <label className="year-label">Filtro de Torneo</label>
                    <select
                      value={tournamentFilter}
                      onChange={(e) => setTournamentFilter(e.target.value)}
                      className="year-select"
                    >
                      <option value="todos">Todos los torneos</option>
                      <option value="local">Solo locales</option>
                      <option value="internacional">Solo internacionales</option>
                    </select>
                  </div>
                </div>                
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm relative">
                  {/* Indicador de scroll en móvil */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100/50 to-transparent pointer-events-none md:hidden z-10" />
                  
                  <table className="w-full min-w-[640px]">
                    <caption className="sr-only">
                      Estadísticas anuales de Sporting Cristal - Partidos jugados, ganados, empatados, perdidos, porcentaje de victorias, goles a favor y en contra
                    </caption>
                    
                    <thead>
                      <tr className="bg-biscay text-white">
                        <th scope="col" className="px-4 py-4 text-left font-semibold rounded-tl-xl">
                          <span className="cursor-help" title="Año de la temporada">Año</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Partidos Jugados">PJ</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Partidos Ganados">G</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Partidos Empatados">E</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Partidos Perdidos">P</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Porcentaje de Victorias">% G</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold">
                          <span className="cursor-help" title="Goles a Favor">GF</span>
                        </th>
                        <th scope="col" className="px-4 py-4 text-center font-semibold rounded-tr-xl">
                          <span className="cursor-help" title="Goles en Contra">GC</span>
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {yearlyStats.map((yearData) => (
                        <tr 
                          key={yearData.year}
                          className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 ease-out cursor-pointer focus-within:ring-2 focus-within:ring-celeste focus-within:ring-inset"
                          tabIndex={0}
                          role="button"
                          aria-label={`Ver detalles del año ${yearData.year}: ${yearData.total} partidos, ${yearData.victories} victorias`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedYear(yearData.year.toString());
                              setActiveTab('temporadas');
                            }
                          }}
                          onClick={() => {
                            setSelectedYear(yearData.year.toString());
                            setActiveTab('temporadas');
                          }}
                        >
                          <td className="px-4 py-4 font-bold text-biscay">{yearData.year}</td>
                          <td className="px-4 py-4 text-center font-medium text-gray-700">{yearData.total}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-emerald-700 font-bold bg-emerald-50 rounded-lg">
                              {yearData.victories}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-amber-700 font-semibold bg-amber-50 rounded-lg">
                              {yearData.draws}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-red-700 font-semibold bg-red-50 rounded-lg">
                              {yearData.defeats}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 text-white font-bold bg-celeste rounded-lg">
                              {yearData.winPercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-gray-700">{yearData.goalsFor}</td>
                          <td className="px-4 py-4 text-center font-medium text-gray-700">{yearData.goalsAgainst}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'rivales' && (
              <RivalHistory data={data} />
            )}

            {activeTab === 'trivia' && (
              <Trivia />
            )}
          </div>
        </Card>
      </main>

      <footer className="app-footer">
        <p>Cristal Archive 2026 — Editorial Luxury Design System</p>
      </footer>
    </div>
  );
}

export default App;

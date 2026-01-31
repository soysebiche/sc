import React, { useState, useEffect } from 'react';
import vercelDataService from './services/vercelDataService';
import { useAnalytics } from './hooks/useAnalytics';
import { getIcon, getResultIcon } from './utils/icons';
import RivalHistory from './components/RivalHistory';
import Trivia from './components/Trivia';

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
  
  // Analytics hook
  const analytics = useAnalytics();

  // Helper function para obtener año de manera segura
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

  // Helper function para obtener fecha de manera segura (para ordenamiento)
  const getDateForSorting = (match) => {
    if (match.Fecha && match.Fecha !== 'TBD') {
      const date = new Date(match.Fecha);
      return !isNaN(date.getTime()) ? date : new Date(0); // Usar fecha muy antigua para TBD
    }
    return new Date(0); // Fecha muy antigua para ordenar al final
  };

  useEffect(() => {
    // Cargar datos automáticamente al iniciar
    loadData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // Calculate yearly statistics when data or filter changes
      setYearlyStats(calculateYearlyStats(data, tournamentFilter));
    }
  }, [data, tournamentFilter]);

  const loadData = async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);
      
      // Cargar todos los datos usando el servicio de Vercel Functions
      const allData = await vercelDataService.fetchAllData();
      
      // Combinar y ordenar los datos por fecha
      const combinedData = [
        ...allData.completo,
        ...allData.inca,
        ...allData.conmebol
      ].sort((a, b) => getDateForSorting(a) - getDateForSorting(b));
      
      console.log('Loading Combined JSON Data from Vercel Functions:', combinedData);
      setData(combinedData);

      // Extract unique years - usar campo Año directamente o extraer de fecha si no está disponible
      const uniqueYears = [...new Set(combinedData.map(match => getYearFromMatch(match)).filter(year => year !== null))].sort((a, b) => b - a);
      console.log('Unique Years:', uniqueYears);
      setYears(uniqueYears);
      if (uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0].toString());
      }

      // Extract unique months
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const uniqueMonths = [...new Set(combinedData.map(match => {
        // Usar campo Mes si está disponible
        if (match.Mes && match.Mes !== 'TBD' && monthNames.includes(match.Mes)) {
          return match.Mes;
        }
        // Si no, intentar extraer de la fecha
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

      // Set today's date for efemérides
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);

      // Calculate curiosidades
      setCuriosidades(calculateCuriosidades(combinedData));

      // Trackear tiempo de carga exitoso
      const loadTime = performance.now() - startTime;
      analytics.trackLoadTime(loadTime);
      analytics.trackEvent('data_load_success', {
        data_count: combinedData.length,
        load_time_ms: loadTime
      });

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error);
      
      // Trackear error
      analytics.trackError('data_load_error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
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

  // Filter functions
  const filteredMatches = data.filter(match => {
    const matchYear = getYearFromMatch(match);
    const yearMatch = selectedYear ? (matchYear && matchYear.toString() === selectedYear) : true;
    
    // Para el mes, usar campo Mes si está disponible
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
        monthMatch = false; // Si no hay fecha válida, no coincide
      }
    }
    return yearMatch && monthMatch;
  });

  const getMatchesForDate = (date) => {
    if (!date) return [];
    const [year, month, day] = date.split('-');
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
              if (parsedMinute == minute) {
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
      
      // Usar campos del match si están disponibles, o extraer de fecha
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
      
      // Saltar si no hay información de fecha válida
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
      
      // Analyze minutes (exclude minute 0)
      if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
        const allParenthesizedContents = [...match["Goles (Solo SC)"].matchAll(/\(([^)]+)\)/g)]
          .map(m => m[1]);
        
        allParenthesizedContents.forEach(content => {
          const individualMinuteStrings = content.split(/,\s*/);
          individualMinuteStrings.forEach(minuteStr => {
            const numericalMinuteMatch = minuteStr.match(/^(\d+\+?\d*)/);
            if (numericalMinuteMatch) {
              const minute = parseInt(numericalMinuteMatch[1], 10);
              if (minute >= 1 && minute <= 90) { // Only count minutes 1-90
                minuteStats[minute] = (minuteStats[minute] || 0) + 1;
              }
            }
          });
        });
      }
    });

    // Find best and worst performing days
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
    
    // Find best and worst performing day numbers
    const dayNumberVictories = Object.keys(dayByNumber).map(day => ({
      day: parseInt(day),
      victories: dayByNumber[day].victories
    })).sort((a, b) => b.victories - a.victories);
    
    const dayNumberDefeats = Object.keys(dayByNumber).map(day => ({
      day: parseInt(day),
      defeats: dayByNumber[day].defeats
    })).sort((a, b) => b.defeats - a.defeats);
    
    // Find minutes with most and least goals
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
    // Filter data based on tournament type
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
      // Usar campo Año directamente o extraer de fecha si no está disponible
      let year;
      if (match.Año && typeof match.Año === 'number') {
        year = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      } else {
        return; // Saltar partidos sin año válido
      }
      
      if (!year) return; // Saltar si no se pudo obtener el año
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
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center">
          <p className="text-lg text-red-600">Error al cargar los datos: {error.message}</p>
        </div>
      </div>
    );
  }

  // Loading State Premium
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center">
        <div className="text-center animate-fadeInUp">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-3xl">
              {getIcon('ball')}
            </span>
          </div>
          <p className="text-xl font-medium">Cargando estadísticas...</p>
          <p className="text-sm text-sky-200 mt-2">Preparando la historia celeste</p>
        </div>
      </div>
    );
  }

  // Error State Premium
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center p-4">
        <div className="card card-glass p-8 max-w-md w-full text-center animate-scaleIn">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{getIcon('error')}</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-100">Error al cargar datos</h2>
          <p className="text-lg mb-6 text-sky-100">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-lg"
          >
            {getIcon('refresh')} Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header Premium */}
      <header className="text-center mb-8 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-sky-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <img 
                src="/SebicheCeleste logo copy.png" 
                alt="Sebiche Celeste Logo" 
                className="h-16 md:h-20 drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md">
            Sebiche Celeste
          </h1>
          <p className="text-lg text-sky-100 flex items-center justify-center gap-2">
            <span>{getIcon('calendar')}</span>
            Desde 1993, toda la historia celeste
            <span>{getIcon('trophy')}</span>
          </p>
        </div>
      </header>

      {/* Tabs Premium */}
      <div className="card card-elevated p-2 sm:p-4 mb-8">
        <div className="border-b border-gray-200/60">
          <nav className="-mb-px flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {[
              { id: 'efemerides', label: 'Efemérides', icon: 'calendar', mobileLabel: 'Efemérides' },
              { id: 'temporadas', label: 'Temporadas', icon: 'ball', mobileLabel: 'Temporadas' },
              { id: 'minutos', label: 'Goles por Minuto', icon: 'timer', mobileLabel: 'Minutos' },
              { id: 'curiosidades', label: 'Datos Curiosos', icon: 'chart', mobileLabel: 'Datos' },
              { id: 'analisis-anual', label: 'Análisis por Año', icon: 'statistics', mobileLabel: 'Años' },
              { id: 'rivales', label: 'Historial vs Rivales', icon: 'rivals', mobileLabel: 'Rivales' },
              { id: 'trivia', label: 'Trivia Celeste', icon: 'star', mobileLabel: 'Trivia' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  analytics.trackTabNavigation(tab.id);
                }}
                className={`group relative whitespace-nowrap py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm flex-shrink-0 transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'border-sky-500 text-sky-600' 
                    : 'border-transparent text-gray-500 hover:text-sky-500 hover:border-sky-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {getIcon(tab.icon)}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de Efemérides */}
        {activeTab === 'efemerides' && (
          <div className="py-6 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg mb-4">
                <span className="text-3xl">{getIcon('calendar')}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Hola Sebichero! {getIcon('celeste')}
              </h2>
              <p className="text-lg text-sky-600 font-medium">
                {getCurrentDateText()}
              </p>
              <p className="text-gray-600 mt-2">
                Descubre qué partidos se jugaron en esta fecha histórica
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
              <p className="text-sm font-medium">Busca partidos en una fecha específica:</p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
              />
            </div>

            <div>
              {getMatchesForDate(selectedDate).length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-sky-600">
                    El {formatDate(selectedDate)} se jugaron {getMatchesForDate(selectedDate).length} partidos
                  </h3>
                  <div className="space-y-4">
                    {getMatchesForDate(selectedDate).map((match, index) => {
                      const matchYear = getYearFromMatch(match);
                      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                        ? parseInt(match.Marcador.split('-')[0]) 
                        : parseInt(match.Marcador.split('-')[1]);
                      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                        ? parseInt(match.Marcador.split('-')[1]) 
                        : parseInt(match.Marcador.split('-')[0]);
                      const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                      const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                         (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');

                      return (
                        <div key={index} className={`card bg-white rounded-lg shadow p-4 border-l-4 ${resultClass}`}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">
                              {matchYear || 'TBD'} - {match.Torneo}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800`}>
                              {result}
                            </span>
                          </div>
                          <p className="font-bold text-lg">
                            {match["Equipo Local"]} <span className="font-normal">vs</span> {match["Equipo Visita"]}
                          </p>
                          <p className="text-3xl font-bold text-center my-2">{match.Marcador}</p>
                          {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Goles de Sporting Cristal:</h4>
                              <p className="text-sm text-gray-700">{match["Goles (Solo SC)"]}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center">
                  No se encontraron partidos de Sporting Cristal para esta fecha.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contenido de Temporadas */}
        {activeTab === 'temporadas' && (
          <div className="py-6 animate-fadeInUp">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <span className="text-3xl">{getIcon('ball')}</span>
                <h2 className="text-2xl font-bold text-gray-900">Resultados de Sporting Cristal</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="year-select" className="text-sm font-medium">Año:</label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      analytics.trackFilter('year', e.target.value);
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
                  >
                    <option value="">Todos</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="month-select" className="text-sm font-medium">Mes:</label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      analytics.trackFilter('month', e.target.value);
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
                  >
                    <option value="">Todos</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match, index) => {
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);
                const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                   (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');

                return (
                  <div key={index} className={`card bg-white rounded-lg shadow p-4 border-l-4 ${resultClass}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-500">
                        {match.Fecha === 'TBD' ? 'Fecha TBD' : formatDate(match.Fecha)}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800`}>
                        {result}
                      </span>
                    </div>
                    <p className="font-bold text-lg">
                      {match["Equipo Local"]} <span className="font-normal">vs</span> {match["Equipo Visita"]}
                    </p>
                    <p className="text-3xl font-bold text-center my-2">{match.Marcador}</p>
                    <p className="text-sm text-gray-600 mb-1">{match.Torneo}</p>
                    {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Goles de Sporting Cristal:</h4>
                        <p className="text-sm text-gray-700">{match["Goles (Solo SC)"]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenido de Goles por Minuto */}
        {activeTab === 'minutos' && (
          <div className="py-6">
            <h2 className="text-2xl font-semibold mb-4">Goles por Minuto de Sporting Cristal</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
              <p className="text-sm font-medium">Busca goles anotados en un minuto específico:</p>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="Ej: 15"
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
              />
              <button
                onClick={() => {/* trigger search */}}
                className="bg-sky-400 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Buscar
              </button>
            </div>

            <div>
              {selectedMinute && getGoalsForMinute(selectedMinute).length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-sky-600">
                    En el minuto {selectedMinute} se anotaron {getGoalsForMinute(selectedMinute).length} goles
                  </h3>
                  <div className="space-y-4">
                    {getGoalsForMinute(selectedMinute).map((goal, index) => {
                      const matchDate = new Date(goal.fecha);
                      const scGoals = goal.equipoLocal === "Sporting Cristal" 
                        ? parseInt(goal.marcador.split('-')[0]) 
                        : parseInt(goal.marcador.split('-')[1]);
                      const opponentGoals = goal.equipoLocal === "Sporting Cristal" 
                        ? parseInt(goal.marcador.split('-')[1]) 
                        : parseInt(goal.marcador.split('-')[0]);
                      const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                      const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                         (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');

                      return (
                        <div key={index} className={`card bg-white rounded-lg shadow p-4 border-l-4 ${resultClass}`}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">
                              {goal.año} - {goal.torneo}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800`}>
                              {result}
                            </span>
                          </div>
                          <p className="font-bold text-lg">
                            {goal.equipoLocal} <span className="font-normal">vs</span> {goal.equipoVisita}
                          </p>
                          <p className="text-3xl font-bold text-center my-2">{goal.marcador}</p>
                          {goal.goles && goal.goles !== '-' && (
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Goles de Sporting Cristal:</h4>
                              <p className="text-sm text-gray-700">{goal.goles}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : selectedMinute ? (
                <p className="text-gray-500">
                  No se encontraron goles de Sporting Cristal en el minuto {selectedMinute}.
                </p>
              ) : (
                <p className="text-gray-500">
                  Ingresa un minuto para buscar goles.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contenido de Datos Curiosos */}
        {activeTab === 'curiosidades' && (
          <div className="py-6 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{getIcon('chart')}</span>
              <h2 className="text-2xl font-bold text-gray-900">Datos Curiosos de Sporting Cristal</h2>
            </div>
            
            {/* Estadísticas Generales */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('chart')} Estadísticas Generales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total de Partidos" 
                  value={curiosidades.totalMatches} 
                  icon={getIcon('ball')} 
                  color="sky" 
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
            </div>

            {/* Estadísticas de Goles */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('goal')} Estadísticas de Goles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  subtitle="goles en un partido"
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
            </div>

            {/* Estadísticas por Minutos */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('timer')} Análisis por Minutos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard 
                  title="Minuto con más goles" 
                  value={`Min ${curiosidades.mostGoalsMinute}`} 
                  subtitle={`${curiosidades.mostGoalsMinuteCount} goles`}
                  icon={getIcon('clock')} 
                  color="violet" 
                />
                <StatCard 
                  title="Minuto con menos goles" 
                  value={`Min ${curiosidades.leastGoalsMinute}`} 
                  subtitle={`${curiosidades.leastGoalsMinuteCount} goles`}
                  icon={getIcon('stopwatch')} 
                  color="pink" 
                />
              </div>
            </div>

            {/* Estadísticas por Días de la Semana */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('calendar')} Análisis por Días de la Semana
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                    {getIcon('victory')} Victorias
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-3 shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Mejor día:</span>
                        <span className="text-sm font-bold text-green-900 flex items-center gap-1">
                          {getIcon('trophy')} {curiosidades.bestVictoryDay}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700">Peor día:</span>
                        <span className="text-sm font-bold text-green-800">{curiosidades.worstVictoryDay}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                    {getIcon('defeat')} Derrotas
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-3 shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-red-800">Más derrotas:</span>
                        <span className="text-sm font-bold text-red-900">{curiosidades.bestDefeatDay}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 shadow">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-red-700">Menos derrotas:</span>
                        <span className="text-sm font-bold text-red-800">{curiosidades.worstDefeatDay}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas por Día del Mes */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('statistics')} Análisis por Día del Mes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Día con + Victorias" 
                  value={curiosidades.bestVictoryDayNumber} 
                  subtitle={`${curiosidades.bestVictoryDayNumberCount} victorias`}
                  icon={getIcon('chartUp')} 
                  color="emerald" 
                />
                <StatCard 
                  title="Día con - Victorias" 
                  value={curiosidades.worstVictoryDayNumber} 
                  subtitle={`${curiosidades.worstVictoryDayNumberCount} victorias`}
                  icon={getIcon('chartDown')} 
                  color="red" 
                />
                <StatCard 
                  title="Día con + Derrotas" 
                  value={curiosidades.bestDefeatDayNumber} 
                  subtitle={`${curiosidades.bestDefeatDayNumberCount} derrotas`}
                  icon={getIcon('trendDown')} 
                  color="rose" 
                />
                <StatCard 
                  title="Día con - Derrotas" 
                  value={curiosidades.worstDefeatDayNumber} 
                  subtitle={`${curiosidades.worstDefeatDayNumberCount} derrotas`}
                  icon={getIcon('trendUp')} 
                  color="teal" 
                />
              </div>
            </div>

            {/* Estadísticas Temporales */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('calendar')} Estadísticas Temporales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Mes con más partidos" 
                  value={curiosidades.bestMonth} 
                  subtitle={`${curiosidades.bestMonthMatches} partidos`}
                  icon={getIcon('ball')} 
                  color="indigo" 
                />
                <StatCard 
                  title="Mes con más victorias" 
                  value={curiosidades.bestVictoryMonth} 
                  subtitle={`${curiosidades.bestVictoryMonthCount} victorias`}
                  icon={getIcon('victory')} 
                  color="success" 
                />
                <StatCard 
                  title="Mes con más derrotas" 
                  value={curiosidades.bestDefeatMonth} 
                  subtitle={`${curiosidades.bestDefeatMonthCount} derrotas`}
                  icon={getIcon('defeat')} 
                  color="error" 
                />
                <StatCard 
                  title="Mes con menos derrotas" 
                  value={curiosidades.worstDefeatMonth} 
                  subtitle={`${curiosidades.worstDefeatMonthCount} derrotas`}
                  icon={getIcon('shield')} 
                  color="purple" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Contenido de Análisis por Año */}
        {activeTab === 'analisis-anual' && (
          <div className="py-6 animate-fadeInUp">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <span className="text-3xl">{getIcon('statistics')}</span>
                <h2 className="text-2xl font-bold text-gray-900">Análisis por Año de Sporting Cristal</h2>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="tournament-filter" className="text-sm font-medium">Filtro:</label>
                <select
                  id="tournament-filter"
                  value={tournamentFilter}
                  onChange={(e) => setTournamentFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
                >
                  <option value="todos">Todos los torneos</option>
                  <option value="local">Solo torneos locales</option>
                  <option value="internacional">Solo torneos internacionales</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-sky-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Año</th>
                    <th className="px-4 py-3 text-center">PJ</th>
                    <th className="px-4 py-3 text-center">V</th>
                    <th className="px-4 py-3 text-center">E</th>
                    <th className="px-4 py-3 text-center">D</th>
                    <th className="px-4 py-3 text-center">%V</th>
                    <th className="px-4 py-3 text-center">GF</th>
                    <th className="px-4 py-3 text-center">GC</th>
                    <th className="px-4 py-3 text-center">Dif</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((yearData, index) => {
                    const goalDifference = yearData.goalsFor - yearData.goalsAgainst;
                    const isPositiveDiff = goalDifference > 0;
                    return (
                      <tr key={yearData.year} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-semibold text-sky-600">{yearData.year}</td>
                        <td className="px-4 py-3 text-center">{yearData.total}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">{yearData.victories}</td>
                        <td className="px-4 py-3 text-center text-yellow-600 font-semibold">{yearData.draws}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-semibold">{yearData.defeats}</td>
                        <td className="px-4 py-3 text-center font-semibold">{yearData.winPercentage}%</td>
                        <td className="px-4 py-3 text-center">{yearData.goalsFor}</td>
                        <td className="px-4 py-3 text-center">{yearData.goalsAgainst}</td>
                        <td className={`px-4 py-3 text-center font-semibold ${
                          isPositiveDiff ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {goalDifference > 0 ? '+' : ''}{goalDifference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Gráfico simple de tendencias */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                {getIcon('chartUp')} Tendencias por Año
              </h3>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Victorias por año */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                      {getIcon('victory')} Victorias
                    </h4>
                    <div className="space-y-2">
                      {yearlyStats.map(yearData => (
                        <div key={`v-${yearData.year}`} className="flex items-center">
                          <span className="w-12 text-sm">{yearData.year}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2 overflow-hidden">
                            <div 
                              className="bg-green-500 h-4 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(5, (yearData.victories / Math.max(...yearlyStats.map(y => y.victories))) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-sm text-green-600 font-semibold">{yearData.victories}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empates por año */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                      {getIcon('draw')} Empates
                    </h4>
                    <div className="space-y-2">
                      {yearlyStats.map(yearData => (
                        <div key={`e-${yearData.year}`} className="flex items-center">
                          <span className="w-12 text-sm">{yearData.year}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2 overflow-hidden">
                            <div 
                              className="bg-yellow-500 h-4 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(5, (yearData.draws / Math.max(...yearlyStats.map(y => y.draws))) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-sm text-yellow-600 font-semibold">{yearData.draws}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Derrotas por año */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                      {getIcon('defeat')} Derrotas
                    </h4>
                    <div className="space-y-2">
                      {yearlyStats.map(yearData => (
                        <div key={`d-${yearData.year}`} className="flex items-center">
                          <span className="w-12 text-sm">{yearData.year}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2 overflow-hidden">
                            <div 
                              className="bg-red-500 h-4 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(5, (yearData.defeats / Math.max(...yearlyStats.map(y => y.defeats))) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-sm text-red-600 font-semibold">{yearData.defeats}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de Historial vs Rivales */}
        {activeTab === 'rivales' && (
          <RivalHistory data={data} />
        )}

        {/* Contenido de Trivia */}
        {activeTab === 'trivia' && (
          <Trivia />
        )}
      </div>
    </div>
  );
}

// Componente StatCard reutilizable
function StatCard({ title, value, subtitle, icon, color }) {
  const colorSchemes = {
    sky: 'from-sky-100 to-sky-200 text-sky-800',
    success: 'from-green-100 to-green-200 text-green-800',
    error: 'from-red-100 to-red-200 text-red-800',
    warning: 'from-yellow-100 to-yellow-200 text-yellow-800',
    blue: 'from-blue-100 to-blue-200 text-blue-800',
    emerald: 'from-emerald-100 to-emerald-200 text-emerald-800',
    orange: 'from-orange-100 to-orange-200 text-orange-800',
    cyan: 'from-cyan-100 to-cyan-200 text-cyan-800',
    violet: 'from-violet-100 to-violet-200 text-violet-800',
    pink: 'from-pink-100 to-pink-200 text-pink-800',
    indigo: 'from-indigo-100 to-indigo-200 text-indigo-800',
    purple: 'from-purple-100 to-purple-200 text-purple-800',
    teal: 'from-teal-100 to-teal-200 text-teal-800',
    rose: 'from-rose-100 to-rose-200 text-rose-800',
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorSchemes[color]} rounded-xl p-4 text-center shadow-lg animate-scaleIn`}>
      <div className="text-2xl mb-1">{icon}</div>
      <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
    </div>
  );
}

export default App;
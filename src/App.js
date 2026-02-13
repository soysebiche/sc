import React, { useState, useEffect } from 'react';
import vercelDataService from './services/vercelDataService';
import RivalHistory from './components/RivalHistory';
// import Trivia from './components/Trivia'; // Oculto temporalmente
import { Card } from './components/ui';

// Cargar datos directamente al importar (sin delay)
const initialData = vercelDataService.fetchAllData().completo;

function App() {
  const [data] = useState(initialData);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState('efemerides');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('todos');

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

  // Función para obtener años únicos
  const getUniqueYears = (data) => {
    return [...new Set(data.map(match => getYearFromMatch(match)).filter(year => year !== null))].sort((a, b) => b - a);
  };

  // Función para obtener meses únicos
  const getUniqueMonths = (data) => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const uniqueMonths = [...new Set(data.map(match => {
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
    return monthNames.filter(month => uniqueMonths.includes(month));
  };

  // Helper functions - move before useState calls
  const calculateCuriosidades = (data) => {
    const victories = [];
    const defeats = [];
    const draws = [];
    let totalScGoals = 0;
    let totalOpponentGoals = 0;
    let maxScGoals = 0;
    let minScGoals = Infinity;
    let maxScGoalsAway = 0;
    let maxScGoalsHome = 0;
    let maxDefeatGoals = 0;
    let maxDefeatGoalsAway = 0;
    let maxDefeatGoalsHome = 0;
    
    // Track day of week
    const dayStats = {
      'Domingo': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Lunes': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Martes': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Miércoles': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Jueves': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Viernes': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 },
      'Sábado': { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 }
    };
    
    // Track months
    const monthStats = {};
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    monthNames.forEach(m => {
      monthStats[m] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0 };
    });
    
    // Track rivals
    const rivalStats = {};
    
    // Track countries (for international matches)
    const countryStats = {};
    
    // Track years
    const yearStats = {};
    
    // Track streaks
    let currentStreak = 0;
    let bestWinStreak = 0;
    let currentLoseStreak = 0;
    let worstLoseStreak = 0;
    let currentUnbeaten = 0;
    let bestUnbeaten = 0;
    let currentWinless = 0;
    let worstWinless = 0;
    
    // Track years with wins/losses
    const yearsWithWins = new Set();
    const yearsWithLosses = new Set();
    
    data.forEach((match, index) => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      const isHome = match["Equipo Local"] === "Sporting Cristal";
      const day = match["Día de la Semana"] || '';
      const month = match["Mes"] || '';
      const year = match.Año;
      
      // Total goals
      totalScGoals += scGoals;
      totalOpponentGoals += opponentGoals;
      
      // Max goals
      if (scGoals > maxScGoals) maxScGoals = scGoals;
      if (scGoals > 0 && scGoals < minScGoals) minScGoals = scGoals;
      if (isHome && scGoals > maxScGoalsHome) maxScGoalsHome = scGoals;
      if (!isHome && scGoals > maxScGoalsAway) maxScGoalsAway = scGoals;
      
      // Max defeat
      if (opponentGoals > maxDefeatGoals) maxDefeatGoals = opponentGoals;
      if (isHome && opponentGoals > maxDefeatGoalsHome) maxDefeatGoalsHome = opponentGoals;
      if (!isHome && opponentGoals > maxDefeatGoalsAway) maxDefeatGoalsAway = opponentGoals;
      
      // Day stats
      if (dayStats[day]) {
        dayStats[day].jugados++;
      }
      
      // Month stats
      if (monthStats[month]) {
        monthStats[month].jugados++;
        monthStats[month].gf += scGoals;
        monthStats[month].gc += opponentGoals;
      }
      
      // Rival stats
      const rival = isHome ? match["Equipo Visita"] : match["Equipo Local"];
      if (!rivalStats[rival]) {
        rivalStats[rival] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0 };
      }
      rivalStats[rival].jugados++;
      rivalStats[rival].gf += scGoals;
      rivalStats[rival].gc += opponentGoals;
      
      // Country stats (international matches only)
      const country = match["País"] || 'Perú';
      if (!countryStats[country]) {
        countryStats[country] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0 };
      }
      countryStats[country].jugados++;
      countryStats[country].gf += scGoals;
      countryStats[country].gc += opponentGoals;
      
      // Year stats
      if (!yearStats[year]) {
        yearStats[year] = { jugados: 0, ganados: 0, empatados: 0, perdidos: 0 };
      }
      yearStats[year].jugados++;
      
      // Match result
      if (scGoals > opponentGoals) {
        victories.push(match);
        if (dayStats[day]) dayStats[day].ganados++;
        if (monthStats[month]) monthStats[month].ganados++;
        rivalStats[rival].ganados++;
        countryStats[country].ganados++;
        yearStats[year].ganados++;
        yearsWithWins.add(year);
        
        currentStreak++;
        currentWinless = 0;
        currentLoseStreak = 0;
        if (currentStreak > bestWinStreak) bestWinStreak = currentStreak;
        currentUnbeaten++;
        if (currentUnbeaten > bestUnbeaten) bestUnbeaten = currentUnbeaten;
      } else if (scGoals < opponentGoals) {
        defeats.push(match);
        if (dayStats[day]) dayStats[day].perdidos++;
        if (monthStats[month]) monthStats[month].perdidos++;
        rivalStats[rival].perdidos++;
        countryStats[country].perdidos++;
        yearStats[year].perdidos++;
        yearsWithLosses.add(year);
        
        currentStreak = 0;
        currentLoseStreak++;
        if (currentLoseStreak > worstLoseStreak) worstLoseStreak = currentLoseStreak;
        currentUnbeaten = 0;
        currentWinless++;
        if (currentWinless > worstWinless) worstWinless = currentWinless;
      } else {
        draws.push(match);
        if (dayStats[day]) dayStats[day].empatados++;
        if (monthStats[month]) monthStats[month].empatados++;
        rivalStats[rival].empatados++;
        countryStats[country].empatados++;
        yearStats[year].empatados++;
        
        currentStreak = 0;
        currentLoseStreak = 0;
        currentUnbeaten++;
        if (currentUnbeaten > bestUnbeaten) bestUnbeaten = currentUnbeaten;
        currentWinless = 0;
      }
    });
    
    // Find best day
    let bestDay = '';
    let maxWins = 0;
    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.ganados > maxWins) {
        maxWins = stats.ganados;
        bestDay = day;
      }
    });
    
    // Find worst day
    let worstDay = '';
    let maxLosses = 0;
    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.perdidos > maxLosses) {
        maxLosses = stats.perdidos;
        worstDay = day;
      }
    });
    
    // Find best month
    let bestMonth = '';
    let maxMonthWins = 0;
    Object.entries(monthStats).forEach(([month, stats]) => {
      if (stats.ganados > maxMonthWins) {
        maxMonthWins = stats.ganados;
        bestMonth = month;
      }
    });
    
    // Find worst month
    let worstMonth = '';
    let maxMonthLosses = 0;
    Object.entries(monthStats).forEach(([month, stats]) => {
      if (stats.perdidos > maxMonthLosses) {
        maxMonthLosses = stats.perdidos;
        worstMonth = month;
      }
    });
    
    // Find most played rival
    let mostPlayedRival = '';
    let maxMatches = 0;
    Object.entries(rivalStats).forEach(([rival, stats]) => {
      if (stats.jugados > maxMatches) {
        maxMatches = stats.jugados;
        mostPlayedRival = rival;
      }
    });
    
    // Find best rival (most wins)
    let bestRival = '';
    let maxRivalWins = 0;
    Object.entries(rivalStats).forEach(([rival, stats]) => {
      if (stats.ganados > maxRivalWins) {
        maxRivalWins = stats.ganados;
        bestRival = rival;
      }
    });
    
    // Find worst rival (most losses)
    let worstRival = '';
    let maxRivalLosses = 0;
    Object.entries(rivalStats).forEach(([rival, stats]) => {
      if (stats.perdidos > maxRivalLosses) {
        maxRivalLosses = stats.perdidos;
        worstRival = rival;
      }
    });
    
    // Country stats (international only)
    const intlCountries = Object.keys(countryStats).filter(c => c !== 'Perú');
    
    // Best country (most wins)
    let bestCountry = '';
    let maxCountryWins = 0;
    Object.entries(countryStats).forEach(([country, stats]) => {
      if (stats.ganados > maxCountryWins) {
        maxCountryWins = stats.ganados;
        bestCountry = country;
      }
    });
    
    // Worst country (most losses)
    let worstCountry = '';
    let maxCountryLosses = 0;
    Object.entries(countryStats).forEach(([country, stats]) => {
      if (stats.perdidos > maxCountryLosses) {
        maxCountryLosses = stats.perdidos;
        worstCountry = country;
      }
    });
    
    // Most played country
    let mostPlayedCountry = '';
    let maxCountryMatches = 0;
    Object.entries(countryStats).forEach(([country, stats]) => {
      if (stats.jugados > maxCountryMatches) {
        maxCountryMatches = stats.jugados;
        mostPlayedCountry = country;
      }
    });
    
    // Least wins (among countries with matches)
    let leastCountryWins = '';
    let minCountryWins = Infinity;
    Object.entries(countryStats).forEach(([country, stats]) => {
      if (stats.ganados > 0 && stats.ganados < minCountryWins) {
        minCountryWins = stats.ganados;
        leastCountryWins = country;
      }
    });
    if (minCountryWins === Infinity) {
      leastCountryWins = 'N/A';
      minCountryWins = 0;
    }
    
    // Least losses (among countries with matches)
    let leastCountryLosses = '';
    let minCountryLosses = Infinity;
    Object.entries(countryStats).forEach(([country, stats]) => {
      if (stats.perdidos > 0 && stats.perdidos < minCountryLosses) {
        minCountryLosses = stats.perdidos;
        leastCountryLosses = country;
      }
    });
    if (minCountryLosses === Infinity) {
      leastCountryLosses = 'N/A';
      minCountryLosses = 0;
    }
    
    // Count unique years with wins/losses
    const yearsWithWinsCount = yearsWithWins.size;
    const yearsWithLossesCount = yearsWithLosses.size;
    
    // Torneos unique
    const tournaments = [...new Set(data.map(m => m.Torneo).filter(t => t))];
    
    return {
      // Basic stats
      totalMatches: data.length,
      victories: victories.length,
      defeats: defeats.length,
      draws: draws.length,
      winPercentage: ((victories.length / data.length) * 100).toFixed(1),
      defeatPercentage: ((defeats.length / data.length) * 100).toFixed(1),
      drawPercentage: ((draws.length / data.length) * 100).toFixed(1),
      averageGoals: (totalScGoals / data.length).toFixed(2),
      averageGoalsAgainst: (totalOpponentGoals / data.length).toFixed(2),
      maxGoals: maxScGoals,
      maxGoalsHome: maxScGoalsHome,
      maxGoalsAway: maxScGoalsAway,
      minGoals: minScGoals === Infinity ? 0 : minScGoals,
      maxDefeat: maxDefeatGoals,
      maxDefeatHome: maxDefeatGoalsHome,
      maxDefeatAway: maxDefeatGoalsAway,
      
      // Day stats
      bestDay: bestDay || 'N/A',
      bestDayWins: maxWins,
      worstDay: worstDay || 'N/A',
      worstDayLosses: maxLosses,
      
      // Month stats
      bestMonth: bestMonth || 'N/A',
      bestMonthWins: maxMonthWins,
      worstMonth: worstMonth || 'N/A',
      worstMonthLosses: maxMonthLosses,
      
      // Streaks
      bestWinStreak: bestWinStreak,
      worstLoseStreak: worstWinless,
      bestUnbeatenStreak: bestUnbeaten,
      worstWinlessStreak: worstWinless,
      
      // Rivals
      mostPlayedRival: mostPlayedRival || 'N/A',
      mostPlayedCount: maxMatches,
      bestRival: bestRival || 'N/A',
      bestRivalWins: maxRivalWins,
      worstRival: worstRival || 'N/A',
      worstRivalLosses: maxRivalLosses,
      
      // Countries (international)
      bestCountry: bestCountry || 'N/A',
      bestCountryWins: maxCountryWins,
      worstCountry: worstCountry || 'N/A',
      worstCountryLosses: maxCountryLosses,
      mostPlayedCountry: mostPlayedCountry || 'N/A',
      mostPlayedCountryCount: maxCountryMatches,
      leastCountryWins: leastCountryWins,
      leastCountryWinsCount: minCountryWins,
      leastCountryLosses: leastCountryLosses,
      leastCountryLossesCount: minCountryLosses,
      totalIntlCountries: intlCountries.length,
      
      // Years
      yearsWithWins: yearsWithWinsCount,
      yearsWithLosses: yearsWithLossesCount,
      totalYears: Object.keys(yearStats).length,
      
      // Tournaments
      totalTournaments: tournaments.length,
      tournaments: tournaments.join(', ')
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

  // Inicializar estados
  const uniqueYears = getUniqueYears(initialData);
  const [years] = useState(uniqueYears);
  const [months] = useState(getUniqueMonths(initialData));
  const [selectedYear, setSelectedYear] = useState(uniqueYears.length > 0 ? uniqueYears[0].toString() : '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [curiosidades, setCuriosidades] = useState({});
  const [yearlyStats, setYearlyStats] = useState([]);

  // Calcular stats al montar el componente y cuando cambie el filtro
  useEffect(() => {
    setCuriosidades(calculateCuriosidades(data));
    setYearlyStats(calculateYearlyStats(data, tournamentFilter));
  }, [data, tournamentFilter]);

  // Datos ya inicializados, sin loading

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

  const tabs = [
    { id: 'efemerides', label: 'Efemerides' },
    { id: 'temporadas', label: 'Temporadas' },
    { id: 'minutos', label: 'Goles por Minuto' },
    { id: 'curiosidades', label: 'Datos Curiosos' },
    { id: 'analisis-anual', label: 'Analisis por Ano' },
    { id: 'rivales', label: 'Historial vs Rivales' },
    // { id: 'trivia', label: 'Trivia Celeste' }, // Oculto temporalmente
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1B265C] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">CRISTAL ARCHIVE</h1>
          <p className="text-xl text-gray-300">Desde 1993, toda la historia celeste</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-[#3CBEEF] text-[#3CBEEF]' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'efemerides' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1B265C] mb-2">Hola Sebichero</h2>
              <p className="text-gray-600">{getCurrentDateText()}</p>
              <p className="text-gray-500 mt-2">Descubre que partidos se jugaron en esta fecha historica</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Estadísticas de la fecha */}
            {(() => {
              const matchesForDate = getMatchesForDate(selectedDate);
              if (matchesForDate.length === 0) return null;
              
              let victories = 0;
              let draws = 0;
              let defeats = 0;
              let goalsFor = 0;
              let goalsAgainst = 0;
              
              matchesForDate.forEach(match => {
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);
                
                goalsFor += scGoals;
                goalsAgainst += opponentGoals;
                
                if (scGoals > opponentGoals) victories++;
                else if (scGoals < opponentGoals) defeats++;
                else draws++;
              });
              
              const total = matchesForDate.length;
              const winPercentage = ((victories / total) * 100).toFixed(1);
              const drawPercentage = ((draws / total) * 100).toFixed(1);
              const defeatPercentage = ((defeats / total) * 100).toFixed(1);
              
              return (
                <Card className="p-6 mb-8">
                  <h3 className="text-xl font-bold text-[#1B265C] mb-4 text-center">
                    Balance en esta fecha
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-sky-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-sky-700 mb-1">Total</p>
                      <p className="text-3xl font-bold text-sky-900">{total}</p>
                      <p className="text-xs text-sky-600">partidos</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-green-700 mb-1">Ganados</p>
                      <p className="text-3xl font-bold text-green-900">{victories}</p>
                      <p className="text-xs text-green-600">{winPercentage}%</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-700 mb-1">Empatados</p>
                      <p className="text-3xl font-bold text-yellow-900">{draws}</p>
                      <p className="text-xs text-yellow-600">{drawPercentage}%</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-700 mb-1">Perdidos</p>
                      <p className="text-3xl font-bold text-red-900">{defeats}</p>
                      <p className="text-xs text-red-600">{defeatPercentage}%</p>
                    </div>
                    
                    <div className="bg-violet-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-violet-700 mb-1">Goles</p>
                      <p className="text-xl font-bold text-violet-900">{goalsFor} - {goalsAgainst}</p>
                      <p className="text-xs text-violet-600">a favor - en contra</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 text-center">Distribucion de resultados</p>
                    <div className="flex rounded-full overflow-hidden h-8">
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${winPercentage}%` }}
                      >
                        {winPercentage > 15 && `${winPercentage}%`}
                      </div>
                      <div 
                        className="bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${drawPercentage}%` }}
                      >
                        {drawPercentage > 15 && `${drawPercentage}%`}
                      </div>
                      <div 
                        className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${defeatPercentage}%` }}
                      >
                        {defeatPercentage > 15 && `${defeatPercentage}%`}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Victorias ({victories})</span>
                      <span>Empates ({draws})</span>
                      <span>Derrotas ({defeats})</span>
                    </div>
                  </div>
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMatchesForDate(selectedDate).map((match, index) => {
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);
                const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');

                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">{match.Año || 'TBD'}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        result === 'Victoria' ? 'bg-green-100 text-green-700' :
                        result === 'Derrota' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{result}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{match["Equipo Local"]} vs {match["Equipo Visita"]}</h3>
                    <p className="text-2xl font-bold text-[#3CBEEF] text-center my-2">{match.Marcador}</p>
                    <p className="text-sm text-gray-600">{match.Torneo}</p>
                    {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Goles SC:</p>
                        <p className="text-sm font-medium text-gray-700">{match["Goles (Solo SC)"]}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'temporadas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B265C]">Resultados de Sporting Cristal</h2>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los anos</option>
                {years.map(year => {
                  // Títulos nacionales (20)
                  const titulos = [1956, 1961, 1968, 1970, 1972, 1979, 1980, 1983, 1988, 1991, 1994, 1995, 1996, 2002, 2005, 2012, 2014, 2016, 2018, 2020];
                  // Subcampeonatos nacionales (15)
                  const subCampeones = [1962, 1963, 1967, 1973, 1977, 1989, 1992, 1997, 1998, 2000, 2003, 2004, 2015, 2021, 2024];
                  // Copa Bicentenario (1)
                  const bicentenario = [2021];
                  // Libertadores subcampeón (1)
                  const libertadoresSub = [1997];
                  
                  let badge = '';
                  if (titulos.includes(year)) badge = ' 🏆';
                  else if (bicentenario.includes(year)) badge = ' 🥇';
                  else if (libertadoresSub.includes(year)) badge = ' 🌎';
                  else if (subCampeones.includes(year)) badge = ' 🥈';
                  
                  return <option key={year} value={year}>{year}{badge}</option>;
                })}
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los meses</option>
                {months.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </div>

            {/* Balance estadistico */}
            {filteredMatches.length > 0 && (() => {
              let victories = 0;
              let draws = 0;
              let defeats = 0;
              let goalsFor = 0;
              let goalsAgainst = 0;

              filteredMatches.forEach(match => {
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);

                goalsFor += scGoals;
                goalsAgainst += opponentGoals;

                if (scGoals > opponentGoals) victories++;
                else if (scGoals < opponentGoals) defeats++;
                else draws++;
              });

              const total = filteredMatches.length;
              const winPercentage = ((victories / total) * 100).toFixed(1);
              const drawPercentage = ((draws / total) * 100).toFixed(1);
              const defeatPercentage = ((defeats / total) * 100).toFixed(1);

              return (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-[#1B265C] mb-4 text-center">
                    Balance {selectedYear && `${selectedYear}`} {selectedMonth && `- ${selectedMonth}`}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-sky-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-sky-700 mb-1">Total</p>
                      <p className="text-3xl font-bold text-sky-900">{total}</p>
                      <p className="text-xs text-sky-600">partidos</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-green-700 mb-1">Ganados</p>
                      <p className="text-3xl font-bold text-green-900">{victories}</p>
                      <p className="text-xs text-green-600">{winPercentage}%</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-700 mb-1">Empatados</p>
                      <p className="text-3xl font-bold text-yellow-900">{draws}</p>
                      <p className="text-xs text-yellow-600">{drawPercentage}%</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-700 mb-1">Perdidos</p>
                      <p className="text-3xl font-bold text-red-900">{defeats}</p>
                      <p className="text-xs text-red-600">{defeatPercentage}%</p>
                    </div>
                    
                    <div className="bg-violet-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-violet-700 mb-1">Goles</p>
                      <p className="text-xl font-bold text-violet-900">{goalsFor} - {goalsAgainst}</p>
                      <p className="text-xs text-violet-600">a favor - en contra</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 text-center">Distribucion de resultados</p>
                    <div className="flex rounded-full overflow-hidden h-8">
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${winPercentage}%` }}
                      >
                        {winPercentage > 15 && `${winPercentage}%`}
                      </div>
                      <div 
                        className="bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${drawPercentage}%` }}
                      >
                        {drawPercentage > 15 && `${drawPercentage}%`}
                      </div>
                      <div 
                        className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${defeatPercentage}%` }}
                      >
                        {defeatPercentage > 15 && `${defeatPercentage}%`}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Victorias ({victories})</span>
                      <span>Empates ({draws})</span>
                      <span>Derrotas ({defeats})</span>
                    </div>
                  </div>

                  {/* Titulo o subcampenato del ano */}
                  {selectedYear && (() => {
                    const titulos = [1956, 1961, 1968, 1970, 1972, 1979, 1980, 1983, 1988, 1991, 1994, 1995, 1996, 2002, 2005, 2012, 2014, 2016, 2018, 2020];
                    const subCampeones = [1962, 1963, 1967, 1973, 1977, 1989, 1992, 1997, 1998, 2000, 2003, 2004, 2015, 2021, 2024];
                    const bicentenario = [2021];
                    const libertadoresSub = [1997];
                    
                    const yearNum = parseInt(selectedYear);
                    let title = '';
                    if (titulos.includes(yearNum)) title = '🏆 Campeon Nacional';
                    else if (bicentenario.includes(yearNum)) title = '🥇 Campeon Copa Bicentenario';
                    else if (libertadoresSub.includes(yearNum)) title = '🌎 Subampeon Copa Libertadores';
                    else if (subCampeones.includes(yearNum)) title = '🥈 Subampeon Nacional';
                    
                    if (title) {
                      return (
                        <div className="mt-4 pt-4 border-t-2 border-yellow-400">
                          <p className="text-lg font-bold text-center text-yellow-700">{title}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match, index) => {
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);
                const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');

                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">{match.Fecha === 'TBD' ? 'Fecha TBD' : formatDate(match.Fecha)}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        result === 'Victoria' ? 'bg-green-100 text-green-700' :
                        result === 'Derrota' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{result}</span>
                    </div>
                    <h3 className="font-semibold">{match["Equipo Local"]} vs {match["Equipo Visita"]}</h3>
                    <p className="text-xl font-bold text-[#3CBEEF] text-center my-2">{match.Marcador}</p>
                    <p className="text-sm text-gray-600">{match.Torneo}</p>
                    {match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Goles SC:</p>
                        <p className="text-sm font-medium text-gray-700">{match["Goles (Solo SC)"]}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'minutos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B265C]">Goles por Minuto</h2>
            
            <div className="flex items-center gap-4">
              <label>Busca goles anotados en un minuto especifico:</label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="Ej: 15"
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="px-4 py-2 border rounded-lg w-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedMinute && getGoalsForMinute(selectedMinute).map((goal, index) => (
                <Card key={index} className="p-4">
                  <p className="text-sm text-gray-500">{goal.año} - {goal.torneo}</p>
                  <h3 className="font-semibold">{goal.equipoLocal} vs {goal.equipoVisita}</h3>
                  <p className="text-xl font-bold text-[#3CBEEF] text-center my-2">{goal.marcador}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'curiosidades' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B265C]">Datos Curiosos</h2>
            
            {/* Basic Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Total Partidos</p>
                <p className="text-3xl font-bold text-[#1B265C]">{curiosidades.totalMatches}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Victorias</p>
                <p className="text-3xl font-bold text-green-600">{curiosidades.victories}</p>
                <p className="text-sm text-gray-500">{curiosidades.winPercentage}%</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Derrotas</p>
                <p className="text-3xl font-bold text-red-600">{curiosidades.defeats}</p>
                <p className="text-sm text-gray-500">{curiosidades.defeatPercentage}%</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Empates</p>
                <p className="text-3xl font-bold text-yellow-600">{curiosidades.draws}</p>
                <p className="text-sm text-gray-500">{curiosidades.drawPercentage}%</p>
              </Card>
            </div>

            {/* Goals Stats */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Goles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Goles a Favor (Total)</p>
                <p className="text-2xl font-bold text-green-600">{curiosidades.victories > 0 ? (parseFloat(curiosidades.averageGoals) * curiosidades.totalMatches).toFixed(0) : 0}</p>
                <p className="text-sm text-gray-500">Promedio: {curiosidades.averageGoals}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Goles en Contra (Total)</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.defeats > 0 ? (parseFloat(curiosidades.averageGoalsAgainst) * curiosidades.totalMatches).toFixed(0) : 0}</p>
                <p className="text-sm text-gray-500">Promedio: {curiosidades.averageGoalsAgainst}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Max Goles (Local)</p>
                <p className="text-2xl font-bold text-[#1B265C]">{curiosidades.maxGoalsHome}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Max Goles (Visitante)</p>
                <p className="text-2xl font-bold text-[#1B265C]">{curiosidades.maxGoalsAway}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mayor Derrota (Local)</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.maxDefeatHome}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mayor Derrota (Visitante)</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.maxDefeatAway}</p>
              </Card>
            </div>

            {/* Day of Week Stats */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Días de la Semana</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor Día (Victorias)</p>
                <p className="text-2xl font-bold text-green-600">{curiosidades.bestDay}</p>
                <p className="text-sm text-gray-500">{curiosidades.bestDayWins} victorias</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor Día (Derrotas)</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.worstDay}</p>
                <p className="text-sm text-gray-500">{curiosidades.worstDayLosses} derrotas</p>
              </Card>
            </div>

            {/* Month Stats */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Meses</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor Mes (Victorias)</p>
                <p className="text-2xl font-bold text-green-600">{curiosidades.bestMonth}</p>
                <p className="text-sm text-gray-500">{curiosidades.bestMonthWins} victorias</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor Mes (Derrotas)</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.worstMonth}</p>
                <p className="text-sm text-gray-500">{curiosidades.worstMonthLosses} derrotas</p>
              </Card>
            </div>

            {/* Streaks */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Rachas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor Racha Victorias</p>
                <p className="text-2xl font-bold text-green-600">{curiosidades.bestWinStreak}</p>
                <p className="text-sm text-gray-500">partidos seguidos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor Racha Derrotas</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.worstLoseStreak}</p>
                <p className="text-sm text-gray-500">partidos seguidos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor Racha Sin Perder</p>
                <p className="text-2xl font-bold text-blue-600">{curiosidades.bestUnbeatenStreak}</p>
                <p className="text-sm text-gray-500">partidos seguidos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor Racha Sin Ganar</p>
                <p className="text-2xl font-bold text-orange-600">{curiosidades.worstWinlessStreak}</p>
                <p className="text-sm text-gray-500">partidos seguidos</p>
              </Card>
            </div>

            {/* Rivals */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Rivales</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Rival Más Encontrado</p>
                <p className="text-xl font-bold text-[#1B265C]">{curiosidades.mostPlayedRival}</p>
                <p className="text-sm text-gray-500">{curiosidades.mostPlayedCount} partidos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor Rival (Más Victorias)</p>
                <p className="text-xl font-bold text-green-600">{curiosidades.bestRival}</p>
                <p className="text-sm text-gray-500">{curiosidades.bestRivalWins} victorias</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor Rival (Más Derrotas)</p>
                <p className="text-xl font-bold text-red-600">{curiosidades.worstRival}</p>
                <p className="text-sm text-gray-500">{curiosidades.worstRivalLosses} derrotas</p>
              </Card>
            </div>

            {/* Countries (International) */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Países (Internacional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">País Más Jugado</p>
                <p className="text-xl font-bold text-[#1B265C]">{curiosidades.mostPlayedCountry}</p>
                <p className="text-sm text-gray-500">{curiosidades.mostPlayedCountryCount} partidos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Mejor País (Más Victorias)</p>
                <p className="text-xl font-bold text-green-600">{curiosidades.bestCountry}</p>
                <p className="text-sm text-gray-500">{curiosidades.bestCountryWins} victorias</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Peor País (Más Derrotas)</p>
                <p className="text-xl font-bold text-red-600">{curiosidades.worstCountry}</p>
                <p className="text-sm text-gray-500">{curiosidades.worstCountryLosses} derrotas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">País Menos Victorias</p>
                <p className="text-xl font-bold text-yellow-600">{curiosidades.leastCountryWins}</p>
                <p className="text-sm text-gray-500">{curiosidades.leastCountryWinsCount} victorias</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">País Menos Derrotas</p>
                <p className="text-xl font-bold text-blue-600">{curiosidades.leastCountryLosses}</p>
                <p className="text-sm text-gray-500">{curiosidades.leastCountryLossesCount} derrotas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Países Diferentes</p>
                <p className="text-2xl font-bold text-[#1B265C]">{curiosidades.totalIntlCountries}</p>
                <p className="text-sm text-gray-500">en partidos internacionales</p>
              </Card>
            </div>

            {/* Years and Tournaments */}
            <h3 className="text-xl font-semibold text-[#1B265C] mt-6">Temporadas y Torneos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Años Jugados</p>
                <p className="text-2xl font-bold text-[#1B265C]">{curiosidades.totalYears}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Años con Victorias</p>
                <p className="text-2xl font-bold text-green-600">{curiosidades.yearsWithWins}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Años con Derrotas</p>
                <p className="text-2xl font-bold text-red-600">{curiosidades.yearsWithLosses}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-600">Torneos Diferentes</p>
                <p className="text-2xl font-bold text-[#1B265C]">{curiosidades.totalTournaments}</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'analisis-anual' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1B265C]">Analisis por Ano</h2>
              <select
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="todos">Todos los torneos</option>
                <option value="local">Solo locales</option>
                <option value="internacional">Solo internacionales</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow">
                <thead className="bg-[#1B265C] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Ano</th>
                    <th className="px-4 py-3 text-center">PJ</th>
                    <th className="px-4 py-3 text-center">G</th>
                    <th className="px-4 py-3 text-center">E</th>
                    <th className="px-4 py-3 text-center">P</th>
                    <th className="px-4 py-3 text-center">% G</th>
                    <th className="px-4 py-3 text-center">GF</th>
                    <th className="px-4 py-3 text-center">GC</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((yearData) => (
                    <tr key={yearData.year} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{yearData.year}</td>
                      <td className="px-4 py-3 text-center">{yearData.total}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{yearData.victories}</td>
                      <td className="px-4 py-3 text-center text-yellow-600">{yearData.draws}</td>
                      <td className="px-4 py-3 text-center text-red-600">{yearData.defeats}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#3CBEEF]">{yearData.winPercentage}%</td>
                      <td className="px-4 py-3 text-center">{yearData.goalsFor}</td>
                      <td className="px-4 py-3 text-center">{yearData.goalsAgainst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rivales' && <RivalHistory data={data} />}
        {/* {activeTab === 'trivia' && <Trivia />} // Modulo oculto temporalmente */}
      </main>

      {/* Footer */}
      <footer className="bg-[#1B265C] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Cristal Archive 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

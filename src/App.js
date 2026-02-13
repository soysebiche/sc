import React, { useState, useEffect } from 'react';
import vercelDataService from './services/vercelDataService';
import RivalHistory from './components/RivalHistory';
import Trivia from './components/Trivia';
import { Card } from './components/ui';

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

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error);
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
    let totalScGoals = 0;
    let totalOpponentGoals = 0;
    let maxScGoals = 0;
    let minScGoals = Infinity;
    
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
      }
      if (scGoals < minScGoals && scGoals > 0) {
        minScGoals = scGoals;
      }

      if (scGoals > opponentGoals) {
        victories.push(match);
      } else if (scGoals < opponentGoals) {
        defeats.push(match);
      } else {
        draws.push(match);
      }
    });
    
    return {
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
      minGoals: minScGoals
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
          <p className="loading-text">Cargando estadisticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card variant="glass" className="p-8 max-w-md w-full text-center">
          <h2 className="title-card text-red-600 mb-2">Error al cargar datos</h2>
          <p className="text-body mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-lg">
            Recargar pagina
          </button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'efemerides', label: 'Efemerides' },
    { id: 'temporadas', label: 'Temporadas' },
    { id: 'minutos', label: 'Goles por Minuto' },
    { id: 'curiosidades', label: 'Datos Curiosos' },
    { id: 'analisis-anual', label: 'Analisis por Ano' },
    { id: 'rivales', label: 'Historial vs Rivales' },
    { id: 'trivia', label: 'Trivia Celeste' },
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
          <div className="flex overflow-x-auto">
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
                {years.map(year => <option key={year} value={year}>{year}</option>)}
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
        {activeTab === 'trivia' && <Trivia />}
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

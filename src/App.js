import React, { useState, useEffect } from 'react';
import historicoData from './data/historico_completo_sc.json';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);
  const [activeTab, setActiveTab] = useState('efemerides');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [curiosidades, setCuriosidades] = useState({});

  useEffect(() => {
    try {
      console.log('Loading JSON Data:', historicoData);
      setData(historicoData);
      setLoading(false);

      // Extract unique years
      const uniqueYears = [...new Set(historicoData.map(match => new Date(match.Fecha).getFullYear()))].sort((a, b) => b - a);
      console.log('Unique Years:', uniqueYears);
      setYears(uniqueYears);
      if (uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0].toString());
      }

      // Set today's date for efemérides
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);

      // Calculate curiosidades
      setCuriosidades(calculateCuriosidades(historicoData));
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error);
      setLoading(false);
    }
  }, []);

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
  const filteredMatches = selectedYear
    ? data.filter(match => new Date(match.Fecha).getFullYear().toString() === selectedYear)
    : data;

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
                  rival: match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"],
                  marcador: match.Marcador,
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
    const victories = data.filter(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      return scGoals > opponentGoals;
    });
    
    const defeats = data.filter(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      return scGoals < opponentGoals;
    });
    
    const draws = data.filter(match => {
      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);
      return scGoals === opponentGoals;
    });

    const dayStats = {};
    const monthStats = {};
    const scoreStats = {};
    
    data.forEach(match => {
      const date = new Date(match.Fecha);
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
      const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];
      
      dayStats[dayName] = (dayStats[dayName] || 0) + 1;
      monthStats[monthName] = (monthStats[monthName] || 0) + 1;
      scoreStats[match.Marcador] = (scoreStats[match.Marcador] || 0) + 1;
    });

    const bestDay = Object.keys(dayStats).reduce((a, b) => dayStats[a] > dayStats[b] ? a : b);
    const bestMonth = Object.keys(monthStats).reduce((a, b) => monthStats[a] > monthStats[b] ? a : b);
    const mostCommonScore = Object.keys(scoreStats).reduce((a, b) => scoreStats[a] > scoreStats[b] ? a : b);
    
    return {
      totalMatches: data.length,
      victories: victories.length,
      defeats: defeats.length,
      draws: draws.length,
      bestDay,
      bestMonth,
      mostCommonScore,
      winPercentage: ((victories.length / data.length) * 100).toFixed(1)
    };
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Archivo Histórico de Sporting Cristal
        </h1>
        <p className="text-lg text-gray-600">Explora 25 años de historia celeste</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('efemerides')}
              className={`tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'efemerides' ? 'tab-active' : ''
              }`}
            >
              Efemérides
            </button>
            <button
              onClick={() => setActiveTab('temporadas')}
              className={`tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'temporadas' ? 'tab-active' : ''
              }`}
            >
              Temporadas
            </button>
            <button
              onClick={() => setActiveTab('minutos')}
              className={`tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'minutos' ? 'tab-active' : ''
              }`}
            >
              Goles por Minuto
            </button>
            <button
              onClick={() => setActiveTab('curiosidades')}
              className={`tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'curiosidades' ? 'tab-active' : ''
              }`}
            >
              Datos Curiosos
            </button>
          </nav>
        </div>

        {/* Contenido de Efemérides */}
        {activeTab === 'efemerides' && (
          <div className="py-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Hola Celeste, feliz {getCurrentDateText()}!
              </h2>
              <p className="text-lg text-gray-600">
                Descubre qué partidos se jugaron en esta fecha
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
                    Partidos jugados el {formatDate(selectedDate)}
                  </h3>
                  <div className="space-y-4">
                    {getMatchesForDate(selectedDate).map((match, index) => {
                      const matchDate = new Date(match.Fecha);
                      const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                        ? parseInt(match.Marcador.split('-')[0]) 
                        : parseInt(match.Marcador.split('-')[1]);
                      const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                        ? parseInt(match.Marcador.split('-')[1]) 
                        : parseInt(match.Marcador.split('-')[0]);
                      const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                      const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                         (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');
                      const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];

                      return (
                        <div key={index} className={`card bg-white rounded-lg shadow p-4 border-l-4 ${resultClass}`}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">
                              {matchDate.getFullYear()} - {match.Torneo}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800`}>
                              {result}
                            </span>
                          </div>
                          <p className="font-bold text-lg">
                            Sporting Cristal <span className="font-normal">vs</span> {rival}
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
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-2xl font-semibold mb-2 sm:mb-0">Resultados de Sporting Cristal</h2>
              <div className="flex items-center space-x-2">
                <label htmlFor="year-select" className="text-sm font-medium">Año:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match, index) => {
                const matchDate = new Date(match.Fecha);
                const scGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[0]) 
                  : parseInt(match.Marcador.split('-')[1]);
                const opponentGoals = match["Equipo Local"] === "Sporting Cristal" 
                  ? parseInt(match.Marcador.split('-')[1]) 
                  : parseInt(match.Marcador.split('-')[0]);
                const result = scGoals > opponentGoals ? 'Victoria' : (scGoals < opponentGoals ? 'Derrota' : 'Empate');
                const resultClass = result === 'Victoria' ? 'bg-green-100 border-green-500' : 
                                   (result === 'Derrota' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500');
                const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];

                return (
                  <div key={index} className={`card bg-white rounded-lg shadow p-4 border-l-4 ${resultClass}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-500">{formatDate(match.Fecha)}</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultClass.replace('border-', 'bg-').replace('100', '200')} text-gray-800`}>
                        {result}
                      </span>
                    </div>
                    <p className="font-bold text-lg">
                      Sporting Cristal <span className="font-normal">vs</span> {rival}
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
                    Goles anotados en el minuto {selectedMinute}
                  </h3>
                  <div className="space-y-3">
                    {getGoalsForMinute(selectedMinute).map((goal, index) => (
                      <div key={index} className="card bg-white rounded-lg shadow p-3">
                        <p className="font-semibold">Contra {goal.rival}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(goal.fecha)} - Resultado: {goal.marcador}
                        </p>
                      </div>
                    ))}
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
          <div className="py-6">
            <h2 className="text-2xl font-semibold mb-6">Datos Curiosos de Sporting Cristal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-sky-800 mb-2">Total de Partidos</h3>
                <p className="text-3xl font-bold text-sky-900">{curiosidades.totalMatches}</p>
                <p className="text-sm text-sky-700 mt-1">En nuestra base de datos</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-green-800 mb-2">Victorias</h3>
                <p className="text-3xl font-bold text-green-900">{curiosidades.victories}</p>
                <p className="text-sm text-green-700 mt-1">{curiosidades.winPercentage}% de efectividad</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-red-800 mb-2">Derrotas</h3>
                <p className="text-3xl font-bold text-red-900">{curiosidades.defeats}</p>
                <p className="text-sm text-red-700 mt-1">Aprendizajes del pasado</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Empates</h3>
                <p className="text-3xl font-bold text-yellow-900">{curiosidades.draws}</p>
                <p className="text-sm text-yellow-700 mt-1">Puntos compartidos</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Día Favorito</h3>
                <p className="text-xl font-bold text-purple-900">{curiosidades.bestDay}</p>
                <p className="text-sm text-purple-700 mt-1">Día con más partidos</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-lg font-bold text-indigo-800 mb-2">Mes Favorito</h3>
                <p className="text-xl font-bold text-indigo-900">{curiosidades.bestMonth}</p>
                <p className="text-sm text-indigo-700 mt-1">Mes con más actividad</p>
              </div>
              
              <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg p-6 text-center shadow-lg md:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-bold text-sky-800 mb-2">Marcador Más Común</h3>
                <p className="text-2xl font-bold text-sky-900">{curiosidades.mostCommonScore}</p>
                <p className="text-sm text-sky-700 mt-1">Resultado más frecuente</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
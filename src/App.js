import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetch('/historico_completo_sc.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
        console.log('Fetched JSON Data:', jsonData);
        setData(jsonData);
        setLoading(false);

        // Extract unique years
        const uniqueYears = [...new Set(jsonData.map(match => new Date(match.Fecha).getFullYear()))].sort((a, b) => b - a);
        console.log('Unique Years:', uniqueYears);
        setYears(uniqueYears);
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0].toString()); // Set default to the latest year
        }
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const filteredMatches = selectedYear
    ? data.filter(match => new Date(match.Fecha).getFullYear().toString() === selectedYear)
    : data;

  const stats = useMemo(() => {
    if (data.length === 0) return {};

    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const victoriesByDay = new Array(7).fill(0);
    const defeatsByDay = new Array(7).fill(0);
    const goalsByMinute = new Array(121).fill(0); // Assuming minutes 0-120 (for extra time)
    const goalsByMonth = new Array(12).fill(0);
    const victoriesByMonth = new Array(12).fill(0);
    const defeatsByMonth = new Array(12).fill(0);
    const drawsByMonth = new Array(12).fill(0);

    let totalVictories = 0;
    let totalDefeats = 0;
    let totalDraws = 0;

    data.forEach(match => {
      const matchDate = new Date(match.Fecha);
      const dayOfWeek = matchDate.getDay(); // 0 for Sunday, 6 for Saturday
      const month = matchDate.getMonth(); // 0 for January, 11 for December

      // Results by Day and Month
      if (match.Resultado === 'V') {
        victoriesByDay[dayOfWeek]++;
        victoriesByMonth[month]++;
        totalVictories++;
      } else if (match.Resultado === 'D') {
        defeatsByDay[dayOfWeek]++;
        defeatsByMonth[month]++;
        totalDefeats++;
      } else if (match.Resultado === 'E') {
        drawsByMonth[month]++;
        totalDraws++;
      }

      // Calculate goals by minute from 'Goles (Solo SC)' field
      let minutesExtracted = false; // Flag to check if any minutes were extracted
      if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
        const allParenthesizedContents = [...match["Goles (Solo SC)"].matchAll(/\(([^)]+)\)/g)]
            .map(m => m[1]); // Get content inside parentheses, e.g., "12', 78'"

        allParenthesizedContents.forEach(content => {
            const individualMinuteStrings = content.split(/,\s*/);

            individualMinuteStrings.forEach(minuteStr => {
                const numericalMinuteMatch = minuteStr.match(/^(\d+\+?\d*)/);
                if (numericalMinuteMatch) {
                    const parsedMinute = parseInt(numericalMinuteMatch[1], 10);

                    if (!isNaN(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 120) {
                        goalsByMinute[parsedMinute]++;
                        goalsByMonth[month]++; // Aggregate goals by month
                        minutesExtracted = true; // Set flag if a minute is extracted
                    }
                }
            });
        });
      }

      // Check if goals were scored but no minutes extracted
      // Assuming 'Marcador' is like "X-Y"
      const scoreParts = match.Marcador.split('-');
      let scGoalsCount = 0;
      if (match["Equipo Local"] === "Sporting Cristal") {
          scGoalsCount = parseInt(scoreParts[0], 10);
      } else if (match["Equipo Visita"] === "Sporting Cristal") {
          scGoalsCount = parseInt(scoreParts[1], 10);
      }

      if (scGoalsCount > 0 && !minutesExtracted) {
          console.log('Match with goals but no minutes extracted:', match.Fecha, match.Marcador, match["Goles (Solo SC)"]);
      }
    });

    // Day with most victories
    const maxVictoriesDayCount = Math.max(...victoriesByDay);
    const dayWithMostVictories = dayNames[victoriesByDay.indexOf(maxVictoriesDayCount)];

    // Day with most defeats
    const maxDefeatsDayCount = Math.max(...defeatsByDay);
    const dayWithMostDefeats = dayNames[defeatsByDay.indexOf(maxDefeatsDayCount)];

    // Top 5 minutes with most goals
    const top5MostGoalsMinutes = goalsByMinute
      .map((count, minute) => ({ minute, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top 5 minutes with fewest goals (excluding 0 goals, and minutes > 90)
    const top5FewestGoalsMinutes = goalsByMinute
      .map((count, minute) => ({ minute, count }))
      .filter(item => item.count > 0 && item.minute <= 90) // Only minutes 1-90 with at least one goal
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    // Month with most goals
    const maxGoalsMonthCount = Math.max(...goalsByMonth);
    const monthWithMostGoals = monthNames[goalsByMonth.indexOf(maxGoalsMonthCount)];

    // Month with fewest goals (excluding 0 goals)
    const minGoalsMonthCount = Math.min(...goalsByMonth.filter(count => count > 0));
    const monthWithFewestGoals = monthNames[goalsByMonth.indexOf(minGoalsMonthCount)];

    // Month with most victories
    const maxVictoriesMonthCount = Math.max(...victoriesByMonth);
    const monthWithMostVictories = monthNames[victoriesByMonth.indexOf(maxVictoriesMonthCount)];

    // Month with most defeats
    const maxDefeatsMonthCount = Math.max(...defeatsByMonth);
    const monthWithMostDefeats = monthNames[defeatsByMonth.indexOf(maxDefeatsMonthCount)];

    // Minutes with no goals (1-90)
    const minutesWithNoGoals = [];
    for (let i = 1; i <= 90; i++) {
      if (goalsByMinute[i] === 0) {
        minutesWithNoGoals.push(i);
      }
    }

    // Single minute with most goals
    const maxGoalsInMinute = Math.max(...goalsByMinute);
    const minuteWithMostGoals = goalsByMinute.indexOf(maxGoalsInMinute);

    // Single minute with fewest goals (excluding 0 goals, and minutes > 90)
    const filteredGoalsByMinute = goalsByMinute
      .map((count, minute) => ({ minute, count }))
      .filter(item => item.count > 0 && item.minute <= 90);
    
    const minGoalsInMinute = filteredGoalsByMinute.length > 0 
      ? Math.min(...filteredGoalsByMinute.map(item => item.count)) 
      : 0;
    const minuteWithFewestGoals = filteredGoalsByMinute.length > 0 
      ? filteredGoalsByMinute.find(item => item.count === minGoalsInMinute)?.minute || 0 
      : 0;

    // Additional Curious Facts (at least 20)

    // Example: Average goals per match
    const totalGoalsScored = goalsByMinute.reduce((sum, count) => sum + count, 0);
    const averageGoalsPerMatch = data.length > 0 ? (totalGoalsScored / data.length).toFixed(2) : 0;

    // Example: Win/Loss/Draw percentage
    const winPercentage = data.length > 0 ? ((totalVictories / data.length) * 100).toFixed(2) : 0;
    const lossPercentage = data.length > 0 ? ((totalDefeats / data.length) * 100).toFixed(2) : 0;
    const drawPercentage = data.length > 0 ? ((totalDraws / data.length) * 100).toFixed(2) : 0;

    // Example: Most common score (requires parsing Marcador)
    const scoreCounts = {};
    data.forEach(match => {
      scoreCounts[match.Marcador] = (scoreCounts[match.Marcador] || 0) + 1;
    });
    let mostCommonScore = 'N/A';
    let maxScoreCount = 0;
    for (const score in scoreCounts) {
      if (scoreCounts[score] > maxScoreCount) {
        maxScoreCount = scoreCounts[score];
        mostCommonScore = score;
      }
    }

    // Example: Biggest win (by goal difference)
    let biggestWinDiff = -Infinity;
    let biggestWinMatch = null;
    data.forEach(match => {
      if (match.Resultado === 'V') {
        const scoreParts = match.Marcador.split('-');
        let scGoals = 0;
        let opponentGoals = 0;
        if (match["Equipo Local"] === "Sporting Cristal") {
            scGoals = parseInt(scoreParts[0], 10);
            opponentGoals = parseInt(scoreParts[1], 10);
        } else if (match["Equipo Visita"] === "Sporting Cristal") {
            scGoals = parseInt(scoreParts[1], 10);
            opponentGoals = parseInt(scoreParts[0], 10);
        }
        const diff = scGoals - opponentGoals;
        if (diff > biggestWinDiff) {
          biggestWinDiff = diff;
          biggestWinMatch = `${match.Fecha} vs ${match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"]} (${match.Marcador})`;
        }
      }
    });

    // Example: Most common opponent (requires parsing Equipo Local/Visita)
    const opponentCounts = {};
    data.forEach(match => {
      const opponent = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
      opponentCounts[opponent] = (opponentCounts[opponent] || 0) + 1;
    });
    let mostCommonOpponent = 'N/A';
    let maxOpponentCount = 0;
    for (const opp in opponentCounts) {
      if (opponentCounts[opp] > maxOpponentCount) {
        maxOpponentCount = opponentCounts[opp];
        mostCommonOpponent = opp;
      }
    }

    // Example: Total goals scored by SC
    // totalGoalsScored is already calculated

    // Example: Total goals conceded by SC
    let totalGoalsConceded = 0;
    data.forEach(match => {
        const scoreParts = match.Marcador.split('-');
        let conceded = 0;
        if (match["Equipo Local"] === "Sporting Cristal") {
            conceded = parseInt(scoreParts[1], 10);
        }
        else if (match["Equipo Visita"] === "Sporting Cristal") {
            conceded = parseInt(scoreParts[0], 10);
        }
        totalGoalsConceded += conceded;
    });

    // Example: Clean sheets (matches with 0 goals conceded)
    let cleanSheets = 0;
    data.forEach(match => {
        let conceded = 0;
        const scoreParts = match.Marcador.split('-');
        if (match["Equipo Local"] === "Sporting Cristal") {
            conceded = parseInt(scoreParts[1], 10);
        }
        else if (match["Equipo Visita"] === "Sporting Cristal") {
            conceded = parseInt(scoreParts[0], 10);
        }
        if (conceded === 0) {
            cleanSheets++;
        }
    });

    // Example: Matches with 5+ goals (total goals in match)
    let matchesWithHighGoals = 0;
    data.forEach(match => {
        const scoreParts = match.Marcador.split('-');
        const team1Goals = parseInt(scoreParts[0], 10);
        const team2Goals = parseInt(scoreParts[1], 10);
        if (team1Goals + team2Goals >= 5) {
            matchesWithHighGoals++;
        }
    });

    // Example: Most common goal scorer (requires parsing Goles (Solo SC) for player names)
    const scorerCounts = {};
    data.forEach(match => {
        if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
            const players = match["Goles (Solo SC)"].split(/,\s*(?![^()]*\))/); // Split by comma, but not inside parentheses
            players.forEach(playerEntry => {
                const playerNameMatch = playerEntry.match(/^([^(\[]+)/); // Get name before '(' or '['
                if (playerNameMatch) {
                    const playerName = playerNameMatch[1].trim();
                    if (playerName) {
                        scorerCounts[playerName] = (scorerCounts[playerName] || 0) + 1;
                    }
                }
            });
        }
    });
    let topScorer = 'N/A';
    let maxScorerGoals = 0;
    for (const scorer in scorerCounts) {
        if (scorerCounts[scorer] > maxScorerGoals) {
            maxScorerGoals = scorerCounts[scorer];
            topScorer = scorer;
        }
    }

    // Example: Number of tournaments played
    const uniqueTournaments = new Set(data.map(match => match.Torneo));
    const numberOfTournaments = uniqueTournaments.size;

    // Example: Number of unique opponents
    const uniqueOpponents = new Set();
    data.forEach(match => {
        const opponent = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
        uniqueOpponents.add(opponent);
    });
    const numberOfUniqueOpponents = uniqueOpponents.size;

    // Example: Matches with "Walkover"
    let walkoverWins = 0;
    let walkoverLosses = 0;
    data.forEach(match => {
        if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"].includes("Walkover")) {
            if (match.Resultado === 'V') walkoverWins++;
            if (match.Resultado === 'D') walkoverLosses++;
        }
    });

    // Example: Matches with "autogol"
    let autogolesForSC = 0;
    data.forEach(match => {
        if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"].includes("autogol")) {
            autogolesForSC++;
        }
    });

    // Example: Matches with "pen" (penalty)
    let penaltiesScored = 0;
    data.forEach(match => {
        if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"].includes("pen")) {
            penaltiesScored++;
        }
    });

    // Example: Matches with 0-0 draws
    const zeroZeroDraws = data.filter(match => match.Marcador === '0-0').length;

    // Example: Matches with 1-1 draws
    const oneOneDrawsCount = data.filter(match => match.Marcador === '1-1').length;

    // Example: Matches with 2-2 draws
    const twoTwoDraws = data.filter(match => match.Marcador === '2-2').length;

    // Example: Matches with 1-0 wins
    const oneZeroWins = data.filter(match => {
        if (match.Resultado === 'V') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            } else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 1 && opponentGoals === 0;
        }
        return false;
    }).length;

    // Example: Matches with 2-1 wins
    const twoOneWins = data.filter(match => {
        if (match.Resultado === 'V') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            }
            else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 2 && opponentGoals === 1;
        }
        return false;
    }).length;

    // Example: Matches with 3-0 wins
    const threeZeroWins = data.filter(match => {
        if (match.Resultado === 'V') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            }
            else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 3 && opponentGoals === 0;
        }
        return false;
    }).length;

    // Example: Matches with 0-1 losses
    const zeroOneLosses = data.filter(match => {
        if (match.Resultado === 'D') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            }
            else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 0 && opponentGoals === 1;
        }
        return false;
    }).length;

    // Example: Matches with 1-2 losses
    const oneTwoLosses = data.filter(match => {
        if (match.Resultado === 'D') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            }
            else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 1 && opponentGoals === 2;
        }
        return false;
    }).length;

    // Example: Matches with 0-3 losses
    const zeroThreeLosses = data.filter(match => {
        if (match.Resultado === 'D') {
            const scoreParts = match.Marcador.split('-');
            let scGoals = 0;
            let opponentGoals = 0;
            if (match["Equipo Local"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[0], 10);
                opponentGoals = parseInt(scoreParts[1], 10);
            }
            else if (match["Equipo Visita"] === "Sporting Cristal") {
                scGoals = parseInt(scoreParts[1], 10);
                opponentGoals = parseInt(scoreParts[0], 10);
            }
            return scGoals === 0 && opponentGoals === 3;
        }
        return false;
    }).length;


    return {
      totalMatches: data.length,
      totalVictories,
      totalDefeats,
      totalDraws,
      dayWithMostVictories: { day: dayWithMostVictories, count: maxVictoriesDayCount },
      dayWithMostDefeats: { day: dayWithMostDefeats, count: maxDefeatsDayCount },
      minuteWithMostGoals: { minute: minuteWithMostGoals, count: maxGoalsInMinute },
      minuteWithFewestGoals: { minute: minuteWithFewestGoals, count: minGoalsInMinute },
      minutesWithNoGoals,
      top5MostGoalsMinutes,
      top5FewestGoalsMinutes,
      monthWithMostGoals: { month: monthWithMostGoals, count: maxGoalsMonthCount },
      monthWithFewestGoals: { month: monthWithFewestGoals, count: minGoalsMonthCount },
      monthWithMostVictories: { month: monthWithMostVictories, count: maxVictoriesMonthCount },
      monthWithMostDefeats: { month: monthWithMostDefeats, count: maxDefeatsMonthCount },
      averageGoalsPerMatch,
      winPercentage,
      lossPercentage,
      drawPercentage,
      mostCommonScore,
      biggestWin: biggestWinMatch,
      biggestWinDiff,
      mostCommonOpponent,
      totalGoalsScored,
      totalGoalsConceded,
      cleanSheets,
      matchesWithHighGoals,
      topScorer,
      numberOfTournaments,
      numberOfUniqueOpponents,
      walkoverWins,
      walkoverLosses,
      autogolesForSC,
      penaltiesScored,
      zeroZeroDraws,
      oneOneDrawsCount,
      twoTwoDraws,
      oneZeroWins,
      twoOneWins,
      threeZeroWins,
      zeroOneLosses,
      oneTwoLosses,
      zeroThreeLosses,
    };
  }, [data]); // Recalculate when data changes

  if (loading) {
    return <div className="App">Cargando datos...</div>;
  }

  if (error) {
    return <div className="App">Error al cargar los datos: {error.message}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Histórico Sporting Cristal</h1>
      </header>
      <main>
        <section className="match-list-section">
          <h2>Resultados por Año</h2>
          <div className="year-selector">
            <label htmlFor="year-select">Selecciona un Año: </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="matches-container">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => {
                const matchDate = new Date(match.Fecha);
                const displayDate = matchDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                const rival = match["Equipo Local"] === "Sporting Cristal" ? match["Equipo Visita"] : match["Equipo Local"];
                const goalsScoredDisplay = []; // New array for display
                if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
                  const allParenthesizedContents = [...match["Goles (Solo SC)"].matchAll(/\(([^)]+)\)/g)]
                      .map(m => m[1]);

                  allParenthesizedContents.forEach(content => {
                      const individualMinuteStrings = content.split(/,\s*/);
                      individualMinuteStrings.forEach(minuteStr => {
                          // Extract only the numerical part (e.g., "12", "45+2", "63")
                          const match = minuteStr.match(/^(\d+\+?\d*)/);
                          if (match) {
                              const numericalMinuteStr = match[1]; // "12", "45+2", "63"
                              const parsedMinuteForStats = parseInt(numericalMinuteStr, 10); // 12, 45, 63

                              if (!isNaN(parsedMinuteForStats)) {
                                  // For display, push the numerical string
                                  goalsScoredDisplay.push(numericalMinuteStr);
                              }
                              // For stats, the logic is already in useMemo and uses parsedMinuteForStats
                              // The stats calculation already uses parseInt on the extracted numerical part,
                              // so it will correctly count 45+2 as 45.
                          }
                      });
                  });
                }

                

                let goalsDisplayContent = null;
                if (goalsScoredDisplay.length > 0) {
                    goalsDisplayContent = `Goles de SC en los minutos: ${goalsScoredDisplay.join(', ')}`;
                } else if (match["Goles (Solo SC)"] && match["Goles (Solo SC)"] !== '-') {
                    goalsDisplayContent = `Goles de SC: ${match["Goles (Solo SC)"]}`;
                }

                return (
                  <div key={index} className="match-card">
                    <h3>{displayDate} vs {rival}</h3>
                    <p>Marcador: {match.Marcador}</p>
                    <p>Resultado: {match.Resultado === 'V' ? 'Victoria' : match.Resultado === 'D' ? 'Derrota' : 'Empate'}</p>
                    {match["Goles (Solo SC)"] && ( // Display raw string
                      <p>Goles (raw): {match["Goles (Solo SC)"]}</p>
                    )}
                    {goalsDisplayContent && ( // Display the determined content
                      <p>{goalsDisplayContent}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No hay partidos para el año seleccionado.</p>
            )}
          </div>
        </section>
        <section className="stats-section">
          <h2>Estadísticas Curiosas</h2>
          {stats.totalMatches && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Resumen General</h3>
                <p>Total de partidos registrados: {stats.totalMatches}</p>
                <p>Total de victorias: {stats.totalVictories} ({stats.winPercentage}%)</p>
                <p>Total de derrotas: {stats.totalDefeats} ({stats.lossPercentage}%)</p>
                <p>Total de empates: {stats.totalDraws} ({stats.drawPercentage}%)</p>
                <p>Goles a favor: {stats.totalGoalsScored}</p>
                <p>Goles en contra: {stats.totalGoalsConceded}</p>
                <p>Promedio de goles por partido: {stats.averageGoalsPerMatch}</p>
                <p>Partidos con valla invicta (portería a 0): {stats.cleanSheets}</p>
              </div>

              <div className="stat-card">
                <h3>Minutos de Goles</h3>
                <p>Minuto con más goles: Minuto {stats.minuteWithMostGoals.minute} ({stats.minuteWithMostGoals.count} goles)</p>
                <p>Minuto con menos goles: Minuto {stats.minuteWithFewestGoals.minute} ({stats.minuteWithFewestGoals.count} goles)</p>
                {stats.minutesWithNoGoals && stats.minutesWithNoGoals.length > 0 && (
                  <p>Minutos sin goles (1-90): {stats.minutesWithNoGoals.join(', ')}</p>
                )}
                {stats.minutesWithNoGoals && stats.minutesWithNoGoals.length === 0 && (
                  <p>¡Sporting Cristal ha anotado en cada minuto del 1 al 90!</p>
                )}
                <h4>Top 5 Minutos con Más Goles:</h4>
                <ul>
                  {stats.top5MostGoalsMinutes.map(item => (
                    <li key={item.minute}>Minuto {item.minute}: {item.count} goles</li>
                  ))}
                </ul>
                <h4>Top 5 Minutos con Menos Goles (con al menos 1 gol):</h4>
                <ul>
                  {stats.top5FewestGoalsMinutes.map(item => (
                    <li key={item.minute}>Minuto {item.minute}: {item.count} goles</li>
                  ))}
                </ul>
              </div>

              <div className="stat-card">
                <h3>Días de la Semana</h3>
                <p>Día con más victorias: {stats.dayWithMostVictories.day} ({stats.dayWithMostVictories.count} victorias)</p>
                <p>Día con más derrotas: {stats.dayWithMostDefeats.day} ({stats.dayWithMostDefeats.count} derrotas)</p>
              </div>

              <div className="stat-card">
                <h3>Meses</h3>
                <p>Mes con más goles: {stats.monthWithMostGoals.month} ({stats.monthWithMostGoals.count} goles)</p>
                <p>Mes con menos goles: {stats.monthWithFewestGoals.month} ({stats.monthWithFewestGoals.count} goles)</p>
                <p>Mes con más victorias: {stats.monthWithMostVictories.month} ({stats.monthWithMostVictories.count} victorias)</p>
                <p>Mes con más derrotas: {stats.monthWithMostDefeats.month} ({stats.monthWithMostDefeats.count} derrotas)</p>
              </div>

              <div className="stat-card">
                <h3>Curiosidades Adicionales</h3>
                <p>Marcador más común: {stats.mostCommonScore}</p>
                <p>Mayor goleada: {stats.biggestWin} (diferencia de {stats.biggestWinDiff} goles)</p>
                <p>Rival más enfrentado: {stats.mostCommonOpponent}</p>
                <p>Máximo goleador (según datos): {stats.topScorer}</p>
                <p>Número de torneos jugados: {stats.numberOfTournaments}</p>
                <p>Número de rivales únicos: {stats.numberOfUniqueOpponents}</p>
                <p>Victorias por walkover: {stats.walkoverWins}</p>
                <p>Derrotas por walkover: {stats.walkoverLosses}</p>
                <p>Goles en contra por autogol: {stats.autogolesForSC}</p>
                <p>Goles de penal: {stats.penaltiesScored}</p>
                <p>Empates 0-0: {stats.zeroZeroDraws}</p>
                <p>Empates 1-1: {stats.oneOneDrawsCount}</p>
                <p>Empates 2-2: {stats.twoTwoDraws}</p>
                <p>Victorias 1-0: {stats.oneZeroWins}</p>
                <p>Victorias 2-1: {stats.twoOneWins}</p>
                <p>Victorias 3-0: {stats.threeZeroWins}</p>
                <p>Derrotas 0-1: {stats.zeroOneLosses}</p>
                <p>Derrotas 1-2: {stats.oneTwoLosses}</p>
                <p>Derrotas 0-3: {stats.zeroThreeLosses}</p>
                <p>Partidos con 5 o más goles (total): {stats.matchesWithHighGoals}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui';

function CountryHistory({ data }) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const countrySet = new Set();
    const yearSet = new Set();

    data.forEach(match => {
      const country = match["País"];
      if (country && country !== 'Perú') {
        countrySet.add(country);
      }
      
      let year;
      if (match.Año && typeof match.Año === 'number') {
        year = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        year = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      if (year) {
        yearSet.add(year);
      }
    });

    setCountries([...countrySet].sort());
    setYears([...yearSet].sort((a, b) => b - a));
  }, [data]);

  const filteredMatches = useMemo(() => {
    if (!selectedCountry || !data) return [];

    return data.filter(match => {
      const country = match["País"];
      
      let matchYear;
      if (match.Año && typeof match.Año === 'number') {
        matchYear = match.Año;
      } else if (match.Fecha && match.Fecha !== 'TBD') {
        const date = new Date(match.Fecha);
        matchYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
      }
      
      const yearMatch = selectedYear ? 
        (matchYear && matchYear.toString() === selectedYear) : true;

      return country === selectedCountry && yearMatch;
    }).sort((a, b) => {
      const dateA = a.Fecha === 'TBD' ? new Date(0) : new Date(a.Fecha);
      const dateB = b.Fecha === 'TBD' ? new Date(0) : new Date(b.Fecha);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    });
  }, [data, selectedCountry, selectedYear]);

  const stats = useMemo(() => {
    if (filteredMatches.length === 0) {
      return {
        total: 0,
        victories: 0,
        draws: 0,
        defeats: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    }

    let victories = 0;
    let draws = 0;
    let defeats = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    filteredMatches.forEach(match => {
      const isHome = match["Equipo Local"] === "Sporting Cristal";
      const scGoals = isHome 
        ? parseInt(match.Marcador.split('-')[0]) 
        : parseInt(match.Marcador.split('-')[1]);
      const opponentGoals = isHome 
        ? parseInt(match.Marcador.split('-')[1]) 
        : parseInt(match.Marcador.split('-')[0]);

      goalsFor += scGoals;
      goalsAgainst += opponentGoals;

      if (scGoals > opponentGoals) {
        victories++;
      } else if (scGoals < opponentGoals) {
        defeats++;
      } else {
        draws++;
      }
    });

    return {
      total: filteredMatches.length,
      victories,
      draws,
      defeats,
      goalsFor,
      goalsAgainst
    };
  }, [filteredMatches]);

  const getResultClass = (result) => {
    switch (result) {
      case 'G': return 'text-green-600 font-bold';
      case 'E': return 'text-yellow-600 font-bold';
      case 'P': return 'text-red-600 font-bold';
      default: return 'text-gray-600';
    }
  };

  const getResultText = (result) => {
    switch (result) {
      case 'G': return 'G';
      case 'E': return 'E';
      case 'P': return 'P';
      default: return '-';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar País</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Selecciona un país</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por año (opcional)</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={!selectedCountry}
          >
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCountry && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Partidos</p>
              <p className="text-2xl font-bold text-[#1B265C]">{stats.total}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Victorias</p>
              <p className="text-2xl font-bold text-green-600">{stats.victories}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Empates</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draws}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Derrotas</p>
              <p className="text-2xl font-bold text-red-600">{stats.defeats}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Goles a Favor</p>
              <p className="text-2xl font-bold text-green-600">{stats.goalsFor}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-600">Goles en Contra</p>
              <p className="text-2xl font-bold text-red-600">{stats.goalsAgainst}</p>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-[#1B265C] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Torneo</th>
                  <th className="px-4 py-3 text-center">Local</th>
                  <th className="px-4 py-3 text-center">Marcador</th>
                  <th className="px-4 py-3 text-center">Resultado</th>
                  <th className="px-4 py-3 text-left">Rival</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No hay partidos para mostrar
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((match, index) => {
                    const isHome = match["Equipo Local"] === "Sporting Cristal";
                    const rival = isHome ? match["Equipo Visita"] : match["Equipo Local"];
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {match.Fecha && match.Fecha !== 'TBD' 
                            ? new Date(match.Fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">{match.Torneo || '-'}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          {isHome ? '🏠' : '✈️'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold">
                          {match.Marcador}
                        </td>
                        <td className={`px-4 py-3 text-center ${getResultClass(match.Resultado)}`}>
                          {getResultText(match.Resultado)}
                        </td>
                        <td className="px-4 py-3 text-sm">{rival}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!selectedCountry && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Selecciona un país para ver el historial</p>
          <p className="text-sm mt-2">Países disponibles: {countries.length}</p>
        </div>
      )}
    </div>
  );
}

export default CountryHistory;

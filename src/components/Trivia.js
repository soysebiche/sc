import React, { useState, useEffect } from 'react';
import { getRandomQuestion, getQuestionsByDecade } from '../data/triviaQuestions';

function Trivia() {
  const [selectedDecade, setSelectedDecade] = useState('93-25');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Opciones de décadas
  const decadeOptions = [
    { value: '93-25', label: 'Todas las épocas (1993-2025)' },
    { value: '93-99', label: '90s (1993-1999)' },
    { value: '00-10', label: '00s (2000-2010)' },
    { value: '11-20', label: '10s (2011-2020)' },
    { value: '21-25', label: '20s (2021-2025)' }
  ];

  // Cargar primera pregunta al iniciar
  useEffect(() => {
    loadNewQuestion();
  }, [selectedDecade]);

  const loadNewQuestion = () => {
    setIsLoading(true);
    setShowAnswer(false);
    
    // Simular un pequeño delay para efecto visual
    setTimeout(() => {
      const newQuestion = getRandomQuestion(selectedDecade);
      setCurrentQuestion(newQuestion);
      setQuestionCount(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  const handleDecadeChange = (decade) => {
    setSelectedDecade(decade);
    setQuestionCount(0);
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'fácil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Historia': '📚',
      'Resultados': '⚽',
      'Goleadores': '🥅',
      'Estadísticas': '📊',
      'Rivales': '🤝',
      'Torneos': '🏆',
      'Clásicos': '⚡',
      'Calendario': '📅',
      'Jugadores': '👕',
      'Estrategia': '🎯',
      'Récords': '🏅',
      'Longevidad': '⏳',
      'Técnica': '🎨',
      'Invictos': '🛡️',
      'Dificultades': '💪',
      'Estadios': '🏟️',
      'Internacional': '🌎',
      'Libertadores': '🏆',
      'Sudamericana': '🥈',
      'Títulos': '👑',
      'Consistencia': '📈',
      'Defensa': '🔒',
      'Rachas': '🔥',
      'Posiciones': '📍',
      'Hinchada': '👥',
      'Curiosidades': '🤔',
      'Minutos': '⏰',
      'Tradición': '🎨',
      'Duración': '⏱️',
      'Evolución': '📈',
      'Crecimiento': '🌱',
      'Innovación': '💡',
      'Logros': '🎖️',
      'default': '❓'
    };
    return icons[category] || icons.default;
  };

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          🧠 Trivia Celeste
        </h2>
        <p className="text-lg text-gray-600">
          ¡Pon a prueba tus conocimientos sobre Sporting Cristal!
        </p>
      </div>

      {/* Filtro de décadas */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center text-sky-600">
          📊 Selecciona la época
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {decadeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDecadeChange(option.value)}
              className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedDecade === option.value
                  ? 'bg-sky-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-sky-100 hover:text-sky-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {getQuestionsByDecade(selectedDecade).length} preguntas disponibles
          </p>
        </div>
      </div>

      {/* Área de la pregunta */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg p-8 mb-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-sky-600 font-medium">Preparando pregunta...</p>
          </div>
        ) : currentQuestion ? (
          <>
            {/* Header de la pregunta */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <span className="text-2xl">{getCategoryIcon(currentQuestion.category)}</span>
                <span className="text-sm font-medium text-gray-600">
                  {currentQuestion.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Pregunta #{questionCount}
              </div>
            </div>

            {/* La pregunta */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed text-center">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Botón para revelar respuesta */}
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={handleRevealAnswer}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🔍 Revelar Respuesta
                </button>
              </div>
            ) : (
              /* Área de respuesta */
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">✅</span>
                  <h4 className="text-lg font-bold text-green-800">Respuesta:</h4>
                </div>
                <p className="text-lg text-green-900 leading-relaxed">
                  {currentQuestion.answer}
                </p>
              </div>
            )}

            {/* Botón para siguiente pregunta */}
            {showAnswer && (
              <div className="text-center mt-6">
                <button
                  onClick={loadNewQuestion}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  ➡️ Siguiente Pregunta
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤔</div>
            <p className="text-gray-500">No hay preguntas disponibles para esta época.</p>
          </div>
        )}
      </div>

      {/* Estadísticas de la sesión */}
      {questionCount > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-sky-600">
            📈 Tu sesión de trivia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">{questionCount}</div>
              <div className="text-sm text-blue-700">Preguntas vistas</div>
            </div>
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-sky-900">
                {decadeOptions.find(d => d.value === selectedDecade)?.label.split(' ')[0] || 'Todas'}
              </div>
              <div className="text-sm text-sky-700">Época actual</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-900">
                {currentQuestion ? currentQuestion.category : '---'}
              </div>
              <div className="text-sm text-indigo-700">Última categoría</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setQuestionCount(0);
                loadNewQuestion();
              }}
              className="text-sky-600 hover:text-sky-800 font-medium text-sm transition-colors"
            >
              🔄 Reiniciar contador
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-sky-800 mb-2">
            💡 ¿Sabías que...?
          </h4>
          <p className="text-sky-700 text-sm leading-relaxed">
            Esta trivia contiene <strong>1324 preguntas únicas</strong> basadas en partidos específicos del histórico de Sporting Cristal (1993-2025). Incluye resultados, días de la semana, goleadores (2000+) y torneos. 
            Las preguntas están categorizadas por décadas y dificultad para ofrecerte el mejor desafío.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Trivia;
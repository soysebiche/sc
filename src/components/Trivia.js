import React, { useState, useEffect } from 'react';
import { getRandomQuestion, getQuestionsByDecade } from '../data/triviaQuestions';
import { getTriviaCategoryIcon, getDifficultyIcon, getIcon } from '../utils/icons';
import { Button } from './ui';

function Trivia() {
  const [selectedDecade, setSelectedDecade] = useState('93-25');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Opciones de décadas con iconos
  const decadeOptions = [
    { value: '93-25', label: 'Todas las épocas', years: '1993-2025', icon: '⭐' },
    { value: '93-99', label: 'Era Dorada 90s', years: '1993-1999', icon: '💿' },
    { value: '00-10', label: 'Milenio 2000s', years: '2000-2010', icon: '📱' },
    { value: '11-20', label: 'Década 2010s', years: '2011-2020', icon: '📲' },
    { value: '21-25', label: 'Era Moderna', years: '2021-2025', icon: '🚀' },
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

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'fácil': return 'bg-green-100 text-green-700 border-green-200';
      case 'medio': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'difícil': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="py-6">
      {/* Header Premium */}
      <div className="text-center mb-8 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg mb-4">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="text-4xl font-bold gradient-text-celeste mb-2">
          Trivia Celeste
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Pon a prueba tus conocimientos sobre la historia de Sporting Cristal
        </p>
      </div>

      {/* Selector de Décadas */}
      <div className="card card-elevated p-6 mb-8 animate-fadeInUp stagger-1">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">
          {getIcon('calendar')} Selecciona la época
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {decadeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDecadeChange(option.value)}
              className={`relative p-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                selectedDecade === option.value
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-sky-50 hover:text-sky-700 border border-gray-200'
              }`}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="block font-semibold">{option.label}</span>
              <span className={`text-xs ${selectedDecade === option.value ? 'text-sky-100' : 'text-gray-500'}`}>
                {option.years}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <span className="badge badge-primary">
            {getIcon('database')} {getQuestionsByDecade(selectedDecade).length} preguntas disponibles
          </span>
        </div>
      </div>

      {/* Área de la Pregunta */}
      <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 mb-6 border border-sky-100 animate-fadeInUp stagger-2">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-sky-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sky-600 font-medium animate-pulse">Preparando pregunta...</p>
          </div>
        ) : currentQuestion ? (
          <>
            {/* Header de la pregunta */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-sky-100">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <span className="text-3xl">{getTriviaCategoryIcon(currentQuestion.category)}</span>
                <div>
                  <span className="text-sm font-semibold text-gray-600 block">
                    {currentQuestion.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyStyles(currentQuestion.difficulty)}`}>
                    {getDifficultyIcon(currentQuestion.difficulty)} {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Pregunta</span>
                <span className="badge badge-primary text-base px-3">#{questionCount}</span>
              </div>
            </div>

            {/* La pregunta */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-sky-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed text-center">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Botón para revelar respuesta */}
            {!showAnswer ? (
              <div className="text-center">
                <Button
                  variant="primary"
                  size="xl"
                  icon="search"
                  onClick={handleRevealAnswer}
                  className="shadow-xl hover:shadow-2xl"
                >
                  Revelar Respuesta
                </Button>
              </div>
            ) : (
              /* Área de respuesta */
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6 animate-fadeInUp">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">✅</span>
                  <h4 className="text-xl font-bold text-green-800">Respuesta Correcta</h4>
                </div>
                <p className="text-lg text-green-900 leading-relaxed font-medium">
                  {currentQuestion.answer}
                </p>
              </div>
            )}

            {/* Botón para siguiente pregunta */}
            {showAnswer && (
              <div className="text-center mt-6 animate-fadeInUp">
                <Button
                  variant="success"
                  size="lg"
                  icon="arrow-right"
                  iconPosition="right"
                  onClick={loadNewQuestion}
                >
                  Siguiente Pregunta
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">🤔</div>
            <p className="text-gray-500 text-lg">No hay preguntas disponibles para esta época.</p>
          </div>
        )}
      </div>

      {/* Estadísticas de la sesión */}
      {questionCount > 0 && (
        <div className="card card-elevated p-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">
            {getIcon('chart')} Tu sesión de trivia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBadge 
              icon={getIcon('document')} 
              value={questionCount} 
              label="Preguntas vistas" 
              color="blue"
            />
            <StatBadge 
              icon={decadeOptions.find(d => d.value === selectedDecade)?.icon} 
              value={decadeOptions.find(d => d.value === selectedDecade)?.label.split(' ')[0]} 
              label="Época actual" 
              color="sky"
            />
            <StatBadge 
              icon={getTriviaCategoryIcon(currentQuestion?.category)} 
              value={currentQuestion?.category || '---'} 
              label="Última categoría" 
              color="indigo"
            />
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setQuestionCount(0);
                loadNewQuestion();
              }}
              className="btn btn-ghost"
            >
              {getIcon('refresh')} Reiniciar contador
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 rounded-2xl p-6 border border-sky-200 animate-fadeInUp">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="text-lg font-bold text-sky-800 mb-2">
              ¿Sabías que...?
            </h4>
            <p className="text-sky-700 text-sm leading-relaxed">
              Esta trivia contiene <strong>1,324 preguntas únicas</strong> basadas en partidos específicos 
              del histórico de Sporting Cristal (1993-2025). Incluye resultados, días de la semana, 
              goleadores y torneos, categorizadas por décadas y dificultad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para estadísticas
function StatBadge({ icon, value, label, color }) {
  const colors = {
    blue: 'from-blue-100 to-blue-200 text-blue-800',
    sky: 'from-sky-100 to-sky-200 text-sky-800',
    indigo: 'from-indigo-100 to-indigo-200 text-indigo-800',
    green: 'from-green-100 to-green-200 text-green-800',
    purple: 'from-violet-100 to-violet-200 text-violet-800',
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold truncate">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}

export default Trivia;

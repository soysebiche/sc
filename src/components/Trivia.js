import React, { useState, useEffect, useCallback } from 'react';
import { getRandomQuestion, getQuestionsByDecade } from '../data/triviaQuestions';
import { getIcon } from '../utils/icons';
import { Card } from './ui';

function Trivia() {
  const [selectedDecade, setSelectedDecade] = useState('93-25');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const decadeOptions = [
    { value: '93-25', label: 'Todas las épocas', years: '1993-2025', icon: '⭐' },
    { value: '93-99', label: 'Era Dorada 90s', years: '1993-1999', icon: '💿' },
    { value: '00-10', label: 'Milenio 2000s', years: '2000-2010', icon: '📱' },
    { value: '11-20', label: 'Década 2010s', years: '2011-2020', icon: '📲' },
    { value: '21-25', label: 'Era Moderna', years: '2021-2025', icon: '🚀' },
  ];

  const difficultyStyles = {
    'fácil': 'badge-win',
    'medio': 'badge-draw',
    'difícil': 'badge-loss',
  };

  const loadNewQuestion = useCallback(() => {
    setIsLoading(true);
    setShowAnswer(false);
    
    setTimeout(() => {
      const newQuestion = getRandomQuestion(selectedDecade);
      setCurrentQuestion(newQuestion);
      setQuestionCount(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  }, [selectedDecade]);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const handleDecadeChange = (decade) => {
    setSelectedDecade(decade);
    setQuestionCount(0);
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg mb-4">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="title-section mb-2">
          Trivia Celeste
        </h2>
        <p className="text-body-lg max-w-md mx-auto">
          Pon a prueba tus conocimientos sobre la historia de Sporting Cristal
        </p>
      </div>

      {/* Selector de Décadas */}
      <Card variant="elevated" className="p-6 mb-8">
        <h3 className="text-label text-center mb-4">
          {getIcon('calendar')} SELECCIONA LA ÉPOCA
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {decadeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDecadeChange(option.value)}
              className={`p-4 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer ${
                selectedDecade === option.value
                  ? 'bg-gradient-to-br from-celeste to-celeste-dark text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-celeste-soft hover:text-celeste border border-gray-200'
              }`}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="block font-semibold font-editorial">{option.label}</span>
              <span className={`text-xs ${selectedDecade === option.value ? 'text-white/70' : 'text-gray-500'}`}>
                {option.years}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <span className="badge badge-celeste">
            {getIcon('database')} {getQuestionsByDecade(selectedDecade).length} preguntas disponibles
          </span>
        </div>
      </Card>

      {/* Área de la Pregunta */}
      <Card variant="glass" className="p-8 mb-6">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-celeste font-medium">Preparando pregunta...</p>
          </div>
        ) : currentQuestion ? (
          <>
            {/* Header de la pregunta */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <span className="text-3xl">{currentQuestion.categoryIcon || getIcon('question')}</span>
                <div>
                  <span className="text-sm font-semibold text-gray-600 block">
                    {currentQuestion.category}
                  </span>
                  <span className={`badge ${difficultyStyles[currentQuestion.difficulty]}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Pregunta</span>
                <span className="badge badge-celeste">#{questionCount}</span>
              </div>
            </div>

            {/* La pregunta */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed text-center font-editorial">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Botón para revelar respuesta */}
            {!showAnswer ? (
              <div className="text-center">
                <button
                  onClick={handleRevealAnswer}
                  className="btn btn-primary btn-xl"
                >
                  {getIcon('search')} Revelar Respuesta
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">✅</span>
                    <h4 className="text-lg font-bold text-emerald-800">Respuesta Correcta</h4>
                  </div>
                  <p className="text-lg text-emerald-900 leading-relaxed font-medium">
                    {currentQuestion.answer}
                  </p>
                </div>
                
                {currentQuestion.explanation && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}

            {/* Botón para siguiente pregunta */}
            {showAnswer && (
              <div className="text-center mt-6">
                <button
                  onClick={loadNewQuestion}
                  className="btn btn-win btn-lg"
                >
                  {getIcon('arrow-right')} Siguiente Pregunta
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-500 text-lg">No hay preguntas disponibles para esta época.</p>
          </div>
        )}
      </Card>

      {/* Estadísticas de la sesión */}
      {questionCount > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-label text-center mb-4">
            {getIcon('chart')} TU SESIÓN DE TRIVIA
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
              icon={currentQuestion?.categoryIcon || getIcon('question')} 
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
              className="btn btn-tertiary"
            >
              {getIcon('refresh')} Reiniciar contador
            </button>
          </div>
        </Card>
      )}

      {/* Información adicional */}
      <Card variant="glass" className="mt-8 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="text-lg font-bold text-biscay mb-2">
              ¿Sabías que...?
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Esta trivia contiene <strong>1,324 preguntas únicas</strong> basadas en partidos específicos 
              del histórico de Sporting Cristal (1993-2025). Incluye resultados, días de la semana, 
              goleadores y torneos, categorizadas por décadas y dificultad.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBadge({ icon, value, label, color }) {
  const colors = {
    blue: 'from-blue-100 to-blue-200 text-blue-800',
    sky: 'from-sky-100 to-sky-200 text-sky-800',
    indigo: 'from-indigo-100 to-indigo-200 text-indigo-800',
    green: 'from-emerald-100 to-emerald-200 text-emerald-800',
    purple: 'from-violet-100 to-violet-200 text-violet-800',
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold font-editorial truncate">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}

export default Trivia;

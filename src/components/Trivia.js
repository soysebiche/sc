import React, { useState, useEffect, useCallback } from 'react';
import { getRandomQuestion, getQuestionsByDecade } from '../data/triviaQuestions';
import { Card } from './ui';

function Trivia() {
  const [selectedDecade, setSelectedDecade] = useState('93-25');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const decadeOptions = [
    { value: '93-25', label: 'Todas las epocas', years: '1993-2025' },
    { value: '93-99', label: 'Era Dorada 90s', years: '1993-1999' },
    { value: '00-10', label: 'Milenio 2000s', years: '2000-2010' },
    { value: '11-20', label: 'Decada 2010s', years: '2011-2020' },
    { value: '21-25', label: 'Era Moderna', years: '2021-2025' },
  ];

  const difficultyStyles = {
    'facil': 'bg-green-100 text-green-700',
    'medio': 'bg-yellow-100 text-yellow-700',
    'dificil': 'bg-red-100 text-red-700',
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1B265C] mb-2">Trivia Celeste</h2>
        <p className="text-gray-600">Pon a prueba tus conocimientos sobre la historia de Sporting Cristal</p>
      </div>

      {/* Selector de Decadas */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-[#3CBEEF] uppercase tracking-wider text-center mb-4">Selecciona la epoca</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {decadeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDecadeChange(option.value)}
              className={`p-4 rounded-lg font-medium text-sm transition-all ${
                selectedDecade === option.value
                  ? 'bg-[#3CBEEF] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block font-bold">{option.label}</span>
              <span className={`text-xs ${selectedDecade === option.value ? 'text-white/70' : 'text-gray-500'}`}>
                {option.years}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 bg-[#3CBEEF]/10 text-[#3CBEEF] rounded-full text-sm">
            {getQuestionsByDecade(selectedDecade).length} preguntas disponibles
          </span>
        </div>
      </Card>

      {/* Area de la Pregunta */}
      <Card className="p-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#3CBEEF]/20 border-t-[#3CBEEF] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#3CBEEF] font-medium">Preparando pregunta...</p>
          </div>
        ) : currentQuestion ? (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{currentQuestion.category}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${difficultyStyles[currentQuestion.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Pregunta #{questionCount}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <p className="text-xl font-bold text-gray-900 text-center">{currentQuestion.question}</p>
            </div>

            {!showAnswer ? (
              <div className="text-center">
                <button onClick={handleRevealAnswer} className="btn btn-primary btn-lg"
                >
                  Revelar Respuesta
                </button>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-bold text-green-800 mb-2">Respuesta Correcta</h4>
                  <p className="text-lg text-green-900 font-medium">{currentQuestion.answer}</p>
                </div>
                
                {currentQuestion.explanation && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}

            {showAnswer && (
              <div className="text-center mt-6">
                <button onClick={loadNewQuestion} className="btn btn-primary btn-lg"
                >
                  Siguiente Pregunta
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay preguntas disponibles para esta epoca.</p>
          </div>
        )}
      </Card>

      {questionCount > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[#3CBEEF] uppercase tracking-wider text-center mb-4">Tu sesion de trivia</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-800">{questionCount}</p>
              <p className="text-sm text-blue-600">Preguntas vistas</p>
            </div>
            
            <div className="bg-sky-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-sky-800">{decadeOptions.find(d => d.value === selectedDecade)?.label}</p>
              <p className="text-sm text-sky-600">Epoca actual</p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-800">{currentQuestion?.category || '---'}</p>
              <p className="text-sm text-indigo-600">Ultima categoria</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => { setQuestionCount(0); loadNewQuestion(); }} className="text-gray-500 hover:text-gray-700"
            >
              Reiniciar contador
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Trivia;

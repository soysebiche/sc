/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         COMPONENTE CARD PREMIUM 2026                         ║
 * ║         Sporting Cristal Stats Viewer                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { getResultIcon } from '../../utils/icons';

/**
 * Componente Card base
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.variant - Variante visual: 'default' | 'elevated' | 'glass' | 'victory' | 'defeat' | 'draw'
 * @param {boolean} props.isHoverable - Tiene efecto hover
 * @param {boolean} props.isAnimated - Tiene animación de entrada
 * @param {string} props.className - Clases CSS adicionales
 */
const Card = ({
  children,
  variant = 'default',
  isHoverable = true,
  isAnimated = true,
  animationDelay = 0,
  className = '',
  ...rest
}) => {
  const baseClasses = 'card';
  
  const variantClasses = {
    default: '',
    elevated: 'card-elevated',
    glass: 'card-glass',
    victory: 'card-victory',
    defeat: 'card-defeat',
    draw: 'card-draw',
  };
  
  const hoverClass = isHoverable ? 'card-hover' : '';
  const animateClass = isAnimated ? `animate-fadeInUp stagger-${Math.min(animationDelay + 1, 5)}` : '';
  
  const cardClasses = [
    baseClasses,
    variantClasses[variant] || '',
    hoverClass,
    animateClass,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card de partido con estructura predefinida
 */
export const MatchCard = ({
  match,
  result,
  showGoals = true,
  className = '',
  ...rest
}) => {
  const resultClass = result === 'Victoria' ? 'victory' : 
                     result === 'Derrota' ? 'defeat' : 'draw';
  
  const resultColors = {
    victory: 'bg-green-100 border-green-500',
    defeat: 'bg-red-100 border-red-500',
    draw: 'bg-yellow-100 border-yellow-500',
  };
  
  const resultBadgeColors = {
    victory: 'bg-green-200 text-green-800',
    defeat: 'bg-red-200 text-red-800',
    draw: 'bg-yellow-200 text-yellow-800',
  };
  
  return (
    <Card variant={resultClass} className={`p-4 ${className}`} {...rest}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">
          {match.year || match.Año || 'TBD'} • {match.tournament || match.Torneo}
        </p>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultBadgeColors[resultClass]}`}>
          {getResultIcon(result)} {result}
        </span>
      </div>
      
      <p className="font-bold text-lg">
        {match.homeTeam || match["Equipo Local"]} 
        <span className="font-normal text-gray-400 mx-2">vs</span>
        {match.awayTeam || match["Equipo Visita"]}
      </p>
      
      <p className="text-3xl font-bold text-center my-3 gradient-text-celeste">
        {match.score || match.Marcador}
      </p>
      
      {showGoals && match.goals && match.goals !== '-' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Goles SC</p>
          <p className="text-sm text-gray-700">{match.goals || match["Goles (Solo SC)"]}</p>
        </div>
      )}
    </Card>
  );
};

/**
 * Card de estadística con icono y valor
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
  isAnimated = true,
  animationDelay = 0,
  className = '',
}) => {
  const colorSchemes = {
    primary: 'from-sky-100 to-sky-200 text-sky-800',
    success: 'from-green-100 to-green-200 text-green-800',
    error: 'from-red-100 to-red-200 text-red-800',
    warning: 'from-yellow-100 to-yellow-200 text-yellow-800',
    purple: 'from-violet-100 to-violet-200 text-violet-800',
    pink: 'from-pink-100 to-pink-200 text-pink-800',
    orange: 'from-orange-100 to-orange-200 text-orange-800',
    cyan: 'from-cyan-100 to-cyan-200 text-cyan-800',
  };
  
  const trendIcons = {
    up: '📈',
    down: '📉',
    flat: '➡️',
  };
  
  const animateClass = isAnimated ? `animate-scaleIn stagger-${Math.min(animationDelay + 1, 5)}` : '';
  
  return (
    <div className={`bg-gradient-to-br ${colorSchemes[color]} rounded-xl p-5 text-center shadow-lg ${animateClass} ${className}`}>
      {icon && (
        <div className="text-3xl mb-2">{icon}</div>
      )}
      <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
        {title}
      </h4>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-xs mt-1 opacity-75">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-2 text-xs font-medium">
          {trendIcons[trend]} {trendValue}
        </div>
      )}
    </div>
  );
};

/**
 * Card de trivia
 */
export const TriviaCard = ({
  question,
  category,
  difficulty,
  showAnswer = false,
  answer,
  onReveal,
  onNext,
  className = '',
}) => {
  const difficultyColors = {
    'fácil': 'bg-green-100 text-green-800',
    'medio': 'bg-yellow-100 text-yellow-800',
    'difícil': 'bg-red-100 text-red-800',
  };
  
  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-2xl">{category?.icon}</span>
        <span className="text-sm font-medium text-gray-600">{category?.name}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'}`}>
          {difficulty}
        </span>
      </div>
      
      {/* Question */}
      <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 text-center leading-relaxed">
          {question}
        </h3>
      </div>
      
      {/* Actions */}
      {!showAnswer ? (
        <div className="text-center">
          <button
            onClick={onReveal}
            className="btn btn-primary btn-lg"
          >
            🔍 Revelar Respuesta
          </button>
        </div>
      ) : (
        <>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 mb-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">✅</span>
              <h4 className="text-lg font-bold text-green-800">Respuesta:</h4>
            </div>
            <p className="text-lg text-green-900 leading-relaxed">{answer}</p>
          </div>
          
          {onNext && (
            <div className="text-center">
              <button
                onClick={onNext}
                className="btn btn-success btn-lg"
              >
                ➡️ Siguiente Pregunta
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default Card;

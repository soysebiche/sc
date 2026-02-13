/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         CARD COMPONENT - Editorial Luxury Style                  ║
 * ║         Cristal Archive 2026                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import PropTypes from 'prop-types';

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
    dark: 'card-dark',
    win: 'card-win',
    loss: 'card-loss',
    draw: 'card-draw',
    highlight: 'card-highlight',
  };
  
  const hoverClass = isHoverable ? 'card-hover' : '';
  const animateClass = isAnimated 
    ? `animate-fadeInUp stagger-${Math.min(animationDelay + 1, 5)}` 
    : '';
  
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

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'glass', 'dark', 'win', 'loss', 'draw', 'highlight']),
  isHoverable: PropTypes.bool,
  isAnimated: PropTypes.bool,
  animationDelay: PropTypes.number,
  className: PropTypes.string,
};

// Match Card Component
export const MatchCard = ({
  match,
  result,
  showGoals = true,
  isAnimated = true,
  animationDelay = 0,
  className = '',
  ...rest
}) => {
  const getResultVariant = (result) => {
    switch (result) {
      case 'Victoria': return 'win';
      case 'Derrota': return 'loss';
      case 'Empate': return 'draw';
      default: return 'default';
    }
  };
  
  const getResultBadgeClass = (result) => {
    switch (result) {
      case 'Victoria': return 'badge-win';
      case 'Derrota': return 'badge-loss';
      case 'Empate': return 'badge-draw';
      default: return 'badge-celeste';
    }
  };
  
  const resultVariant = getResultVariant(result);
  const badgeClass = getResultBadgeClass(result);
  
  return (
    <Card 
      variant={resultVariant}
      isHoverable={true}
      isAnimated={isAnimated}
      animationDelay={animationDelay}
      className={`match-card ${className}`}
      {...rest}
    >
      <div className="match-card-content">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-label">
            {match.year || match.Año || 'TBD'} • {match.tournament || match.Torneo}
          </div>
          <span className={`badge ${badgeClass}`}>
            {result}
          </span>
        </div>
        
        {/* Teams */}
        <h3 className="title-card mb-4">
          {match.homeTeam || match["Equipo Local"]}
          <span className="mx-2 text-gray-400 font-normal">vs</span>
          {match.awayTeam || match["Equipo Visita"]}
        </h3>
        
        {/* Score */}
        <div className="match-score">
          {match.score || match.Marcador}
        </div>
        
        {/* Goals */}
        {showGoals && match.goals && match.goals !== '-' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-label mb-2">Goles SC</p>
            <p className="text-body-sm">{match.goals || match["Goles (Solo SC)"]}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

MatchCard.propTypes = {
  match: PropTypes.object.isRequired,
  result: PropTypes.oneOf(['Victoria', 'Derrota', 'Empate']),
  showGoals: PropTypes.bool,
  isAnimated: PropTypes.bool,
  animationDelay: PropTypes.number,
  className: PropTypes.string,
};

// Stat Card Component
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
    success: 'from-emerald-100 to-emerald-200 text-emerald-800',
    error: 'from-red-100 to-red-200 text-red-800',
    warning: 'from-amber-100 to-amber-200 text-amber-800',
    purple: 'from-violet-100 to-violet-200 text-violet-800',
    pink: 'from-pink-100 to-pink-200 text-pink-800',
    orange: 'from-orange-100 to-orange-200 text-orange-800',
    cyan: 'from-cyan-100 to-cyan-200 text-cyan-800',
    indigo: 'from-indigo-100 to-indigo-200 text-indigo-800',
    rose: 'from-rose-100 to-rose-200 text-rose-800',
    teal: 'from-teal-100 to-teal-200 text-teal-800',
    emerald: 'from-emerald-100 to-emerald-200 text-emerald-800',
    blue: 'from-blue-100 to-blue-200 text-blue-800',
    violet: 'from-violet-100 to-violet-200 text-violet-800',
  };
  
  const trendIcons = {
    up: '📈',
    down: '📉',
    flat: '➡️',
  };
  
  const animateClass = isAnimated 
    ? `animate-scaleIn stagger-${Math.min(animationDelay + 1, 5)}` 
    : '';
  
  return (
    <div 
      className={`bg-gradient-to-br ${colorSchemes[color]} rounded-2xl p-6 text-center shadow-lg ${animateClass} ${className}`}
    >
      {icon && (
        <div className="text-3xl mb-3">{icon}</div>
      )}
      <h4 className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2">
        {title}
      </h4>
      
      <div className="text-4xl font-bold font-editorial mb-1">
        {value}
      </div>
      
      {subtitle && (
        <p className="text-sm opacity-75">{subtitle}</p>
      )}
      
      {trend && (
        <div className="mt-3 text-sm font-medium">
          {trendIcons[trend]} {trendValue}
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down', 'flat']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf([
    'primary', 'success', 'error', 'warning', 'purple', 'pink', 
    'orange', 'cyan', 'indigo', 'rose', 'teal', 'emerald', 'blue', 'violet'
  ]),
  isAnimated: PropTypes.bool,
  animationDelay: PropTypes.number,
  className: PropTypes.string,
};

// Trivia Card Component
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
  const difficultyBadges = {
    'fácil': 'badge-win',
    'medio': 'badge-draw',
    'difícil': 'badge-loss',
  };
  
  return (
    <Card variant="glass" className={`p-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-2xl">{category?.icon}</span>
        <span className="text-sm font-medium text-gray-600">
          {category?.name}
        </span>
        <span className={`badge ${difficultyBadges[difficulty] || 'badge-celeste'}`}>
          {difficulty}
        </span>
      </div>
      
      {/* Question */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
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
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">✅</span>
              <h4 className="text-lg font-bold text-emerald-800">Respuesta:</h4>
            </div>
            <p className="text-lg text-emerald-900 leading-relaxed">{answer}</p>
          </div>
          
          {onNext && (
            <div className="text-center">
              <button
                onClick={onNext}
                className="btn btn-win btn-lg"
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

TriviaCard.propTypes = {
  question: PropTypes.string.isRequired,
  category: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
  }),
  difficulty: PropTypes.oneOf(['fácil', 'medio', 'difícil']),
  showAnswer: PropTypes.bool,
  answer: PropTypes.string,
  onReveal: PropTypes.func,
  onNext: PropTypes.func,
  className: PropTypes.string,
};

export default Card;

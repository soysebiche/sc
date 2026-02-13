/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         BADGE COMPONENT - Editorial Luxury Style                 ║
 * ║         Cristal Archive 2026                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
  children,
  variant = 'celeste',
  size = 'md',
  icon,
  className = '',
  ...rest
}) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    celeste: 'badge-celeste',
    biscay: 'badge-biscay',
    win: 'badge-win',
    loss: 'badge-loss',
    draw: 'badge-draw',
    glass: 'badge-glass',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: '',
    lg: 'text-sm px-4 py-2',
  };
  
  const badgeClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.celeste,
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <span className={badgeClasses} {...rest}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['celeste', 'biscay', 'win', 'loss', 'draw', 'glass']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default Badge;

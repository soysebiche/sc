/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         BUTTON COMPONENT - Editorial Luxury Style                ║
 * ║         Cristal Archive 2026                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  isFullWidth = false,
  isDisabled = false,
  hasRipple = true,
  onClick,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = 'btn';
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
    dark: 'btn-dark',
    win: 'btn-win',
    loss: 'btn-loss',
    draw: 'btn-draw',
    glass: 'btn-glass',
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };
  
  // State classes
  const stateClasses = [
    isLoading && 'btn-loading',
    isFullWidth && 'btn-full',
    hasRipple && 'btn-ripple',
  ].filter(Boolean).join(' ');
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {iconPosition === 'left' && icon && !isLoading && (
        <span className="btn-icon-content">{icon}</span>
      )}
      {children}
      {iconPosition === 'right' && icon && !isLoading && (
        <span className="btn-icon-content">{icon}</span>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'dark', 'win', 'loss', 'draw', 'glass']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  isLoading: PropTypes.bool,
  isFullWidth: PropTypes.bool,
  isDisabled: PropTypes.bool,
  hasRipple: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

// Icon Button Component
export const IconButton = ({
  icon,
  variant = 'tertiary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  hasRipple = true,
  onClick,
  className = '',
  ariaLabel,
  ...rest
}) => {
  const baseClasses = 'btn btn-icon';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
    dark: 'btn-dark',
    glass: 'btn-glass',
  };
  
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  const stateClasses = [
    isLoading && 'btn-loading',
    hasRipple && 'btn-ripple',
  ].filter(Boolean).join(' ');
  
  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.tertiary,
    sizeClasses[size],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      aria-label={ariaLabel}
      {...rest}
    >
      {!isLoading && icon}
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'dark', 'glass']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  hasRipple: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
};

// Button Group Component
export const ButtonGroup = ({
  children,
  attached = false,
  className = '',
}) => {
  const groupClasses = [
    'btn-group',
    attached && 'btn-group-attached',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={groupClasses} role="group">
      {children}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  attached: PropTypes.bool,
  className: PropTypes.string,
};

// Toggle Button Component
export const ToggleButton = ({
  children,
  isActive = false,
  activeVariant = 'primary',
  inactiveVariant = 'secondary',
  size = 'md',
  icon,
  iconActive,
  onToggle,
  className = '',
  ...rest
}) => {
  const handleClick = () => {
    onToggle?.(!isActive);
  };
  
  const currentIcon = isActive && iconActive ? iconActive : icon;
  
  return (
    <Button
      variant={isActive ? activeVariant : inactiveVariant}
      size={size}
      icon={currentIcon}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
};

ToggleButton.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  activeVariant: PropTypes.string,
  inactiveVariant: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  icon: PropTypes.node,
  iconActive: PropTypes.node,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};

export default Button;

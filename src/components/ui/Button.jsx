/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         COMPONENTE BUTTON PREMIUM 2026                       ║
 * ║         Sporting Cristal Stats Viewer                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { getIcon } from '../../utils/icons';

/**
 * Componente Button profesional con múltiples variantes y estados
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} props.variant - Variante visual: 'primary' | 'secondary' | 'success' | 'error' | 'ghost' | 'glass'
 * @param {string} props.size - Tamaño: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.icon - Nombre del icono (del sistema de iconos)
 * @param {string} props.iconPosition - Posición del icono: 'left' | 'right'
 * @param {boolean} props.isLoading - Estado de carga
 * @param {boolean} props.isFullWidth - Ocupa todo el ancho disponible
 * @param {boolean} props.isDisabled - Estado deshabilitado
 * @param {boolean} props.hasRipple - Efecto ripple al hacer click
 * @param {Function} props.onClick - Handler del click
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.rest - Props adicionales
 */
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
  // Construir clases base
  const baseClasses = 'btn';
  
  // Clases de variante
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    error: 'btn-error',
    ghost: 'btn-ghost',
    glass: 'btn-glass',
  };
  
  // Clases de tamaño
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };
  
  // Estados
  const stateClasses = [
    isLoading && 'btn-loading',
    isFullWidth && 'btn-full',
    hasRipple && 'btn-ripple',
  ].filter(Boolean).join(' ');
  
  // Combinar todas las clases
  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');
  
  // Obtener el icono
  const iconContent = icon && !isLoading ? (
    <span className="btn-icon-content" aria-hidden="true">
      {getIcon(icon)}
    </span>
  ) : null;
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {iconPosition === 'left' && iconContent}
      {children}
      {iconPosition === 'right' && iconContent}
    </button>
  );
};

/**
 * Botón de Icono (solo icono, sin texto)
 */
export const IconButton = ({
  icon,
  variant = 'ghost',
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
    success: 'btn-success',
    error: 'btn-error',
    ghost: 'btn-ghost',
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
    variantClasses[variant] || variantClasses.ghost,
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
      {!isLoading && <span aria-hidden="true">{getIcon(icon)}</span>}
    </button>
  );
};

/**
 * Grupo de botones
 */
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

/**
 * Botón con estado de toggle
 */
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

export default Button;

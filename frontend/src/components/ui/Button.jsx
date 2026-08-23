import React from 'react';

/**
 * Reusable Button component.
 * @param {string} variant - primary | secondary | danger | ghost
 * @param {string} size - sm | md | lg
 * @param {boolean} fullWidth - Set to true for 100% width
 * @param {boolean} isLoading - Shows loading state and disables button
 * @param {React.ReactNode} icon - Optional FontAwesome icon node
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  isLoading = false, 
  icon = null,
  as: Component = 'button',
  className = '',
  disabled,
  style,
  ...props 
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-size-${size}`;
  const widthClass = fullWidth ? 'btn-full-width' : '';
  const loadingClass = isLoading ? 'btn-loading' : '';
  
  const combinedClasses = [
    baseClass, 
    variantClass, 
    sizeClass, 
    widthClass, 
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={combinedClasses} 
      disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading ? (
        <>
          <i className="fa-solid fa-circle-notch fa-spin btn-icon"></i>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </Component>
  );
}

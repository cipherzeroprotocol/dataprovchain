import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '../../contexts/ThemeContext';

// Define variants with theme awareness
const getVariants = (isDark) => ({
  success: isDark 
    ? 'bg-green-900 border-green-700 text-green-100' 
    : 'bg-green-50 border-green-400 text-green-800',
  error: isDark 
    ? 'bg-red-900 border-red-700 text-red-100' 
    : 'bg-red-50 border-red-400 text-red-800',
  warning: isDark 
    ? 'bg-yellow-900 border-yellow-700 text-yellow-100' 
    : 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: isDark 
    ? 'bg-blue-900 border-blue-700 text-blue-100' 
    : 'bg-blue-50 border-blue-400 text-blue-800'
});

// Define icon classes with theme awareness
const getIconClasses = (isDark) => ({
  success: isDark ? 'text-green-300' : 'text-green-400',
  error: isDark ? 'text-red-300' : 'text-red-400',
  warning: isDark ? 'text-yellow-300' : 'text-yellow-400',
  info: isDark ? 'text-blue-300' : 'text-blue-400'
});

const Alert = ({
  variant = 'info',
  title,
  children,
  className = '',
  dismissible = false,
  onDismiss,
  icon
}) => {
  // Get theme context
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme.name === 'dark' || 
    (theme.name === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Get theme-aware styles
  const variants = getVariants(isDarkMode);
  const iconClasses = getIconClasses(isDarkMode);

  // Default icons based on variant
  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const displayIcon = icon || getDefaultIcon();

  // Apply theme-specific dismiss button styles
  const getDismissButtonClasses = () => {
    if (isDarkMode) {
      switch (variant) {
        case 'success': return 'bg-green-800 text-green-200 hover:bg-green-700 focus:ring-green-700';
        case 'error': return 'bg-red-800 text-red-200 hover:bg-red-700 focus:ring-red-700';
        case 'warning': return 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700 focus:ring-yellow-700';
        default: return 'bg-blue-800 text-blue-200 hover:bg-blue-700 focus:ring-blue-700';
      }
    } else {
      switch (variant) {
        case 'success': return 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600';
        case 'error': return 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600';
        case 'warning': return 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600';
        default: return 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600';
      }
    }
  };

  return (
    <div className={`rounded-md border p-4 ${variants[variant]} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={iconClasses[variant]}>
            {displayIcon}
          </div>
        </div>
        <div className="ml-3 flex-grow">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'ring-offset-gray-800 focus:ring-offset-2' : 'ring-offset-white focus:ring-offset-2'
                } ${getDismissButtonClasses()}`}
                onClick={onDismiss}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  icon: PropTypes.node
};

export default Alert;

import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  // Size mapping
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color mapping
  const colorMap = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-teal-500'
  };

  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} border-t-2 ${colorClass} rounded-full animate-spin`}></div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  className: PropTypes.string
};

export default Spinner;

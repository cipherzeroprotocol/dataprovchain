import React from 'react';
import PropTypes from 'prop-types';

const Select = ({
  children,
  className = '',
  error = '',
  ...props
}) => {
  return (
    <div>
      <select
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 
          sm:text-sm bg-white
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  error: PropTypes.string
};

export default Select;

import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  className = '',
  error = '',
  ...props
}) => {
  return (
    <div>
      <input
        type={type}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 
          sm:text-sm
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string
};

export default Input;

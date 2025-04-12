import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  width = 'w-48',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const alignmentClasses = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`origin-top-right absolute ${alignmentClasses} mt-2 ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
        >
          <div 
            className="py-1" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.string,
  className: PropTypes.string
};

// Dropdown Item Component
export const DropdownItem = ({ children, onClick, disabled = false, className = '' }) => {
  return (
    <button
      className={`block w-full text-left px-4 py-2 text-sm ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Dropdown;

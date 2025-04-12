import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg 
                  className="flex-shrink-0 h-5 w-5 text-gray-400 mx-1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              
              {isLast ? (
                <span className="text-sm font-medium text-gray-500" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href} 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string
    })
  ).isRequired,
  className: PropTypes.string
};

export default Breadcrumbs;

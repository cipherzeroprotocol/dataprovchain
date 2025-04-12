import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiPlus, FiGrid, FiList } from 'react-icons/fi';
import Button from '../common/Button';

const MarketplaceLayout = ({
  children,
  showCreateButton = true,
  showViewToggle = false,
  currentView = 'grid',
  onViewChange,
  title = 'Marketplace',
  subtitle = 'Discover and purchase high-quality datasets for AI and analytics'
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {showViewToggle && (
            <div className="bg-gray-100 rounded-md p-1 flex">
              <button
                type="button"
                onClick={() => onViewChange('grid')}
                className={`p-1.5 rounded-md ${
                  currentView === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded-md ${
                  currentView === 'list'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {showCreateButton && (
            <Link to="/marketplace/create">
              <Button
                variant="primary"
                leftIcon={<FiPlus className="mr-1" />}
              >
                Create Dataset
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
};

MarketplaceLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showCreateButton: PropTypes.bool,
  showViewToggle: PropTypes.bool,
  currentView: PropTypes.oneOf(['grid', 'list']),
  onViewChange: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

export default MarketplaceLayout;
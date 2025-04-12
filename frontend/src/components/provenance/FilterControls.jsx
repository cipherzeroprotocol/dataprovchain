import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import Datepicker from '../common/Datepicker';

/**
 * FilterControls Component
 * 
 * Provides UI controls for filtering provenance records by action type, 
 * date range, and actors (addresses)
 */
const FilterControls = ({ 
  filters, 
  setFilters, 
  onApplyFilters, 
  actionTypes = [],
  className = '' 
}) => {
  // Default action types if not provided
  const defaultActionTypes = actionTypes.length > 0 ? actionTypes : [
    'creation', 
    'modification', 
    'derivation', 
    'verification', 
    'transfer',
    'usage',
    'storage_confirmed',
    'storage_failed',
    'access'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      actionType: '',
      startDate: null,
      endDate: null,
      actor: '',
      searchQuery: ''
    });
    
    if (onApplyFilters) {
      onApplyFilters({
        actionType: '',
        startDate: null,
        endDate: null,
        actor: '',
        searchQuery: ''
      });
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  return (
    <Card title="Filter Provenance" className={className}>
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-1">
            Action Type
          </label>
          <Select
            id="actionType"
            value={filters.actionType || ''}
            onChange={e => handleFilterChange('actionType', e.target.value)}
            className="w-full"
          >
            <option value="">All Actions</option>
            {defaultActionTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Datepicker
              id="startDate"
              selected={filters.startDate}
              onChange={date => handleFilterChange('startDate', date)}
              placeholderText="From"
              maxDate={filters.endDate || new Date()}
              isClearable
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Datepicker
              id="endDate"
              selected={filters.endDate}
              onChange={date => handleFilterChange('endDate', date)}
              placeholderText="To"
              minDate={filters.startDate}
              maxDate={new Date()}
              isClearable
            />
          </div>
        </div>

        <div>
          <label htmlFor="actor" className="block text-sm font-medium text-gray-700 mb-1">
            Actor Address
          </label>
          <Input
            id="actor"
            type="text"
            value={filters.actor || ''}
            onChange={e => handleFilterChange('actor', e.target.value)}
            placeholder="0x..."
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            id="searchQuery"
            type="text"
            value={filters.searchQuery || ''}
            onChange={e => handleFilterChange('searchQuery', e.target.value)}
            placeholder="Search descriptions or metadata..."
            className="w-full"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <Button 
            variant="secondary" 
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApply}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

FilterControls.propTypes = {
  filters: PropTypes.shape({
    actionType: PropTypes.string,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    actor: PropTypes.string,
    searchQuery: PropTypes.string
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func,
  actionTypes: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

export default FilterControls;
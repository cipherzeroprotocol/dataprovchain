import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import RangeSlider from '../common/RangeSlider';
import LicenseSelector from './LicenseSelector';

const FilterSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  dataTypes = [],
  tags = [],
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  const handleTagToggle = (tag) => {
    const currentTags = localFilters.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleChange('tags', updatedTags);
  };
  
  const handleDataTypeToggle = (dataType) => {
    const currentTypes = localFilters.dataTypes || [];
    const updatedTypes = currentTypes.includes(dataType)
      ? currentTypes.filter(t => t !== dataType)
      : [...currentTypes, dataType];
    
    handleChange('dataTypes', updatedTypes);
  };
  
  const handleClear = () => {
    const emptyFilters = {
      search: '',
      dataTypes: [],
      tags: [],
      priceRange: [0, 100],
      licenses: [],
      verifiedOnly: false
    };
    setLocalFilters(emptyFilters);
    onClearFilters(emptyFilters);
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <Button 
          variant="text" 
          size="sm" 
          onClick={handleClear}
        >
          Clear All
        </Button>
      </div>
      
      {/* Verification Filter */}
      <Card title="Verification">
        <Checkbox
          id="verified-filter"
          label="Verified Datasets Only"
          checked={localFilters.verifiedOnly || false}
          onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
        />
      </Card>
      
      {/* Data Type Filter */}
      <Card title="Data Types">
        <div className="space-y-2">
          {dataTypes.map((type) => (
            <Checkbox
              key={type}
              id={`data-type-${type}`}
              label={type}
              checked={(localFilters.dataTypes || []).includes(type)}
              onChange={() => handleDataTypeToggle(type)}
            />
          ))}
          
          {!dataTypes.length && (
            <p className="text-sm text-gray-500">No data types available</p>
          )}
        </div>
      </Card>
      
      {/* Price Range Filter */}
      <Card title="Price Range (FIL)">
        <RangeSlider
          min={0}
          max={100}
          step={1}
          value={localFilters.priceRange || [0, 100]}
          onChange={(value) => handleChange('priceRange', value)}
        />
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{localFilters.priceRange?.[0] || 0} FIL</span>
          <span className="text-sm text-gray-600">{localFilters.priceRange?.[1] || 100} FIL</span>
        </div>
      </Card>
      
      {/* License Filter */}
      <Card title="Licenses">
        <LicenseSelector
          selectedLicenses={localFilters.licenses || []}
          onChange={(licenses) => handleChange('licenses', licenses)}
          multiple={true}
        />
      </Card>
      
      {/* Tags Filter */}
      <Card title="Tags">
        <div className="space-y-2">
          {tags.map((tag) => (
            <Checkbox
              key={tag}
              id={`tag-${tag}`}
              label={tag}
              checked={(localFilters.tags || []).includes(tag)}
              onChange={() => handleTagToggle(tag)}
            />
          ))}
          
          {!tags.length && (
            <p className="text-sm text-gray-500">No tags available</p>
          )}
        </div>
      </Card>
      
      <Button
        variant="primary"
        className="w-full"
        onClick={() => onFilterChange(localFilters)}
      >
        Apply Filters
      </Button>
    </div>
  );
};

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    dataTypes: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    priceRange: PropTypes.arrayOf(PropTypes.number),
    licenses: PropTypes.arrayOf(PropTypes.string),
    verifiedOnly: PropTypes.bool
  }),
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  dataTypes: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

FilterSidebar.defaultProps = {
  filters: {
    search: '',
    dataTypes: [],
    tags: [],
    priceRange: [0, 100],
    licenses: [],
    verifiedOnly: false
  },
  dataTypes: [],
  tags: []
};

export default FilterSidebar;
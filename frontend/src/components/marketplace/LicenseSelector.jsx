import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../common/Checkbox';
import Select from '../common/Select';

const COMMON_LICENSES = [
  { value: 'CC0', label: 'CC0 (Public Domain)' },
  { value: 'CC-BY', label: 'CC BY (Attribution)' },
  { value: 'CC-BY-SA', label: 'CC BY-SA (Attribution-ShareAlike)' },
  { value: 'CC-BY-NC', label: 'CC BY-NC (Attribution-NonCommercial)' },
  { value: 'CC-BY-ND', label: 'CC BY-ND (Attribution-NoDerivatives)' },
  { value: 'MIT', label: 'MIT License' },
  { value: 'APACHE', label: 'Apache License 2.0' },
  { value: 'CUSTOM', label: 'Custom License' }
];

const LicenseSelector = ({ 
  selectedLicenses, 
  onChange,
  multiple = false,
  className = ''
}) => {
  // If multiple selection is allowed, use checkboxes
  if (multiple) {
    return (
      <div className={`space-y-2 ${className}`}>
        {COMMON_LICENSES.map(license => (
          <Checkbox
            key={license.value}
            id={`license-${license.value}`}
            label={license.label}
            checked={selectedLicenses.includes(license.value)}
            onChange={() => {
              const newSelected = selectedLicenses.includes(license.value)
                ? selectedLicenses.filter(l => l !== license.value)
                : [...selectedLicenses, license.value];
              onChange(newSelected);
            }}
          />
        ))}
      </div>
    );
  }
  
  // If single selection, use a dropdown
  return (
    <Select
      className={className}
      options={COMMON_LICENSES}
      value={selectedLicenses[0] || ''}
      onChange={(e) => onChange([e.target.value])}
      placeholder="Select a license"
    />
  );
};

LicenseSelector.propTypes = {
  selectedLicenses: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  className: PropTypes.string
};

export default LicenseSelector;
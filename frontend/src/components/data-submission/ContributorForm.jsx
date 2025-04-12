import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Input from '../common/Input';
import { isValidAddress } from '../../utils/web3';

const ContributorForm = ({ contributors, onChange, error }) => {
  const [newContributor, setNewContributor] = useState({
    id: '',
    share: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleContributorChange = (index, field, value) => {
    const updatedContributors = [...contributors];
    
    if (field === 'share') {
      // Ensure share is a number between 0 and 100
      const shareValue = parseInt(value) || 0;
      updatedContributors[index].share = Math.min(Math.max(shareValue, 0), 100);
    } else {
      updatedContributors[index][field] = value;
    }
    
    onChange(updatedContributors);
  };

  const handleNewContributorChange = (field, value) => {
    setNewContributor({
      ...newContributor,
      [field]: value
    });
    setValidationError('');
  };

  const addContributor = () => {
    // Validate address
    if (!newContributor.id.trim() || !isValidAddress(newContributor.id.trim())) {
      setValidationError('Please enter a valid wallet address');
      return;
    }
    
    // Validate share
    const share = parseInt(newContributor.share) || 0;
    if (share <= 0) {
      setValidationError('Contribution share must be greater than 0');
      return;
    }
    
    // Add new contributor
    const updatedContributors = [
      ...contributors,
      {
        id: newContributor.id.trim(),
        share
      }
    ];
    
    onChange(updatedContributors);
    
    // Reset form
    setNewContributor({
      id: '',
      share: ''
    });
  };

  const removeContributor = (index) => {
    if (contributors.length <= 1) {
      setValidationError('At least one contributor is required');
      return;
    }
    
    const updatedContributors = contributors.filter((_, i) => i !== index);
    
    // Redistribute shares evenly if all contributors have equal share
    const isEqualShare = updatedContributors.every(c => c.share === updatedContributors[0].share);
    if (isEqualShare) {
      const newShare = Math.floor(100 / updatedContributors.length);
      const remainder = 100 - (newShare * updatedContributors.length);
      
      updatedContributors.forEach((c, i) => {
        c.share = newShare + (i < remainder ? 1 : 0);
      });
    }
    
    onChange(updatedContributors);
  };

  const getTotalShare = () => {
    return contributors.reduce((sum, contributor) => sum + contributor.share, 0);
  };

  const totalShare = getTotalShare();

  return (
    <div>
      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Wallet address (0x...)"
                value={contributor.id}
                onChange={(e) => handleContributorChange(index, 'id', e.target.value)}
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Share %"
                value={contributor.share}
                onChange={(e) => handleContributorChange(index, 'share', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => removeContributor(index)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Add Contributor</h4>
          <div className={`text-sm ${totalShare === 100 ? 'text-green-600' : 'text-red-600'}`}>
            Total Share: {totalShare}%
          </div>
        </div>
        
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Wallet address (0x...)"
              value={newContributor.id}
              onChange={(e) => handleNewContributorChange('id', e.target.value)}
            />
          </div>
          <div className="w-24">
            <Input
              type="number"
              placeholder="Share %"
              value={newContributor.share}
              onChange={(e) => handleNewContributorChange('share', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addContributor}
          >
            Add
          </Button>
        </div>
        
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

ContributorForm.propTypes = {
  contributors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    share: PropTypes.number.isRequired
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default ContributorForm;

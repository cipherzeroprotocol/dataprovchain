import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { isValidEthereumAddress } from '../../utils/web3';

const ContributorsForm = ({ initialContributors = [], onChange, className = '' }) => {
  const [contributors, setContributors] = useState(initialContributors);
  const [errors, setErrors] = useState({});
  
  const getTotalSharePercentage = () => {
    return contributors.reduce((sum, contributor) => sum + (parseInt(contributor.share) || 0), 0);
  };
  
  const handleAddContributor = () => {
    const newContributor = { id: '', share: '0' };
    const updatedContributors = [...contributors, newContributor];
    setContributors(updatedContributors);
    onChange(updatedContributors);
  };
  
  const handleRemoveContributor = (index) => {
    const updatedContributors = contributors.filter((_, i) => i !== index);
    setContributors(updatedContributors);
    onChange(updatedContributors);
    
    // Clear errors for this contributor
    const updatedErrors = { ...errors };
    delete updatedErrors[`address_${index}`];
    delete updatedErrors[`share_${index}`];
    setErrors(updatedErrors);
  };
  
  const validateContributor = (contributor, index) => {
    const newErrors = { ...errors };
    
    // Validate address
    if (!contributor.id) {
      newErrors[`address_${index}`] = 'Address is required';
    } else if (!isValidEthereumAddress(contributor.id)) {
      newErrors[`address_${index}`] = 'Invalid Ethereum address';
    } else {
      delete newErrors[`address_${index}`];
    }
    
    // Validate share
    const share = parseInt(contributor.share) || 0;
    if (share <= 0) {
      newErrors[`share_${index}`] = 'Share must be greater than 0';
    } else if (share > 100) {
      newErrors[`share_${index}`] = 'Share cannot exceed 100%';
    } else {
      delete newErrors[`share_${index}`];
    }
    
    setErrors(newErrors);
    return !newErrors[`address_${index}`] && !newErrors[`share_${index}`];
  };
  
  const handleContributorChange = (index, field, value) => {
    const updatedContributors = contributors.map((contributor, i) => 
      i === index ? { ...contributor, [field]: value } : contributor
    );
    setContributors(updatedContributors);
    
    // Validate the updated contributor
    validateContributor(updatedContributors[index], index);
    
    onChange(updatedContributors);
  };
  
  const totalShare = getTotalSharePercentage();
  const isShareValid = totalShare === 100;
  
  return (
    <Card 
      title="Dataset Contributors" 
      className={className}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className={`font-medium ${isShareValid ? 'text-green-600' : 'text-red-600'}`}>
              Total: {totalShare}%
            </span>
            {!isShareValid && (
              <span className="ml-2 text-red-600">
                (must equal 100%)
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddContributor}
            leftIcon={<FiPlus />}
          >
            Add Contributor
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {contributors.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No contributors specified. Click &quot;Add Contributor&quot; to add dataset contributors and their revenue shares.
          </p>
        ) : (
          contributors.map((contributor, index) => (
            <div key={index} className="flex items-end space-x-4 pb-4 border-b border-gray-200">
              <div className="flex-grow">
                <Input
                  label="Wallet Address"
                  value={contributor.id}
                  onChange={(e) => handleContributorChange(index, 'id', e.target.value)}
                  error={errors[`address_${index}`]}
                  placeholder="0x..."
                />
              </div>
              <div className="w-32">
                <Input
                  label="Share (%)"
                  type="number"
                  min="1"
                  max="100"
                  value={contributor.share}
                  onChange={(e) => handleContributorChange(index, 'share', e.target.value)}
                  error={errors[`share_${index}`]}
                />
              </div>
              <div className="pb-2">
                <Button
                  variant="icon"
                  color="danger"
                  onClick={() => handleRemoveContributor(index)}
                  aria-label="Remove contributor"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

ContributorsForm.propTypes = {
  initialContributors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      share: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ContributorsForm;
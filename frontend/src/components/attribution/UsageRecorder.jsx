import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const UsageRecorder = ({ 
  onSubmit, 
  datasetId, 
  loading = false,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    modelId: '',
    usageType: 'training',
    description: '',
    impactScore: 50
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'impactScore') {
      // Ensure impact score is within range 1-100
      const score = parseInt(value);
      if (isNaN(score) || score < 1) {
        setFormData({ ...formData, impactScore: 1 });
      } else if (score > 100) {
        setFormData({ ...formData, impactScore: 100 });
      } else {
        setFormData({ ...formData, impactScore: score });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      datasetId
    });
  };

  return (
    <Card
      title="Record Dataset Usage"
      subtitle="Record how this dataset was used in your AI model"
      className={className}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-gray-700">
              Model Identifier
            </label>
            <Input
              id="modelId"
              name="modelId"
              type="text"
              value={formData.modelId}
              onChange={handleChange}
              placeholder="e.g., my-image-classifier-v1"
              required
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique identifier for your AI model
            </p>
          </div>
          
          <div>
            <label htmlFor="usageType" className="block text-sm font-medium text-gray-700">
              Usage Type
            </label>
            <Select
              id="usageType"
              name="usageType"
              value={formData.usageType}
              onChange={handleChange}
              required
              className="mt-1"
            >
              <option value="training">Training</option>
              <option value="validation">Validation</option>
              <option value="testing">Testing</option>
              <option value="finetuning">Fine-tuning</option>
              <option value="inference">Inference</option>
            </Select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe how the dataset was used in your model"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="impactScore" className="block text-sm font-medium text-gray-700">
              Impact Score (1-100)
            </label>
            <div className="mt-1 flex items-center">
              <Input
                id="impactScore"
                name="impactScore"
                type="number"
                value={formData.impactScore}
                onChange={handleChange}
                min={1}
                max={100}
                required
                className="w-24"
              />
              <div className="ml-4 flex-grow">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${formData.impactScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              How impactful was this dataset to your model&#39;s performance
            </p>
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              fullWidth
            >
              Record Usage
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

UsageRecorder.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  datasetId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default UsageRecorder;

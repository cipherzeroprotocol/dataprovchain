import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Button from '../common/Button';
import FileUpload from '../common/FileUpload';
import LicenseSelector from './LicenseSelector';
import { formatCurrency } from '../../utils/formatting';

const ListingForm = ({
  onSubmit,
  initialData = {},
  loading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataType: '',
    license: [],
    price: '',
    attributionRequired: false,
    usageRestrictions: '',
    tags: '',
    ...initialData
  });
  
  const [files, setFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleFileChange = (uploadedFiles) => {
    setFiles(uploadedFiles);
    
    if (validationErrors.files) {
      const newErrors = { ...validationErrors };
      delete newErrors.files;
      setValidationErrors(newErrors);
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Dataset name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.dataType.trim()) {
      errors.dataType = 'Data type is required';
    }
    
    if (formData.license.length === 0) {
      errors.license = 'License is required';
    }
    
    if (!formData.price.toString().trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a valid positive number';
    }
    
    if (!isEdit && files.length === 0) {
      errors.files = 'At least one file is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Format tags as an array
    const formattedData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      usageRestrictions: formData.usageRestrictions
        ? formData.usageRestrictions.split('\n').filter(Boolean)
        : []
    };
    
    onSubmit(formattedData, files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Basic Information">
        <div className="space-y-4">
          <Input
            label="Dataset Name"
            id="dataset-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={validationErrors.name}
            required
          />
          
          <TextArea
            label="Description"
            id="dataset-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={validationErrors.description}
            rows={5}
            required
          />
          
          <Input
            label="Data Type"
            id="data-type"
            value={formData.dataType}
            onChange={(e) => handleChange('dataType', e.target.value)}
            error={validationErrors.dataType}
            placeholder="E.g., Tabular, Image, Text, Audio, etc."
            required
          />
          
          <Input
            label="Tags (comma separated)"
            id="dataset-tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="E.g., finance, healthcare, nlp"
          />
        </div>
      </Card>
      
      <Card title="Licensing & Pricing">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Type
            </label>
            <LicenseSelector
              selectedLicenses={Array.isArray(formData.license) ? formData.license : [formData.license]}
              onChange={(licenses) => handleChange('license', licenses)}
              multiple={false}
            />
            {validationErrors.license && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.license}</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <div className="flex-1 mb-4 sm:mb-0">
              <Input
                label="Price (FIL)"
                id="dataset-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                error={validationErrors.price}
                required
              />
              {!validationErrors.price && formData.price && (
                <p className="mt-1 text-sm text-gray-500">
                  Listed at {formatCurrency(formData.price, 'FIL')}
                </p>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center h-full pt-8">
                <input
                  id="attribution-required"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.attributionRequired}
                  onChange={(e) => handleChange('attributionRequired', e.target.checked)}
                />
                <label htmlFor="attribution-required" className="ml-2 block text-sm text-gray-700">
                  Attribution required for usage
                </label>
              </div>
            </div>
          </div>
          
          <TextArea
            label="Usage Restrictions (one per line)"
            id="usage-restrictions"
            value={formData.usageRestrictions}
            onChange={(e) => handleChange('usageRestrictions', e.target.value)}
            placeholder="E.g.,&#10;No commercial use without permission&#10;Cannot be used for military applications&#10;etc."
            rows={4}
          />
        </div>
      </Card>
      
      {!isEdit && (
        <Card title="Dataset Files">
          <div className="space-y-4">
            <FileUpload
              label="Upload Dataset Files"
              onFilesSelected={handleFileChange}
              multiple={true}
              accept=".csv,.json,.txt,.jpg,.png,.pdf,.zip,.tar.gz"
              maxSize={500 * 1024 * 1024} // 500MB
              error={validationErrors.files}
              description="Upload your dataset files. Supported formats include CSV, JSON, text files, images, PDFs, and archives."
            />
            
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
                <ul className="mt-1 text-sm text-gray-500 list-disc list-inside space-y-1">
                  {files.slice(0, 5).map((file, index) => (
                    <li key={index}>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </li>
                  ))}
                  {files.length > 5 && <li>...and {files.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {isEdit ? 'Update Dataset' : 'List Dataset'}
        </Button>
      </div>
    </form>
  );
};

ListingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  isEdit: PropTypes.bool
};

export default ListingForm;
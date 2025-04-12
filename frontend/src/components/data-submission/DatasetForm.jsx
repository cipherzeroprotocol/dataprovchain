import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import MetadataEditor from './MetadataEditor';
import ContributorForm from './ContributorForm';
import SubmissionStatus from './SubmissionStatus';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { useWeb3 } from '../../contexts/Web3Context';
import { submitDataset } from '../../services/datasetService';

const DatasetForm = () => {
  const { account, connected } = useWeb3();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [dataset, setDataset] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    license: '',
    files: [],
    metadata: {},
    contributors: [{ id: account || '', share: 100 }]
  });
  
  // Status state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submittedDatasetId, setSubmittedDatasetId] = useState(null);
  const [error, setError] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    license: '',
    files: '',
    metadata: '',
    contributors: ''
  });

  // Update default contributor when account changes
  useEffect(() => {
    if (account && dataset.contributors.length === 1 && !dataset.contributors[0].id) {
      setDataset(prev => ({
        ...prev,
        contributors: [{ id: account, share: 100 }]
      }));
    }
  }, [account, dataset.contributors]);

  const handleInputChange = (field, value) => {
    setDataset(prev => ({
      ...prev,
      [field]: value
    }));
    setError(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleFilesChange = (files) => {
    setDataset(prev => ({
      ...prev,
      files
    }));
    setError(prev => ({
      ...prev,
      files: ''
    }));
  };

  const handleMetadataChange = (metadata) => {
    setDataset(prev => ({
      ...prev,
      metadata
    }));
  };

  const handleContributorsChange = (contributors) => {
    setDataset(prev => ({
      ...prev,
      contributors
    }));
    
    // Clear error if total share is now 100%
    const totalShare = contributors.reduce((sum, c) => sum + c.share, 0);
    if (totalShare === 100) {
      setError(prev => ({
        ...prev,
        contributors: ''
      }));
    }
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = { ...error };

    if (step === 1) {
      if (!dataset.title.trim()) {
        newErrors.title = 'Title is required';
        isValid = false;
      }
      
      if (!dataset.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      }
      
      if (!dataset.category.trim()) {
        newErrors.category = 'Category is required';
        isValid = false;
      }
      
      if (dataset.price < 0) {
        newErrors.price = 'Price cannot be negative';
        isValid = false;
      }
    } 
    else if (step === 2) {
      if (dataset.files.length === 0) {
        newErrors.files = 'At least one file is required';
        isValid = false;
      }
    }
    else if (step === 3) {
      const totalShare = dataset.contributors.reduce((sum, c) => sum + c.share, 0);
      
      if (totalShare !== 100) {
        newErrors.contributors = 'Total contribution share must equal 100%';
        isValid = false;
      }
      
      const hasInvalidAddresses = dataset.contributors.some(c => !c.id.trim());
      if (hasInvalidAddresses) {
        newErrors.contributors = 'All contributors must have valid wallet addresses';
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }
    
    setSubmissionStatus('pending');
    setUploading(true);
    
    try {
      const progressCallback = (progress) => {
        setUploadProgress(progress);
      };
      
      const result = await submitDataset(dataset, progressCallback);
      
      setSubmittedDatasetId(result.datasetId);
      setSubmissionStatus('success');
    } catch (err) {
      console.error('Error submitting dataset:', err);
      setSubmissionStatus('error');
      setError(prev => ({
        ...prev,
        general: err.message || 'There was an error submitting your dataset'
      }));
    } finally {
      setUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <Input
                id="title"
                type="text"
                value={dataset.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={error.title}
                className="mt-1"
              />
              {error.title && <p className="mt-1 text-sm text-red-600">{error.title}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={dataset.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${error.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {error.description && <p className="mt-1 text-sm text-red-600">{error.description}</p>}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                value={dataset.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${error.category ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
              >
                <option value="">Select a category</option>
                <option value="medical">Medical</option>
                <option value="financial">Financial</option>
                <option value="images">Images</option>
                <option value="text">Text</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
              {error.category && <p className="mt-1 text-sm text-red-600">{error.category}</p>}
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (ETH)
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.001"
                value={dataset.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                error={error.price}
                className="mt-1"
              />
              {error.price && <p className="mt-1 text-sm text-red-600">{error.price}</p>}
            </div>
            
            <div>
              <label htmlFor="license" className="block text-sm font-medium text-gray-700">
                License
              </label>
              <select
                id="license"
                value={dataset.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a license</option>
                <option value="cc0">CC0 (Public Domain)</option>
                <option value="cc-by">CC BY (Attribution)</option>
                <option value="cc-by-sa">CC BY-SA (Attribution-ShareAlike)</option>
                <option value="cc-by-nc">CC BY-NC (Attribution-NonCommercial)</option>
                <option value="mit">MIT License</option>
                <option value="custom">Custom License</option>
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload Data</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Files *
              </label>
              <FileUploader
                multiple={true}
                onChange={handleFilesChange}
                uploading={uploading}
                progress={uploadProgress}
              />
              {error.files && <p className="mt-1 text-sm text-red-600">{error.files}</p>}
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata (Optional)
              </label>
              <MetadataEditor
                metadata={dataset.metadata}
                onChange={handleMetadataChange}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Contributors</h2>
            
            <p className="text-sm text-gray-600">
              Define the contributors to this dataset and their respective ownership shares.
              Total shares must equal 100%.
            </p>
            
            <ContributorForm
              contributors={dataset.contributors}
              onChange={handleContributorsChange}
              error={error.contributors}
            />
            
            <div className="pt-6 mt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Review Submission</h2>
              
              <Card className="bg-gray-50">
                <div className="space-y-4 p-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Basic Information</h5>
                    <p className="text-sm"><strong>Title:</strong> {dataset.title}</p>
                    <p className="text-sm"><strong>Category:</strong> {dataset.category}</p>
                    <p className="text-sm"><strong>Price:</strong> {dataset.price} ETH</p>
                    {dataset.license && <p className="text-sm"><strong>License:</strong> {dataset.license}</p>}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Files</h5>
                    <p className="text-sm">{dataset.files.length} files selected</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Contributors</h5>
                    <div className="space-y-1">
                      {dataset.contributors.map((contributor, index) => (
                        <p key={index} className="text-sm">
                          {contributor.id} ({contributor.share}%)
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      
      case 4:
        return (
          <SubmissionStatus
            status={submissionStatus}
            datasetId={submittedDatasetId}
            error={error.general}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {currentStep < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step}
                  className={`flex items-center ${
                    currentStep === step
                      ? 'text-blue-600'
                      : currentStep > step
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    currentStep === step
                      ? 'border-blue-600'
                      : currentStep > step
                      ? 'border-green-600'
                      : 'border-gray-400'
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {step === 1 ? 'Info' : step === 2 ? 'Data' : 'Contributors'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 w-full bg-gray-200 h-1 rounded-full">
            <div 
              className="bg-blue-600 h-1 rounded-full" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card>
          {renderStepContent()}
          
          {currentStep < 4 && (
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!connected || uploading}
                >
                  {uploading ? 'Submitting...' : 'Submit Dataset'}
                </Button>
              )}
            </div>
          )}
        </Card>
      </form>
    </div>
  );
};

export default DatasetForm;

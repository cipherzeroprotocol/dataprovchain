import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const SubmissionStatus = ({ status, datasetId, error }) => {
  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center p-6">
            <svg className="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Dataset Submitted Successfully
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Your dataset has been submitted and is now being processed.
              You can view its status in the marketplace.
            </p>
            <div className="mt-6">
              <Link to={`/marketplace/${datasetId}`}>
                <Button variant="primary">
                  View Dataset
                </Button>
              </Link>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center p-6">
            <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Submission Failed
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {error || 'There was an error submitting your dataset. Please try again.'}
            </p>
            <div className="mt-6">
              <Button 
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        );
      
      case 'pending':
        return (
          <div className="text-center p-6">
            <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Submitting Dataset...
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Your dataset is being uploaded and registered on the blockchain.
              This may take a few minutes.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
};

SubmissionStatus.propTypes = {
  status: PropTypes.oneOf(['success', 'error', 'pending']).isRequired,
  datasetId: PropTypes.string,
  error: PropTypes.string
};

export default SubmissionStatus;

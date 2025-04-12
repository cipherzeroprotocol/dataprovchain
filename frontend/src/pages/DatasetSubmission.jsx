import React, { useState } from 'react';
import DatasetForm from '../components/data-submission/DatasetForm';
import SubmissionStatus from '../components/data-submission/SubmissionStatus';

const DatasetSubmission = () => {
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Dataset</h1>
        <p className="mt-2 text-lg text-gray-600">
          Share your dataset with the AI community and earn attribution for its usage
        </p>
      </div>
      
      {submissionStatus ? (
        <SubmissionStatus
          status={submissionStatus}
          datasetId={datasetId}
          error={error}
        />
      ) : (
        <DatasetForm
          onSubmissionStart={() => setSubmissionStatus('pending')}
          onSubmissionSuccess={(id) => {
            setDatasetId(id);
            setSubmissionStatus('success');
          }}
          onSubmissionError={(err) => {
            setError(err);
            setSubmissionStatus('error');
          }}
        />
      )}
    </div>
  );
};

export default DatasetSubmission;

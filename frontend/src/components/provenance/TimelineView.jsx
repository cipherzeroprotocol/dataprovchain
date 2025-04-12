import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatAddress } from '../../utils/formatting';
import Card from '../common/Card';
import Tooltip from '../common/Tooltip';

/**
 * TimelineView Component
 * 
 * Displays a vertical timeline of provenance events for a dataset
 * Shows chronological history of dataset creation, modifications, verifications, etc.
 */
const TimelineView = ({ provenanceRecords = [], className = '' }) => {
  if (!provenanceRecords || provenanceRecords.length === 0) {
    return (
      <Card title="Provenance Timeline" className={className}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No provenance records available for this dataset.</p>
        </div>
      </Card>
    );
  }

  // Sort by timestamp in descending order (most recent first)
  const sortedRecords = [...provenanceRecords].sort((a, b) => 
    new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
  );

  return (
    <Card title="Provenance Timeline" className={className}>
      <div className="flow-root p-2 sm:p-4">
        <ul className="-mb-8">
          {sortedRecords.map((record, index) => (
            <li key={record.id || index}>
              <div className="relative pb-8">
                {index !== sortedRecords.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getEventColor(record.actionType)}`}>
                      {getEventIcon(record.actionType)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getEventTitle(record.actionType)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{record.description}</p>
                      {record.performedBy && (
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          By: {formatAddress(record.performedBy)}
                        </p>
                      )}
                      {record.transactionHash && (
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          <a 
                            href={`https://explorer.filecoin.io/tx/${record.transactionHash}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Tx: {formatAddress(record.transactionHash)}
                          </a>
                        </p>
                      )}
                      {record.ipfsCid && (
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          <a
                            href={`https://gateway.ipfs.io/ipfs/${record.ipfsCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            IPFS: {formatAddress(record.ipfsCid)}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-gray-500">
                      <Tooltip content={formatDate(record.timestamp || record.createdAt, true)}>
                        <span>{formatDate(record.timestamp || record.createdAt)}</span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

// Helper functions for event display
const getEventColor = (eventType) => {
  const colors = {
    creation: 'bg-green-500',
    modification: 'bg-yellow-500',
    derivation: 'bg-orange-500',
    verification: 'bg-blue-500',
    transfer: 'bg-purple-500',
    usage: 'bg-indigo-500',
    storage_confirmed: 'bg-cyan-500',
    storage_failed: 'bg-red-500',
    access: 'bg-violet-500',
    default: 'bg-gray-500'
  };
  
  return colors[eventType?.toLowerCase()] || colors.default;
};

const getEventIcon = (eventType) => {
  const type = eventType?.toLowerCase();
  
  if (type === 'creation') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'modification') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    );
  } else if (type === 'verification') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'transfer') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
      </svg>
    );
  } else if (type === 'usage') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.766-1.324-2.246-.48-.32-1.054-.545-1.676-.662V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.563-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'storage_confirmed') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'storage_failed') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'access') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (type === 'derivation') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  } else {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  }
};

const getEventTitle = (eventType) => {
  const titles = {
    creation: 'Dataset Created',
    modification: 'Dataset Modified',
    derivation: 'Dataset Derived',
    verification: 'Dataset Verified',
    transfer: 'Ownership Transferred',
    usage: 'Dataset Used',
    storage_confirmed: 'Storage Confirmed',
    storage_failed: 'Storage Failed',
    access: 'Access Granted',
  };
  
  return titles[eventType?.toLowerCase()] || eventType;
};

TimelineView.propTypes = {
  provenanceRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      actionType: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string,
      createdAt: PropTypes.string,
      performedBy: PropTypes.string,
      transactionHash: PropTypes.string,
      ipfsCid: PropTypes.string,
      metadata: PropTypes.object
    })
  ),
  className: PropTypes.string
};

export default TimelineView;
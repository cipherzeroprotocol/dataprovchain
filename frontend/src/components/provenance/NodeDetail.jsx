import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatAddress } from '../../utils/formatting';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * NodeDetail Component
 * 
 * Displays detailed information about a selected provenance record
 * Shows action details, metadata, blockchain verification status, etc.
 */
const NodeDetail = ({ record, onVerify, verifying = false, className = '' }) => {
  if (!record) {
    return (
      <Card title="Record Details" className={className}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">Select a provenance record to view details</p>
        </div>
      </Card>
    );
  }

  const formattedMetadata = record.metadata ? (
    typeof record.metadata === 'string' 
      ? JSON.parse(record.metadata) 
      : record.metadata
  ) : {};

  const renderMetadataItem = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'object') {
      return (
        <div className="pl-4 border-l-2 border-gray-200">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="text-sm mb-1">
              <span className="text-gray-600 font-medium">{nestedKey}: </span>
              {renderMetadataItem(nestedValue)}
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  return (
    <Card title="Record Details" className={className}>
      <div className="divide-y divide-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{getEventTitle(record.actionType)}</h3>
            <Badge
              color={getBadgeColor(record.actionType)}
              text={formatActionType(record.actionType)}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">{record.description}</p>
          
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Record ID</h4>
              <p className="mt-1 text-sm font-mono text-gray-900">{record.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Performed By</h4>
              <p className="mt-1 text-sm font-mono text-gray-900">
                <a 
                  href={`https://explorer.filecoin.io/address/${record.performedBy}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {formatAddress(record.performedBy, 8, 8)}
                </a>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(record.timestamp || record.createdAt, true)}
              </p>
            </div>
          </div>
          
          {record.previousRecordId && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Previous Record</h4>
              <p className="mt-1 text-sm font-mono text-gray-900">{record.previousRecordId}</p>
            </div>
          )}
          
          {record.transactionHash && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Blockchain Transaction</h4>
              <p className="mt-1 text-sm font-mono text-gray-900">
                <a 
                  href={`https://explorer.filecoin.io/tx/${record.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {formatAddress(record.transactionHash, 10, 10)}
                </a>
              </p>
            </div>
          )}
          
          {record.ipfsCid && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">IPFS Content ID</h4>
              <p className="mt-1 text-sm font-mono text-gray-900">
                <a 
                  href={`https://gateway.ipfs.io/ipfs/${record.ipfsCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {formatAddress(record.ipfsCid, 10, 10)}
                </a>
              </p>
            </div>
          )}
        </div>
        
        {Object.keys(formattedMetadata).length > 0 && (
          <div className="p-4 sm:p-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">Metadata</h3>
            <div className="bg-gray-50 rounded-md p-3 overflow-auto max-h-64">
              {Object.entries(formattedMetadata).map(([key, value]) => (
                <div key={key} className="text-sm mb-2">
                  <span className="text-gray-600 font-medium">{key}: </span>
                  {renderMetadataItem(value)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {onVerify && (
          <div className="p-4 sm:p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Verify this provenance record</span>
              <Button
                variant="secondary"
                onClick={() => onVerify(record.id)}
                disabled={verifying}
                className="text-xs px-3 py-1.5"
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>Verify on Blockchain</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper functions
const formatActionType = (actionType) => {
  if (!actionType) return '';
  return actionType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getBadgeColor = (actionType) => {
  const typeToColor = {
    creation: 'green',
    modification: 'yellow',
    derivation: 'orange',
    verification: 'blue',
    transfer: 'purple',
    usage: 'indigo',
    storage_confirmed: 'cyan',
    storage_failed: 'red',
    access: 'violet'
  };

  return typeToColor[actionType?.toLowerCase()] || 'gray';
};

const getEventTitle = (actionType) => {
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
  
  return titles[actionType?.toLowerCase()] || actionType;
};

NodeDetail.propTypes = {
  record: PropTypes.shape({
    id: PropTypes.string,
    actionType: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.string,
    createdAt: PropTypes.string,
    performedBy: PropTypes.string,
    transactionHash: PropTypes.string,
    ipfsCid: PropTypes.string,
    metadata: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    previousRecordId: PropTypes.string
  }),
  onVerify: PropTypes.func,
  verifying: PropTypes.bool,
  className: PropTypes.string
};

export default NodeDetail;
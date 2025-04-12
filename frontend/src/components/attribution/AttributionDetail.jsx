import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate, formatAddress } from '../../utils/formatting';

const AttributionDetail = ({ 
  attribution, 
  onVerify, 
  onDispute,
  verifying = false,
  disputing = false,
  canVerify = false 
}) => {
  if (!attribution) return null;

  const getUsageTypeBadge = (usageType) => {
    switch (usageType) {
      case 'training':
        return <Badge variant="primary">Training</Badge>;
      case 'validation':
        return <Badge variant="info">Validation</Badge>;
      case 'testing':
        return <Badge variant="warning">Testing</Badge>;
      case 'finetuning':
        return <Badge variant="purple">Fine-tuning</Badge>;
      case 'inference':
        return <Badge variant="success">Inference</Badge>;
      default:
        return <Badge variant="default">{usageType}</Badge>;
    }
  };

  const getStatusBadge = (verified) => {
    return verified ? 
      <Badge variant="success">Verified</Badge> : 
      <Badge variant="warning">Pending</Badge>;
  };

  return (
    <Card title="Attribution Details">
      <div className="space-y-6 p-4">
        {/* Header with model info and status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{attribution.modelName}</h3>
            <p className="text-sm text-gray-500">ID: {attribution.modelId}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(attribution.verified)}
            {getUsageTypeBadge(attribution.usageType)}
          </div>
        </div>

        {/* Attribution details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 border-t border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-500">Creator</p>
            <p className="mt-1 text-sm text-gray-900">{formatAddress(attribution.creator)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Recorded Date</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(attribution.timestamp)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Impact Score</p>
            <div className="mt-1 flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${attribution.impactScore}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-900">{attribution.impactScore}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
            <p className="mt-1 text-sm text-gray-900 font-mono truncate">
              {attribution.transactionHash || 'Not available'}
            </p>
          </div>
        </div>

        {/* Description */}
        {attribution.description && (
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1 text-sm text-gray-900">{attribution.description}</p>
          </div>
        )}

        {/* Actions */}
        {!attribution.verified && canVerify && (
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => onDispute(attribution.id)}
              disabled={disputing || verifying}
              loading={disputing}
            >
              Dispute
            </Button>
            <Button
              variant="primary"
              onClick={() => onVerify(attribution.id)}
              disabled={disputing || verifying}
              loading={verifying}
            >
              Verify
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

AttributionDetail.propTypes = {
  attribution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    datasetId: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    usageType: PropTypes.string.isRequired,
    impactScore: PropTypes.number.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    verified: PropTypes.bool.isRequired,
    description: PropTypes.string,
    transactionHash: PropTypes.string
  }),
  onVerify: PropTypes.func,
  onDispute: PropTypes.func,
  verifying: PropTypes.bool,
  disputing: PropTypes.bool,
  canVerify: PropTypes.bool
};

export default AttributionDetail;

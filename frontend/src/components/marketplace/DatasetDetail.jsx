import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatFileSize, formatCurrency } from '../../utils/formatting';
import { formatAddress } from '../../utils/web3';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const DatasetDetail = ({
  dataset,
  onPurchase,
  purchasing = false,
  isOwned = false,
  canAccess = false
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{dataset.name}</h1>
            {dataset.verified && (
              <Badge variant="success">Verified</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Created by {formatAddress(dataset.creator.walletAddress)} on {formatDate(dataset.createdAt)}
          </p>
        </div>
        
        {/* Actions based on ownership */}
        {isOwned ? (
          <Button variant="outline">Manage Dataset</Button>
        ) : canAccess ? (
          <Button variant="success">Access Dataset</Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={onPurchase} 
            loading={purchasing}
            disabled={purchasing}
          >
            Purchase Access ({formatCurrency(dataset.price, 'FIL')})
          </Button>
        )}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Description and metadata */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Description">
            <p className="text-gray-700">{dataset.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {dataset.tags && dataset.tags.map((tag, index) => (
                <Badge key={index} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
          
          <Card title="Storage Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Filecoin CID</p>
                  <p className="text-sm font-mono break-all">
                    {dataset.storage?.filecoinCID || 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="text-sm">
                    {dataset.size ? formatFileSize(dataset.size) : 'Not available'}
                  </p>
                </div>
              </div>
              
              {dataset.storage?.deals && dataset.storage.deals.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Storage Deals</p>
                  <ul className="space-y-2">
                    {dataset.storage.deals.map((deal, index) => (
                      <li key={index} className="text-sm border p-2 rounded">
                        <p>Provider: <span className="font-mono">{deal.provider}</span></p>
                        <p>Deal ID: {deal.dealId}</p>
                        <p>Expires: {formatDate(deal.expirationTime)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Right column - License and contributors */}
        <div className="space-y-6">
          <Card title="License Information">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">License Type</p>
                <p className="text-sm font-medium">{dataset.license || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Usage Restrictions</p>
                <ul className="list-disc list-inside text-sm">
                  {dataset.usageRestrictions ? (
                    dataset.usageRestrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))
                  ) : (
                    <li>No specific restrictions defined</li>
                  )}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Attribution Required</p>
                <p className="text-sm">{dataset.attributionRequired ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>
          
          <Card title="Contributors">
            {dataset.contributors && dataset.contributors.length > 0 ? (
              <ul className="space-y-3">
                {dataset.contributors.map((contributor, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{formatAddress(contributor.id)}</p>
                    </div>
                    <Badge variant="primary">{contributor.share}%</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No contributors specified</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

DatasetDetail.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    dataType: PropTypes.string,
    createdAt: PropTypes.string,
    verified: PropTypes.bool,
    license: PropTypes.string,
    attributionRequired: PropTypes.bool,
    usageRestrictions: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.number,
    storage: PropTypes.shape({
      filecoinCID: PropTypes.string,
      deals: PropTypes.arrayOf(PropTypes.shape({
        provider: PropTypes.string,
        dealId: PropTypes.number,
        expirationTime: PropTypes.string
      }))
    }),
    creator: PropTypes.shape({
      walletAddress: PropTypes.string
    }),
    contributors: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      share: PropTypes.number
    })),
    tags: PropTypes.arrayOf(PropTypes.string),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onPurchase: PropTypes.func,
  purchasing: PropTypes.bool,
  isOwned: PropTypes.bool,
  canAccess: PropTypes.bool
};

export default DatasetDetail;

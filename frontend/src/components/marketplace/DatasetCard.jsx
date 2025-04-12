import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, formatCurrency, truncateText } from '../../utils/formatting';
import { formatAddress } from '../../utils/web3';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DatasetCard = ({ dataset, className = '' }) => {
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            <Link to={`/marketplace/${dataset.id}`} className="hover:text-blue-600">
              {dataset.name}
            </Link>
          </h3>
          {dataset.verified && (
            <Badge variant="success" className="ml-2">Verified</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {truncateText(dataset.description, 100)}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-gray-500">Data Type</p>
            <p className="text-sm font-medium">{dataset.dataType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm">{formatDate(dataset.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Creator</p>
            <p className="text-sm">{formatAddress(dataset.creator.walletAddress)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">License</p>
            <p className="text-sm">{dataset.license || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {dataset.tags && dataset.tags.map((tag, index) => (
            <Badge key={index} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {dataset.price && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(dataset.price, 'FIL')}
              </p>
            </div>
            <Link 
              to={`/marketplace/${dataset.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

DatasetCard.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    dataType: PropTypes.string,
    createdAt: PropTypes.string,
    verified: PropTypes.bool,
    license: PropTypes.string,
    creator: PropTypes.shape({
      walletAddress: PropTypes.string
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  className: PropTypes.string
};

export default DatasetCard;

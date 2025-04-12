import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatDate, formatCurrency, formatAddress } from '../../utils/formatting';

const RoyaltyView = ({ 
  royalties, 
  onDistribute,
  distributing = false,
  className = ''
}) => {
  if (!royalties) {
    return (
      <Card title="Royalty Information" className={className}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No royalty data available</p>
        </div>
      </Card>
    );
  }

  const { totalEarned, pendingDistribution, lastDistribution, contributors } = royalties;
  const hasPendingRoyalties = parseFloat(pendingDistribution) > 0;
  
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Total Royalties</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalEarned, 'FIL')}
            </p>
            <p className="mt-1 text-sm text-gray-500">Lifetime earnings</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Royalties</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(pendingDistribution, 'FIL')}
            </p>
            <p className="mt-1 text-sm text-gray-500">Available to distribute</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={onDistribute}
              loading={distributing}
              disabled={distributing || !hasPendingRoyalties}
            >
              Distribute Royalties
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Last Distribution</h3>
            <p className="text-3xl font-bold text-gray-900">
              {lastDistribution ? formatDate(lastDistribution) : 'Never'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {lastDistribution 
                ? `${Math.round((Date.now() - new Date(lastDistribution).getTime()) / (24 * 60 * 60 * 1000))} days ago`
                : 'No distributions yet'}
            </p>
          </div>
        </Card>
      </div>
      
      <Card title="Contributor Shares">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contributor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Share Percentage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                {hasPendingRoyalties && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributors.map((contributor, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAddress(contributor.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${contributor.share}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {contributor.share}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(contributor.earned, 'FIL')}
                  </td>
                  {hasPendingRoyalties && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency((parseFloat(pendingDistribution) * contributor.share / 100).toFixed(4), 'FIL')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

RoyaltyView.propTypes = {
  royalties: PropTypes.shape({
    totalEarned: PropTypes.string.isRequired,
    pendingDistribution: PropTypes.string.isRequired,
    lastDistribution: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    contributors: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      share: PropTypes.number.isRequired,
      earned: PropTypes.string.isRequired
    })).isRequired
  }),
  onDistribute: PropTypes.func.isRequired,
  distributing: PropTypes.bool,
  className: PropTypes.string
};

export default RoyaltyView;

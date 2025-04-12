import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Select from '../common/Select';
import Input from '../common/Input';
import { formatDate, formatAddress } from '../../utils/formatting';

const AttributionList = ({ 
  attributions = [], 
  onSelectAttribution,
  selectedAttributionId = null,
  className = ''
}) => {
  const [filters, setFilters] = useState({
    status: 'all',
    usageType: 'all',
    searchQuery: ''
  });

  // Apply filters
  const filteredAttributions = attributions.filter(attr => {
    // Filter by status
    if (filters.status !== 'all') {
      const isVerified = filters.status === 'verified';
      if (attr.verified !== isVerified) return false;
    }

    // Filter by usage type
    if (filters.usageType !== 'all' && attr.usageType !== filters.usageType) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        attr.modelName.toLowerCase().includes(query) ||
        attr.modelId.toLowerCase().includes(query) ||
        (attr.creator && attr.creator.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

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

  if (!attributions || attributions.length === 0) {
    return (
      <Card title="Dataset Usage" className={className}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No attribution data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Dataset Usage" className={className}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/3">
            <Input
              type="text"
              name="searchQuery"
              placeholder="Search by model name or ID"
              value={filters.searchQuery}
              onChange={handleFilterChange}
            />
          </div>
          <div className="sm:w-1/3">
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
          <div className="sm:w-1/3">
            <Select
              name="usageType"
              value={filters.usageType}
              onChange={handleFilterChange}
            >
              <option value="all">All Usage Types</option>
              <option value="training">Training</option>
              <option value="validation">Validation</option>
              <option value="testing">Testing</option>
              <option value="finetuning">Fine-tuning</option>
              <option value="inference">Inference</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impact Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttributions.map((attribution) => (
              <tr 
                key={attribution.id} 
                className={`
                  cursor-pointer hover:bg-gray-50 
                  ${selectedAttributionId === attribution.id ? 'bg-blue-50' : ''}
                `}
                onClick={() => onSelectAttribution(attribution.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {attribution.modelName}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {attribution.modelId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatAddress(attribution.creator)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getUsageTypeBadge(attribution.usageType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${attribution.impactScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">
                      {attribution.impactScore}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(attribution.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attribution.verified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAttributions.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No attributions match your filters</p>
        </div>
      )}
    </Card>
  );
};

AttributionList.propTypes = {
  attributions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      datasetId: PropTypes.string.isRequired,
      modelId: PropTypes.string.isRequired,
      modelName: PropTypes.string.isRequired,
      creator: PropTypes.string.isRequired,
      usageType: PropTypes.string.isRequired,
      impactScore: PropTypes.number.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      verified: PropTypes.bool.isRequired
    })
  ),
  onSelectAttribution: PropTypes.func.isRequired,
  selectedAttributionId: PropTypes.string,
  className: PropTypes.string
};

export default AttributionList;

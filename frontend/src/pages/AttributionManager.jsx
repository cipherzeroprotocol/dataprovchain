import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAttribution } from '../hooks/useAttribution';
import { WalletContext } from '../contexts/WalletContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatDate, formatAddress, formatCurrency } from '../utils/formatting';

const AttributionManager = () => {
  const { id } = useParams(); // Dataset ID if provided in URL
  const { signer } = useContext(WalletContext);
  const { 
    distributing,
  } = useAttribution(signer);
  
  const [selectedDataset, setSelectedDataset] = useState(id || null);
  const [activeTab, setActiveTab] = useState('usage');
  const [localAttributions, setLocalAttributions] = useState([]);
  const [localRoyalties, setLocalRoyalties] = useState(null);
  
  // Mock datasets for dropdown
  const [datasets] = useState([
    { id: '1', name: 'ImageNet Subset' },
    { id: '2', name: 'Text Classification Dataset' },
    { id: '3', name: 'Speech Recognition Dataset' }
  ]);
  
  // Mock attribution data
  const mockAttributions = React.useMemo(() => [
    {
      id: '1',
      datasetId: '1',
      modelId: 'model-1',
      modelName: 'Image Classification Model',
      creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
      usageType: 'training',
      impactScore: 85,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      verified: true
    },
    {
      id: '2',
      datasetId: '1',
      modelId: 'model-2',
      modelName: 'Object Detection Model',
      creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      usageType: 'training',
      impactScore: 72,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      verified: true
    },
    {
      id: '3',
      datasetId: '1',
      modelId: 'model-3',
      modelName: 'Image Generation Model',
      creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      usageType: 'training',
      impactScore: 65,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      verified: false
    }
  ], []);
  
  // Mock royalty data
  const mockRoyalties = React.useMemo(() => ({
    totalEarned: '0.75',
    pendingDistribution: '0.35',
    lastDistribution: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    contributors: [
      { id: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', share: 60, earned: '0.45' },
      { id: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', share: 40, earned: '0.30' }
    ]
  }), []);
  
  // Load data when dataset is selected
  useEffect(() => {
    if (selectedDataset) {
      // In a real implementation, these would fetch from the API
      // getAttributions(selectedDataset);
      // getRoyalties(selectedDataset);
      
      // For demo purposes, set mock data
      setLocalAttributions(mockAttributions);
      setLocalRoyalties(mockRoyalties);
    }
  }, [selectedDataset, mockAttributions, mockRoyalties]);
  
  const handleDistributeRoyalties = async () => {
    if (!selectedDataset || !mockRoyalties.pendingDistribution) return;
    
    try {
      // In a real implementation, this would call the contract
      // await distributeRoyalties(selectedDataset, mockRoyalties.pendingDistribution);
      alert('Royalties distributed successfully!');
    } catch (error) {
      console.error('Failed to distribute royalties:', error);
    }
  };
  
  const getUsageTypeBadge = (usageType) => {
    switch (usageType) {
      case 'training':
        return <Badge variant="primary">Training</Badge>;
      case 'validation':
        return <Badge variant="info">Validation</Badge>;
      case 'testing':
        return <Badge variant="warning">Testing</Badge>;
      case 'inference':
        return <Badge variant="success">Inference</Badge>;
      default:
        return <Badge variant="default">{usageType}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attribution Manager</h1>
        <p className="mt-2 text-lg text-gray-600">
          Track dataset usage, manage attribution, and distribute royalties
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <label htmlFor="dataset-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Dataset
          </label>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-grow">
              <select
                id="dataset-select"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                <option value="">Select a dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {selectedDataset && (
        <>
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'usage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                  onClick={() => setActiveTab('usage')}
                >
                  Usage Tracking
                </button>
                <button
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'royalties'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                  onClick={() => setActiveTab('royalties')}
                >
                  Royalty Management
                </button>
              </nav>
            </div>
          </div>
          
          {activeTab === 'usage' ? (
            <div>
              <Card title="Dataset Usage">
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
                      {localAttributions.map((attribution) => (
                        <tr key={attribution.id}>
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
              </Card>
              
              <div className="mt-8">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Analytics</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Uses</p>
                        <p className="text-2xl font-bold text-gray-900">{localAttributions.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Average Impact Score</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(localAttributions.reduce((sum, item) => sum + item.impactScore, 0) / localAttributions.length)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Verification Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(localAttributions.filter(a => a.verified).length / localAttributions.length * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Usage by Type</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          {['training', 'validation', 'testing', 'inference'].map(type => {
                            const count = localAttributions.filter(a => a.usageType === type).length;
                            const percentage = localAttributions.length > 0 
                              ? Math.round(count / localAttributions.length * 100) 
                              : 0;
                            
                            return (
                              <div key={type}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                                  <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Total Royalties</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {localRoyalties && formatCurrency(localRoyalties.totalEarned, 'FIL')}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Lifetime earnings</p>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Royalties</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {localRoyalties && formatCurrency(localRoyalties.pendingDistribution, 'FIL')}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Available to distribute</p>
                    <Button 
                      variant="primary" 
                      className="mt-4"
                      onClick={handleDistributeRoyalties}
                      loading={distributing}
                      disabled={distributing || (localRoyalties && parseFloat(localRoyalties.pendingDistribution) === 0)}
                    >
                      Distribute Royalties
                    </Button>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Last Distribution</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {localRoyalties && formatDate(localRoyalties.lastDistribution)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {localRoyalties && localRoyalties.lastDistribution 
                        ? `${Math.round((Date.now() - localRoyalties.lastDistribution) / (24 * 60 * 60 * 1000))} days ago`
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {localRoyalties && localRoyalties.contributors.map((contributor, index) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttributionManager;

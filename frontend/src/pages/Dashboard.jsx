import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatDate, formatCurrency } from '../utils/formatting';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { datasets, loading, error, listDatasets } = useDataset();
  
  const [activeTab, setActiveTab] = useState('datasets');
  
  useEffect(() => {
    // Load user's datasets
    listDatasets({ creator: user?.walletAddress });
  }, [listDatasets, user]);
  
  const renderDatasetsTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      );
    }
    
    if (datasets.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven&#39;t submitted any datasets yet.
          </p>
          <div className="mt-6">
            <Link to="/submit">
              <Button variant="primary">
                Submit a Dataset
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map((dataset) => (
              <tr key={dataset.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link to={`/marketplace/${dataset.id}`} className="hover:text-blue-600">
                      {dataset.name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dataset.dataType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dataset.verified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(dataset.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/marketplace/${dataset.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    View
                  </Link>
                  <Link to={`/attribution/${dataset.id}`} className="text-blue-600 hover:text-blue-900">
                    Attribution
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderRoyaltiesTab = () => {
    return (
      <div className="py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Total Royalties</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(0.35, 'FIL')}</p>
              <p className="mt-1 text-sm text-gray-500">Lifetime earnings</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Royalties</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(0.12, 'FIL')}</p>
              <p className="mt-1 text-sm text-gray-500">Available to claim</p>
              <Button variant="primary" className="mt-4" disabled>
                Claim Royalties
              </Button>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dataset Usage</h3>
              <p className="text-3xl font-bold text-indigo-600">7</p>
              <p className="mt-1 text-sm text-gray-500">Models using your datasets</p>
              <Link to="/attribution" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500">
                View Attribution Details →
              </Link>
            </div>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card title="Recent Transactions">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dataset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Sample data - would be replaced with real data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ImageNet Subset
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Royalty Payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(0.08, 'FIL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Completed</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Text Classification Dataset
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      License Purchase
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(0.15, 'FIL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Completed</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your datasets, track attribution, and monitor royalties
        </p>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'datasets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
            onClick={() => setActiveTab('datasets')}
          >
            My Datasets
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
            Royalties & Attribution
          </button>
        </nav>
      </div>
      
      <div className="py-6">
        {activeTab === 'datasets' ? renderDatasetsTab() : renderRoyaltiesTab()}
      </div>
    </div>
  );
};

export default Dashboard;

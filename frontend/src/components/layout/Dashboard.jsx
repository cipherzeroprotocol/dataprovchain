import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { WalletContext } from '../../contexts/WalletContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatEther } from '../../utils/web3';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { account, balance } = useContext(WalletContext);
  
  const [stats, setStats] = useState({
    datasets: { count: 0, total: 0 },
    purchases: { count: 0, total: 0 },
    earnings: { total: 0, pending: 0 }
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
          setStats({
            datasets: { count: 5, total: 12 },
            purchases: { count: 8, total: 20 },
            earnings: { total: 2.45, pending: 0.5 }
          });
          
          setRecentActivities([
            { id: 1, type: 'sale', dataset: 'Medical Imaging Dataset', amount: 0.75, date: new Date(Date.now() - 86400000) },
            { id: 2, type: 'purchase', dataset: 'Financial Time Series', amount: 1.2, date: new Date(Date.now() - 172800000) },
            { id: 3, type: 'submission', dataset: 'Voice Recognition Samples', amount: 0, date: new Date(Date.now() - 259200000) }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [account]);
  
  const StatCard = ({ title, value, subValue, icon, color }) => (
    <Card className="shadow-sm">
      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            {subValue && (
              <p className="mt-1 text-sm text-gray-500">{subValue}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
            <span className={`text-${color}-600`}>{icon}</span>
          </div>
        </div>
      </div>
    </Card>
  );
  
  // Add prop type validation for StatCard
  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subValue: PropTypes.string,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string.isRequired
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.username || 'User'}!
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Datasets Contributed"
                value={stats.datasets.count}
                subValue={`${stats.datasets.total} total on platform`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                }
                color="blue"
              />
              
              <StatCard
                title="Purchased Datasets"
                value={stats.purchases.count}
                subValue={`${stats.purchases.total} total on platform`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                }
                color="purple"
              />
              
              <StatCard
                title="Total Earnings"
                value={`${stats.earnings.total} ETH`}
                subValue={`${stats.earnings.pending} ETH pending`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              
              <StatCard
                title="Wallet Balance"
                value={`${formatEther(balance)} ETH`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                color="yellow"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      No recent activities
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {activity.type === 'sale' && (
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                            {activity.type === 'purchase' && (
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </span>
                            )}
                            {activity.type === 'submission' && (
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.type === 'sale' && 'Sold dataset'}
                              {activity.type === 'purchase' && 'Purchased dataset'}
                              {activity.type === 'submission' && 'Submitted new dataset'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.dataset}
                            </div>
                          </div>
                          <div className="text-right">
                            {activity.amount > 0 && (
                              <div className="text-sm font-medium text-gray-900">
                                {activity.amount} ETH
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {activity.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Link to="/dashboard/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all transactions
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-4">
                  <Link to="/submit">
                    <Button variant="primary" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Submit New Dataset
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button variant="outline" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link to="/dashboard/datasets">
                    <Button variant="outline" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Manage My Datasets
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Wallet Information</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500">Connected Account</div>
                    <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {account}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Balance</div>
                    <div className="mt-1 text-2xl font-medium">{formatEther(balance)} ETH</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;




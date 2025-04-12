import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatting';
import { useResponsive } from '../hooks/useResponsive';

const UserProfile = () => {
  const navigate = useNavigate();
  const { account, disconnect } = useContext(WalletContext);
  const { user, updateUserProfile, isAuthenticated, logout } = useContext(AuthContext);
  const { isMobile } = useResponsive();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    website: '',
    twitter: '',
    github: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || '',
        github: user.github || ''
      });
    }
  }, [user]);
  
  // Mock user activity data
  const userActivity = [
    {
      id: '1',
      type: 'dataset_upload',
      name: 'ImageNet Subset',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'dataset_purchase',
      name: 'Text Classification Dataset',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'model_attribution',
      name: 'Image Classification Model',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'dao_vote',
      name: 'Increase royalty percentage proposal',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the actual update profile method from context
      await updateUserProfile(formData);
      
      setIsEditing(false);
      setLoading(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      await disconnect();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'dataset_upload':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        );
      case 'dataset_purchase':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'model_attribution':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'dao_vote':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your personal information and activity
        </p>
      </div>
      
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-8`}>
        {/* Left column - Profile information */}
        <div className={isMobile ? '' : 'md:col-span-1'}>
          <Card>
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                        Twitter
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                        GitHub
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          github.com/
                        </span>
                        <input
                          type="text"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">
                      {formData.username ? formData.username.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{formData.username}</h3>
                    <p className="text-sm text-gray-500">{formData.email}</p>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="mb-4 px-4 py-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                      <p className="text-sm font-mono break-all">{account}</p>
                    </div>
                    
                    {formData.bio && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Bio</h4>
                        <p className="mt-1 text-sm text-gray-600">{formData.bio}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Profile Links</h4>
                      <ul className="mt-2 space-y-2">
                        {formData.website && (
                          <li className="text-sm">
                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                              </svg>
                              Website
                            </a>
                          </li>
                        )}
                        {formData.twitter && (
                          <li className="text-sm">
                            <a href={`https://twitter.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184A4.92 4.92 0 0016.29 2a4.926 4.926 0 00-4.927 4.927c0 .39.045.77.127 1.124A14.005 14.005 0 011.645 3.156a4.926 4.926 0 001.52 6.597 4.924 4.924 0 01-2.23-.618v.063a4.928 4.928 0 003.95 4.829 4.955 4.955 0 01-2.222.084 4.928 4.928 0 004.599 3.422A9.878 9.878 0 011 19.54a13.991 13.991 0 007.548 2.212c9.059 0 14.01-7.5 14.01-14.01 0-.211-.005-.422-.016-.633A10.004 10.004 0 0024 4.57h-.047z" />
                              </svg>
                              @{formData.twitter}
                            </a>
                          </li>
                        )}
                        {formData.github && (
                          <li className="text-sm">
                            <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.71c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.39.2 2.43.1 2.68.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.68.92.68 1.85V21c0 .27.18.57.69.48A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                              </svg>
                              {formData.github}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        
        {/* Right column - Activity and stats */}
        <div className={isMobile ? '' : 'md:col-span-2'}>
          <Card title="Recent Activity">
            <div className="divide-y divide-gray-200">
              {userActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.type === 'dataset_upload' && 'You uploaded a new dataset'}
                        {activity.type === 'dataset_purchase' && 'You purchased access to a dataset'}
                        {activity.type === 'model_attribution' && 'Your dataset was used in a model'}
                        {activity.type === 'dao_vote' && 'You voted on a DAO proposal'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <div className={`mt-6 grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Datasets</p>
                    <p className="text-lg font-semibold text-gray-700">3</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-green-50">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Royalties</p>
                    <p className="text-lg font-semibold text-gray-700">0.35 FIL</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-md bg-purple-50">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">DAO Power</p>
                    <p className="text-lg font-semibold text-gray-700">75</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
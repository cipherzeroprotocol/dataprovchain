import React from 'react';
import PropTypes from 'prop-types';
import { FiUsers, FiDownload, FiBarChart2, FiHeart } from 'react-icons/fi';
import Card from '../common/Card';
import { formatNumber } from '../../utils/formatting';

const DatasetStats = ({ 
  stats = {}, 
  isOwner = false,
  className = ''
}) => {
  const {
    purchases = 0,
    downloads = 0,
    views = 0,
    likes = 0,
    earnings = 0,
    rating = 0
  } = stats;
  
  return (
    <Card title="Dataset Analytics" className={className}>
      <div className="grid grid-cols-2 gap-4">
        <div className="border-r border-b border-gray-200 p-4">
          <div className="flex items-center">
            <FiUsers className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-500">Purchases</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(purchases)}</p>
        </div>
        
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center">
            <FiDownload className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-500">Downloads</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(downloads)}</p>
        </div>
        
        <div className="border-r border-gray-200 p-4">
          <div className="flex items-center">
            <FiBarChart2 className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm text-gray-500">Views</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(views)}</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center">
            <FiHeart className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-gray-500">Likes</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(likes)}</p>
        </div>
      </div>
      
      {isOwner && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Earnings</span>
            <span className="text-lg font-semibold">{formatNumber(earnings, 2)} FIL</span>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">Average Rating</span>
            <div className="flex items-center">
              <span className="text-lg font-semibold mr-1">{rating.toFixed(1)}</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

DatasetStats.propTypes = {
  stats: PropTypes.shape({
    purchases: PropTypes.number,
    downloads: PropTypes.number,
    views: PropTypes.number,
    likes: PropTypes.number,
    earnings: PropTypes.number,
    rating: PropTypes.number
  }),
  isOwner: PropTypes.bool,
  className: PropTypes.string
};

export default DatasetStats;
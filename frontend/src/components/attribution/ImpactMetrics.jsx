import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const ImpactMetrics = ({ attributions = [], className = '' }) => {
  if (!attributions || attributions.length === 0) {
    return (
      <Card title="Impact Metrics" className={className}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No attribution data available</p>
        </div>
      </Card>
    );
  }

  // Calculate metrics
  const totalUses = attributions.length;
  const averageImpact = Math.round(
    attributions.reduce((sum, item) => sum + item.impactScore, 0) / totalUses
  );
  const verificationRate = Math.round(
    (attributions.filter(a => a.verified).length / totalUses) * 100
  );

  // Group by usage type
  const usageTypes = ['training', 'validation', 'testing', 'finetuning', 'inference'];
  const usageByType = usageTypes.map(type => {
    const count = attributions.filter(a => a.usageType === type).length;
    const percentage = Math.round((count / totalUses) * 100);
    return { type, count, percentage };
  }).filter(item => item.count > 0);

  // Group by time (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      timestamp: d.getTime(),
      count: 0
    };
  }).reverse();

  attributions.forEach(attr => {
    const attrDate = new Date(attr.timestamp);
    const monthIdx = months.findIndex(m => 
      attrDate.getMonth() === new Date(m.timestamp).getMonth() && 
      attrDate.getFullYear() === new Date(m.timestamp).getFullYear()
    );
    if (monthIdx >= 0) months[monthIdx].count++;
  });

  return (
    <Card title="Impact Metrics" className={className}>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Uses</p>
            <p className="text-2xl font-bold text-gray-900">{totalUses}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Average Impact</p>
            <p className="text-2xl font-bold text-blue-600">{averageImpact}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Verification Rate</p>
            <p className="text-2xl font-bold text-green-600">{verificationRate}%</p>
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-900 mb-3">Usage by Type</h4>
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <div className="space-y-3">
            {usageByType.map(usage => (
              <div key={usage.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {usage.type} ({usage.count})
                  </span>
                  <span className="text-sm font-medium text-gray-700">{usage.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${usage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-900 mb-3">Attribution Over Time</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="h-40 flex items-end justify-between">
            {months.map((item, index) => {
              const maxCount = Math.max(...months.map(m => m.count));
              const percentage = maxCount === 0 ? 0 : Math.round((item.count / maxCount) * 100);
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-blue-600 rounded-t" 
                    style={{ height: `${percentage}%`, minHeight: item.count ? '4px' : '0' }}
                  ></div>
                  <div className="mt-2 text-xs text-gray-500">{item.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

ImpactMetrics.propTypes = {
  attributions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      usageType: PropTypes.string.isRequired,
      impactScore: PropTypes.number.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      verified: PropTypes.bool.isRequired
    })
  ),
  className: PropTypes.string
};

export default ImpactMetrics;

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatasetCard from './DatasetCard';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

const DatasetList = ({
  datasets,
  loading,
  error,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className = ''
}) => {
  const [displayedDatasets, setDisplayedDatasets] = useState([]);

  useEffect(() => {
    if (datasets && Array.isArray(datasets)) {
      setDisplayedDatasets(datasets);
    }
  }, [datasets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading datasets"
        description={error}
        icon="error"
      />
    );
  }

  if (!displayedDatasets.length) {
    return (
      <EmptyState
        title="No datasets found"
        description="Try adjusting your filters or check back later for new datasets"
        icon="search"
      />
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedDatasets.map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
      
      {totalItems > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

DatasetList.propTypes = {
  datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  itemsPerPage: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  className: PropTypes.string
};

DatasetList.defaultProps = {
  loading: false,
  error: null,
  totalItems: 0,
  itemsPerPage: 9,
  currentPage: 1,
  onPageChange: () => {}
};

export default DatasetList;
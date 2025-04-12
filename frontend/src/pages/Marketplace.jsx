import React, { useEffect, useState, useContext } from 'react';
import { useMarketplace } from '../hooks/useMarketplace';
import { WalletContext } from '../contexts/WalletContext';
import DatasetCard from '../components/marketplace/DatasetCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const Marketplace = () => {
  const { signer } = useContext(WalletContext);
  const { listings, loading, pagination, getListings } = useMarketplace(signer);
  
  const [filters, setFilters] = useState({
    dataType: '',
    verified: '',
    minPrice: '',
    maxPrice: '',
    tag: '',
    creator: '',
    page: 1
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load listings on component mount and filter changes
  useEffect(() => {
    getListings(filters);
  }, [getListings, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      page: 1 // Reset to first page when applying filters
    });
    getListings(filters);
  };

  const resetFilters = () => {
    setFilters({
      dataType: '',
      verified: '',
      minPrice: '',
      maxPrice: '',
      tag: '',
      creator: '',
      page: 1
    });
    getListings({
      page: 1
    });
  };

  const goToPage = (page) => {
    setFilters({
      ...filters,
      page
    });
  };

  const dataTypes = ['image', 'text', 'audio', 'video', 'tabular', 'other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dataset Marketplace</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover high-quality datasets with verified provenance for AI training
        </p>
      </div>
      
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filter sidebar - desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <Card title="Filters" className="sticky top-20">
            <div className="space-y-4">
              <div>
                <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <Select
                  id="dataType"
                  name="dataType"
                  value={filters.dataType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label htmlFor="verified" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <Select
                  id="verified"
                  name="verified"
                  value={filters.verified}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (FIL)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    min={0}
                  />
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    min={0}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <Input
                  id="tag"
                  name="tag"
                  type="text"
                  value={filters.tag}
                  onChange={handleFilterChange}
                  placeholder="Filter by tag"
                />
              </div>
              
              <div>
                <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-1">
                  Creator Address
                </label>
                <Input
                  id="creator"
                  name="creator"
                  type="text"
                  value={filters.creator}
                  onChange={handleFilterChange}
                  placeholder="0x..."
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="primary"
                  onClick={applyFilters}
                  className="flex-grow"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="mt-8 lg:mt-0 lg:col-span-3">
          {/* Mobile filter button */}
          <div className="block lg:hidden mb-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {/* Mobile filters */}
          {isFilterOpen && (
            <div className="block lg:hidden mb-6">
              <Card>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="dataTypeMobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <Select
                      id="dataTypeMobile"
                      name="dataType"
                      value={filters.dataType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      {dataTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="verifiedMobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Status
                    </label>
                    <Select
                      id="verifiedMobile"
                      name="verified"
                      value={filters.verified}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="true">Verified Only</option>
                      <option value="false">Unverified Only</option>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="primary"
                      onClick={applyFilters}
                      className="flex-grow"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg p-8">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No datasets found</h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your filters or check back later for new datasets.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {listings.map((listing) => (
                    <DatasetCard key={listing.id} dataset={listing} />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        filters.page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === filters.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => goToPage(Math.min(pagination.pages, filters.page + 1))}
                      disabled={filters.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        filters.page === pagination.pages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

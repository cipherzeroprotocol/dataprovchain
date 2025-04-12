import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { useProvenance } from '../hooks/useProvenance';
import { useMarketplace } from '../hooks/useMarketplace';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import DatasetDetailView from '../components/marketplace/DatasetDetail';
import ProvenanceGraph from '../components/provenance/ProvenanceGraph';
import UsageRecorder from '../components/attribution/UsageRecorder';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/formatting';
import { ethers } from 'ethers';

const DatasetDetail = () => {
  const { id } = useParams();
  const { signer, account } = useContext(WalletContext);
  useContext(AuthContext);
  
  const { dataset, loading: datasetLoading, error: datasetError, getDataset } = useDataset();
  const { graph, loading: graphLoading, recordUsage, recording } = useProvenance(signer);
  const { purchaseListing, purchasing } = useMarketplace(signer);
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Fetch dataset details
  useEffect(() => {
    if (id) {
      getDataset(id);
    }
  }, [getDataset, id]);
  
  // Check if the user is the owner or has access
  useEffect(() => {
    if (dataset && account) {
      const isCreator = dataset.creator.walletAddress.toLowerCase() === account.toLowerCase();
      setIsOwner(isCreator);
      
      // Check if the user has purchased access
      // This would typically come from the backend or contract
      // For now, we'll just simulate it
      setHasAccess(isCreator); // Only the creator has access for now
    }
  }, [dataset, account]);
  
  // Handle purchase
  const handlePurchase = async () => {
    try {
      const priceInWei = ethers.utils.parseEther(dataset.price.toString());
      await purchaseListing(dataset.listingId, priceInWei);
      setIsPurchaseModalOpen(false);
      setHasAccess(true);
      // Refresh dataset details
      getDataset(id);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  // Handle usage recording
  const handleRecordUsage = async (usageData) => {
    try {
      await recordUsage(usageData);
      // Refresh provenance graph
      // This would typically trigger a fetch of the updated graph
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  };
  
  if (datasetLoading) {
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
  
  if (datasetError || !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-gray-900">Dataset Not Found</h2>
            <p className="mt-2 text-gray-600">
              The dataset you are looking for does not exist or may have been removed.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DatasetDetailView
        dataset={dataset}
        onPurchase={() => setIsPurchaseModalOpen(true)}
        purchasing={purchasing}
        isOwned={isOwner}
        canAccess={hasAccess}
      />
      
      {/* Provenance Graph Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Provenance</h2>
        {graphLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <ProvenanceGraph data={graph} height={400} />
        )}
      </div>
      
      {/* Usage Recording Section */}
      {hasAccess && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card title="Dataset Usage">
              <p className="text-gray-600">
                Record how you are using this dataset in your AI models to maintain proper provenance and attribution.
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Why Record Usage?</h3>
                <ul className="mt-2 text-gray-600 list-disc list-inside space-y-1">
                  <li>Maintain transparent data lineage for your AI models</li>
                  <li>Ensure proper attribution to data creators</li>
                  <li>Enable fair compensation for dataset contributors</li>
                  <li>Comply with licensing and usage requirements</li>
                </ul>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <UsageRecorder
              datasetId={id}
              onSubmit={handleRecordUsage}
              loading={recording}
            />
          </div>
        </div>
      )}
      
      {/* Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Purchase Dataset Access"
      >
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dataset.name}
            </h3>
            <p className="text-gray-600">
              You are about to purchase access to this dataset.
            </p>
          </div>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">{formatCurrency(dataset.price, 'FIL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">License:</span>
              <span className="font-medium">{dataset.license || 'Standard'}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              By purchasing this dataset, you agree to comply with the license terms and attribution requirements.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsPurchaseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePurchase}
              loading={purchasing}
              disabled={purchasing}
            >
              Confirm Purchase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatasetDetail;

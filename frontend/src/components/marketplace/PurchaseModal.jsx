import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatting';

const PurchaseModal = ({
  isOpen,
  onClose,
  onConfirm,
  dataset,
  processing = false,
  walletBalance = '0',
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToLicense, setAgreedToLicense] = useState(false);

  const hasEnoughBalance = parseFloat(walletBalance) >= parseFloat(dataset?.price || 0);

  const handleConfirm = () => {
    if (agreedToTerms && agreedToLicense && hasEnoughBalance) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Dataset Access"
    >
      <div className="space-y-6">
        {dataset && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Dataset:</span>
                <span className="font-medium">{dataset.name}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">Price:</span>
                <span className="font-medium text-lg">{formatCurrency(dataset.price, 'FIL')}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">Your balance:</span>
                <span className={`font-medium ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(walletBalance, 'FIL')}
                </span>
              </div>
            </div>

            {!hasEnoughBalance && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Insufficient balance. Please add funds to your wallet to complete this purchase.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={agreedToTerms}
                      onChange={() => setAgreedToTerms(!agreedToTerms)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I agree to the terms of service
                    </label>
                    <p className="text-gray-500">
                      By purchasing this dataset, you agree to abide by the DataProvChain platform terms of service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="license"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={agreedToLicense}
                      onChange={() => setAgreedToLicense(!agreedToLicense)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="license" className="font-medium text-gray-700">
                      I agree to the dataset license terms
                    </label>
                    <p className="text-gray-500">
                      {dataset.license && `This dataset is licensed under ${dataset.license}. `}
                      {dataset.attributionRequired && 'Attribution is required when using this dataset. '}
                      You agree to comply with all usage restrictions and conditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!agreedToTerms || !agreedToLicense || !hasEnoughBalance || processing}
                loading={processing}
              >
                Confirm Purchase
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

PurchaseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  dataset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    license: PropTypes.string,
    attributionRequired: PropTypes.bool
  }),
  processing: PropTypes.bool,
  walletBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default PurchaseModal;
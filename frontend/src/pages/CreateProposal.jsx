import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/formatting';

const CreateProposal = () => {
  const navigate = useNavigate();
  const { signer, account } = useContext(WalletContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'parameter',
    parameter: 'royaltyPercentage',
    parameterValue: '',
    recipient: '',
    amount: '',
    votingPeriod: 7
  });
  
  const [userVotingPower, setUserVotingPower] = useState(75); // Mock data
  const [minProposalPower, setMinProposalPower] = useState(50); // Mock data
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Load user voting power
  useEffect(() => {
    const fetchVotingPower = async () => {
      // In a real implementation, this would call the contract
      // const power = await daoContract.getVotingPower(account);
      // setUserVotingPower(power);
      
      // For demo, use mock data
      setUserVotingPower(75);
    };
    
    if (account && signer) {
      fetchVotingPower();
    }
  }, [account, signer]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // In a real implementation, this would call the contract
      // if (formData.type === 'parameter') {
      //   await daoContract.proposeParameterChange(
      //     formData.title,
      //     formData.description,
      //     formData.parameter,
      //     formData.parameterValue,
      //     formData.votingPeriod
      //   );
      // } else if (formData.type === 'spending') {
      //   await daoContract.proposeSpending(
      //     formData.title,
      //     formData.description,
      //     formData.recipient,
      //     ethers.utils.parseEther(formData.amount),
      //     formData.votingPeriod
      //   );
      // }
      
      // For demo, simulate delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitting(false);
      
      // Navigate to DAO page
      navigate('/dao');
      
      // Show success message
      alert('Proposal submitted successfully!');
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setError('Failed to submit proposal. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Get proposal parameters based on type
  const renderProposalTypeFields = () => {
    switch (formData.type) {
      case 'parameter':
        return (
          <>
            <div>
              <label htmlFor="parameter" className="block text-sm font-medium text-gray-700">
                Parameter
              </label>
              <select
                id="parameter"
                name="parameter"
                value={formData.parameter}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="royaltyPercentage">Royalty Percentage</option>
                <option value="quorumPercentage">Minimum Quorum</option>
                <option value="votingPeriod">Voting Period</option>
                <option value="proposalThreshold">Proposal Threshold</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="parameterValue" className="block text-sm font-medium text-gray-700">
                New Value
              </label>
              <input
                type="text"
                id="parameterValue"
                name="parameterValue"
                value={formData.parameterValue}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.parameter === 'royaltyPercentage' && 'Enter a percentage value (e.g., 5 for 5%)'}
                {formData.parameter === 'quorumPercentage' && 'Enter a percentage value (e.g., 33 for 33%)'}
                {formData.parameter === 'votingPeriod' && 'Enter days (e.g., 7 for 7 days)'}
                {formData.parameter === 'proposalThreshold' && 'Enter minimum voting power required'}
              </p>
            </div>
          </>
        );
      
      case 'spending':
        return (
          <>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Recipient Address
              </label>
              <input
                type="text"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                placeholder="0x..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                required
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (FIL)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum spending limit per proposal: {formatCurrency(5, 'FIL')}
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Proposal</h1>
        <p className="mt-2 text-lg text-gray-600">
          Submit a new governance proposal to the DataProvChain DAO
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Proposal Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Provide a detailed explanation of your proposal and why it should be implemented.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Proposal Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="parameter">Parameter Change</option>
                      <option value="spending">Treasury Spending</option>
                    </select>
                  </div>
                  
                  {renderProposalTypeFields()}
                  
                  <div>
                    <label htmlFor="votingPeriod" className="block text-sm font-medium text-gray-700">
                      Voting Period (days)
                    </label>
                    <select
                      id="votingPeriod"
                      name="votingPeriod"
                      value={formData.votingPeriod}
                      onChange={handleChange}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                    </select>
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-50 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dao')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                      disabled={submitting || userVotingPower < minProposalPower}
                    >
                      Submit Proposal
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Proposal Guidelines</h3>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h4 className="font-medium text-gray-900">Voting Power</h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Your current voting power: <span className="font-medium">{userVotingPower}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Minimum required: <span className="font-medium">{minProposalPower}</span>
                </p>
                
                {userVotingPower < minProposalPower && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                    You need more voting power to create a proposal.
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Parameter Change</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Proposals to modify governance parameters like royalty percentages, voting periods, or quorum requirements.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Treasury Spending</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Proposals to allocate treasury funds for development, marketing, or other initiatives.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Tips for Success</h4>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Be specific about what you want to change</li>
                    <li>Explain the benefits to the community</li>
                    <li>Provide data or research to back your proposal</li>
                    <li>Engage with community feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
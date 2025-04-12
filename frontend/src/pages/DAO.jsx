import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProposalCard from '../components/dao/ProposalCard';
import VotingPower from '../components/dao/VotingPower';
import { formatCurrency } from '../utils/formatting';

const DAO = () => {
  const { signer, account } = useContext(WalletContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [userVotingPower, setUserVotingPower] = useState(0);
  const [totalVotingPower, setTotalVotingPower] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for proposals
  const mockProposals = React.useMemo(() => [
    {
      id: '1',
      title: 'Increase royalty percentage for data providers',
      description: 'This proposal aims to increase the minimum royalty percentage for data providers from 2% to 5% to better compensate dataset creators.',
      creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      votesFor: 250,
      votesAgainst: 120,
      quorum: 500,
      executed: false
    },
    {
      id: '2',
      title: 'Add support for audio dataset verification',
      description: 'Implement specialized verification mechanisms for audio datasets to ensure quality and proper attribution.',
      creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'passed',
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      votesFor: 430,
      votesAgainst: 180,
      quorum: 400,
      executed: true
    },
    {
      id: '3',
      title: 'Partner with AI research institutions',
      description: 'Establish formal partnerships with academic AI research institutions to promote dataset usage and proper attribution.',
      creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      status: 'rejected',
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      votesFor: 210,
      votesAgainst: 350,
      quorum: 400,
      executed: false
    }
  ], []);
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API or contract calls
        // const proposals = await daoContract.getProposals();
        // const votingPower = await daoContract.getVotingPower(account);
        // const totalPower = await daoContract.getTotalVotingPower();
        
        // For now, use mock data
        setProposals(mockProposals);
        setUserVotingPower(75);  // Mock value - would come from contract
        setTotalVotingPower(1000);  // Mock value - would come from contract
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load DAO data:', err);
        setError('Failed to load DAO data. Please try again later.');
        setLoading(false);
      }
    };
    
    if (isAuthenticated && account) {
      fetchData();
    }
  }, [isAuthenticated, account, signer, mockProposals]);
  
  // Filter proposals based on status
  const getFilteredProposals = (status) => {
    if (status === 'all') return proposals;
    return proposals.filter(p => p.status === status);
  };
  
  // Handle voting on a proposal
  const handleVote = async (proposalId, support) => {
    try {
      // In a real implementation, this would call the contract
      // await daoContract.castVote(proposalId, support);
      alert(`You voted ${support ? 'for' : 'against'} proposal ${proposalId}`);
      
      // Update local state to reflect the vote
      const updatedProposals = proposals.map(p => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesFor: support ? p.votesFor + userVotingPower : p.votesFor,
            votesAgainst: !support ? p.votesAgainst + userVotingPower : p.votesAgainst
          };
        }
        return p;
      });
      
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Failed to cast vote:', error);
      alert('Failed to cast vote. Please try again.');
    }
  };
  
  // Render proposals tab
  const renderProposalsTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'proposals' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('proposals')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'active' ? 'bg-green-100 text-green-800' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'passed' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('passed')}
            >
              Passed
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'rejected' ? 'bg-red-100 text-red-800' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected
            </button>
          </div>
          
          <Link to="/dao/propose">
            <Button variant="primary" size="sm">
              Create Proposal
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <Card>
            <div className="p-4 text-red-600">
              {error}
            </div>
          </Card>
        ) : getFilteredProposals(activeTab !== 'proposals' ? activeTab : 'all').length === 0 ? (
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-500">No proposals found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {getFilteredProposals(activeTab !== 'proposals' ? activeTab : 'all').map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={handleVote}
                userVotingPower={userVotingPower}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render governance tab
  const renderGovernanceTab = () => {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Voting Power</h3>
              <VotingPower 
                userPower={userVotingPower} 
                totalPower={totalVotingPower} 
              />
              <div className="mt-4">
                <Link to="/dao/staking">
                  <Button variant="outline" size="sm">
                    Increase Voting Power
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Governance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Proposals:</span>
                  <span className="font-medium">{proposals.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Participation:</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Quorum:</span>
                  <span className="font-medium">33% of total voting power</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Card title="Governance Parameters">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Voting Parameters</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>Voting Period:</span>
                    <span className="font-medium">7 days</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Minimum Quorum:</span>
                    <span className="font-medium">33%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Proposal Threshold:</span>
                    <span className="font-medium">50 voting power</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Treasury</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>Treasury Balance:</span>
                    <span className="font-medium">{formatCurrency(15.75, 'FIL')}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spending Limit:</span>
                    <span className="font-medium">{formatCurrency(5, 'FIL')} per proposal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DataProvChain DAO</h1>
        <p className="mt-2 text-lg text-gray-600">
          Participate in governance and shape the future of data provenance
        </p>
      </div>
      
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'proposals' || activeTab === 'active' || activeTab === 'passed' || activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
            onClick={() => setActiveTab('proposals')}
          >
            Proposals
          </button>
          <button
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'governance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
            onClick={() => setActiveTab('governance')}
          >
            Governance
          </button>
        </nav>
      </div>
      
      {activeTab === 'proposals' || activeTab === 'active' || activeTab === 'passed' || activeTab === 'rejected'
        ? renderProposalsTab()
        : renderGovernanceTab()}
    </div>
  );
};

export default DAO;
import React, { useState } from 'react';
import Card from '../components/common/Card';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Documentation' }
  ];

  // Define documentation sections
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'data-providers', title: 'For Data Providers' },
    { id: 'ai-developers', title: 'For AI Developers' },
    { id: 'provenance', title: 'Data Provenance' },
    { id: 'attribution', title: 'Attribution & Royalties' },
    { id: 'dao', title: 'Governance DAO' },
    { id: 'api', title: 'API Reference' },
    { id: 'filecoin', title: 'Filecoin Integration' }
  ];

  // Function to render the active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DataProvChain Overview</h2>
            <p className="mb-4">
              DataProvChain is a blockchain-based platform for transparent AI data provenance, attribution, and royalty distribution. 
              It enables data providers to share their datasets with AI developers while maintaining proper attribution and 
              receiving fair compensation for their contributions.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dataset Registry:</strong> Register your datasets on the blockchain with NFT-based ownership verification.
              </li>
              <li>
                <strong>Provenance Tracking:</strong> Track the lineage and usage of datasets across AI models.
              </li>
              <li>
                <strong>Attribution Management:</strong> Ensure proper attribution for dataset contributors.
              </li>
              <li>
                <strong>Royalty Distribution:</strong> Automatically distribute royalties based on dataset usage and impact.
              </li>
              <li>
                <strong>Decentralized Storage:</strong> Store datasets securely on Filecoin with guaranteed availability.
              </li>
              <li>
                <strong>Marketplace:</strong> Discover and access high-quality datasets for AI training.
              </li>
              <li>
                <strong>Governance DAO:</strong> Participate in platform governance decisions.
              </li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">How It Works</h3>
            <p className="mb-4">
              DataProvChain uses blockchain technology to create a transparent and verifiable record of dataset provenance,
              ownership, and usage. Smart contracts manage the registration of datasets, track their usage in AI models,
              and handle the distribution of royalties to contributors.
            </p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-lg font-bold text-blue-800 mb-2">Getting Started</h4>
              <p className="text-blue-700">
                To get started with DataProvChain, connect your wallet, create an account, and explore the platform&apos;s features.
                If you&apos;re a data provider, you can submit your datasets to the registry. If you&apos;re an AI developer, you can
                browse the marketplace for datasets to use in your models.
              </p>
            </div>
          </div>
        );
      
      case 'getting-started':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started with DataProvChain</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Connect Your Wallet</h3>
                <p>
                  DataProvChain uses blockchain technology for secure authentication and transactions. To get started,
                  you&apos;ll need a Web3 wallet like MetaMask.
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Click the &quot;Connect Wallet&quot; button in the top right corner</li>
                  <li>Select your wallet provider (MetaMask, WalletConnect, etc.)</li>
                  <li>Approve the connection request in your wallet</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Create an Account</h3>
                <p>
                  After connecting your wallet, you&apos;ll need to create an account to access all platform features.
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Click &quot;Sign Up&quot; to create a new account</li>
                  <li>Fill in your username and email</li>
                  <li>Your wallet address will be automatically linked to your account</li>
                  <li>Sign the authentication message with your wallet</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Explore the Platform</h3>
                <p>
                  Now that you&apos;re logged in, you can explore the different features of the platform:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li><strong>Marketplace:</strong> Browse and access datasets</li>
                  <li><strong>Submit Dataset:</strong> Register your own datasets</li>
                  <li><strong>Dashboard:</strong> Manage your datasets and monitor royalties</li>
                  <li><strong>Provenance Explorer:</strong> Visualize dataset lineage and usage</li>
                  <li><strong>DAO:</strong> Participate in governance decisions</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-bold text-yellow-800 mb-2">Note about Filecoin Network</h4>
                <p className="text-yellow-700">
                  DataProvChain operates on the Filecoin Calibration testnet. Make sure your wallet is configured
                  for this network. You&apos;ll need testnet FIL to perform transactions, which you can obtain from
                  the Filecoin faucet.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'data-providers':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guide for Data Providers</h2>
            
            <p className="mb-4">
              As a data provider, you can use DataProvChain to share your datasets with AI developers, track their usage,
              and receive fair compensation through royalties. This guide explains how to register and manage your datasets
              on the platform.
            </p>
            
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registering a Dataset</h3>
                <p>
                  To register a dataset on DataProvChain, follow these steps:
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>
                    <strong>Prepare your dataset:</strong> Organize your data files and create appropriate metadata.
                    Make sure your dataset complies with relevant data protection regulations and licensing requirements.
                  </li>
                  <li>
                    <strong>Go to &quot;Submit Dataset&quot;:</strong> Navigate to the &quot;Submit Dataset&quot; page from the main menu.
                  </li>
                  <li>
                    <strong>Fill in dataset details:</strong> Provide a name, description, data type, and license information
                    for your dataset. Add relevant tags to help users discover your dataset.
                  </li>
                  <li>
                    <strong>Upload files:</strong> Upload your dataset files. These will be stored securely on Filecoin.
                  </li>
                  <li>
                    <strong>Specify contributors:</strong> If multiple people contributed to the dataset, specify each
                    contributor and their contribution share percentage.
                  </li>
                  <li>
                    <strong>Add metadata:</strong> Provide additional metadata to help users understand your dataset.
                  </li>
                  <li>
                    <strong>Review and submit:</strong> Review all information and submit your dataset. You&apos;ll need to
                    sign a transaction with your wallet to confirm the registration.
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Managing Attribution and Royalties</h3>
                <p>
                  Once your dataset is registered, you can track its usage and manage royalties:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>
                    <strong>View usage:</strong> In your dashboard, you can see how your datasets are being used
                    across different AI models.
                  </li>
                  <li>
                    <strong>Track attribution:</strong> The platform automatically tracks attribution for your datasets
                    when they&apos;re used in AI models.
                  </li>
                  <li>
                    <strong>Receive royalties:</strong> When your datasets are used in commercial applications, you&apos;ll
                    receive royalties based on your contribution share.
                  </li>
                  <li>
                    <strong>Distribute royalties:</strong> If there are multiple contributors, royalties will be
                    distributed according to the specified contribution shares.
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-2">Licensing Tips</h4>
                <p className="text-green-700">
                  Choosing the right license for your dataset is important. Consider the following options:
                </p>
                <ul className="list-disc pl-6 mt-2 text-green-700">
                  <li><strong>CC-BY-4.0:</strong> Allows use with attribution</li>
                  <li><strong>CC-BY-SA-4.0:</strong> Allows use with attribution and share-alike</li>
                  <li><strong>CC-BY-NC-4.0:</strong> Allows non-commercial use with attribution</li>
                  <li><strong>Custom License:</strong> Define your own terms for dataset usage</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      // Add more sections as needed
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a section from the sidebar to view documentation</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
      <p className="text-lg text-gray-600 mb-8">
        Comprehensive guides and reference materials for the DataProvChain platform
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <div className="py-4">
              <h3 className="px-4 text-lg font-medium text-gray-900 mb-4">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>
        
        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6">
              {renderSectionContent()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

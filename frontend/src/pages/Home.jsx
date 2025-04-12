import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Transparent AI Data Provenance
            </h1>
            <p className="mt-6 text-xl">
              DataProvChain helps AI developers and data providers track dataset usage, prove attribution, and earn royalties from dataset usage.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Browse Datasets
                </Button>
              </Link>
              <Link to="/submit">
                <Button variant="primary" size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  Submit Dataset
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why use DataProvChain?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform provides complete transparency and attribution for AI datasets
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Provenance Tracking
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Track the complete history of your datasets with blockchain-based provenance records that can&#39;t be altered or disputed.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Fair Attribution
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Ensure all dataset contributors receive proper attribution and royalties based on the actual usage and impact.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Decentralized Storage
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Store your datasets securely on Filecoin with guaranteed availability and integrity verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How DataProvChain Works
            </h2>
          </div>
          
          <div className="mt-16">
            <div className="relative">
              {/* Steps */}
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* Step 1 */}
                <div className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <div className="mt-5 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Dataset</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Upload your dataset, add metadata, and define contributor shares. We&#39;ll store it securely on Filecoin.
                    </p>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <div className="mt-5 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Record Usage</h3>
                    <p className="mt-2 text-base text-gray-500">
                      AI developers record how they use datasets in their models, creating an immutable provenance trail.
                    </p>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <div className="mt-5 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Receive Attribution</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Data providers receive attribution and royalties automatically based on dataset usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-300">Join the data provenance revolution.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register">
                <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

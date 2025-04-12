import { useState, useEffect, useMemo } from 'react';
import { useProvenance } from '../hooks/useProvenance';
import ProvenanceGraph from '../components/provenance/ProvenanceGraph';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const ProvenanceExplorer = () => {
  useProvenance();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDataset, setSelectedDataset] = useState(null);
  
  // State for the provenance graph
  const [graph, setGraph] = useState(null);

  // Mock datasets for search functionality
  const [datasets, setDatasets] = useState([
    { id: '1', name: 'ImageNet Subset', dataType: 'image', creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: '2', name: 'Text Classification Dataset', dataType: 'text', creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4' },
    { id: '3', name: 'Speech Recognition Dataset', dataType: 'audio', creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2' }
  ]);
  
  // Sample provenance data
  const mockProvenanceData = useMemo(() => ({
    nodes: [
      { id: 'dataset-1', name: 'ImageNet Subset', type: 'dataset', creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
      { id: 'model-1', name: 'Image Classification Model', type: 'model', creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2' },
      { id: 'model-2', name: 'Object Detection Model', type: 'model', creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4' },
      { id: 'model-3', name: 'Image Segmentation Model', type: 'model', creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4' },
      { id: 'user-1', name: 'AI Research Lab', type: 'user', creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2' }
    ],
    edges: [
      { source: 'dataset-1', target: 'model-1', type: 'training', timestamp: '2023-01-15T10:00:00Z' },
      { source: 'dataset-1', target: 'model-2', type: 'training', timestamp: '2023-02-10T14:30:00Z' },
      { source: 'model-1', target: 'model-3', type: 'derivation', timestamp: '2023-03-05T09:15:00Z' },
      { source: 'model-3', target: 'user-1', type: 'inference', timestamp: '2023-03-20T16:45:00Z' }
    ]
  }), []);
  
  // Simulate loading the graph for a selected dataset
  useEffect(() => {
    if (selectedDataset) {
      // In a real implementation, this would fetch from the API
      setTimeout(() => {
        // Mock data for visualization
        setGraph(mockProvenanceData);
      }, 1000);
    }
  }, [mockProvenanceData, selectedDataset]);
  
  const handleSearch = () => {
    // Filter datasets based on search query
    if (searchQuery) {
      const filteredDatasets = datasets.filter(dataset => 
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.id.includes(searchQuery)
      );
      setDatasets(filteredDatasets);
    } else {
      // Reset to all datasets
      setDatasets([
        { id: '1', name: 'ImageNet Subset', dataType: 'image', creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
        { id: '2', name: 'Text Classification Dataset', dataType: 'text', creator: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4' },
        { id: '3', name: 'Speech Recognition Dataset', dataType: 'audio', creator: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2' }
      ]);
    }
  };
  
  const selectDataset = (dataset) => {
    setSelectedDataset(dataset);
    // In a real app, this would fetch the actual provenance graph
    // getProvenanceGraph(dataset.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provenance Explorer</h1>
        <p className="mt-2 text-lg text-gray-600">
          Explore the lineage and usage of AI datasets across models and applications
        </p>
      </div>
      
      <div className="mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search Datasets</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by dataset name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="tabular">Tabular</option>
                </Select>
              </div>
              <div>
                <Button variant="primary" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dataset list */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Datasets</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {datasets.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No datasets found</p>
                </div>
              ) : (
                datasets.map((dataset) => (
                  <div 
                    key={dataset.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDataset?.id === dataset.id ? 'bg-blue-50' : ''}`}
                    onClick={() => selectDataset(dataset)}
                  >
                    <h4 className="text-sm font-medium text-gray-900">{dataset.name}</h4>
                    <p className="mt-1 text-xs text-gray-500">ID: {dataset.id}</p>
                    <p className="mt-1 text-xs text-gray-500">Type: {dataset.dataType}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Provenance graph */}
        <div className="lg:col-span-2">
          {selectedDataset ? (
            <ProvenanceGraph data={graph || mockProvenanceData} height={600} />
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Dataset</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a dataset from the list to view its provenance graph
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Legend and information */}
      {selectedDataset && (
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Understanding Provenance</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Node Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Dataset</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Model</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 mr-2"></div>
                      <span className="text-sm text-gray-600">User/Organization</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Application</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Edge Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Training</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-purple-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Validation</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-pink-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Inference</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-amber-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Derivation</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                The provenance graph visualizes how datasets are used across different AI models and applications.
                Nodes represent datasets, models, users, and applications, while edges represent different types of
                relationships between them. This provides a transparent view of data lineage and attribution.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProvenanceExplorer;

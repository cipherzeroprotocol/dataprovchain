import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const MetadataEditor = ({ metadata, onChange }) => {
  const [entries, setEntries] = useState(
    Object.entries(metadata || {}).map(([key, value]) => ({ key, value }))
  );
  const [newEntry, setNewEntry] = useState({ key: '', value: '' });
  const [error, setError] = useState('');

  const updateEntries = (updatedEntries) => {
    setEntries(updatedEntries);
    
    // Convert to object for parent component
    const metadataObj = updatedEntries.reduce((obj, entry) => {
      if (entry.key.trim()) {
        obj[entry.key.trim()] = entry.value;
      }
      return obj;
    }, {});
    
    onChange(metadataObj);
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    updateEntries(updatedEntries);
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry({
      ...newEntry,
      [field]: value
    });
    setError('');
  };

  const addEntry = () => {
    if (!newEntry.key.trim()) {
      setError('Metadata key is required');
      return;
    }
    
    // Check for duplicate keys
    if (entries.some(entry => entry.key === newEntry.key.trim())) {
      setError('Metadata key already exists');
      return;
    }
    
    const updatedEntries = [
      ...entries,
      {
        key: newEntry.key.trim(),
        value: newEntry.value
      }
    ];
    
    updateEntries(updatedEntries);
    
    // Reset form
    setNewEntry({
      key: '',
      value: ''
    });
  };

  const removeEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    updateEntries(updatedEntries);
  };

  const handleSubmitJson = (jsonString) => {
    try {
      const jsonObj = JSON.parse(jsonString);
      
      if (typeof jsonObj !== 'object' || jsonObj === null || Array.isArray(jsonObj)) {
        setError('Invalid JSON object');
        return;
      }
      
      const newEntries = Object.entries(jsonObj).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
      
      updateEntries(newEntries);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata Fields</h4>
        
        {entries.length === 0 ? (
          <Card className="bg-gray-50">
            <p className="text-sm text-gray-500 text-center py-4">
              No metadata fields added yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-1/3">
                  <Input
                    type="text"
                    placeholder="Key"
                    value={entry.key}
                    onChange={(e) => handleEntryChange(index, 'key', e.target.value)}
                  />
                </div>
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={entry.value}
                    onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeEntry(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add Metadata Field</h4>
        
        <div className="flex items-center space-x-4">
          <div className="w-1/3">
            <Input
              type="text"
              placeholder="Key"
              value={newEntry.key}
              onChange={(e) => handleNewEntryChange('key', e.target.value)}
            />
          </div>
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Value"
              value={newEntry.value}
              onChange={(e) => handleNewEntryChange('value', e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addEntry}
          >
            Add
          </Button>
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Import from JSON</h4>
        
        <textarea
          placeholder="Paste JSON object here"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={4}
          onChange={(e) => handleSubmitJson(e.target.value)}
        />
        
        <p className="mt-2 text-xs text-gray-500">
          You can paste a JSON object to quickly add multiple metadata fields
        </p>
      </div>
    </div>
  );
};

MetadataEditor.propTypes = {
  metadata: PropTypes.object,
  onChange: PropTypes.func.isRequired
};

export default MetadataEditor;

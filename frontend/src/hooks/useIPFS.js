import { useState, useCallback } from 'react';
import * as ipfsService from '../services/ipfs';
import { useNotificationContext } from '../contexts/NotificationContext';

export const useIPFS = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  
  const { success, error: showError } = useNotificationContext();

  // Upload file to IPFS
  const uploadFile = useCallback(async (file, options = {}) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional options to formData
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      // Upload file with progress tracking
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      const result = await ipfsService.uploadFile(formData, onProgress);
      
      success('File uploaded successfully to IPFS');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to upload file: ${err.message}`);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [success, showError]);

  // Upload multiple files to IPFS as a directory
  const uploadDirectory = useCallback(async (files, options = {}) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Create FormData
      const formData = new FormData();
      
      // Append files with proper path structure
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add additional options to formData
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      // Upload files with progress tracking
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      const result = await ipfsService.uploadDirectory(formData, onProgress);
      
      success('Directory uploaded successfully to IPFS');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to upload directory: ${err.message}`);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [success, showError]);

  // Get file by CID
  const getFile = useCallback(async (cid, fileName) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ipfsService.getFile(cid, fileName);
      setFile(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pin file on IPFS
  const pinFile = useCallback(async (cid) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ipfsService.pinFile(cid);
      
      success('File pinned successfully');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to pin file: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Unpin file from IPFS
  const unpinFile = useCallback(async (cid) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ipfsService.unpinFile(cid);
      
      success('File unpinned successfully');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to unpin file: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Get IPFS stats
  const getStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      return await ipfsService.getStats();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pins list
  const getPins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      return await ipfsService.getPins();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if file is pinned
  const checkPin = useCallback(async (cid) => {
    try {
      setLoading(true);
      setError(null);
      
      return await ipfsService.checkPin(cid);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    loading,
    error,
    file,
    uploadFile,
    uploadDirectory,
    getFile,
    pinFile,
    unpinFile,
    getStats,
    getPins,
    checkPin
  };
};

export default useIPFS;
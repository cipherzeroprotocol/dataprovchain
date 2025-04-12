import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatFileSize } from '../../utils/formatting';

const FileUploader = ({
  accept = '*',
  multiple = false,
  maxSize = 1024 * 1024 * 500, // 500MB
  onChange,
  uploading = false,
  progress = 0,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList) => {
    const fileArray = Array.from(fileList);
    const validFiles = [];
    const errorMessages = [];
    
    fileArray.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errorMessages.push(`${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }
      
      // Check file type if accept is specified
      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        const isAccepted = acceptedTypes.some(type => {
          // Check MIME type
          if (type.includes('/') && fileType === type) return true;
          // Check file extension
          if (type.startsWith('.') && fileExtension === type) return true;
          return false;
        });
        
        if (!isAccepted) {
          errorMessages.push(`${file.name} has an unsupported file type.`);
          return;
        }
      }
      
      validFiles.push(file);
    });
    
    return { validFiles, errorMessages };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const { validFiles, errorMessages } = validateFiles(e.dataTransfer.files);
      
      if (errorMessages.length > 0) {
        setErrors(errorMessages);
        return;
      }
      
      setErrors([]);
      
      if (multiple) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
        onChange([...files, ...validFiles]);
      } else {
        setFiles([validFiles[0]]);
        onChange([validFiles[0]]);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const { validFiles, errorMessages } = validateFiles(e.target.files);
      
      if (errorMessages.length > 0) {
        setErrors(errorMessages);
        return;
      }
      
      setErrors([]);
      
      if (multiple) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
        onChange([...files, ...validFiles]);
      } else {
        setFiles([validFiles[0]]);
        onChange([validFiles[0]]);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onChange(newFiles);
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
        />
        
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop files here, or{' '}
          <span 
            className="text-blue-600 hover:text-blue-500 cursor-pointer"
            onClick={handleButtonClick}
          >
            browse
          </span>
        </p>
        
        <p className="mt-1 text-xs text-gray-500">
          {multiple ? 'Upload multiple files' : 'Upload a single file'} up to {formatFileSize(maxSize)}
        </p>
        
        {uploading && (
          <div className="w-full mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}
      </div>
      
      {errors.length > 0 && (
        <div className="mt-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files
          </h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <svg 
                    className="w-5 h-5 text-gray-400 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

FileUploader.propTypes = {
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
  progress: PropTypes.number,
  className: PropTypes.string
};

export default FileUploader;

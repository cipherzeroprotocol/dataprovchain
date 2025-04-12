import { ethers } from 'ethers';

/**
 * Format a date string to a readable format
 * @param {string|number|Date} date Date to format
 * @param {boolean} includeTime Whether to include time
 * @returns {string} Formatted date
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Format file size to a readable format
 * @param {number} bytes Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a currency amount
 * @param {string|number} amount Amount to format
 * @param {string} currency Currency symbol
 * @param {number} decimals Number of decimal places
 * @returns {string} Formatted currency amount
 */
export const formatCurrency = (amount, currency = 'FIL', decimals = 18) => {
  if (amount === undefined || amount === null) return '';
  
  // Convert from wei to ether format if needed
  const formattedAmount = typeof amount === 'string' && amount.length > 10
    ? ethers.utils.formatUnits(amount, decimals)
    : amount.toString();
  
  // Format with 4 decimal places max
  const parsed = parseFloat(formattedAmount);
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${currency}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text Text to truncate
 * @param {number} maxLength Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

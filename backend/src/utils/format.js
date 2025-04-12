/**
 * Formatting utilities for data presentation
 */

/**
 * Format a date to a readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  const dateToFormat = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateToFormat);
};

/**
 * Format a number with thousand separators and fixed decimals
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted number
 */
const formatNumber = (number, decimals = 2, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format a file size in a human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a duration in milliseconds to a readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration (e.g., "2h 30m 15s")
 */
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} - Truncated string
 */
const truncateString = (str, length, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return `${str.substring(0, length).trim()}${suffix}`;
};

/**
 * Format a currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted currency amount
 */
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format a percentage
 * @param {number} value - The value (e.g., 0.75 for 75%)
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} - Formatted percentage
 */
const formatPercentage = (value, decimals = 1, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Convert camelCase or snake_case to Title Case
 * @param {string} str - The string to convert
 * @returns {string} - The title-cased string
 */
const toTitleCase = (str) => {
  // Handle camelCase
  const fromCamelCase = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Handle snake_case
  const fromSnakeCase = fromCamelCase.replace(/_/g, ' ');
  // Capitalize first letter of each word
  return fromSnakeCase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

module.exports = {
  formatDate,
  formatNumber,
  formatFileSize,
  formatDuration,
  truncateString,
  formatCurrency,
  formatPercentage,
  toTitleCase
};

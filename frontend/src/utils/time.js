/**
 * Get the current timestamp in milliseconds
 * @returns {number} Current timestamp
 */
export const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Get the current timestamp in seconds
 * @returns {number} Current timestamp in seconds
 */
export const getCurrentTimestampInSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Format a timestamp to a human-readable relative time (e.g., "2 hours ago")
 * @param {number|string|Date} timestamp Timestamp to format
 * @returns {string} Formatted relative time
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  // Time units in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  // Check each interval
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 
        ? `1 ${unit} ago` 
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

/**
 * Calculate the time difference between two dates in a specific unit
 * @param {Date|number|string} date1 First date
 * @param {Date|number|string} date2 Second date
 * @param {string} unit Unit of result ('seconds', 'minutes', 'hours', 'days')
 * @returns {number} Time difference in the specified unit
 */
export const getTimeDifference = (date1, date2, unit = 'seconds') => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2 - d1);
  
  const conversions = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000
  };
  
  return Math.floor(diffMs / conversions[unit] || conversions.seconds);
};

/**
 * Check if a date is in the past
 * @param {Date|number|string} date Date to check
 * @returns {boolean} Whether the date is in the past
 */
export const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if a date is in the future
 * @param {Date|number|string} date Date to check
 * @returns {boolean} Whether the date is in the future
 */
export const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Add time to a date
 * @param {Date|number|string} date Base date
 * @param {number} amount Amount to add
 * @param {string} unit Unit ('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
 * @returns {Date} Resulting date
 */
export const addTime = (date, amount, unit = 'days') => {
  const d = new Date(date);
  
  switch(unit) {
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'weeks':
      d.setDate(d.getDate() + (amount * 7));
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
    default:
      d.setDate(d.getDate() + amount);
  }
  
  return d;
};
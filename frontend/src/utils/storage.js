/**
 * Get item from localStorage with error handling
 * @param {string} key Key to retrieve
 * @returns {any} Retrieved value or null
 */
export const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Set item in localStorage with error handling
 * @param {string} key Key to set
 * @param {any} value Value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key Key to remove
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

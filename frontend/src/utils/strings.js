/**
 * Capitalize the first letter of a string
 * @param {string} str String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert camelCase to Title Case
 * @param {string} str camelCase string
 * @returns {string} Title Case string
 */
export const camelToTitleCase = (str) => {
  if (!str) return '';
  
  const result = str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (firstChar) => firstChar.toUpperCase());
  
  return result;
};

/**
 * Convert kebab-case to camelCase
 * @param {string} str kebab-case string
 * @returns {string} camelCase string
 */
export const kebabToCamelCase = (str) => {
  if (!str) return '';
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Convert camelCase to kebab-case
 * @param {string} str camelCase string
 * @returns {string} kebab-case string
 */
export const camelToKebabCase = (str) => {
  if (!str) return '';
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Generate a random string of specified length
 * @param {number} length Length of the string
 * @param {string} charset Character set to use (default: alphanumeric)
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Pluralize a word based on count
 * @param {string} singular Singular form
 * @param {string} plural Plural form
 * @param {number} count Count
 * @returns {string} Pluralized word
 */
export const pluralize = (singular, plural, count) => {
  return count === 1 ? singular : plural;
};

/**
 * Truncate a string and add ellipsis if it exceeds max length
 * @param {string} str String to truncate
 * @param {number} maxLength Maximum length
 * @param {string} ellipsis Ellipsis string
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength, ellipsis = '...') => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Sanitize a string for use in HTML (prevents XSS)
 * @param {string} str String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Strip HTML tags from a string
 * @param {string} html HTML string
 * @returns {string} Plain text string
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Convert a string to snake_case
 * @param {string} str String to convert
 * @returns {string} snake_case string
 */
export const toSnakeCase = (str) => {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};
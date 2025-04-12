/**
 * UI Constants for DataProvChain
 * Contains constants for UI elements, themes, and configurations
 */

// Page title suffix
export const PAGE_TITLE_SUFFIX = 'DataProvChain';

// Content max widths
export const CONTENT_WIDTH = {
  SM: 'max-w-3xl',
  MD: 'max-w-5xl',
  LG: 'max-w-7xl',
  XL: 'max-w-screen-2xl',
  FULL: 'max-w-full'
};

// Animation durations
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN_OUT: 'ease-in-out',
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in'
  }
};

// Card styles
export const CARD_STYLES = {
  DEFAULT: 'bg-white shadow rounded-lg overflow-hidden',
  BORDERED: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
  ELEVATED: 'bg-white shadow-md rounded-lg overflow-hidden',
  FLAT: 'bg-gray-50 rounded-lg overflow-hidden'
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  DANGER: 'danger',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  LINK: 'link'
};

// Table styles
export const TABLE_STYLES = {
  DEFAULT: 'min-w-full divide-y divide-gray-200',
  BORDERED: 'min-w-full border border-gray-200 divide-y divide-gray-200',
  STRIPED: 'min-w-full divide-y divide-gray-200 striped'
};

// Pagination sizes
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
};

// Badge colors
export const BADGE_COLORS = {
  GRAY: 'gray',
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue',
  INDIGO: 'indigo',
  PURPLE: 'purple',
  PINK: 'pink',
  CYAN: 'cyan',
  ORANGE: 'orange',
  VIOLET: 'violet'
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
};

// Notification positions
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

// Form validation error messages
export const FORM_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be at most ${max} characters`,
  INVALID_ETH_ADDRESS: 'Please enter a valid Ethereum address',
  PASSWORDS_DONT_MATCH: 'Passwords do not match'
};

// Dataset types
export const DATASET_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'text', label: 'Text' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'tabular', label: 'Tabular' },
  { value: 'multimodal', label: 'Multimodal' },
  { value: 'other', label: 'Other' }
];

// Provenance action types
export const PROVENANCE_ACTION_TYPES = [
  { value: 'creation', label: 'Creation' },
  { value: 'modification', label: 'Modification' },
  { value: 'derivation', label: 'Derivation' },
  { value: 'verification', label: 'Verification' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'usage', label: 'Usage' },
  { value: 'storage_confirmed', label: 'Storage Confirmed' },
  { value: 'storage_failed', label: 'Storage Failed' },
  { value: 'access', label: 'Access' }
];

// License types
export const LICENSE_TYPES = [
  { value: 'cc0', label: 'CC0 (Public Domain)' },
  { value: 'cc-by', label: 'CC BY (Attribution)' },
  { value: 'cc-by-sa', label: 'CC BY-SA (Attribution-ShareAlike)' },
  { value: 'cc-by-nc', label: 'CC BY-NC (Attribution-NonCommercial)' },
  { value: 'cc-by-nd', label: 'CC BY-ND (Attribution-NoDerivs)' },
  { value: 'cc-by-nc-sa', label: 'CC BY-NC-SA (Attribution-NonCommercial-ShareAlike)' },
  { value: 'cc-by-nc-nd', label: 'CC BY-NC-ND (Attribution-NonCommercial-NoDerivs)' },
  { value: 'apache-2.0', label: 'Apache 2.0' },
  { value: 'mit', label: 'MIT' },
  { value: 'gpl-3.0', label: 'GPL 3.0' },
  { value: 'custom', label: 'Custom License' }
];

// Network types for blockchain interactions
export const NETWORK_TYPES = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  LOCALHOST: 'localhost'
};

// Default theme settings
export const THEME = {
  COLORS: {
    PRIMARY: '#3B82F6', // blue-500
    SECONDARY: '#6B7280', // gray-500
    ACCENT: '#8B5CF6', // violet-500
    SUCCESS: '#10B981', // green-500
    WARNING: '#F59E0B', // amber-500
    DANGER: '#EF4444', // red-500
    INFO: '#3B82F6' // blue-500
  },
  DARK_MODE: false
};

// Breakpoints for responsive design (matches Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  WITH_TIME: 'MMM D, YYYY h:mm A',
  FULL: 'MMMM D, YYYY h:mm:ss A',
  ISO: 'YYYY-MM-DD'
};

// File size limits
export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  DATASET_PREVIEW: 5 * 1024 * 1024, // 5MB
  DATASET_UPLOAD: 1024 * 1024 * 1024 // 1GB
};

// Provenance graph node types and colors
export const PROVENANCE_GRAPH = {
  NODE_TYPES: {
    DATASET: 'dataset',
    MODEL: 'model',
    USER: 'user',
    ACTION: 'action',
    APPLICATION: 'application'
  },
  NODE_COLORS: {
    dataset: '#3b82f6', // blue
    model: '#10b981',   // green
    user: '#6366f1',    // indigo
    action: '#f59e0b',  // amber
    application: '#8b5cf6' // purple
  },
  EDGE_COLORS: {
    training: '#3b82f6',  // blue
    validation: '#8b5cf6', // purple
    inference: '#ec4899',  // pink
    derivation: '#f59e0b',  // amber
    usage: '#10b981',      // green
    creation: '#6366f1',   // indigo
    transfer: '#64748b'    // slate
  }
};
/**
 * Application Routes for DataProvChain
 * Defines all routes and path constants for the application
 */

// Base routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  DOCUMENTATION: '/docs',
  FAQ: '/faq',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Authentication routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  CONNECT_WALLET: '/connect-wallet',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Dataset routes
  DATASETS: '/datasets',
  DATASET_DETAIL: '/datasets/:id',
  DATASET_CREATE: '/datasets/create',
  DATASET_EDIT: '/datasets/:id/edit',
  DATASET_UPLOAD: '/datasets/:id/upload',
  
  // Provenance routes
  PROVENANCE: '/provenance',
  PROVENANCE_EXPLORER: '/provenance/explorer',
  PROVENANCE_DETAIL: '/provenance/:id',
  PROVENANCE_VERIFY: '/provenance/:id/verify',
  
  // Marketplace routes
  MARKETPLACE: '/marketplace',
  MARKETPLACE_LISTING: '/marketplace/:id',
  MARKETPLACE_CREATE: '/marketplace/create',
  MARKETPLACE_PURCHASES: '/marketplace/purchases',
  MARKETPLACE_SALES: '/marketplace/sales',
  
  // Attribution routes
  ATTRIBUTION: '/attribution',
  ATTRIBUTION_LIST: '/attribution/list',
  ATTRIBUTION_DETAIL: '/attribution/:id',
  ATTRIBUTION_CREATE: '/attribution/create',
  
  // DAO routes
  DAO: '/dao',
  DAO_PROPOSALS: '/dao/proposals',
  DAO_PROPOSAL_DETAIL: '/dao/proposals/:id',
  DAO_PROPOSAL_CREATE: '/dao/proposals/create',
  DAO_VOTING: '/dao/voting',
  DAO_TREASURY: '/dao/treasury',
  
  // Analytics routes
  ANALYTICS: '/analytics',
  ANALYTICS_USAGE: '/analytics/usage',
  ANALYTICS_ATTRIBUTION: '/analytics/attribution',
  ANALYTICS_ROYALTIES: '/analytics/royalties',
  
  // Royalty routes
  ROYALTIES: '/royalties',
  ROYALTY_EARNINGS: '/royalties/earnings',
  ROYALTY_PAYMENTS: '/royalties/payments',
  ROYALTY_SETTINGS: '/royalties/settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_DATASETS: '/admin/datasets',
  ADMIN_MARKETPLACE: '/admin/marketplace',
  ADMIN_DAO: '/admin/dao'
};

// Helper function to build paths with parameters
export const buildPath = (path, params = {}) => {
  let result = path;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

// External links
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/dataprovchain',
  DOCUMENTATION: 'https://docs.dataprovchain.io',
  TWITTER: 'https://twitter.com/dataprovchain',
  DISCORD: 'https://discord.gg/dataprovchain',
  FILECOIN_EXPLORER: 'https://explorer.filecoin.io',
  IPFS_EXPLORER: 'https://gateway.ipfs.io/ipfs'
};

// API endpoints (for frontend routes that match API endpoints)
export const API_ROUTES = {
  // Base API path
  BASE: '/api',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    CONNECT_WALLET: '/api/auth/connect-wallet'
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    GET_BY_ID: (id) => `/api/users/${id}`
  },
  
  // Dataset endpoints
  DATASET: {
    LIST: '/api/datasets',
    CREATE: '/api/datasets',
    GET_BY_ID: (id) => `/api/datasets/${id}`,
    UPDATE: (id) => `/api/datasets/${id}`,
    DELETE: (id) => `/api/datasets/${id}`,
    UPLOAD: (id) => `/api/datasets/${id}/upload`,
    DOWNLOAD: (id) => `/api/datasets/${id}/download`,
    PREVIEW: (id) => `/api/datasets/${id}/preview`
  },
  
  // Provenance endpoints
  PROVENANCE: {
    BASE: '/api/provenance',
    HISTORY: (datasetId) => `/api/provenance/dataset/${datasetId}`,
    GRAPH: (datasetId) => `/api/provenance/dataset/${datasetId}/graph`,
    VERIFY: (datasetId) => `/api/provenance/dataset/${datasetId}/verify`,
    ADD_RECORD: '/api/provenance',
    RECORD_DETAIL: (id) => `/api/provenance/${id}`,
    USAGE: '/api/provenance/usage'
  },
  
  // Marketplace endpoints
  MARKETPLACE: {
    LISTINGS: '/api/marketplace/listings',
    CREATE_LISTING: '/api/marketplace/listings',
    GET_LISTING: (id) => `/api/marketplace/listings/${id}`,
    UPDATE_LISTING: (id) => `/api/marketplace/listings/${id}`,
    DELETE_LISTING: (id) => `/api/marketplace/listings/${id}`,
    PURCHASE: (id) => `/api/marketplace/listings/${id}/purchase`,
    USER_PURCHASES: '/api/marketplace/purchases',
    USER_SALES: '/api/marketplace/sales'
  },
  
  // Attribution endpoints
  ATTRIBUTION: {
    LIST: '/api/attribution',
    CREATE: '/api/attribution',
    GET_BY_ID: (id) => `/api/attribution/${id}`,
    UPDATE: (id) => `/api/attribution/${id}`,
    DELETE: (id) => `/api/attribution/${id}`,
    BY_DATASET: (datasetId) => `/api/attribution/dataset/${datasetId}`,
    BY_MODEL: (modelId) => `/api/attribution/model/${modelId}`
  },
  
  // DAO endpoints
  DAO: {
    PROPOSALS: '/api/dao/proposals',
    CREATE_PROPOSAL: '/api/dao/proposals',
    GET_PROPOSAL: (id) => `/api/dao/proposals/${id}`,
    VOTE: (id) => `/api/dao/proposals/${id}/vote`,
    TREASURY: '/api/dao/treasury',
    MEMBER_INFO: '/api/dao/member'
  },
  
  // Royalty endpoints
  ROYALTY: {
    EARNINGS: '/api/royalties/earnings',
    PAYMENTS: '/api/royalties/payments',
    SETTINGS: '/api/royalties/settings',
    DISTRIBUTION: '/api/royalties/distribution',
    CLAIM: '/api/royalties/claim'
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DATASET_USAGE: '/api/analytics/datasets/usage',
    ATTRIBUTION: '/api/analytics/attribution',
    ROYALTIES: '/api/analytics/royalties',
    MARKETPLACE: '/api/analytics/marketplace',
    USER_STATS: '/api/analytics/users'
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: '/api/admin/users',
    DATASETS: '/api/admin/datasets',
    MARKETPLACE: '/api/admin/marketplace',
    DAO: '/api/admin/dao',
    SYSTEM_STATS: '/api/admin/stats'
  }
};

// Route groups used for navigation and authorization
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.ABOUT,
    ROUTES.DOCUMENTATION,
    ROUTES.FAQ,
    ROUTES.CONTACT,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
    ROUTES.CONNECT_WALLET
  ],
  AUTHENTICATED: [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
    ROUTES.DATASETS,
    ROUTES.DATASET_DETAIL,
    ROUTES.DATASET_CREATE,
    ROUTES.DATASET_EDIT,
    ROUTES.DATASET_UPLOAD,
    ROUTES.PROVENANCE,
    ROUTES.PROVENANCE_EXPLORER,
    ROUTES.PROVENANCE_DETAIL,
    ROUTES.PROVENANCE_VERIFY,
    ROUTES.MARKETPLACE,
    ROUTES.MARKETPLACE_LISTING,
    ROUTES.MARKETPLACE_CREATE,
    ROUTES.MARKETPLACE_PURCHASES,
    ROUTES.MARKETPLACE_SALES,
    ROUTES.ATTRIBUTION,
    ROUTES.ATTRIBUTION_LIST,
    ROUTES.ATTRIBUTION_DETAIL,
    ROUTES.ATTRIBUTION_CREATE,
    ROUTES.DAO,
    ROUTES.DAO_PROPOSALS,
    ROUTES.DAO_PROPOSAL_DETAIL,
    ROUTES.DAO_VOTING,
    ROUTES.DAO_TREASURY,
    ROUTES.ROYALTIES,
    ROUTES.ROYALTY_EARNINGS,
    ROUTES.ROYALTY_PAYMENTS,
    ROUTES.ROYALTY_SETTINGS,
    ROUTES.ANALYTICS,
    ROUTES.ANALYTICS_USAGE,
    ROUTES.ANALYTICS_ATTRIBUTION,
    ROUTES.ANALYTICS_ROYALTIES
  ],
  ADMIN: [
    ROUTES.ADMIN,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_DATASETS,
    ROUTES.ADMIN_MARKETPLACE,
    ROUTES.ADMIN_DAO
  ]
};

// Main navigation items
export const MAIN_NAVIGATION = [
  { name: 'Home', path: ROUTES.HOME, public: true },
  { name: 'Datasets', path: ROUTES.DATASETS, public: false },
  { name: 'Marketplace', path: ROUTES.MARKETPLACE, public: true },
  { name: 'Provenance', path: ROUTES.PROVENANCE, public: false },
  { name: 'Attribution', path: ROUTES.ATTRIBUTION, public: false },
  { name: 'Governance DAO', path: ROUTES.DAO, public: false },
  { name: 'Documentation', path: ROUTES.DOCUMENTATION, public: true }
];

// Authenticated user menu items
export const USER_MENU = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD },
  { name: 'My Datasets', path: ROUTES.DATASETS },
  { name: 'My Purchases', path: ROUTES.MARKETPLACE_PURCHASES },
  { name: 'Royalty Earnings', path: ROUTES.ROYALTY_EARNINGS },
  { name: 'Profile', path: ROUTES.PROFILE },
  { name: 'Settings', path: ROUTES.SETTINGS }
];

// Breadcrumb configurations
export const BREADCRUMBS = {
  [ROUTES.HOME]: [{ name: 'Home', path: ROUTES.HOME }],
  [ROUTES.DASHBOARD]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Dashboard', path: ROUTES.DASHBOARD }
  ],
  [ROUTES.DATASETS]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Datasets', path: ROUTES.DATASETS }
  ],
  [ROUTES.DATASET_CREATE]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Datasets', path: ROUTES.DATASETS },
    { name: 'Create New Dataset', path: ROUTES.DATASET_CREATE }
  ],
  [ROUTES.PROVENANCE]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Provenance', path: ROUTES.PROVENANCE }
  ],
  [ROUTES.PROVENANCE_EXPLORER]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Provenance', path: ROUTES.PROVENANCE },
    { name: 'Explorer', path: ROUTES.PROVENANCE_EXPLORER }
  ],
  [ROUTES.MARKETPLACE]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Marketplace', path: ROUTES.MARKETPLACE }
  ],
  [ROUTES.ATTRIBUTION]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Attribution', path: ROUTES.ATTRIBUTION }
  ],
  [ROUTES.DAO]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Governance DAO', path: ROUTES.DAO }
  ],
  [ROUTES.ROYALTIES]: [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Royalties', path: ROUTES.ROYALTIES }
  ]
};
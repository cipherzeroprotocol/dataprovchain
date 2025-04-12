const config = {
  appName: 'DataProvChain',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  defaultPageSize: 10,
  maxFileSize: 1024 * 1024 * 500, // 500MB
  supportedFileTypes: ['csv', 'json', 'txt', 'zip', 'tar', 'gz'],
  ipfsGateway: 'https://ipfs.io/ipfs/'
};

export default config;

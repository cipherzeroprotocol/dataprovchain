const networks = {
  calibrationnet: {
    name: 'Filecoin Calibration Testnet',
    chainId: 314159,
    rpcUrl: 'https://api.calibration.node.glif.io/rpc/v1',
    blockExplorer: 'https://calibration.filscan.io',
    currency: 'tFIL',
    isTestnet: true
  },
  mainnet: {
    name: 'Filecoin Mainnet',
    chainId: 314,
    rpcUrl: 'https://api.node.glif.io/rpc/v1',
    blockExplorer: 'https://filscan.io',
    currency: 'FIL',
    isTestnet: false
  }
};

export const defaultNetwork = 'calibrationnet';
export const getNetwork = (networkId) => networks[networkId] || networks[defaultNetwork];
export default networks;

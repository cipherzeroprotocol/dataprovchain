// filecoin/src/rpc/methods.js

const FilecoinRpcClient = require('./client');

/**
 * Implementation of common Filecoin RPC methods
 */
class FilecoinRpcMethods {
  /**
   * Create a new FilecoinRpcMethods instance
   * @param {FilecoinRpcClient} client - RPC client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get chain head
   * @returns {Promise<any>} - Chain head info
   */
  async getChainHead() {
    return this.client.call('Filecoin.ChainHead');
  }

  /**
   * Get node version
   * @returns {Promise<any>} - Node version info
   */
  async getVersion() {
    return this.client.call('Filecoin.Version');
  }

  /**
   * Get network info
   * @returns {Promise<any>} - Network info
   */
  async getNetworkInfo() {
    return this.client.call('Filecoin.NetworkName');
  }

  /**
   * Get state miner power
   * @param {string} minerAddress - Miner address
   * @returns {Promise<any>} - Miner power info
   */
  async getStateMinerPower(minerAddress) {
    const head = await this.getChainHead();
    return this.client.call('Filecoin.StateMinerPower', [minerAddress, head.Cids]);
  }

  /**
   * Get deal status
   * @param {number} dealId - Deal ID
   * @returns {Promise<any>} - Deal status
   */
  async getDealStatus(dealId) {
    const head = await this.getChainHead();
    return this.client.call('Filecoin.StateMarketDeal', [dealId, head.Cids]);
  }

  /**
   * Get miner info
   * @param {string} minerAddress - Miner address
   * @returns {Promise<any>} - Miner info
   */
  async getMinerInfo(minerAddress) {
    const head = await this.getChainHead();
    return this.client.call('Filecoin.StateMinerInfo', [minerAddress, head.Cids]);
  }

  /**
   * Get client deals
   * @param {string} address - Client address
   * @returns {Promise<any>} - Client deals
   */
  async getClientDeals(address) {
    return this.client.call('Filecoin.ClientListDeals');
  }

  /**
   * Create a storage deal
   * @param {Object} dealParams - Deal parameters
   * @returns {Promise<any>} - Deal info
   */
  async createStorageDeal(dealParams) {
    return this.client.call('Filecoin.ClientStartDeal', [dealParams]);
  }

  /**
   * Get wallet balance
   * @param {string} address - Wallet address
   * @returns {Promise<any>} - Wallet balance
   */
  async getWalletBalance(address) {
    return this.client.call('Filecoin.WalletBalance', [address]);
  }

  /**
   * Send funds
   * @param {string} from - From address
   * @param {string} to - To address
   * @param {string} amount - Amount in attoFIL
   * @returns {Promise<any>} - Transaction info
   */
  async sendFunds(from, to, amount) {
    return this.client.call('Filecoin.MpoolPushMessage', [{
      To: to,
      From: from,
      Value: amount,
      Method: 0, // 0 is the method number for Send
      Params: '',
      GasLimit: 0, // 0 means automatic estimation
      GasFeeCap: '0',
      GasPremium: '0',
    }, null]);
  }

  /**
   * Get active storage providers
   * @returns {Promise<Array<string>>} - Array of miner addresses
   */
  async getActiveStorageProviders() {
    const head = await this.getChainHead();
    const minerAddresses = await this.client.call('Filecoin.StateListMiners', [head.Cids]);
    
    const activeMiners = [];
    for (const address of minerAddresses) {
      try {
        const power = await this.getStateMinerPower(address);
        if (power.MinerPower.QualityAdjPower !== '0') {
          activeMiners.push(address);
        }
      } catch (error) {
        // Skip miners that return errors
        console.warn(`Skipping miner ${address}: ${error.message}`);
      }
    }
    
    return activeMiners;
  }
}

module.exports = FilecoinRpcMethods;
// filecoin/src/rpc/client.js

const axios = require('axios');
const ConfigUtils = require('../utils/config');

/**
 * Client for interacting with Filecoin RPC API
 */
class FilecoinRpcClient {
  /**
   * Create a new FilecoinRpcClient
   * @param {string} endpoint - Filecoin API endpoint
   * @param {string} token - API token (optional)
   */
  constructor(endpoint, token = null) {
    this.endpoint = endpoint;
    this.token = token;
    this.requestId = 0;
  }

  /**
   * Create a FilecoinRpcClient using network configuration
   * @param {string} network - Network name
   * @param {string} token - API token (optional)
   * @returns {FilecoinRpcClient} - Configured client
   */
  static fromNetwork(network = 'calibrationnet', token = null) {
    const endpoint = ConfigUtils.getFilecoinApiEndpoint(network);
    return new FilecoinRpcClient(endpoint, token);
  }

  /**
   * Make a JSON-RPC call
   * @param {string} method - RPC method name
   * @param {Array} params - RPC method parameters
   * @returns {Promise<any>} - RPC response
   */
  async call(method, params = []) {
    this.requestId += 1;
    
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await axios.post(
        this.endpoint,
        {
          jsonrpc: '2.0',
          method,
          params,
          id: this.requestId,
        },
        options
      );
      
      if (response.data.error) {
        throw new Error(`RPC Error: ${response.data.error.message}`);
      }
      
      return response.data.result;
    } catch (error) {
      if (error.response) {
        throw new Error(`RPC Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Check if client can connect to the node
   * @returns {Promise<boolean>} - True if connected, false otherwise
   */
  async isConnected() {
    try {
      const version = await this.call('Filecoin.Version');
      return !!version;
    } catch (error) {
      return false;
    }
  }
}

module.exports = FilecoinRpcClient;
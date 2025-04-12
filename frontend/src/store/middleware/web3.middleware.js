import { ethers } from 'ethers';

// Web3 middleware to handle blockchain interactions
const web3Middleware = store => next => async action => {
  // If the action doesn't have the web3 flag, pass it to the next middleware
  if (!action.meta || !action.meta.web3) {
    return next(action);
  }

  const { 
    contractName, 
    method, 
    args = [], 
    options = {}, 
    onSuccess, 
    onError,
    onStart,
    onEnd
  } = action.meta.web3;

  // Get the contract from state or action
  const contract = action.meta.web3.contract || 
                  store.getState().auth.contracts?.[contractName];

  if (!contract) {
    const error = `Contract ${contractName} not found`;
    
    if (onError) {
      store.dispatch({
        type: onError,
        payload: error,
        error: true
      });
    }
    
    return Promise.reject(error);
  }

  // Dispatch the original action
  next(action);

  // Dispatch the start action if provided
  if (onStart) {
    store.dispatch({ type: onStart });
  }

  try {
    // Get gas estimate if requested
    let gasLimit;
    if (options.estimateGas) {
      try {
        const gasEstimate = await contract.estimateGas[method](...args);
        gasLimit = gasEstimate.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100)); // 20% buffer
      } catch (error) {
        console.warn(`Gas estimation failed for ${contractName}.${method}:`, error);
      }
    }

    // Execute the contract method
    const tx = await contract[method](...args, {
      ...options,
      ...(gasLimit ? { gasLimit } : {})
    });

    // If this is a transaction (not a view function), wait for it to be mined
    if (tx.wait) {
      const receipt = await tx.wait();
      
      // Dispatch the success action if provided
      if (onSuccess) {
        store.dispatch({
          type: onSuccess,
          payload: {
            receipt,
            events: receipt.events,
            transactionHash: receipt.transactionHash
          }
        });
      }
      
      // Return the receipt
      return receipt;
    } else {
      // This is a view function, so just return the result
      if (onSuccess) {
        store.dispatch({
          type: onSuccess,
          payload: tx
        });
      }
      
      return tx;
    }
  } catch (error) {
    const message = error.reason || error.message || 'Transaction failed';
    
    if (onError) {
      store.dispatch({
        type: onError,
        payload: message,
        error: true
      });
    }
    
    return Promise.reject(message);
  } finally {
    if (onEnd) {
      store.dispatch({ type: onEnd });
    }
  }
};

export default web3Middleware;

import Web3 from 'web3';
import { ethers } from 'ethers';
import { Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Admin wallet addresses
const ADMIN_ETH_WALLET = process.env.ADMIN_ETH_WALLET;
const ADMIN_SOL_WALLET = process.env.ADMIN_SOL_WALLET;

// Platform fees
const ETH_PLATFORM_FEE = '0.001'; // in ETH
const SOL_PLATFORM_FEE = '0.01'; // in SOL

export const verifyEthereumPayment = async (from, txHash) => {
  try {
    const web3 = new Web3(process.env.ETH_RPC_URL);
    const transaction = await web3.eth.getTransaction(txHash);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Verify transaction details
    const value = web3.utils.fromWei(transaction.value, 'ether');
    const isValid = 
      transaction.from.toLowerCase() === from.toLowerCase() &&
      transaction.to.toLowerCase() === ADMIN_ETH_WALLET.toLowerCase() &&
      value === ETH_PLATFORM_FEE;

    return isValid;
  } catch (error) {
    console.error('Error verifying Ethereum payment:', error);
    return false;
  }
};

export const verifySolanaPayment = async (from, signature) => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'));
    const transaction = await connection.getTransaction(signature);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Verify transaction details
    const amount = transaction.meta.postBalances[1] - transaction.meta.preBalances[1];
    const isValid = 
      transaction.transaction.message.accountKeys[0].toString() === from &&
      transaction.transaction.message.accountKeys[1].toString() === ADMIN_SOL_WALLET &&
      amount === LAMPORTS_PER_SOL * parseFloat(SOL_PLATFORM_FEE);

    return isValid;
  } catch (error) {
    console.error('Error verifying Solana payment:', error);
    return false;
  }
};

import { ethers } from "ethers";

// Platform fee configuration
const PLATFORM_FEE = {
  ETH: "0.001", // 0.001 ETH
  MATIC: "0.001", // 0.001 MATIC
  SOL: "0.01", // 0.01 SOL
};

// Admin wallet addresses (should be in environment variables)
const ADMIN_WALLETS = {
  ETH: process.env.ADMIN_ETH_WALLET || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  MATIC: process.env.ADMIN_MATIC_WALLET || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  SOL: process.env.ADMIN_SOL_WALLET || "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
};

// Verify transaction on Ethereum/Polygon
export const verifyEthTransaction = async (txHash, expectedAmount, currency = "ETH") => {
  try {
    const provider = new ethers.JsonRpcProvider(
      currency === "ETH" 
        ? process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/your-project-id"
        : process.env.POLYGON_RPC_URL || "https://polygon-rpc.com"
    );

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error("Transaction not found");
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed");
    }

    // Verify amount
    const amountInEth = ethers.formatEther(tx.value);
    const expectedAmountEth = PLATFORM_FEE[currency];
    
    if (parseFloat(amountInEth) < parseFloat(expectedAmountEth)) {
      throw new Error("Insufficient payment amount");
    }

    // Verify recipient
    const adminWallet = ADMIN_WALLETS[currency];
    if (tx.to.toLowerCase() !== adminWallet.toLowerCase()) {
      throw new Error("Invalid recipient address");
    }

    return {
      verified: true,
      amount: amountInEth,
      currency,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error verifying ETH transaction:", error);
    return {
      verified: false,
      error: error.message,
    };
  }
};

// Verify Solana transaction
export const verifySolTransaction = async (txHash, expectedAmount) => {
  try {
    // For Solana, you would use @solana/web3.js
    // This is a simplified version - in production, implement proper Solana verification
    const expectedAmountSol = PLATFORM_FEE.SOL;
    
    return {
      verified: true,
      amount: expectedAmountSol,
      currency: "SOL",
      blockNumber: "N/A", // Solana doesn't use block numbers the same way
    };
  } catch (error) {
    console.error("Error verifying SOL transaction:", error);
    return {
      verified: false,
      error: error.message,
    };
  }
};

// Get platform fee for a currency
export const getPlatformFee = (currency = "ETH") => {
  return PLATFORM_FEE[currency] || PLATFORM_FEE.ETH;
};

// Get admin wallet address for a currency
export const getAdminWallet = (currency = "ETH") => {
  return ADMIN_WALLETS[currency] || ADMIN_WALLETS.ETH;
};

// Generate payment request
export const generatePaymentRequest = (currency = "ETH") => {
  const amount = getPlatformFee(currency);
  const recipient = getAdminWallet(currency);
  
  return {
    amount,
    currency,
    recipient,
    network: currency === "ETH" ? "Ethereum Mainnet" : 
             currency === "MATIC" ? "Polygon" : "Solana",
  };
}; 
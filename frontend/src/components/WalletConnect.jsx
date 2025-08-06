import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "./ui/button";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";

const WalletConnect = ({
  onWalletConnect,
  onWalletDisconnect,
  connectedAddress,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setIsConnected(true);
          onWalletConnect(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];

        // Update wallet address in backend
        try {
          const response = await fetch(
            `${import.meta.env.VITE_USER_API_URL}/wallet-address`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ walletAddress: account }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update wallet address");
          }
        } catch (error) {
          console.error("Error updating wallet address:", error);
          setError("Failed to update wallet address");
          return;
        }

        setIsConnected(true);
        onWalletConnect(account);
        setError("");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    onWalletDisconnect();
    setError("");
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (error) {
      console.error("Error switching network:", error);
      setError("Failed to switch network. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!isConnected ? (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Connected: {formatAddress(connectedAddress)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchNetwork("0x1")} // Ethereum Mainnet
            >
              Ethereum
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchNetwork("0x89")} // Polygon
            >
              Polygon
            </Button>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

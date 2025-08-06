import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';

const PLATFORM_FEE_ETH = '0.001';
const PLATFORM_FEE_SOL = '0.01';
const ADMIN_ETH_WALLET = process.env.REACT_APP_ADMIN_ETH_WALLET;
const ADMIN_SOL_WALLET = process.env.REACT_APP_ADMIN_SOL_WALLET;

export const useWalletConnect = () => {
    const [walletType, setWalletType] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const connectMetaMask = async () => {
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask');
                return null;
            }

            setLoading(true);
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            setWalletAddress(accounts[0]);
            setWalletType('ethereum');
            return accounts[0];
        } catch (error) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const connectPhantom = async () => {
        try {
            if (!window.solana) {
                toast.error('Please install Phantom wallet');
                return null;
            }

            setLoading(true);
            const resp = await window.solana.connect();
            setWalletAddress(resp.publicKey.toString());
            setWalletType('solana');
            return resp.publicKey.toString();
        } catch (error) {
            toast.error(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const payPlatformFee = async () => {
        try {
            setLoading(true);
            if (walletType === 'ethereum') {
                const web3 = new Web3(window.ethereum);
                const weiValue = web3.utils.toWei(PLATFORM_FEE_ETH, 'ether');
                
                const tx = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: walletAddress,
                        to: ADMIN_ETH_WALLET,
                        value: web3.utils.toHex(weiValue),
                    }],
                });

                setPaymentStatus({
                    success: true,
                    type: walletType,
                    address: walletAddress,
                    txHash: tx
                });
                return true;
            } 
            else if (walletType === 'solana') {
                const connection = new Connection('https://api.devnet.solana.com');
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: new PublicKey(walletAddress),
                        toPubkey: new PublicKey(ADMIN_SOL_WALLET),
                        lamports: LAMPORTS_PER_SOL * parseFloat(PLATFORM_FEE_SOL),
                    })
                );

                const signature = await window.solana.signAndSendTransaction(transaction);
                setPaymentStatus({
                    success: true,
                    type: walletType,
                    address: walletAddress,
                    txHash: signature
                });
                return true;
            }
            return false;
        } catch (error) {
            toast.error(error.message);
            setPaymentStatus({
                success: false,
                error: error.message
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setWalletAddress(null);
        setWalletType(null);
        setPaymentStatus(null);
    };

    return {
        walletType,
        walletAddress,
        loading,
        paymentStatus,
        connectMetaMask,
        connectPhantom,
        payPlatformFee,
        disconnect
    };
};

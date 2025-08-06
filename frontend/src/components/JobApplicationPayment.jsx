import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, Wallet, AlertCircle, CheckCircle } from 'lucide-react';

const JobApplicationPayment = ({ isOpen, onClose, onSuccess, jobTitle }) => {
  const [status, setStatus] = useState('initial'); // initial, connecting, processing, success, error
  const [error, setError] = useState('');
  const applicationFee = 0.001; // ETH

  const handlePayment = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to proceed with the application');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus('processing');
      const tx = await signer.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Company's wallet address
        value: ethers.parseEther(applicationFee.toString())
      });

      await tx.wait();
      setStatus('success');
      onSuccess(tx.hash);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const statusMessages = {
    initial: {
      title: 'Application Payment',
      message: `To apply for "${jobTitle}", a payment of ${applicationFee} ETH is required.`
    },
    connecting: {
      title: 'Connecting Wallet',
      message: 'Please approve the connection in MetaMask...'
    },
    processing: {
      title: 'Processing Payment',
      message: 'Please confirm the transaction in MetaMask...'
    },
    success: {
      title: 'Payment Successful',
      message: 'Your application is being submitted...'
    },
    error: {
      title: 'Payment Failed',
      message: error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{statusMessages[status].title}</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {status === 'initial' && (
            <div className="flex items-center justify-center gap-4">
              <Wallet className="h-6 w-6" />
              <span>{statusMessages[status].message}</span>
            </div>
          )}

          {(status === 'connecting' || status === 'processing') && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>{statusMessages[status].message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 text-green-500">
              <CheckCircle className="h-8 w-8" />
              <span>{statusMessages[status].message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-red-500">
              <AlertCircle className="h-8 w-8" />
              <span>{statusMessages[status].message}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === 'initial' && (
            <Button onClick={handlePayment}>
              Proceed with Payment
            </Button>
          )}
          {(status === 'error' || status === 'success') && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationPayment;

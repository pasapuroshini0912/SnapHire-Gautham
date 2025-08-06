import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const BlockchainPayment = ({ 
  onPaymentSuccess, 
  onPaymentError, 
  connectedAddress, 
  paymentType = 'job' 
}) => {
  const [currency, setCurrency] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const platformFees = {
    ETH: '0.001',
    MATIC: '0.001',
    SOL: '0.01'
  };

  // Company's wallet address for receiving payments
  const companyWallets = {
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    MATIC: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    SOL: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };

  useEffect(() => {
    // Set default amount based on currency
    setAmount(platformFees[currency]);
    // Set recipient based on currency
    setRecipient(companyWallets[currency]);
  }, [currency]);

  const getPaymentRequest = async () => {
    try {
      const response = await fetch(`/api/v1/job/payment-request?currency=${currency}`);
      const data = await response.json();
      
      if (data.success) {
        setAmount(data.paymentRequest.amount);
        setRecipient(data.paymentRequest.recipient);
      }
    } catch (error) {
      console.error('Error fetching payment request:', error);
      setError('Failed to fetch payment details');
    }
  };

  useEffect(() => {
    getPaymentRequest();
  }, [currency]);

  const sendPayment = async () => {
    if (!connectedAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create transaction
      const tx = {
        to: recipient,
        value: ethers.parseEther(amount),
      };

      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      
      // Wait for confirmation
      const receipt = await transaction.wait();

      if (receipt.status === 1) {
        setSuccess(`Payment successful! Transaction hash: ${receipt.hash}`);
        onPaymentSuccess({
          transactionHash: receipt.hash,
          amount,
          currency,
          paid: true,
          paidAt: new Date().toISOString()
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">
          {paymentType === 'job' ? 'Job Posting Fee' : 'Social Post Fee'}
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
              <SelectItem value="SOL">Solana (SOL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
          />
        </div>

        <div>
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            readOnly
          />
        </div>

        {!connectedAddress && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Please connect your wallet to proceed with payment
            </span>
          </div>
        )}

        <Button
          onClick={sendPayment}
          disabled={!connectedAddress || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay ${amount} ${currency}`
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}
    </div>
  );
};

export default BlockchainPayment; 
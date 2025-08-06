import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SocialFeed from '../../components/SocialFeed';
import WalletConnect from '../../components/WalletConnect';

const SocialFeedPage = () => {
  const { user } = useSelector((state) => state.user);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
  }, [user]);

  const handleWalletConnect = (address) => {
    setConnectedAddress(address);
  };

  const handleWalletDisconnect = () => {
    setConnectedAddress('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">Please log in to access the social feed.</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">Something went wrong. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Career Network</h1>
          <p className="text-zinc-400">
            Connect with professionals, share career insights, and stay updated with the latest job opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Connection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Connection</h3>
              <WalletConnect
                onWalletConnect={handleWalletConnect}
                onWalletDisconnect={handleWalletDisconnect}
                connectedAddress={connectedAddress}
              />
            </div>

            {/* User Profile Summary */}
            {user && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name</span>
                    <p className="text-gray-900">{user.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role</span>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                  {user.profile?.walletAddress && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Wallet</span>
                      <p className="text-gray-900 text-sm">
                        {user.profile.walletAddress.slice(0, 6)}...{user.profile.walletAddress.slice(-4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Network Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes Received</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <SocialFeed user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeedPage; 
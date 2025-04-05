import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { providers, utils } from 'ethers';
import Layout from '../components/layout/Layout';

export default function Wallet() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');

  const activeWallet = wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function getBalance() {
      if (activeWallet?.address) {
        const provider = new providers.JsonRpcProvider('https://sepolia.gateway.tenderly.co');
        const balance = await provider.getBalance(activeWallet.address);
        setBalance(utils.formatEther(balance));
      }
    }
    getBalance();
  }, [activeWallet?.address]);

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Wallet
                </h1>
                <div className="text-sm text-gray-500">
                  {activeWallet?.chainId === 'eip155:1' ? 'Ethereum' : 'Sepolia'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {activeWallet?.address.slice(0, 6)}...{activeWallet?.address.slice(-4)}
                </div>
                <div className="text-sm text-gray-500">
                  Balance: {balance} ETH
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/scan')}
                className="w-full px-6 py-3 bg-[#4ADE80] text-black font-bold rounded-lg hover:bg-[#3fcf75] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan QR Code
              </button>

              <button
                onClick={() => router.push('/discover')}
                className="w-full px-6 py-3 bg-[#4ADE80] text-black font-bold rounded-lg hover:bg-[#3fcf75] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Merchants
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
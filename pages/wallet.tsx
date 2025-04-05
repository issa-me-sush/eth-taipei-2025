import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';

export default function Wallet() {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const activeWallet = wallets[0]; // Use the first wallet

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const copyAddress = async () => {
    if (activeWallet?.address) {
      await navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <div className="bg-white  rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Wallet
              </h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activeWallet?.chainId === 1 ? 'Ethereum' : 'Testnet'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Your Address
              </div>
              <button
                onClick={copyAddress}
                className="w-full flex items-center justify-between p-3 bg-white  rounded-lg hover:bg-white-100 dark:hover:bg-white-700 transition-colors"
              >
                <div className="text-sm font-mono text-gray-900 dark:text-white truncate">
                  {activeWallet?.address}
                </div>
                <div className="flex items-center space-x-2">
                  {copied ? (
                    <span className="text-green-500 text-sm">Copied!</span>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => activeWallet?.sendTransaction({
                  to: '',
                  value: '0',
                })}
                className="flex flex-col items-center justify-center p-4 bg-white-50 dark:bg-white-900 rounded-lg hover:bg-white-100 dark:hover:bg-white-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Send</span>
              </button>

              <button
                onClick={() => {/* Implement receive flow */}}
                className="flex flex-col items-center justify-center p-4 bg-white-50 dark:bg-white-900 rounded-lg hover:bg-white-100 dark:hover:bg-white-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Receive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
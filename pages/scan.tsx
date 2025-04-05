import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import QRCodeScanner from '../components/QRCodeScanner';

export default function Scan() {
  const { authenticated, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeWallet = wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const handleScan = async (result: string) => {
    try {
      // Expected QR format: taipay:{merchantId}:{amount}
      const [protocol, merchantId, amount] = result.split(':');
      
      if (protocol !== 'taipay') {
        setError('Invalid QR code format');
        return;
      }

      setScanning(false);
      router.push(`/payment/${merchantId}?amount=${amount}`);
    } catch (error) {
      setError('Invalid QR code');
    }
  };

  const handleError = (error: Error) => {
    setError(error.message);
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
                Scan QR Code
              </h1>
              {activeWallet && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Balance: {activeWallet.balance?.formatted || '0'} ETH
                </div>
              )}
            </div>

            <div className="aspect-square w-full overflow-hidden rounded-lg">
              {scanning ? (
                <QRCodeScanner onScan={handleScan} onError={handleError} />
              ) : (
                <div className="flex items-center justify-center h-full bg-white-100 dark:bg-white-700">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">QR code scanned successfully!</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              {!scanning ? (
                <button
                  onClick={() => setScanning(true)}
                  className="px-6 py-2 bg-white text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Scan Again
                </button>
              ) : (
                <button
                  onClick={() => setScanning(false)}
                  className="px-6 py-2 bg-white-600 text-white rounded-lg hover:bg-white-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
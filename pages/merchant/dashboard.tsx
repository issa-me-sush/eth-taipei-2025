import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface MerchantData {
  _id: string;
  brandName: string;
  name: string;
  walletAddress: string;
  description: string;
  phoneNumber: string;
  email: string;
  address: string;
  dailyLimit: number;
  maxTransactionLimit: number;
  successCount: number;
  rating: number;
  commissionPercent: number;
  imageUrl?: string;
}

interface ApiError {
  error: string;
  message: string;
}

function MerchantDashboardContent() {
  const { isReady, isAuthenticated, hasWallet, walletAddress, connectWallet } = useAuth();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await connectWallet();
    } catch (error) {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if user is a merchant
  useEffect(() => {
    async function checkMerchant() {
      setIsLoading(true);
      setError(null);
      
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/merchants/me?wallet_address=${walletAddress}`);
        const data = await response.json();

        if (response.ok) {
          setMerchant(data);
        } else {
          const apiError = data as ApiError;
          if (response.status === 404) {
            setMerchant(null);
          } else {
            setError(apiError.message || 'Failed to fetch merchant data');
          }
        }
      } catch (error) {
        setError('Failed to connect to the server');
      } finally {
        setIsLoading(false);
      }
    }

    if (isReady && isAuthenticated && hasWallet) {
      checkMerchant();
    } else if (isReady && isAuthenticated) {
      setIsLoading(false);
    }
  }, [isReady, isAuthenticated, hasWallet, walletAddress]);

  // Loading state
  if (!isReady || (isLoading && hasWallet)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </Layout>
    );
  }

  // No wallet connected
  if (isReady && isAuthenticated && !hasWallet) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the merchant dashboard
            </p>
            {error && (
              <p className="text-red-500 mb-4 text-sm">
                {error}
              </p>
            )}
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-xl hover:bg-white-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Error
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-xl hover:bg-white-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Not a merchant - show registration prompt
  if (!merchant) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Tell us about your shop
            </h2>
            <p className="text-gray-600 mb-6">
              Register now to start accepting crypto payments!
            </p>
            <button
              onClick={() => router.push('/merchant/register')}
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-xl hover:bg-white-900 transition-colors"
            >
              Register as Merchant
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show merchant dashboard
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - QR Code and Image */}
            <div className="space-y-6">
              {/* Shop Image */}
              <div className="bg-white rounded-2xl p-6">
                {merchant.imageUrl ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={merchant.imageUrl}
                      alt={merchant.brandName}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-[#EBEBEB] rounded-xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-6 text-center">
                <QRCodeSVG
                  value={merchant.walletAddress}
                  size={200}
                  level="H"
                  className="mx-auto"
                />
                <p className="mt-4 text-sm text-gray-600">
                  Click to copy QR code
                </p>
              </div>
            </div>

            {/* Right Column - Merchant Info */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4">Times of services</h3>
                <p className="text-2xl font-bold">{merchant.successCount} transactions</p>
                <div className="mt-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${star <= Math.round(merchant.rating) ? 'text-black' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">3 comments</p>
                </div>
              </div>

              {/* Daily Limits */}
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm text-gray-600">Default daily balance for exchange</h3>
                  <p className="text-2xl font-bold">{merchant.dailyLimit.toLocaleString()} NTD</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Max transaction limit</h3>
                  <p className="text-2xl font-bold">{merchant.maxTransactionLimit.toLocaleString()} NTD</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm text-gray-600">Administrator name</h3>
                  <p className="text-lg font-bold">{merchant.name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Brand name</h3>
                  <p className="text-lg font-bold">{merchant.brandName}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Physical address (Shop)</h3>
                  <p className="text-lg font-bold underline">{merchant.address}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Phone number</h3>
                  <p className="text-lg font-bold">{merchant.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Email</h3>
                  <p className="text-lg font-bold">{merchant.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function MerchantDashboard() {
  return (
    <ProtectedRoute>
      <MerchantDashboardContent />
    </ProtectedRoute>
  );
}
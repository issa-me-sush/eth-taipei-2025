import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

interface MerchantData {
  _id: string;
  name: string;
  brandName: string;
  phoneNumber: string;
  email: string;
  commissionPercent: number;
  dailyLimit: number;
  walletAddress: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  placeId: string;
  createdAt: string;
  updatedAt: string;
}

function MerchantDashboardContent() {
  const router = useRouter();
  const { user } = usePrivy();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [transactionCount, setTransactionCount] = useState<number>(0);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        if (!user?.wallet?.address) return;
        
        console.log('🔍 Fetching merchant data for address:', user.wallet.address);
        const response = await fetch(`/api/merchants/${user.wallet.address}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setMerchant(null);
            setLoading(false);
            return;
          }
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch merchant data');
        }

        const data = await response.json();
        if (!data.success || !data.merchant) {
          throw new Error('Invalid response format');
        }

        setMerchant(data.merchant);

        // Fetch transaction count
        console.log('🔍 Fetching transaction count for merchant:', data.merchant.walletAddress);
        const countResponse = await fetch(`/api/transactions/merchant/count?address=${data.merchant.walletAddress}`);
        const countData = await countResponse.json();
        
        if (countData.success) {
          console.log('✅ Transaction count:', countData.count);
          setTransactionCount(countData.count);
        } else {
          console.error('❌ Failed to fetch transaction count:', countData.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merchant data');
        console.error('❌ Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.wallet?.address) {
      fetchMerchantData();
    } else {
      setLoading(false);
    }
  }, [user?.wallet?.address]);

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(merchant?.walletAddress || '');
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
          <button
            onClick={() => router.push('/merchant/register')}
            className="mt-4 w-full bg-[#4ADE80] text-black font-bold rounded-2xl py-4 text-[17px]"
          >
            Register as Merchant
          </button>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-[32px] font-black text-black mb-2">Welcome!</h1>
            <p className="text-[#6B7280]">You haven't registered as a merchant yet.</p>
          </div>
          <button
            onClick={() => router.push('/merchant/register')}
            className="w-full bg-[#4ADE80] text-black font-bold rounded-2xl py-4 text-[17px]"
          >
            Register as Merchant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-[32px] font-black text-black mb-6">Profile</h1>

        <div className="relative mb-6 border-2 border-blue-200 border-dashed rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden">
              <Image
                src="/cafe.png"
                alt={merchant.brandName}
                width={200}
                height={150}
                className="object-cover"
                priority
              />
            </div>
            <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden">
              <Image
                src="/cafe.png"
                alt={merchant.brandName}
                width={200}
                height={150}
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG
                value={`${window.location.origin}/payment-intent?${new URLSearchParams({
                  address: merchant.walletAddress,
                  brandName: merchant.brandName,
                  dailyLimit: merchant.dailyLimit.toString(),
                  commissionPercent: merchant.commissionPercent.toString(),
                }).toString()}`}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#F6F6F6] rounded-2xl p-6">
            <h2 className="text-[17px] font-medium text-black mb-2">Default daily limit</h2>
            <p className="text-[32px] font-black text-black">{merchant.dailyLimit.toLocaleString()} NTD</p>
          </div>

          <div className="bg-[#F6F6F6] rounded-2xl p-6">
            <h2 className="text-[17px] font-medium text-black mb-2">Times of services</h2>
            <p className="text-[32px] font-black text-black">{transactionCount} transactions</p>
            <div className="mt-4">
              <p className="text-[17px] font-medium text-black mb-2">Ratings</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4].map((star) => (
                    <svg key={star} className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <svg className="w-6 h-6 text-[#E5E7EB]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-[24px] font-black text-black">4.5</span>
                <span className="text-[15px] text-gray-600">(3 comments)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F6F6F6] rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-[15px] text-gray-600 mb-1">Administrator name</p>
              <p className="text-[17px] font-black text-black">{merchant.name}</p>
            </div>
            <div>
              <p className="text-[15px] text-gray-600 mb-1">Brand name</p>
              <p className="text-[17px] font-black text-black">{merchant.brandName}</p>
            </div>
            <div>
              <p className="text-[15px] text-gray-600 mb-1">Physical address* (Shop)</p>
              <p className="text-[17px] font-black text-black">{merchant.address}</p>
            </div>
            <div>
              <p className="text-[15px] text-gray-600 mb-1">Phone number*</p>
              <p className="text-[17px] font-black text-black">{merchant.phoneNumber}</p>
            </div>
            <div>
              <p className="text-[15px] text-gray-600 mb-1">Email*</p>
              <p className="text-[17px] font-black text-black">{merchant.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantDashboard() {
  return (
    <ProtectedRoute>
      <MerchantDashboardContent />
    </ProtectedRoute>
  );
}
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

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        if (!user?.wallet?.address) return;
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merchant data');
        console.error('Error fetching merchant data:', err);
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
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-black">
          <div className="font-bold text-xl">CashMe</div>
          <div className="text-[#6B7280] text-base">{merchant.brandName}</div>
        </div>
        <div className="flex items-center gap-3 text-black">
          <button className="p-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
          <button>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-[32px] font-black  text-black mb-6">Profile</h1>

        <div className="relative mb-6">
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden">
            <Image
              src="/cafe.png"
              alt={merchant.brandName}
              width={500}
              height={300}
              className="rounded-2xl object-cover"
              priority
            />
          </div>
          <div className="absolute right-4 top-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="mb-2">
                <QRCodeSVG
                  value={`${window.location.origin}/payment-intent?${new URLSearchParams({
                    address: merchant.walletAddress,
                    brandName: merchant.brandName,
                    dailyLimit: merchant.dailyLimit.toString(),
                  }).toString()}`}
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <button
                onClick={handleCopyQR}
                className="text-sm text-[#6B7280] hover:text-[#4B5563] text-center w-full relative"
              >
                Click to copy QR code
                {showCopyTooltip && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                    Copied!
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-[#F5F5F5] rounded-2xl p-5">
            <h2 className="text-[15px] font-medium text-[#111827] mb-3">Default daily balance for exchange</h2>
            <p className="text-[32px] font-bold text-[#111827]">{merchant.dailyLimit.toLocaleString()} NTD</p>
            <p className="text-[#6B7280] text-[15px] mt-3 mb-1">Max transaction limit</p>
            <p className="text-[24px] font-bold text-[#111827]">100,000 NTD</p>
          </div>

          <div className="bg-[#F5F5F5] rounded-2xl p-5">
            <h2 className="text-[15px] font-medium text-[#111827] mb-3">Times of services</h2>
            <p className="text-[32px] font-bold text-[#111827]">100 transactions</p>
            <div className="mt-4">
              <p className="text-[#6B7280] text-[15px] mb-1">Ratings</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4].map((star) => (
                    <svg key={star} className="w-6 h-6 text-[#111827]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <svg className="w-6 h-6 text-[#E5E7EB]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-[24px] font-bold text-[#111827]">4.5</span>
                <span className="text-[#6B7280] text-[15px]">(3 comments)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-[#6B7280] text-[15px] mb-1">Administrator name</p>
              <p className="text-[17px] font-medium text-[#111827]">{merchant.name}</p>
            </div>
            <div>
              <p className="text-[#6B7280] text-[15px] mb-1">Brand name</p>
              <p className="text-[17px] font-medium text-[#111827]">{merchant.brandName}</p>
            </div>
            <div>
              <p className="text-[#6B7280] text-[15px] mb-1">Physical address* (Shop)</p>
              <p className="text-[17px] font-medium text-[#111827]">{merchant.address}</p>
            </div>
            <div>
              <p className="text-[#6B7280] text-[15px] mb-1">Phone number*</p>
              <p className="text-[17px] font-medium text-[#111827]">{merchant.phoneNumber}</p>
            </div>
            <div>
              <p className="text-[#6B7280] text-[15px] mb-1">Email*</p>
              <p className="text-[17px] font-medium text-[#111827]">{merchant.email}</p>
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
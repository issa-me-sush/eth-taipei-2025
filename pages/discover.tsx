import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface Transaction {
  _id: string;
  date: Date;
  merchantAddress: string;
  merchantName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionHash: string;
}

interface Merchant {
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
  createdAt?: string;
  updatedAt?: string;
  distance?: number;
  transactionCount?: number;
  rating?: number;
  reviewCount?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

function DiscoverContent() {
  const router = useRouter();
  const { user } = usePrivy();
  const [amount, setAmount] = useState('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'history'>('list');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 25.0330,
    longitude: 121.5654,
    zoom: 13
  });
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    // Request user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setViewState(prev => ({
            ...prev,
            latitude,
            longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const url = new URL('/api/merchants/all', window.location.origin);
        if (userLocation) {
          url.searchParams.append('lat', userLocation.lat.toString());
          url.searchParams.append('lng', userLocation.lng.toString());
        }
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch merchants');
        }
        const data = await response.json();
        if (data.success) {
          let merchantsWithDistance = data.merchants;
          
          // Calculate distances if user location is available
          if (userLocation) {
            merchantsWithDistance = data.merchants.map((merchant: Merchant) => ({
              ...merchant,
              distance: calculateDistance(
                userLocation.lat,
                userLocation.lng,
                merchant.location.coordinates[1], // latitude
                merchant.location.coordinates[0]  // longitude
              )
            }));
            
            // Sort by distance
            merchantsWithDistance.sort((a: Merchant, b: Merchant) => 
              (a.distance || 0) - (b.distance || 0)
            );
          }
          
          setMerchants(merchantsWithDistance);
        }
      } catch (error) {
        console.error('Error fetching merchants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [userLocation]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.wallet?.address) return;
      
      try {
        const response = await fetch(`/api/transactions/user/${user.wallet.address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user?.wallet?.address]);

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
  };

  const getPaymentUrl = (merchant: Merchant) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      address: merchant.walletAddress,
      brandName: merchant.brandName,
      dailyLimit: merchant.dailyLimit.toString(),
      commissionPercent: merchant.commissionPercent.toString(),
    });
    return `${baseUrl}/payment-intent?${params.toString()}`;
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    const result = detectedCodes[0]?.rawValue;
    if (result) {
      try {
        const url = new URL(result);
        // If it's our payment URL, navigate internally
        if (url.pathname === '/payment-intent') {
          router.push(url.toString());
        } else {
          // For other URLs, open in new tab
          window.open(url.toString(), '_blank');
        }
        setShowScanner(false);
      } catch (error) {
        console.error('Invalid URL in QR code:', result);
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner error:', error);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {showScanner && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="relative h-full">
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-4 right-4 z-10 text-white p-2 rounded-full bg-black/50"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="h-screen">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-[32px] font-black text-black mb-2">Find a merchant</h1>
          <p className="text-black mb-6">
            See how much you can get by entering the amount you want to exchange below.
          </p>

          {/* Currency Input */}
          <div className="bg-[#F6F6F6] rounded-2xl p-6 mb-6">
            <h2 className="text-[17px] font-medium text-black mb-4">You sell</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-[40px] font-bold bg-transparent outline-none placeholder-black/40 min-w-0"
              />
              <button className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center">
                  <span className="text-white">$</span>
                </div>
                <span className="font-medium">USDC</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full text-sm ${
                viewMode === 'list' ? 'bg-black text-white' : 'border border-black text-black'
              }`}
            >
              Near me
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 rounded-full text-sm ${
                viewMode === 'history' ? 'bg-black text-white' : 'border border-black text-black'
              }`}
            >
              History
            </button>
          </div>

          {viewMode === 'list' ? (
            <>
              <div className="mb-4">
                <span className="text-black">Send a request from below list before visiting the shop. </span>
                <span className="text-[#0052FF]">Rate refreshes every 15 sec.</span>
              </div>

              <div className="space-y-4">
                {merchants.map((merchant) => (
                  <div
                    key={merchant._id}
                    className="bg-[#F6F6F6] rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#6B7280]">{merchant.distance ? `${merchant.distance.toFixed(1)}km` : '0.5km'}</span>
                      <span className="text-[#0052FF] text-sm">
                        {merchant.transactionCount ? `${merchant.transactionCount}+ tx` : 'new'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-black">{merchant.brandName}</h3>
                        {merchant.rating ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= Math.floor(merchant.rating || 0) ? 'text-black' : 'text-black/20'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-[#6B7280]">
                              {merchant.rating} ({merchant.reviewCount || 0})
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-black">
                          {amount ? (parseFloat(amount) * 30).toLocaleString() : '0'} NTD
                        </p>
                        <p className="text-sm text-[#6B7280]">{merchant.commissionPercent}% fees</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transaction history yet
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx._id} className="bg-[#F6F6F6] rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-black">{tx.merchantName}</h3>
                        <p className="text-sm text-[#6B7280]">
                          {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black">
                          {tx.amount.toLocaleString()} NTD
                        </p>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0052FF] hover:underline"
                        >
                          View on Etherscan →
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pay Button */}
          <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto">
            <button
              onClick={() => setShowScanner(true)}
              className="block w-full bg-[#FF9938] text-white rounded-2xl py-4 font-bold text-lg text-center cursor-pointer"
            >
              Scan QR Code
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Discover() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  );
} 
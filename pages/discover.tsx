import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Map, { Marker, Popup } from 'react-map-gl';
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
  distance: number | null;
  transactionCount?: number | null;
  rating?: number;
  reviewCount?: number;
}

interface Token {
  symbol: string;
  icon: string;
  color: string;
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
  const [viewMode, setViewMode] = useState<'list' | 'history' | 'map'>('list');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 25.0330,
    longitude: 121.5654,
    zoom: 13
  });
  const [showScanner, setShowScanner] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token>({
    symbol: 'USDC',
    icon: '$',
    color: '#0052FF'
  });
  const [showTokens, setShowTokens] = useState(false);
  const [selectedMapMerchant, setSelectedMapMerchant] = useState<Merchant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokens: Token[] = [
    { symbol: 'USDC', icon: '$', color: '#0052FF' },
    { symbol: 'CBTC', icon: '₿', color: '#F7931A' },
    { symbol: 'RBTC', icon: '₿', color: '#FF9938' },
    { symbol: 'FLOW', icon: 'F', color: '#00EF8B' }
  ];

  const getTokenRate = (symbol: string) => {
    switch (symbol) {
      case 'USDC':
        return 30; // 1 USDC = 30 NTD
      case 'CBTC':
      case 'RBTC':
        return 2748918; // 1 BTC = 2,748,918 NTD
      case 'FLOW':
        return 12; // 1 FLOW = 12 NTD
      default:
        return 30;
    }
  };

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
        console.log('🔍 Fetching merchants...');
        const response = await fetch('/api/merchants/all');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch merchants');
        }

        // Calculate distances if user location is available
        let merchantsWithData = data.merchants.map((merchant: Merchant) => {
          let distance = null;
          if (userLocation) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              merchant.location.coordinates[1], // latitude
              merchant.location.coordinates[0]  // longitude
            );
          }
          return {
            ...merchant,
            distance
          };
        });

        // Sort by distance if available
        if (userLocation) {
          merchantsWithData.sort((a: Merchant, b: Merchant) => {
            const distA = a.distance ?? Infinity;
            const distB = b.distance ?? Infinity;
            return distA - distB;
          });
        }

        // Fetch transaction counts
        const merchantsWithCounts = await Promise.all(
          merchantsWithData.map(async (merchant: Merchant) => {
            try {
              console.log(`🔍 Fetching transaction count for merchant: ${merchant.walletAddress}`);
              const countResponse = await fetch(`/api/transactions/merchant/count?address=${merchant.walletAddress}`);
              const countData = await countResponse.json();
              
              return {
                ...merchant,
                transactionCount: countData.success ? countData.count : null
              };
            } catch (error) {
              console.error(`❌ Error fetching count for ${merchant.brandName}:`, error);
              return {
                ...merchant,
                transactionCount: null
              };
            }
          })
        );

        console.log('✅ Merchants loaded with distances and transaction counts');
        setMerchants(merchantsWithCounts);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch merchants');
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
            <h2 className="text-[20px] font-black text-black/60 mb-4">You sell</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-[40px] font-bold bg-transparent text-black outline-none placeholder-black/40 min-w-0"
              />
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-base"
                  onClick={() => setShowTokens(!showTokens)}
                >
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: selectedToken.color }}>
                    <span className="text-white flex items-center justify-center h-full">{selectedToken.icon}</span>
                  </div>
                  <span className="font-black text-black">{selectedToken.symbol}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showTokens ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="black"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showTokens && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => {
                          setSelectedToken(token);
                          setShowTokens(false);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: token.color }}>
                          {token.icon}
                        </div>
                        <span className="font-black text-black">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
                Transaction history
              </button>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="p-2 rounded-full bg-black text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>

          {viewMode === 'list' && (
            <>
              <div className="mb-4">
                <span className="text-black">visit any of the merchants below. </span>
                <span className="text-[#FF9938]">Rate refreshes every 60 secs.</span>
              </div>

              <div className="space-y-4">
                {merchants.map((merchant) => {
                  const inputAmount = parseFloat(amount) || 0;
                  const ntdAmount = inputAmount * getTokenRate(selectedToken.symbol);
                  const commissionAmount = (ntdAmount * merchant.commissionPercent) / 100;
                  const finalAmount = ntdAmount - commissionAmount;
                  
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.address)}`;
                  
                  return (
                    <div key={merchant._id} className="bg-white border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-baseline mb-10">
                        <div className="text-gray-500">NAME</div>
                        <div className="text-gray-500">YOU RECEIVE</div>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-[#FF9938] text-sm">
                            {typeof merchant.distance === 'number' ? `${merchant.distance.toFixed(1)} km` : 'Unknown distance'}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-black">{merchant.brandName}</span>
                            <span className="text-[#FF9938]">
                              {merchant.transactionCount !== null ? `${merchant.transactionCount} tx` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 4.5].map((star, index) => (
                              <svg
                                key={index}
                                className="w-4 h-4 text-black"
                                fill={index < 4 ? "currentColor" : "none"}
                                strokeWidth={index === 4 ? "1.5" : "0"}
                                stroke="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-black">4.5 (27)</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-black">
                            {finalAmount.toLocaleString()} NTD
                          </div>
                          <div className="text-gray-500 text-sm">
                            {merchant.commissionPercent}% fees
                          </div>
                          <a 
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'map' && (
            <div className="h-[400px] rounded-2xl overflow-hidden">
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              >
                {/* Current Location Marker */}
                {userLocation && (
                  <Marker
                    longitude={userLocation.lng}
                    latitude={userLocation.lat}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </Marker>
                )}

                {/* Merchant Markers */}
                {merchants.map((merchant) => (
                  <Marker
                    key={merchant._id}
                    longitude={merchant.location.coordinates[0]}
                    latitude={merchant.location.coordinates[1]}
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      setSelectedMapMerchant(merchant);
                    }}
                  >
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white cursor-pointer">
                      $
                    </div>
                  </Marker>
                ))}

                {/* Merchant Popup */}
                {selectedMapMerchant && (
                  <Popup
                    longitude={selectedMapMerchant.location.coordinates[0]}
                    latitude={selectedMapMerchant.location.coordinates[1]}
                    anchor="bottom"
                    onClose={() => setSelectedMapMerchant(null)}
                    closeButton={true}
                    closeOnClick={false}
                  >
                    <div className="p-2">
                      <h3 className="font-bold text-lg text-black">{selectedMapMerchant.brandName}</h3>
                      <p className="text-sm text-gray-500">{selectedMapMerchant.address}</p>
                      <div className="mt-2 text-sm text-black">
                        <span className="font-medium">{selectedMapMerchant.commissionPercent}% fees</span>
                        <span className="mx-2">•</span>
                        <span className="text-[#FF9938]">
                          {selectedMapMerchant.transactionCount !== null ? `${selectedMapMerchant.transactionCount}+ tx` : ''}
                        </span>
                      </div>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>
          )}

          {viewMode === 'history' && (
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
                        {/* <a 
                          href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0052FF] hover:underline"
                        >
                          View on Etherscan →
                        </a> */}
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
              Pay
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
import { useRouter } from 'next/router';
import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface Merchant {
  id: string;
  brandName: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  commissionPercent: number;
  transactionCount?: number;
  isNew?: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const MOCK_MERCHANTS: Merchant[] = [
  {
    id: '1',
    brandName: 'Rouhe Pork bun',
    address: 'Raohe St, Songshan District, Taipei City',
    distance: 0.5,
    rating: 4.5,
    reviewCount: 27,
    commissionPercent: 5,
    transactionCount: 50,
    coordinates: {
      latitude: 25.0505,
      longitude: 121.5729
    }
  },
  {
    id: '2',
    brandName: 'Shilin sausage',
    address: 'Shilin Night Market, Taipei City',
    distance: 1.2,
    rating: 4.0,
    reviewCount: 3,
    commissionPercent: 4.5,
    transactionCount: 3,
    coordinates: {
      latitude: 25.0878,
      longitude: 121.5240
    }
  },
  {
    id: '3',
    brandName: '50 Lan (Rouhe)',
    address: 'Raohe Night Market, Taipei City',
    distance: 2,
    rating: 0,
    reviewCount: 0,
    commissionPercent: 4.5,
    isNew: true,
    coordinates: {
      latitude: 25.0510,
      longitude: 121.5735
    }
  }
];

function DiscoverContent() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [viewState, setViewState] = useState({
    latitude: 25.0330,
    longitude: 121.5654,
    zoom: 13
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-pixel)' }}>TaiPay</h1>
        <svg className="w-6 h-6 text-black font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black mb-1">Find a merchant</h1>
              <p className="text-black">
                See how much you can get by entering the amount you want to exchange below.
              </p>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>

          {/* Currency Input */}
          <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">You sell</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-4xl font-bold bg-transparent outline-none placeholder-black/40 min-w-0"
              />
              <div className="flex items-center gap-2 text-base whitespace-nowrap">
                <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">$</span>
                </div>
                <span className="font-medium">USDC</span>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewMode('list')}
              className={`h-10 px-6 rounded-full text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#4ADE80] text-white'
                  : 'bg-[#ECFDF5] text-[#4ADE80]'
              }`}
            >
              Near me
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="h-10 px-6 rounded-full text-sm bg-[#ECFDF5] text-[#4ADE80] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <span className="text-[#4ADE80]">Send a request from below list before visiting the shop. </span>
            <span className="text-[#0052FF]">Rate refreshes every 15 sec.</span>
          </div>

          {viewMode === 'map' ? (
            // Map View
            <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden h-[400px]">
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              >
                {MOCK_MERCHANTS.map((merchant) => (
                  <Marker
                    key={merchant.id}
                    latitude={merchant.coordinates.latitude}
                    longitude={merchant.coordinates.longitude}
                  >
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">
                      {merchant.commissionPercent}%
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {MOCK_MERCHANTS.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => router.push(`/payment/${merchant.id}?amount=${amount}`)}
                  className="w-full bg-[#F5F5F5] rounded-2xl p-6 text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-black/60">{merchant.distance}km</span>
                    {merchant.isNew ? (
                      <span className="text-[#0052FF] text-sm">new</span>
                    ) : (
                      <span className="text-[#0052FF] text-sm">
                        {merchant.transactionCount}+ tx
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{merchant.brandName}</h3>
                      {merchant.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= Math.floor(merchant.rating) ? 'text-black' : 'text-black/20'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-black/60">
                            {merchant.rating} ({merchant.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {amount ? (parseFloat(amount) * 30).toLocaleString() : '0'} NTD
                      </p>
                      <p className="text-sm text-black/60">{merchant.commissionPercent}% fees</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={() => router.push(`/payment/${MOCK_MERCHANTS[0].id}?amount=${amount}`)}
            className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto bg-[#4ADE80] text-white rounded-2xl py-4 font-bold"
            style={{ width: 'calc(100% - 2rem)' }}
          >
            Pay
          </button>
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
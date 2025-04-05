import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import QRCodeGenerator from '../../components/QRCodeGenerator';

interface RegistrationStatus {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
}

interface FormData {
  adminName: string;
  brandName: string;
  address: string;
  phoneNumber: string;
  email: string;
  commission: number;
  dailyLimit: number;
}

export default function RegisterMerchant() {
  const { authenticated, ready, user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [status, setStatus] = useState<RegistrationStatus>({ status: 'idle' });
  const [merchantId, setMerchantId] = useState<string>();
  const [formData, setFormData] = useState<FormData>({
    adminName: '',
    brandName: '',
    address: '',
    phoneNumber: '',
    email: '',
    commission: 0,
    dailyLimit: 1000000,
  });

  const activeWallet = wallets[0];

  const [coordinates, setCoordinates] = useState({
    latitude: 25.0330,
    longitude: 121.5654
  });

  const [viewState, setViewState] = useState({
    latitude: 25.0330,
    longitude: 121.5654,
    zoom: 13
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet?.address) return;

    try {
      setStatus({ status: 'submitting' });
      const token = await getAccessToken();

      const response = await fetch('/api/merchants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          walletAddress: activeWallet.address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setMerchantId(data._id);
      setStatus({
        status: 'success',
        message: 'Registration successful! You can now receive payments.',
      });
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Registration failed',
      });
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
          <h1 className="text-2xl font-bold text-gray-900  mb-6">
            Register as Merchant
          </h1>

          {status.status === 'success' && merchantId ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                {status.message}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Payment QR Code
                </label>
                <QRCodeGenerator merchantId={merchantId} />
              </div>

              <button
                onClick={() => router.push('/merchant/dashboard')}
                className="w-full bg-white text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Administrator name */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Administrator name*
                </label>
                <input
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none"
                  placeholder="Enter administrator name"
                />
              </div>

              {/* Brand name */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-black font-medium">
                    Brand name*
                  </label>
                  <span className="text-gray-600">Public</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none"
                  placeholder="Enter brand name"
                />
              </div>

              {/* Physical address */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-black font-medium">
                    Physical address* (Shop)
                  </label>
                  <span className="text-gray-600">Public</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none"
                  placeholder="Enter shop address"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Phone number*
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>

              {/* Commission */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Commission
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
                    className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none pr-8"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black">%</span>
                </div>
              </div>

              {/* Daily Balance */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Default daily balance for exchange
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) })}
                    className="w-full p-4 bg-white rounded-2xl text-black placeholder-gray-500 focus:outline-none pr-16"
                    placeholder="1,000,000"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black">NTD</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-black font-medium mb-2">
                  Location* (Drop a pin)
                </label>
                <div className="mt-1 w-full h-[200px] rounded-xl overflow-hidden">
                  <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onClick={evt => setCoordinates({
                      latitude: evt.lngLat.lat,
                      longitude: evt.lngLat.lng
                    })}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                  >
                    <Marker
                      latitude={coordinates.latitude}
                      longitude={coordinates.longitude}
                      draggable
                      onDragEnd={evt => setCoordinates({
                        latitude: evt.lngLat.lat,
                        longitude: evt.lngLat.lng
                      })}
                    >
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">
                        📍
                      </div>
                    </Marker>
                  </Map>
                </div>
              </div>

              {status.status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={status.status === 'submitting'}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  status.status === 'submitting'
                    ? 'bg-white-400 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-700'
                }`}
              >
                {status.status === 'submitting' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register Merchant'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
} 
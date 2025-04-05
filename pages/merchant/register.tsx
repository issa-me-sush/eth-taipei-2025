import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Register() {
  const router = useRouter();
  const { user } = usePrivy();
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    phoneNumber: '',
    email: '',
    commissionPercent: 0,
    dailyLimit: 1000000,
  });

  const [coordinates, setCoordinates] = useState({
    latitude: 25.0330,
    longitude: 121.5654
  });

  const [viewState, setViewState] = useState({
    latitude: 25.0330,
    longitude: 121.5654,
    zoom: 13
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          walletAddress: user?.wallet?.address,
          location: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude]
          }
        }),
      });

      if (response.ok) {
        router.push('/merchant/dashboard');
      }
    } catch (error) {
      console.error('Error creating merchant:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-black">Tell us about your shop</h1>
          <button 
            onClick={() => router.back()} 
            className="p-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[17px] mb-2">
              Administrator name*
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
              placeholder="Vitalik Buretin"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[17px]">Brand name*</label>
              <span className="text-[#6B7280]">Public</span>
            </div>
            <input
              type="text"
              required
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
              placeholder="Rouhe Pork Bun"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[17px]">Physical address* (Shop)</label>
              <span className="text-[#6B7280]">Public</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={`${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`}
                readOnly
                className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
                placeholder="Raohe St, Songshan District, Taipei City..."
              />
              <div className="mt-2 w-full h-[200px] rounded-2xl overflow-hidden">
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
          </div>

          <div>
            <label className="block text-[17px] mb-2">
              Phone number*
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
              placeholder="0922-827-293"
            />
          </div>

          <div>
            <label className="block text-[17px] mb-2">
              Email*
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
              placeholder="vitalik@ethereum.org"
            />
          </div>

          <div>
            <label className="block text-[17px] mb-2">
              Commission
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commissionPercent}
                onChange={(e) => setFormData({ ...formData, commissionPercent: Number(e.target.value) })}
                className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px] pr-8"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[17px]">%</span>
            </div>
          </div>

          <div>
            <label className="block text-[17px] mb-2">
              Default daily balance for exchange
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.dailyLimit.toLocaleString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, dailyLimit: Number(value) || 0 });
                }}
                className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px] pr-16"
                placeholder="1,000,000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[17px]">NTD</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4ADE80] text-black font-bold rounded-2xl py-4 mt-4 text-[17px]"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
} 
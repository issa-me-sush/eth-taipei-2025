import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import SuccessModal from '@/components/SuccessModal';

interface PlaceResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  name: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '16px'
};

const libraries: ("places")[] = ["places"];

export default function Register() {
  const router = useRouter();
  const { user, ready, authenticated } = usePrivy();
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    phoneNumber: '',
    email: '',
    commissionPercent: '',
    dailyLimit: '1000000',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [center, setCenter] = useState({
    lat: 25.0478,
    lng: 121.5170
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const onLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          setSelectedPlace({
            formatted_address: place.formatted_address || '',
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            },
            place_id: place.place_id || '',
            name: place.name || ''
          });
          setCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!ready || !authenticated) {
      setError('Please wait for authentication to complete');
      return;
    }

    if (!user?.wallet?.address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!selectedPlace) {
      setError('Please select a location');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          commissionPercent: formData.commissionPercent === '' ? 0 : parseInt(formData.commissionPercent, 10),
          dailyLimit: formData.dailyLimit === '' ? 0 : parseInt(formData.dailyLimit.replace(/,/g, ''), 10),
          walletAddress: user.wallet.address,
          location: {
            type: 'Point',
            coordinates: [selectedPlace.geometry.location.lng, selectedPlace.geometry.location.lat]
          },
          address: selectedPlace.formatted_address,
          placeId: selectedPlace.place_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating merchant:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to register merchant. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect if not authenticated (this will show briefly before the redirect)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black">
      {showSuccessModal && (
        <SuccessModal
          message="Registration successful! Redirecting to dashboard..."
          onClose={() => {
            setShowSuccessModal(false);
            router.push('/merchant/dashboard');
          }}
        />
      )}
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] font-black text-black">Tell us about your shop</h1>
          <button 
            onClick={() => router.back()} 
            className="p-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600">
            {error}
          </div>
        )}

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
              placeholder="Vitalik Buterin"
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
            <div className="relative space-y-2">
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}
                libraries={libraries}
              >
                <div className="relative">
                  <StandaloneSearchBox
                    onLoad={onLoad}
                    onPlacesChanged={onPlacesChanged}
                  >
                    <input
                      type="text"
                      required
                      className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px]"
                      placeholder="Search for your location..."
                    />
                  </StandaloneSearchBox>
                </div>

                {selectedPlace && (
                  <>
                    <div className="text-sm text-[#6B7280] pl-1">
                      {selectedPlace.formatted_address}
                    </div>
                    <div className="w-full h-[200px] rounded-2xl overflow-hidden">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={16}
                      >
                        <Marker
                          position={{
                            lat: selectedPlace.geometry.location.lat,
                            lng: selectedPlace.geometry.location.lng
                          }}
                        />
                      </GoogleMap>
                    </div>
                  </>
                )}
              </LoadScript>
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.commissionPercent}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value === '' || parseInt(value, 10) <= 100) {
                    setFormData({ ...formData, commissionPercent: value });
                  }
                }}
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
                value={formData.dailyLimit}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ 
                    ...formData, 
                    dailyLimit: value 
                  });
                }}
                className="w-full p-4 rounded-2xl bg-[#F5F5F5] border-none text-[17px] pr-16"
                placeholder="1000000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[17px]">NTD</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#4ADE80] text-black font-bold rounded-2xl py-4 mt-4 text-[17px] relative ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">Confirm</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 
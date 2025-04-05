import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  latitude: number;
  longitude: number;
}

interface Merchant {
  id: string;
  name: string;
  address: string;
  location: Location;
}

interface MapViewProps {
  merchants: Merchant[];
  onMerchantSelect?: (merchant: Merchant) => void;
}

export default function MapView({ merchants, onMerchantSelect }: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude: 25.0330,  // Taipei latitude
    longitude: 121.5654, // Taipei longitude
    zoom: 12
  });
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            ...viewState,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    >
      {merchants.map((merchant) => (
        <Marker
          key={merchant.id}
          latitude={merchant.location.latitude}
          longitude={merchant.location.longitude}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedMerchant(merchant);
            if (onMerchantSelect) {
              onMerchantSelect(merchant);
            }
          }}
        >
          <div className="cursor-pointer text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </Marker>
      ))}

      {selectedMerchant && (
        <Popup
          latitude={selectedMerchant.location.latitude}
          longitude={selectedMerchant.location.longitude}
          onClose={() => setSelectedMerchant(null)}
          closeButton={true}
          closeOnClick={false}
          anchor="bottom"
        >
          <div className="p-2">
            <h3 className="font-semibold">{selectedMerchant.name}</h3>
            <p className="text-sm text-gray-600">{selectedMerchant.address}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
} 
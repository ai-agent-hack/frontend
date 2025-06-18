'use client';

import { useState, useCallback } from 'react';
import { GoogleMap as ReactGoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface MapPin {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
}

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  pins?: MapPin[];
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    }
  ]
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 10,
  pins = [],
  className = ''
}) => {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const onError = useCallback((error: Error) => {
    console.error('Error loading Google Maps:', error);
  }, []);

  const handleMarkerClick = useCallback((pin: MapPin) => {
    setSelectedPin(pin);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPin(null);
  }, []);

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Map Configuration Required</h3>
          <p className="text-gray-600 mb-4">
            Please add your Google Maps API key to the environment variables.
          </p>
          <div className="text-sm text-gray-500">
            <p>1. Copy .env.local.example to .env.local</p>
            <p>2. Add your Google Maps API key</p>
            <p>3. Restart the development server</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%', color: 'red', position: 'relative' }}>
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={['places']}
        onLoad={onLoad}
        onError={onError}
        loadingElement={
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        }
      >
        <ReactGoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
        >
          {pins.map((pin) => {
            // Create icon config without using window.google during SSR
            const iconConfig = {
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: '#FF6B6B',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 1.5,
              ...(typeof window !== 'undefined' && window.google?.maps?.Point && {
                anchor: new window.google.maps.Point(12, 24)
              })
            };

            return (
              <Marker
                key={pin.id}
                position={pin.position}
                title={pin.title}
                onClick={() => handleMarkerClick(pin)}
                icon={iconConfig}
              />
            );
          })}

          {selectedPin && (
            <InfoWindow
              position={selectedPin.position}
              onCloseClick={handleInfoWindowClose}
              options={{
                ...(typeof window !== 'undefined' && window.google?.maps?.Size && {
                  pixelOffset: new window.google.maps.Size(0, -30)
                })
              }}
            >
              <div style={{ padding: '12px', maxWidth: '250px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {selectedPin.title}
                </h3>
                {selectedPin.description && (
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {selectedPin.description}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </ReactGoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMap;

"use client";

import { Center, Stack, Text, VStack } from "@chakra-ui/react";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Map is a reserved name in this context
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";

export interface MapPin {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
}

interface GoogleMapProps {
  apiKey: string;
  pins?: MapPin[];
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const calculateAveragePosition = (
  pins: MapPin[],
): { lat: number; lng: number } => {
  if (pins.length === 0) {
    return {
      lat: 35.652832,
      lng: 139.839478,
    };
  }

  const sum = pins.reduce(
    (acc, pin) => {
      return {
        lat: acc.lat + pin.position.lat,
        lng: acc.lng + pin.position.lng,
      };
    },
    { lat: 0, lng: 0 },
  );

  return {
    lat: sum.lat / pins.length,
    lng: sum.lng / pins.length,
  };
};

const GoogleMap: React.FC<GoogleMapProps> = ({ apiKey, pins = [] }) => {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    calculateAveragePosition(pins),
  );

  const handleMarkerClick = useCallback((pin: MapPin) => {
    setSelectedPin(pin);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPin(null);
  }, []);

  useEffect(() => {
    if (pins.length > 0) {
      setCenter(calculateAveragePosition(pins));
    }
  }, [pins]);

  useEffect(() => {
    setCenter(calculateAveragePosition(pins));
  }, [pins]);

  if (!apiKey) {
    return (
      <Center w={"100%"} h="100%">
        <Text color="red.500" fontSize="xl">
          Google Maps API key is not provided.
        </Text>
      </Center>
    );
  }

  return (
    <Stack w={"100%"} h="100%" position="relative">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={"DEMO_MAP_ID"}
          style={mapContainerStyle}
          streetViewControl={false}
          zoomControl
          zoom={zoom}
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          onCenterChanged={(e) => setCenter(e.detail.center)}
          center={center}
          defaultZoom={10}
        >
          {pins.map((pin) => {
            return (
              <AdvancedMarker
                key={pin.id}
                position={pin.position}
                title={pin.title}
                onClick={() => handleMarkerClick(pin)}
              >
                <Pin
                  background={"#0f9d58"}
                  borderColor={"#006425"}
                  glyphColor={"#60d98f"}
                />
              </AdvancedMarker>
            );
          })}

          {selectedPin && (
            <InfoWindow
              position={selectedPin.position}
              pixelOffset={[0, -40]}
              shouldFocus
              onCloseClick={handleInfoWindowClose}
            >
              <VStack padding={2} align="start" maxWidth="250px">
                <Text fontSize="16px" fontWeight="bold" color="#333" mb="2">
                  {selectedPin.title}
                </Text>
                {selectedPin.description && (
                  <Text fontSize="14px" color="#666" lineHeight="1.4">
                    {selectedPin.description}
                  </Text>
                )}
              </VStack>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </Stack>
  );
};

export default GoogleMap;

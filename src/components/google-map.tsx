"use client";

import {
  Box,
  Center,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Map is a reserved name in this context
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { LuExternalLink } from "react-icons/lu";

export interface MapPin {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
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
    <Stack w={"100%"} h="100vh" position="relative">
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
              <Box
                maxWidth="300px"
                minWidth="250px"
                bg="white"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="lg"
              >
                {selectedPin.imageUrl && (
                  <Box position="relative" height="150px" overflow="hidden">
                    <Image
                      src={selectedPin.imageUrl}
                      alt={selectedPin.title}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                    />
                  </Box>
                )}

                <VStack align="stretch" gap={3} p={4}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="gray.800"
                      lineHeight="1.2"
                      overflow="hidden"
                      display="-webkit-box"
                      css={{
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {selectedPin.title}
                    </Text>
                  </Box>

                  {selectedPin.description && (
                    <>
                      <Box borderTop="1px solid" borderColor="gray.200" />
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.5"
                        overflow="hidden"
                        display="-webkit-box"
                        css={{
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {selectedPin.description}
                      </Text>
                    </>
                  )}

                  {selectedPin.websiteUrl && (
                    <Box pt={2}>
                      <Link
                        href={selectedPin.websiteUrl}
                        target="_blank"
                        display="inline-flex"
                        alignItems="center"
                        color="blue.500"
                        fontSize="sm"
                        fontWeight="medium"
                        _hover={{
                          color: "blue.600",
                          textDecoration: "underline",
                        }}
                      >
                        <Text mr={1}>ウェブサイトを見る</Text>
                        <LuExternalLink size={12} />
                      </Link>
                    </Box>
                  )}
                </VStack>
              </Box>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </Stack>
  );
};

export default GoogleMap;

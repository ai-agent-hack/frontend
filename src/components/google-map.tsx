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
import { Checkbox } from "@/components/ui/checkbox";

export interface MapPin {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
  selected?: boolean;
}

interface GoogleMapProps {
  apiKey: string;
  pins?: MapPin[];
  onSpotSelect?: (spotId: string, isSelected: boolean) => void;
  selectedPinId?: string | null;
  setSelectedPinId?: (pinId: string) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  pins = [],
  onSpotSelect,
  selectedPinId,
  setSelectedPinId,
}) => {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.652832,
    lng: 139.839478,
  });

  const calculateAveragePosition = useCallback(
    (pins: MapPin[]): { lat: number; lng: number } => {
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
    },
    [],
  );

  const handleMarkerClick = useCallback(
    (pin: MapPin) => {
      setSelectedPin(pin);
      setSelectedPinId?.(pin.id);
    },
    [setSelectedPinId],
  );

  // Update selectedPin when pins change
  useEffect(() => {
    if (selectedPin && pins.length > 0) {
      const updatedPin = pins.find((pin) => pin.id === selectedPin.id);
      if (updatedPin) {
        setSelectedPin(updatedPin);
      }
    }
  }, [pins, selectedPin]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPin(null);
  }, []);

  useEffect(() => {
    if (pins.length > 0) {
      const newCenter = calculateAveragePosition(pins);
      setCenter(newCenter);
    }
  }, [pins, calculateAveragePosition]);

  // Handle external pin selection
  useEffect(() => {
    if (selectedPinId !== undefined) {
      if (selectedPinId === null) {
        setSelectedPin(null);
      } else {
        const pin = pins.find((p) => p.id === selectedPinId);
        if (pin) {
          setSelectedPin(pin);
          // Center the map on the selected pin
          setCenter(pin.position);
        }
      }
    }
  }, [selectedPinId, pins]);

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
                  background={"#ff8c00"}
                  borderColor={"#cc7000"}
                  glyphColor={"#ffb366"}
                />
              </AdvancedMarker>
            );
          })}

          {selectedPin && (
            <InfoWindow
              key={`${selectedPin.id}-${selectedPin.selected}`}
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

                  {onSpotSelect && (
                    <Box pt={2} borderTop="1px solid" borderColor="gray.200">
                      <Checkbox
                        checked={selectedPin.selected || false}
                        onCheckedChange={(
                          checked: boolean | "indeterminate",
                        ) => {
                          onSpotSelect(selectedPin.id, checked === true);
                        }}
                        size="sm"
                      >
                        このスポットを選択する
                      </Checkbox>
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

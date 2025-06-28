"use client";

import {
  Box,
  Center,
  CloseButton,
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
  useMap,
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
  selected?: boolean;
}

interface GoogleMapProps {
  apiKey: string;
  pins?: MapPin[];
  onSpotSelect?: (spotId: string, isSelected: boolean) => void;
  selectedPinId?: string | null;
  setSelectedPinId?: (pinId: string) => void;
  routeCoordinates?: Array<{ lat: number; lng: number }>;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Component to render route polyline
const RoutePolyline: React.FC<{
  coordinates: Array<{ lat: number; lng: number }>;
}> = ({ coordinates }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || coordinates.length < 2) return;

    // Create new polyline with improved visibility
    const newPolyline = new google.maps.Polyline({
      path: coordinates,
      strokeColor: "#FF1744", // 鮮やかな赤色に変更
      strokeOpacity: 0.9, // より不透明に
      strokeWeight: 6, // より太く
      map: map,
      geodesic: true, // 地球の曲率に沿って描画
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: "#FF1744",
            strokeWeight: 2,
            fillColor: "#FF1744",
            fillOpacity: 1,
          },
          offset: "100%",
          repeat: "100px", // 矢印を100ピクセルごとに表示
        },
      ],
    });

    setPolyline(newPolyline);

    return () => {
      if (newPolyline) {
        newPolyline.setMap(null);
      }
    };
  }, [map, coordinates]);

  // Clean up previous polyline when new one is created
  useEffect(() => {
    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [polyline]);

  return null;
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  pins = [],
  onSpotSelect,
  selectedPinId,
  setSelectedPinId,
  routeCoordinates = [],
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
      <style>
        {`
          /* Hide default Google Maps InfoWindow close button */
          .gm-ui-hover-effect {
            display: none !important;
            background: transparent !important;
            background-color: transparent !important;
            border-radius: 20px !important;
          }
          /* Remove extra padding from InfoWindow */
          .gm-style-iw {
            padding: 0 !important;
            background: transparent !important;
            background-color: transparent !important;
            border-radius: 20px !important;
          }
          .gm-style-iw-c {
            padding: 0 !important;
            background: transparent !important;
            background-color: transparent !important;
            border-radius: 20px !important;
          }
          .gm-style-iw-d {
            overflow: visible !important;
            background: transparent !important;
            background-color: transparent !important;
            border-radius: 20px !important;
          }
        `}
      </style>
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

          {routeCoordinates.length > 1 && (
            <RoutePolyline coordinates={routeCoordinates} />
          )}

          {selectedPin && (
            <InfoWindow
              key={`${selectedPin.id}-${selectedPin.selected}`}
              position={selectedPin.position}
              pixelOffset={[0, -40]}
              shouldFocus
              onCloseClick={handleInfoWindowClose}
              headerDisabled={true}
              style={{
                maxWidth: "320px",
                minWidth: "280px",
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
              }}
            >
              {selectedPin.imageUrl && (
                <Box
                  position="relative"
                  height="200px"
                  overflow="hidden"
                  borderRadius="20px"
                  mb={2}
                >
                  <Image
                    src={selectedPin.imageUrl}
                    alt={selectedPin.title}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                  <CloseButton
                    position={"absolute"}
                    borderRadius={"full"}
                    variant={"ghost"}
                    top={2}
                    right={2}
                    onClick={handleInfoWindowClose}
                  />
                </Box>
              )}

              <VStack align="stretch" gap={3} p={3} position="relative">
                {!selectedPin.imageUrl && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="gray.100"
                    borderRadius="full"
                    p={1}
                    cursor="pointer"
                    onClick={handleInfoWindowClose}
                    _hover={{
                      bg: "gray.200",
                    }}
                    transition="all 0.2s"
                    zIndex={1}
                  >
                    <Text fontSize="sm" color="gray.600" lineHeight="1">
                      ✕
                    </Text>
                  </Box>
                )}
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
                    <Box borderTop="1px solid" borderColor="border" />
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
                  <Box
                    bg="blue.50"
                    borderRadius="lg"
                    p={3}
                    textAlign="center"
                    transition="all 0.2s"
                    _hover={{
                      bg: "blue.100",
                    }}
                  >
                    <Link
                      href={selectedPin.websiteUrl}
                      target="_blank"
                      display="inline-flex"
                      alignItems="center"
                      color="blue.600"
                      fontSize="sm"
                      fontWeight="medium"
                      textDecoration="none"
                    >
                      <Text mr={1}>ウェブサイトを見る</Text>
                      <LuExternalLink size={12} />
                    </Link>
                  </Box>
                )}

                {onSpotSelect && (
                  <Box pt={2} borderTop="1px solid" borderColor="border">
                    <Box
                      as="button"
                      width="100%"
                      bg={selectedPin.selected ? "blue.500" : "white"}
                      color={selectedPin.selected ? "white" : "gray.700"}
                      border="2px solid"
                      borderColor={selectedPin.selected ? "blue.500" : "border"}
                      borderRadius="xl"
                      p={3}
                      transition="all 0.2s"
                      _hover={{
                        bg: selectedPin.selected ? "blue.600" : "gray.50",
                        borderColor: selectedPin.selected
                          ? "blue.600"
                          : "border",
                        transform: "translateY(-1px)",
                      }}
                      onClick={() =>
                        onSpotSelect(selectedPin.id, !selectedPin.selected)
                      }
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                    >
                      <Box
                        width="20px"
                        height="20px"
                        borderRadius="md"
                        border="2px solid"
                        borderColor={selectedPin.selected ? "white" : "border"}
                        bg={selectedPin.selected ? "white" : "transparent"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.2s"
                      >
                        {selectedPin.selected && (
                          <Text
                            fontSize="sm"
                            color="blue.500"
                            fontWeight="bold"
                          >
                            ✓
                          </Text>
                        )}
                      </Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedPin.selected
                          ? "選択済み"
                          : "このスポットを選択する"}
                      </Text>
                    </Box>
                  </Box>
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

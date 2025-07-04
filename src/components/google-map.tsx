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

export type MapPin = {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  imageUrl?: string;
  websiteUrl?: string;
  selected: boolean;
};

interface GoogleMapProps {
  apiKey: string;
  pins: MapPin[];
  onSpotSelect: (id: string, selected: boolean) => void;
  selectedPinId: string | null;
  setSelectedPinId: React.Dispatch<React.SetStateAction<string | null>>;
  polyline?: string;
  setTriggerMessage?: (message: string) => void;
  isRouteView?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const RoutePolyline = ({
  polyline: encodedPolyline,
}: {
  polyline?: string;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !encodedPolyline) return;

    const path =
      window.google.maps.geometry.encoding.decodePath(encodedPolyline);

    const routePolyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#4F46E5",
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    routePolyline.setMap(map);

    return () => {
      routePolyline.setMap(null);
    };
  }, [map, encodedPolyline]);

  return null;
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  pins,
  onSpotSelect,
  selectedPinId,
  setSelectedPinId,
  polyline,
  setTriggerMessage,
  isRouteView = false,
}) => {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.652832,
    lng: 139.839478,
  });
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

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

  const calculateBounds = useCallback((pins: MapPin[]) => {
    if (pins.length === 0) return null;

    const bounds = {
      north: -90,
      south: 90,
      east: -180,
      west: 180,
    };

    for (const pin of pins) {
      bounds.north = Math.max(bounds.north, pin.position.lat);
      bounds.south = Math.min(bounds.south, pin.position.lat);
      bounds.east = Math.max(bounds.east, pin.position.lng);
      bounds.west = Math.min(bounds.west, pin.position.lng);
    }

    return bounds;
  }, []);

  const calculateZoomLevel = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      const WORLD_DIM = { height: 256, width: 256 };
      const ZOOM_MAX = 21;

      const latDiff = bounds.north - bounds.south;
      const lngDiff = bounds.east - bounds.west;

      // Add padding (10% on each side)
      const latPadding = latDiff * 0.1;
      const lngPadding = lngDiff * 0.1;

      const paddedLatDiff = latDiff + latPadding * 2;
      const paddedLngDiff = lngDiff + lngPadding * 2;

      // Assume a map container size (you might want to get the actual size)
      const mapWidth = 800; // Default width
      const mapHeight = 600; // Default height

      const latZoom = Math.floor(
        Math.log2((mapHeight * 360) / paddedLatDiff / WORLD_DIM.height),
      );
      const lngZoom = Math.floor(
        Math.log2((mapWidth * 360) / paddedLngDiff / WORLD_DIM.width),
      );

      const zoom = Math.min(latZoom, lngZoom, ZOOM_MAX);

      // Return a reasonable zoom level
      return Math.max(1, Math.min(zoom, 18));
    },
    [],
  );

  const handleMarkerClick = useCallback(
    (pin: MapPin) => {
      setSelectedPin(pin);
      setSelectedPinId?.(pin.id);
      setInfoWindowOpen(true);
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
    setInfoWindowOpen(false);
  }, []);

  useEffect(() => {
    if (pins.length > 0) {
      const newCenter = calculateAveragePosition(pins);
      setCenter(newCenter);

      // Calculate and set zoom based on pin distribution
      if (pins.length === 1) {
        // For single pin, use a reasonable default zoom
        setZoom(15);
      } else {
        const bounds = calculateBounds(pins);
        if (bounds) {
          // Check if all pins are at the same location
          const latDiff = bounds.north - bounds.south;
          const lngDiff = bounds.east - bounds.west;

          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            // All pins are very close together
            setZoom(15);
          } else {
            const newZoom = calculateZoomLevel(bounds);
            setZoom(newZoom);
          }
        }
      }
    }
  }, [pins, calculateAveragePosition, calculateBounds, calculateZoomLevel]);

  // Handle external pin selection
  useEffect(() => {
    if (selectedPinId !== undefined) {
      if (selectedPinId === null) {
        setSelectedPin(null);
        setInfoWindowOpen(false);
      } else {
        const pin = pins.find((p) => p.id === selectedPinId);
        if (pin) {
          setSelectedPin(pin);
          setInfoWindowOpen(true);
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
      <APIProvider apiKey={apiKey} libraries={["geometry"]}>
        <Map
          mapId={"DEMO_MAP_ID"}
          style={mapContainerStyle}
          disableDefaultUI
          fullscreenControl
          zoomControl
          zoom={zoom}
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          onCenterChanged={(e) => setCenter(e.detail.center)}
          center={center}
          defaultZoom={10}
        >
          {pins
            .filter((pin) => !pin.selected)
            .map((pin) => {
              return (
                <AdvancedMarker
                  key={pin.id}
                  position={pin.position}
                  title={pin.title}
                  onClick={() => handleMarkerClick(pin)}
                >
                  <div style={{ opacity: isRouteView ? 0.5 : 1 }}>
                    <Pin
                      background={isRouteView ? "#E5E7EB" : "#FBBC04"}
                      borderColor={isRouteView ? "#D1D5DB" : "#F29900"}
                      glyphColor={isRouteView ? "#6B7280" : "#000000"}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}
          {pins
            .filter((pin) => pin.selected)
            .map((pin) => {
              return (
                <AdvancedMarker
                  key={pin.id}
                  position={pin.position}
                  title={pin.title}
                  onClick={() => handleMarkerClick(pin)}
                >
                  <Pin
                    background="#4F46E5"
                    borderColor="#3730A3"
                    glyphColor="#FFFFFF"
                  />
                </AdvancedMarker>
              );
            })}

          {infoWindowOpen && selectedPin && (
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
                    top={2}
                    right={2}
                    onClick={handleInfoWindowClose}
                    bg="white"
                    color="gray.700"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
                    _hover={{
                      transform: "scale(1.1)",
                    }}
                    transition="all 0.2s"
                  />
                </Box>
              )}

              <VStack align="stretch" gap={3} p={3} position="relative">
                {!selectedPin.imageUrl && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="white"
                    borderRadius="full"
                    p={1}
                    cursor="pointer"
                    onClick={handleInfoWindowClose}
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{
                      bg: "gray.100",
                      transform: "scale(1.1)",
                    }}
                    transition="all 0.2s"
                    zIndex={1}
                  >
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      lineHeight="1"
                      fontWeight="bold"
                    >
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

                {setTriggerMessage && selectedPin.id && (
                  <Box
                    as="button"
                    width="100%"
                    bg="purple.50"
                    color="purple.700"
                    border="1px solid"
                    borderColor="purple.200"
                    borderRadius="xl"
                    p={3}
                    transition="all 0.2s"
                    _hover={{
                      bg: "purple.100",
                      borderColor: "purple.300",
                      transform: "translateY(-1px)",
                    }}
                    onClick={() =>
                      setTriggerMessage(
                        `「${selectedPin.title}」について教えて\n${selectedPin.id ? ` (place_id: ${selectedPin.id})` : ""}`,
                      )
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      この場所について教えて
                    </Text>
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
                          : "このスポットに行く"}
                      </Text>
                    </Box>
                  </Box>
                )}
              </VStack>
            </InfoWindow>
          )}
          <RoutePolyline polyline={polyline} />
        </Map>
      </APIProvider>
    </Stack>
  );
};

export default GoogleMap;

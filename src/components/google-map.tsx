"use client";

import { Box, Image, Link, Stack, Text, VStack } from "@chakra-ui/react";
import {
  AdvancedMarker,
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
  selected?: boolean;
}

interface GoogleMapProps {
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

  return (
    <Stack w={"100%"} h="100vh" position="relative">
      <style>
        {`
          /* Hide default Google Maps InfoWindow close button */
          .gm-ui-hover-effect {
            display: none !important;
          }
          /* Remove extra padding from InfoWindow */
          .gm-style-iw {
            padding: 0 !important;
          }
          .gm-style-iw-c {
            padding: 0 !important;
          }
          .gm-style-iw-d {
            overflow: visible !important;
          }
        `}
      </style>
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
            headerDisabled={false}
          >
            <Box
              maxWidth="320px"
              minWidth="280px"
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="xl"
              border="1px solid"
              borderColor="gray.200"
              mt={-4}
              p={2}
              css={{
                "&": {
                  overflow: "visible",
                },
                "& > *:first-of-type": {
                  marginTop: 0,
                },
              }}
            >
              {selectedPin.imageUrl && (
                <Box
                  position="relative"
                  height="200px"
                  overflow="hidden"
                  borderRadius="lg"
                  mb={2}
                >
                  <Image
                    src={selectedPin.imageUrl}
                    alt={selectedPin.title}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="white"
                    borderRadius="full"
                    p={1.5}
                    cursor="pointer"
                    onClick={handleInfoWindowClose}
                    boxShadow="md"
                    _hover={{
                      bg: "gray.100",
                    }}
                    transition="all 0.2s"
                  >
                    <Text fontSize="md" color="gray.600">
                      ✕
                    </Text>
                  </Box>
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
                </Box>

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
                      _hover={{
                        textDecoration: "none",
                      }}
                    >
                      <Text mr={1}>ウェブサイトを見る</Text>
                      <LuExternalLink size={12} />
                    </Link>
                  </Box>
                )}

                {onSpotSelect && (
                  <Box pt={2} borderTop="1px solid" borderColor="gray.100">
                    <Box
                      as="button"
                      width="100%"
                      bg={selectedPin.selected ? "blue.500" : "white"}
                      color={selectedPin.selected ? "white" : "gray.700"}
                      border="2px solid"
                      borderColor={
                        selectedPin.selected ? "blue.500" : "gray.300"
                      }
                      borderRadius="xl"
                      p={3}
                      transition="all 0.2s"
                      _hover={{
                        bg: selectedPin.selected ? "blue.600" : "gray.50",
                        borderColor: selectedPin.selected
                          ? "blue.600"
                          : "gray.400",
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                      }}
                      _active={{
                        transform: "translateY(0)",
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
                        borderColor={
                          selectedPin.selected ? "white" : "gray.400"
                        }
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
            </Box>
          </InfoWindow>
        )}
      </Map>
    </Stack>
  );
};

export default GoogleMap;

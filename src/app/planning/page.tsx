"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import type { RecommendedSpots } from "@/types/mastra";
import { getInitialRecommendedSpots } from "./action";
import ChatPane from "./chat-pane";
import DetailPane from "./detail-pane";

export default function Planning() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [recommendedSpots, setRecommendedSpots] =
    useState<RecommendedSpots | null>(null);
  const preInfoId = useSearchParams().get("pre_info_id");

  useEffect(() => {
    (async () => {
      if (!preInfoId) return;

      const spots = await getInitialRecommendedSpots({
        pre_info_id: preInfoId,
      });
      setRecommendedSpots(spots);
      const pins: MapPin[] = spots.recommend_spots.flatMap((timeSlot) =>
        timeSlot.spots.map((spot, index) => ({
          id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
          position: { lat: spot.latitude, lng: spot.longitude },
          title: spot.details.name,
          description: spot.recommendation_reason,
        })),
      );
      setMapPins(pins);
    })();
  }, [preInfoId]);

  const handleRecommendSpotUpdate = (recommendSpot: RecommendedSpots) => {
    setRecommendedSpots(recommendSpot);

    const pins: MapPin[] = recommendSpot.recommend_spots.flatMap((timeSlot) =>
      timeSlot.spots.map((spot, index) => ({
        id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
        position: { lat: spot.latitude, lng: spot.longitude },
        title: spot.details.name,
        description: spot.recommendation_reason,
      })),
    );
    setMapPins(pins);
  };

  return (
    <HStack height="100vh" gap={0} position="relative">
      <VStack width="calc(100% - 700px)" height="100%" gap={0}>
        <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} pins={mapPins} />
      </VStack>

      <VStack width="400px" height="100vh" p={4} gap={4}>
        <HStack justify="space-between" width="100%">
          <Text fontWeight="bold" fontSize="xl">
            Details
          </Text>
        </HStack>
        <Box width="100%" flex="1">
          {recommendedSpots ? (
            <DetailPane recommendedSpots={recommendedSpots} />
          ) : (
            <Text>No details available</Text>
          )}
        </Box>
      </VStack>

      <VStack width="400px" height="100vh">
        <HStack justify="space-between" width="100%" p={4} pb={0}>
          <Text fontWeight="bold" fontSize="xl">
            Chat
          </Text>
        </HStack>
        <Box width="100%" flex="1">
          <ChatPane onRecommendSpotUpdate={handleRecommendSpotUpdate} />
        </Box>
      </VStack>
    </HStack>
  );
}

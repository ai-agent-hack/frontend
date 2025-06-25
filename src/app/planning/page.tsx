"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import type { RecommendedSpots } from "@/types/mastra";
import { getInitialRecommendedSpots, getPreInfo } from "./action";
import ChatPane from "./chat-pane";
import DetailPane from "./detail-pane";

export default function Planning() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [recommendedSpots, setRecommendedSpots] =
    useState<RecommendedSpots | null>(null);
  const preInfoId = useSearchParams().get("pre_info_id");

  useEffect(() => {
    (async () => {
      if (!preInfoId) return;

      try {
        // Fetch pre-info data
        const preInfo = await getPreInfo(preInfoId);

        // Create initial message from preInfo
        const message = `以下の情報を元にお勧めスポットを調べますね！

出発地: ${preInfo.departure_location}
期間: ${preInfo.start_date} 〜 ${preInfo.end_date}
雰囲気: ${preInfo.atmosphere}
予算: ¥${preInfo.budget.toLocaleString()}
人数: ${preInfo.participants_count}人
地域: ${preInfo.region}

素敵な場所をお探ししますね！
少々お待ちください！`;

        setInitialMessage(message);

        // Fetch initial spots
        const spots = await getInitialRecommendedSpots({
          pre_info_id: preInfoId,
        });
        const pins: MapPin[] = spots.recommend_spots.flatMap((timeSlot) =>
          timeSlot.spots.map((spot, index) => ({
            id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
            position: { lat: spot.latitude, lng: spot.longitude },
            title: spot.details.name,
            description: spot.recommendation_reason,
            imageUrl: spot.google_map_image_url,
            websiteUrl: spot.website_url,
          })),
        );
        setMapPins(pins);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
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
          <ChatPane
            onRecommendSpotUpdate={handleRecommendSpotUpdate}
            initialMessage={initialMessage}
          />
        </Box>
      </VStack>
    </HStack>
  );
}

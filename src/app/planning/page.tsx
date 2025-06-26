"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [planId, setPlanId] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    "午前" | "午後" | "夜"
  >("午前");
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

        const pins: MapPin[] = spots.recommend_spots.recommend_spots.flatMap(
          (timeSlot) =>
            timeSlot.spots.map((spot, index) => ({
              id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
              position: { lat: spot.latitude, lng: spot.longitude },
              title: spot.details.name,
              description: spot.recommendation_reason,
              imageUrl: spot.google_map_image_url,
              websiteUrl: spot.website_url ?? undefined,
              selected: spot.selected,
            })),
        );
        setRecommendedSpots(spots.recommend_spots);
        const planId = spots.plan_id;
        setPlanId(planId);
        setMapPins(pins);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    })();
  }, [preInfoId]);

  const handleRecommendSpotUpdate = useCallback(
    (recommendSpot: RecommendedSpots) => {
      setRecommendedSpots(recommendSpot);

      const pins: MapPin[] = recommendSpot.recommend_spots.flatMap((timeSlot) =>
        timeSlot.spots.map((spot, index) => ({
          id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
          position: { lat: spot.latitude, lng: spot.longitude },
          title: spot.details.name,
          description: spot.recommendation_reason,
          imageUrl: spot.google_map_image_url,
          websiteUrl: spot.website_url ?? undefined,
          selected: spot.selected,
        })),
      );
      setMapPins(pins);
    },
    [],
  );

  const handleSpotSelect = useCallback(
    (spotId: string, isSelected: boolean) => {
      if (!recommendedSpots) return;

      const updatedSpots = { ...recommendedSpots };
      updatedSpots.recommend_spots = updatedSpots.recommend_spots.map(
        (timeSlot) => ({
          ...timeSlot,
          spots: timeSlot.spots.map((spot, index) => {
            const pinId = `${timeSlot.time_slot}-${spot.spot_id}-${index}`;
            if (pinId === spotId) {
              return { ...spot, selected: isSelected };
            }
            return spot;
          }),
        }),
      );

      setRecommendedSpots(updatedSpots);

      // Update mapPins immediately
      const pins: MapPin[] = updatedSpots.recommend_spots.flatMap((timeSlot) =>
        timeSlot.spots.map((spot, index) => ({
          id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
          position: { lat: spot.latitude, lng: spot.longitude },
          title: spot.details.name,
          description: spot.recommendation_reason,
          imageUrl: spot.google_map_image_url,
          websiteUrl: spot.website_url ?? undefined,
          selected: spot.selected,
        })),
      );
      setMapPins(pins);
    },
    [recommendedSpots],
  );

  return (
    <Box height="100vh" bg="gray.100" p={3}>
      <HStack height="100%" gap={3} position="relative">
        {/* Map Section */}
        <Box
          width="calc(100% - 812px)"
          height="100%"
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="md"
          bg="white"
        >
          <GoogleMap
            apiKey={GOOGLE_MAPS_API_KEY}
            pins={mapPins.filter((pin) => pin.id.startsWith(selectedTimeSlot))}
            onSpotSelect={handleSpotSelect}
          />
        </Box>

        {/* Details Section */}
        <VStack
          width="350px"
          height="100%"
          bg="white"
          borderRadius="xl"
          boxShadow="md"
          gap={0}
          position="relative"
          overflow="hidden"
        >
          <Box
            width="100%"
            p={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gradient.to-br"
            bgGradient="linear(to-br, purple.50, pink.50)"
          >
            <Text fontWeight="bold" fontSize="lg" color="gray.700">
              Details
            </Text>
          </Box>
          <Box width="100%" flex="1" overflowY="auto">
            {recommendedSpots ? (
              <DetailPane
                recommendedSpots={recommendedSpots}
                selectedTimeSlot={selectedTimeSlot}
                onTimeSlotChange={setSelectedTimeSlot}
              />
            ) : (
              <Box p={4}>
                <Text color="gray.500">No details available</Text>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Chat Section */}
        <VStack
          width="450px"
          height="100%"
          bg="white"
          borderRadius="xl"
          gap={0}
          boxShadow="lg"
          position="relative"
          overflow="hidden"
        >
          <Box
            width="100%"
            p={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gradient.to-br"
            bgGradient="linear(to-br, blue.50, purple.50)"
          >
            <Text fontWeight="bold" fontSize="lg" color="gray.700">
              Chat
            </Text>
          </Box>
          <Box width="100%" flex="1">
            <ChatPane
              onRecommendSpotUpdate={handleRecommendSpotUpdate}
              initialMessage={initialMessage}
              recommendedSpots={recommendedSpots}
              planId={planId}
            />
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
}

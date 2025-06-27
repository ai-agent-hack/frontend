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
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
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

  const handlePinClick = useCallback((pinId: string) => {
    setSelectedPinId(pinId);
  }, []);

  return (
    <Box height="100vh" bg="gray.50" p={4}>
      <HStack height="100%" gap={4} position="relative">
        {/* Map Section */}
        <Box
          width="calc(100% - 812px)"
          height="100%"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="xl"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            position="absolute"
            top={2}
            left={2}
            zIndex={10}
            bg="white"
            px={11}
            py={5}
            borderRadius="lg"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              🗺️ 旅行マップ
            </Text>
          </Box>
          <GoogleMap
            apiKey={GOOGLE_MAPS_API_KEY}
            pins={mapPins.filter((pin) => pin.id.startsWith(selectedTimeSlot))}
            onSpotSelect={handleSpotSelect}
            selectedPinId={selectedPinId}
            setSelectedPinId={setSelectedPinId}
          />
        </Box>

        {/* Details Section */}
        <VStack
          width="350px"
          height="100%"
          bg="white"
          borderRadius="2xl"
          boxShadow="xl"
          gap={0}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            width="100%"
            p={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gradient.to-br"
            bgGradient="linear(to-br, purple.50, pink.50)"
          >
            <HStack gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="purple.700">
                📍
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="purple.700">
                スポット詳細
              </Text>
            </HStack>
            <Text fontSize="sm" color="purple.600" mt={1}>
              お気に入りの場所をチェックしてください
            </Text>
          </Box>
          <Box width="100%" flex="1" overflowY="auto">
            {recommendedSpots ? (
              <DetailPane
                recommendedSpots={recommendedSpots}
                selectedTimeSlot={selectedTimeSlot}
                onTimeSlotChange={setSelectedTimeSlot}
                onSpotSelect={handleSpotSelect}
                onPinClick={handlePinClick}
              />
            ) : (
              <Box p={6} textAlign="center">
                <Text fontSize="lg" color="gray.400" mb={2}>
                  🎯
                </Text>
                <Text color="gray.500" fontSize="sm">
                  スポット情報を読み込み中...
                </Text>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Chat Section */}
        <VStack
          width="450px"
          height="100%"
          bg="white"
          borderRadius="2xl"
          gap={0}
          boxShadow="xl"
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            width="100%"
            p={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gradient.to-br"
            bgGradient="linear(to-br, blue.50, indigo.50)"
          >
            <HStack gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="blue.700">
                💬
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="blue.700">
                旅行アシスタント
              </Text>
            </HStack>
            <Text fontSize="sm" color="blue.600" mt={1}>
              AIがあなたの旅行をサポートします
            </Text>
          </Box>
          <Box width="100%" flex="1" overflow="hidden">
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

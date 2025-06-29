"use client";

import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import type { RecommendedSpots } from "@/types/mastra";
import { getInitialRecommendedSpots, getPreInfo, saveTrip } from "./action";
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
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const preInfoId = useSearchParams().get("pre_info_id");

  useEffect(() => {
    (async () => {
      if (!preInfoId) return;

      try {
        // Fetch pre-info data
        const preInfo = await getPreInfo(preInfoId);

        // Create initial message from preInfo
        const message = `
**こんにちは！**

**最高の旅を作るお手伝いをします** 🎉

---

### 📋 いただいた旅行プラン

**📍 旅行先**  
${preInfo.region}

**📅 旅行日**  
${new Date(preInfo.start_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}

**✨ 雰囲気**  
${preInfo.atmosphere}な感じ

**💰 予算**  
¥${preInfo.budget.toLocaleString()}

**👥 人数**  
${preInfo.participants_count}人

---

**最高のスポット探してきますね〜** 🔍✨  
*少々お待ちください！*`;

        setInitialMessage(message);

        // Fetch initial spots
        // TODO : pre_info id で紐づいているplantとrouteがあれば叩かない　代わりにgetを叩く
        const spots = await getInitialRecommendedSpots({
          pre_info_id: preInfoId,
        });

        const pins: MapPin[] = spots.recommend_spots.recommend_spots.flatMap(
          (timeSlot) =>
            timeSlot.spots.map((spot, index) => ({
              id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
              position: {
                lat: spot.latitude,
                lng: spot.longitude,
              },
              title: spot.details.name,
              description: spot.recommendation_reason,
              imageUrl: spot.google_map_image_url ?? undefined,
              websiteUrl: spot.website_url ?? undefined,
              selected: spot.selected,
              placeId: spot.spot_id,
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
          imageUrl: spot.google_map_image_url ?? undefined,
          websiteUrl: spot.website_url ?? undefined,
          selected: spot.selected,
          placeId: spot.spot_id,
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
          imageUrl: spot.google_map_image_url ?? undefined,
          websiteUrl: spot.website_url ?? undefined,
          selected: spot.selected,
          placeId: spot.spot_id,
        })),
      );
      setMapPins(pins);
    },
    [recommendedSpots],
  );

  const handlePinClick = useCallback((pinId: string) => {
    setSelectedPinId(pinId);
  }, []);

  const handleCoordinatesUpdate = useCallback(
    (coordinates: Array<{ lat: number; lng: number }>) => {
      setRouteCoordinates(coordinates);
    },
    [],
  );

  return (
    <Box height="100vh" p={4}>
      <HStack height="100%" gap={"15px"} position="relative">
        {/* Map Section */}
        <Box
          width="calc(100% - 812px)"
          height="100%"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid"
          shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
          borderColor="border"
        >
          <GoogleMap
            apiKey={GOOGLE_MAPS_API_KEY}
            pins={mapPins.filter((pin) => pin.id.startsWith(selectedTimeSlot))}
            onSpotSelect={handleSpotSelect}
            selectedPinId={selectedPinId}
            setSelectedPinId={setSelectedPinId}
            routeCoordinates={routeCoordinates}
            setTriggerMessage={setTriggerMessage}
          />
          <Box
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
          >
            <Button
              size="lg"
              colorScheme="purple"
              shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
              px={8}
              py={7}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="full"
              _hover={{
                transform: "scale(1.05)",
                shadow: "0px 0px 15px rgba(0, 0, 0, 0.5)",
              }}
              transition="all 0.2s"
              disabled={!mapPins.some((pin) => pin.selected) || isSaving}
              onClick={async () => {
                if (!recommendedSpots || !planId) return;
                setIsSaving(true);
                try {
                  await saveTrip(planId, recommendedSpots);
                  setTriggerMessage("旅行ルート作成を開始して");
                } catch (error) {
                  console.error("Failed to save trip:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "保存中..." : "選択中のスポットでルートを作成"}
            </Button>
          </Box>
        </Box>

        {/* Details Section */}
        <VStack
          width="350px"
          height="100%"
          borderRadius="2xl"
          gap={0}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="border"
          shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
        >
          <Box width="100%" p={4} borderBottom="1px solid" borderColor="border">
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="lg" color="purple.fg">
                スポット詳細
              </Text>
            </HStack>
            <Text fontSize="sm" color="purple.fg" mt={1}>
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
          borderRadius="2xl"
          gap={0}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="border"
          shadow="0px 0px 15px rgba(0, 0, 0, 0.2)"
        >
          <Box width="100%" p={4} borderBottom="1px solid" borderColor="border">
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="lg" color="blue.fg">
                旅行アシスタント
              </Text>
            </HStack>
            <Text fontSize="sm" color="blue.fg" mt={1}>
              AIがあなたの旅行をサポートします
            </Text>
          </Box>
          <Box width="100%" flex="1" overflow="hidden">
            <ChatPane
              onRecommendSpotUpdate={handleRecommendSpotUpdate}
              onCoordinatesUpdate={handleCoordinatesUpdate}
              initialMessage={initialMessage}
              recommendedSpots={recommendedSpots}
              planId={planId}
              triggerMessage={triggerMessage}
              onTriggerMessageHandled={() => setTriggerMessage(null)}
            />
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
}
// End of file src/app/planning/page.tsx

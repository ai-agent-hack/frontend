"use client";

import { HStack, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import { getInitialRecommendedSpots, getPreInfo } from "./action";
import ChatPane from "./chat-pane";

export default function Planning() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>("");
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

  const handleRecommendSpotUpdate = (recommendSpotObject: unknown) => {
    // Handle the updated recommend spot object
    // You can update the map pins here if needed
    console.log("Recommend spot object updated:", recommendSpotObject);
  };

  return (
    <HStack height="100%">
      <VStack width={"calc(100% - 400px)"} height="100%">
        <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} pins={mapPins} />
      </VStack>

      <VStack width={"400px"} height="100%">
        <ChatPane
          onRecommendSpotUpdate={handleRecommendSpotUpdate}
          initialMessage={initialMessage}
        />
      </VStack>
    </HStack>
  );
}

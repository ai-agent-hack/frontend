"use client";

import { HStack, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import { getInitialRecommendedSpots } from "./action";
import ChatPane from "./chat-pane";

export default function Planning() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const preInfoId = useSearchParams().get("pre_info_id");

  useEffect(() => {
    (async () => {
      if (!preInfoId) return;

      const spots = await getInitialRecommendedSpots({
        pre_info_id: preInfoId,
      });
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
        <ChatPane onRecommendSpotUpdate={handleRecommendSpotUpdate} />
      </VStack>
    </HStack>
  );
}

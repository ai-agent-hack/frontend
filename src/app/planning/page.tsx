"use client";

import { HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/GoogleMap";
import { getInitialRecommendedSpots } from "./action";

export default function Planning() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);

  useEffect(() => {
    (async () => {
      const spots = await getInitialRecommendedSpots();
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
  }, []);

  return (
    <HStack>
      <VStack width={"calc(100% - 400px)"} height="100vh" padding="4">
        <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} pins={mapPins} />
      </VStack>

      <VStack width={"400px"} height="100vh" padding="4">
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          Chat
        </Text>
      </VStack>
    </HStack>
  );
}

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { LuMoon, LuSun, LuSunrise } from "react-icons/lu";
import type { RecommendedSpots } from "@/types/mastra";

interface RouteDetailProps {
  selectedSpots: Array<{
    pinId: string;
    spotId: string;
    name: string;
    timeSlot: "午前" | "午後" | "夜";
  }>;
  onGenerateRoute: () => void;
  isGeneratingRoute?: boolean;
  routeInfo?: {
    duration: string;
    distance: string;
    waypoints: Array<{
      name: string;
      order: number;
    }>;
  };
  onPinClick?: (pinId: string) => void;
  recommendedSpots?: RecommendedSpots;
  onTimeSlotChange?: (timeSlot: "午前" | "午後" | "夜") => void;
  orderedSpots?: Array<{
    spot_id: string;
    name: string;
    time_slot: string;
    order?: number;
    is_spot?: boolean;
    latitude?: number;
    longitude?: number;
    selected?: boolean;
    spot_name?: string;
    details?: {
      name?: string;
      address?: string;
      description?: string;
      image_url?: string;
      rating?: number;
      review_count?: number;
      price?: number;
      congestion?: number[];
      business_hours?: Record<
        string,
        {
          open_time: string;
          close_time: string;
        }
      >;
      website_url?: string;
      location_index?: number;
      similarity_score?: number | null;
      recommendation_reason?: string;
    };
  }>;
}

const RouteDetail = ({
  orderedSpots,
  onPinClick,
  recommendedSpots,
  onTimeSlotChange,
}: RouteDetailProps) => {
  // Mapping between English and Japanese time slots
  const timeSlotMapping: Record<string, "午前" | "午後" | "夜"> = {
    MORNING: "午前",
    AFTERNOON: "午後",
    NIGHT: "夜",
  };

  // Helper function to find pin ID for a spot
  const findPinIdForSpot = (spotId: string) => {
    if (!recommendedSpots) return null;

    for (const timeSlot of recommendedSpots.recommend_spots) {
      const spotIndex = timeSlot.spots.findIndex(
        (spot) => spot.spot_id === spotId,
      );
      if (spotIndex !== -1) {
        return `${timeSlot.time_slot}-${spotId}-${spotIndex}`;
      }
    }
    return null;
  };

  // Group spots by time slot
  const spotsByTimeSlot =
    orderedSpots?.reduce(
      (acc, spot) => {
        const timeSlot = spot.time_slot;

        if (!acc[timeSlot]) {
          acc[timeSlot] = [];
        }
        acc[timeSlot].push(spot);
        return acc;
      },
      {} as Record<string, typeof orderedSpots>,
    ) || {};

  const timeSlotConfig: Record<string, any> = {
    MORNING: {
      icon: LuSunrise,
      color: "orange",
      label: "午前",
      bgColor: "orange.50",
    },
    AFTERNOON: {
      icon: LuSun,
      color: "yellow",
      label: "午後",
      bgColor: "yellow.50",
    },
    NIGHT: { icon: LuMoon, color: "purple", label: "夜", bgColor: "purple.50" },
    午前: {
      icon: LuSunrise,
      color: "orange",
      label: "午前",
      bgColor: "orange.50",
    },
    午後: { icon: LuSun, color: "yellow", label: "午後", bgColor: "yellow.50" },
    夜: { icon: LuMoon, color: "purple", label: "夜", bgColor: "purple.50" },
    未分類: { icon: LuSun, color: "gray", label: "ルート", bgColor: "gray.50" },
  };

  // Define the order of time slots
  const timeSlotOrder = ["MORNING", "AFTERNOON", "NIGHT"];

  // Get actual time slots from the data in the correct order
  const timeSlots = timeSlotOrder.filter(
    (slot) => spotsByTimeSlot[slot] && spotsByTimeSlot[slot].length > 0,
  );

  return (
    <VStack width="100%" gap={4} p={4}>
      {orderedSpots && orderedSpots.length > 0 ? (
        <VStack width="100%" gap={0} position="relative">
          {/* Timeline line */}
          <Box
            position="absolute"
            left="24px"
            top="30px"
            bottom="30px"
            width="2px"
            bg="gray.200"
            zIndex={0}
          />

          {timeSlots.map((timeSlot) => {
            const spots = spotsByTimeSlot?.[timeSlot] || [];
            const config = timeSlotConfig[timeSlot] || timeSlotConfig["未分類"];
            const Icon = config.icon;

            if (spots.length === 0) return null;

            return (
              <VStack key={timeSlot} width="100%" gap={3} mb={6}>
                {/* Time slot header */}
                <HStack width="100%" gap={3} mb={2}>
                  <Box
                    bg={`${config.color}.100`}
                    borderRadius="full"
                    p={2}
                    zIndex={1}
                    border="2px solid"
                    borderColor={`${config.color}.300`}
                  >
                    <Icon
                      size={20}
                      color={`var(--chakra-colors-${config.color}-600)`}
                    />
                  </Box>
                  <Text
                    fontWeight="bold"
                    fontSize="md"
                    color={`${config.color}.700`}
                  >
                    {config.label}
                  </Text>
                </HStack>

                {/* Spots for this time slot */}
                <VStack width="100%" gap={2} pl="56px">
                  {spots.map((spot, index) => (
                    <Box key={spot.spot_id} width="100%" position="relative">
                      {/* Connection dot */}
                      <Box
                        position="absolute"
                        left="-34px"
                        top="50%"
                        transform="translateY(-50%)"
                        width="10px"
                        height="10px"
                        borderRadius="full"
                        bg={`${config.color}.400`}
                        zIndex={1}
                      />

                      {/* Spot card */}
                      <Box
                        p={4}
                        bg={config.bgColor}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={`${config.color}.200`}
                        width="100%"
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => {
                          const pinId = findPinIdForSpot(spot.spot_id);
                          if (pinId && onPinClick) {
                            // Update selected time slot if needed
                            const japaneseTimeSlot =
                              timeSlotMapping[spot.time_slot];
                            if (japaneseTimeSlot && onTimeSlotChange) {
                              onTimeSlotChange(japaneseTimeSlot);
                            }
                            // Show pin info
                            onPinClick(pinId);
                          }
                        }}
                        _hover={{
                          transform: "translateX(4px)",
                          borderColor: `${config.color}.300`,
                          boxShadow: "sm",
                        }}
                      >
                        <HStack gap={3} align="start">
                          <Box
                            bg={`${config.color}.500`}
                            color="white"
                            width="28px"
                            height="28px"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="sm"
                            fontWeight="bold"
                            flexShrink={0}
                          >
                            {spot.order !== undefined
                              ? spot.order + 1
                              : index + 1}
                          </Box>
                          <VStack align="start" gap={1} flex={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.800"
                            >
                              {spot.details?.name || spot.name}
                            </Text>
                            {spot.details?.address && (
                              <Text fontSize="xs" color="gray.600">
                                {spot.details.address}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            );
          })}
        </VStack>
      ) : (
        <Box p={6} textAlign="center">
          <Text fontSize="2xl" color="gray.400" mb={2}>
            🗺️
          </Text>
          <VStack gap={1}>
            <Text color="gray.500" fontSize="sm">
              ルートを生成するとここに表示されます
            </Text>
            <Text color="gray.400" fontSize="xs">
              スポットを選択して「選択中のスポットでルートを作成」ボタンを押してください
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default RouteDetail;

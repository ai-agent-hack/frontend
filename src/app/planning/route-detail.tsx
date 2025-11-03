import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { LuMoon, LuSun, LuSunrise } from "react-icons/lu";
import type { RecommendedSpots } from "@/types/mastra";

interface RouteDetailProps {
  selectedSpots: Array<{
    pinId: string;
    spotId: string;
    name: string;
  }>;
  isGeneratingRoute?: boolean;
  routeGenerationAttempted?: boolean;
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
  routeGenerationAttempted,
}: RouteDetailProps) => {
  const timeSlotMapping: Record<string, "午前" | "午後" | "夜"> = {
    MORNING: "午前",
    AFTERNOON: "午後",
    NIGHT: "夜",
  };

  const findPinIdForSpot = (spotId: string) => {
    if (!recommendedSpots) return null;

    const spotIndex = recommendedSpots.spots.findIndex(
      (spot) => spot.spot_id === spotId,
    );
    if (spotIndex !== -1) {
      return `${spotId}-${spotIndex}`;
    }
    return null;
  };

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

  // biome-ignore lint/suspicious/noExplicitAny: FIXME: This is a temporary use of any type
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

  const timeSlotOrder = ["MORNING", "AFTERNOON", "NIGHT", "午前", "午後", "夜"];
  const timeSlots = timeSlotOrder.filter(
    (slot) => spotsByTimeSlot[slot] && spotsByTimeSlot[slot].length > 0,
  );

  return (
    <VStack width="100%" gap={4} py={4} pl={4}>
      {orderedSpots && orderedSpots.length > 0 ? (
        <VStack width="100%" gap={0} position="relative">
          <Box
            position="absolute"
            left="7.5px"
            top="24px"
            bottom="24px"
            width="1px"
            bg="gray.200"
            zIndex={0}
          />

          {timeSlots.map((timeSlot) => {
            const spots = spotsByTimeSlot?.[timeSlot] || [];
            const config = timeSlotConfig[timeSlot] || timeSlotConfig.未分類;
            const Icon = config.icon;

            if (spots.length === 0) return null;

            return (
              <VStack key={timeSlot} width="100%" gap={2} mb={4}>
                <HStack
                  width="100%"
                  gap={2}
                  mb={1}
                  ml={-10}
                  position="relative"
                >
                  <Box
                    bg={`${config.color}.100`}
                    borderRadius="full"
                    p={1.5}
                    zIndex={1}
                    border="1px solid"
                    borderColor={`${config.color}.300`}
                    position="absolute"
                    left="12px"
                    width="32px"
                    height="32px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      size={16}
                      color={`var(--chakra-colors-${config.color}-600)`}
                    />
                  </Box>
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    color={`${config.color}.700`}
                    ml="52px"
                  >
                    {config.label}
                  </Text>
                </HStack>

                <VStack width="100%" gap={2} ml={-8} pl="52px">
                  {spots.map((spot, index) => (
                    <Box key={spot.spot_id} width="100%" position="relative">
                      <Box
                        position="absolute"
                        left="-32px"
                        top="50%"
                        transform="translateY(-50%)"
                        width="8px"
                        height="8px"
                        borderRadius="full"
                        bg={`${config.color}.400`}
                        zIndex={1}
                      />

                      <Box
                        p={2}
                        bg={config.bgColor}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={`${config.color}.200`}
                        width="100%"
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => {
                          const pinId = findPinIdForSpot(spot.spot_id);
                          if (pinId && onPinClick) {
                            const japaneseTimeSlot =
                              timeSlotMapping[spot.time_slot];
                            if (japaneseTimeSlot && onTimeSlotChange) {
                              onTimeSlotChange(japaneseTimeSlot);
                            }
                            onPinClick(pinId);
                          }
                        }}
                        _hover={{
                          transform: "translateX(3px)",
                          borderColor: `${config.color}.300`,
                          boxShadow: "sm",
                        }}
                      >
                        <HStack gap={2} align="start">
                          <Box
                            bg={`${config.color}.500`}
                            color="white"
                            width="24px"
                            height="24px"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            flexShrink={0}
                          >
                            {spot.order !== undefined
                              ? spot.order + 1
                              : index + 1}
                          </Box>
                          <VStack align="start" gap={0.5} flex={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color="gray.800"
                              lineHeight="short"
                            >
                              {spot.details?.name || spot.name}
                            </Text>
                            {spot.details?.address && (
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                lineHeight="short"
                              >
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
      ) : routeGenerationAttempted && orderedSpots?.length === 0 ? (
        <Box p={6} textAlign="center">
          <Text fontSize="2xl" color="red.400" mb={2}>
            ⚠️
          </Text>
          <VStack gap={1}>
            <Text color="red.500" fontSize="sm">
              1日の中で収まりきらないためルートを作成できませんでした。
            </Text>
            <Text color="gray.400" fontSize="xs" mt={2}>
              スポット数を減らして再度お試しください。
            </Text>
          </VStack>
        </Box>
      ) : (
        <Box p={6} mr={4} textAlign="center">
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

import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { RecommendedSpots } from "@/types/mastra";

interface SpotDetailProps {
  recommendedSpots: RecommendedSpots;
  selectedTimeSlot: "午前" | "午後" | "夜";
  onTimeSlotChange: (timeSlot: "午前" | "午後" | "夜") => void;
  onSpotSelect: (spotId: string, isSelected: boolean) => void;
  onPinClick: (pinId: string) => void;
  setSelectedPinId: (pinId: string | null) => void;
}

const SpotDetail = ({
  recommendedSpots,
  selectedTimeSlot,
  onTimeSlotChange,
  onSpotSelect,
  onPinClick,
  setSelectedPinId,
}: SpotDetailProps) => {
  // Helper function to get average congestion for a specific time slot
  const getAverageCongestion = (
    congestionArray: number[],
    timeSlot: "午前" | "午後" | "夜",
  ) => {
    // Map time slots to hour ranges and calculate average
    const hourRanges = {
      午前: [9, 10, 11], // 9-12
      午後: [13, 14, 15, 16], // 13-17
      夜: [18, 19, 20, 21], // 18-22
    };

    const hours = hourRanges[timeSlot];
    const relevantCongestion = hours.map((hour) => congestionArray[hour] || 0);
    const average =
      relevantCongestion.reduce((sum, val) => sum + val, 0) /
      relevantCongestion.length;

    return average;
  };

  // Get all congestion values for the current time slot
  const currentTimeSlotSpots = recommendedSpots.recommend_spots
    .filter((timeSlot) => timeSlot.time_slot === selectedTimeSlot)
    .flatMap((timeSlot) => timeSlot.spots);

  const allCongestionValues = currentTimeSlotSpots
    .map((spot) =>
      getAverageCongestion(spot.details.congestion, selectedTimeSlot),
    )
    .filter((val) => val > 0);

  // Calculate min and max for relative scaling
  const minCongestion =
    allCongestionValues.length > 0 ? Math.min(...allCongestionValues) : 0;
  const maxCongestion =
    allCongestionValues.length > 0 ? Math.max(...allCongestionValues) : 1;
  const range = maxCongestion - minCongestion || 1;

  // Helper function to get congestion level for specific spot
  const getCongestionLevel = (
    congestionArray: number[],
    timeSlot: "午前" | "午後" | "夜",
  ) => {
    const average = getAverageCongestion(congestionArray, timeSlot);

    if (average === 0 || allCongestionValues.length === 0) return 1;

    // If all values are the same, return middle value
    if (range === 0) return 3;

    // Calculate relative position (0 to 1)
    const relativePosition = (average - minCongestion) / range;

    // Map to 1-5 scale with better distribution
    const scaled = relativePosition * 4 + 1;

    return Math.round(scaled);
  };

  // Helper function to render congestion level
  const renderCongestionLevel = (level: number) => {
    const maxLevel = 5;
    const filledStars = Math.min(level, maxLevel);
    const emptyStars = maxLevel - filledStars;

    return (
      <>
        {"★".repeat(filledStars)}
        {"☆".repeat(emptyStars)}
        <Text as="span" ml={1}>
          ({level}/{maxLevel})
        </Text>
      </>
    );
  };
  return (
    <VStack width="100%" gap={4}>
      {/* Time Slot Selector */}
      <Box width="100%" display="flex" justifyContent="center" pt={4}>
        <HStack gap={1} bg="gray.100" p={1} borderRadius="lg">
          {(["午前", "午後", "夜"] as const).map((slot) => (
            <Button
              key={slot}
              size="sm"
              variant={selectedTimeSlot === slot ? "solid" : "ghost"}
              colorScheme={selectedTimeSlot === slot ? "purple" : "gray"}
              onClick={() => {
                onTimeSlotChange(slot);
                setSelectedPinId(null);
              }}
              flex={1}
              borderRadius="md"
              fontWeight="medium"
              _hover={{
                bg: selectedTimeSlot === slot ? "purple.500" : "gray.200",
              }}
            >
              {slot}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Spots List */}
      <VStack width="100%" gap={3}>
        {recommendedSpots.recommend_spots
          .filter((timeSlot) => timeSlot.time_slot === selectedTimeSlot)
          .flatMap((timeSlot) =>
            timeSlot.spots.map((spot, index) => ({
              ...spot,
              pinId: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
            })),
          )
          .map((pin) => (
            <Box
              key={pin.spot_id}
              p={4}
              bg={pin.selected ? "purple.50" : "white"}
              borderRadius="xl"
              border="2px solid"
              borderColor={pin.selected ? "purple.200" : "gray.100"}
              cursor="pointer"
              transition="all 0.2s"
              width="100%"
              _hover={{
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                borderColor: pin.selected ? "purple.300" : "gray.200",
                transform: "translateY(-1px)",
              }}
              onClick={() => onPinClick(pin.pinId)}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <HStack gap={3} flex="1">
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={pin.selected}
                      onCheckedChange={(checked) => {
                        onSpotSelect(pin.pinId, checked === true);
                      }}
                    />
                  </Box>
                  <Text fontWeight="bold" fontSize="md" color="gray.800">
                    {pin.details.name}
                  </Text>
                </HStack>
                {pin.selected && (
                  <Box
                    bg="purple.500"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    選択済み
                  </Box>
                )}
              </HStack>

              <Text fontSize="sm" color="gray.600" lineHeight="1.5" mb={3}>
                {pin.recommendation_reason}
              </Text>

              <HStack gap={2} fontSize="xs" color="gray.500">
                <HStack gap={1}>
                  <Text>👥</Text>
                  <Text>
                    混雑度:{" "}
                    {renderCongestionLevel(
                      getCongestionLevel(
                        pin.details.congestion,
                        selectedTimeSlot,
                      ),
                    )}
                  </Text>
                </HStack>
              </HStack>
            </Box>
          ))}

        {recommendedSpots.recommend_spots
          .filter((spot) => spot.time_slot === selectedTimeSlot)
          .flatMap((spot) => spot.spots).length === 0 && (
          <Box p={6} textAlign="center">
            <Text fontSize="lg" color="gray.400" mb={2}>
              🕐
            </Text>
            <Text color="gray.500" fontSize="sm">
              {selectedTimeSlot}のスポットはまだありません
            </Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
};

export default SpotDetail;

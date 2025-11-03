import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import type { RecommendedSpots } from "@/types/mastra";

interface SpotDetailProps {
  recommendedSpots: RecommendedSpots;
  onSpotSelect: (spotId: string, isLiked: boolean) => void;
  onPinClick: (pinId: string) => void;
  setSelectedPinId: (pinId: string | null) => void;
  selectedPinId: string | null;
}

const SpotDetail = ({
  recommendedSpots,
  onSpotSelect,
  onPinClick,
  setSelectedPinId,
  selectedPinId,
}: SpotDetailProps) => {
  // Helper function to get average congestion across all hours
  const getAverageCongestion = (congestionArray: number[]) => {
    const sum = congestionArray.reduce((acc, val) => acc + val, 0);
    return sum / congestionArray.length;
  };

  // Get all congestion values
  const allCongestionValues = recommendedSpots.spots
    .map((spot) => getAverageCongestion(spot.details.congestion))
    .filter((val) => val > 0);

  // Calculate min and max for relative scaling
  const minCongestion =
    allCongestionValues.length > 0 ? Math.min(...allCongestionValues) : 0;
  const maxCongestion =
    allCongestionValues.length > 0 ? Math.max(...allCongestionValues) : 1;
  const range = maxCongestion - minCongestion || 1;

  // Helper function to get congestion level for specific spot
  const getCongestionLevel = (congestionArray: number[]) => {
    const average = getAverageCongestion(congestionArray);

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
    <VStack width="100%" gap={4} pt={4}>
      {/* Spots List */}
      <VStack width="100%" gap={3}>
        {recommendedSpots.spots.map((spot, index) => {
          const pin = {
            ...spot,
            pinId: `${spot.spot_id}-${index}`,
          };
          const isSelected = selectedPinId === pin.pinId;
          return (
            <Box
              key={pin.spot_id}
              p={4}
              bg={pin.liked ? "pink.50" : "white"}
              borderRadius="xl"
              border="2px solid"
              borderColor={
                isSelected
                  ? "blue.500"
                  : pin.liked
                    ? "pink.200"
                    : "gray.100"
              }
              cursor="pointer"
              transition="all 0.2s"
              width="100%"
              boxShadow={isSelected ? "0 0 15px rgba(59, 130, 246, 0.4)" : "none"}
              _hover={{
                boxShadow: isSelected
                  ? "0 0 15px rgba(59, 130, 246, 0.4)"
                  : "0 0 15px rgba(0, 0, 0, 0.1)",
                borderColor: isSelected
                  ? "blue.500"
                  : pin.liked
                    ? "pink.300"
                    : "gray.200",
                transform: "translateY(-1px)",
              }}
              onClick={() => onPinClick(pin.pinId)}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <Text fontWeight="bold" fontSize="md" color="gray.800">
                  {pin.details.name}
                </Text>
                {pin.liked && (
                  <Box
                    bg="pink.500"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    whiteSpace="nowrap"
                    flexShrink={0}
                  >
                    いいね！
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
                      getCongestionLevel(pin.details.congestion),
                    )}
                  </Text>
                </HStack>
              </HStack>
            </Box>
          );
        })}

        {recommendedSpots.spots.length === 0 && (
          <Box p={6} textAlign="center">
            <Text fontSize="lg" color="gray.400" mb={2}>
              🕐
            </Text>
            <Text color="gray.500" fontSize="sm">
              スポットはまだありません
            </Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
};

export default SpotDetail;

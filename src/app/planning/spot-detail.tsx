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
                  <Text>💰</Text>
                  <Text>¥{pin.details.price.toLocaleString()}</Text>
                </HStack>
                <HStack gap={1}>
                  <Text>👥</Text>
                  <Text>混雑度: {pin.details.congestion[0]}/5</Text>
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

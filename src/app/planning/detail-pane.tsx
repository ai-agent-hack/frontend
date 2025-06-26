import { Box, SegmentGroup, Separator, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import type { RecommendedSpots } from "@/types/mastra";

interface DetailPaneProps {
  recommendedSpots: RecommendedSpots;
}

const DetailPane = ({ recommendedSpots }: DetailPaneProps) => {
  const [spotKind, setSpotKind] = useState<"午前" | "午後" | "夜">("午前");

  return (
    <VStack>
      <VStack>
        <Text fontWeight="bold" fontSize="xl">
          Destination
        </Text>
      </VStack>

      <Separator />

      <VStack width="100%" gap={3}>
        <SegmentGroup.Root
          onValueChange={(e) => {
            setSpotKind(e.value as "午前" | "午後" | "夜");
          }}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={["午前", "午後", "夜"]} />
        </SegmentGroup.Root>

        {recommendedSpots.recommend_spots
          .filter((spot) => spot.time_slot === spotKind)
          .flatMap((spot) => spot.spots)
          .map((pin) => (
            <Box
              key={pin.spot_id}
              p={3}
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              boxShadow="sm"
              width="90%"
              minHeight="100px"
            >
              <Text fontWeight="semibold" fontSize="sm" mb={1}>
                {pin.details.name}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {pin.recommendation_reason}
              </Text>
            </Box>
          ))}
      </VStack>
    </VStack>
  );
};

export default DetailPane;

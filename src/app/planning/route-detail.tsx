import { Box, HStack, Text, VStack } from "@chakra-ui/react";

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

const RouteDetail = ({ orderedSpots }: RouteDetailProps) => {
  return (
    <VStack width="100%" gap={4}>
      {/* Display Ordered Spots if available */}
      {orderedSpots && orderedSpots.length > 0 ? (
        <VStack width="100%" gap={4}>
          <Text fontWeight="bold" fontSize="sm" color="gray.600" px={2}>
            ルート順序 ({orderedSpots.length}件)
          </Text>
          <VStack gap={2} width="100%">
            {orderedSpots.map((spot, index) => (
              <Box
                key={spot.spot_id}
                p={3}
                bg="white"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                width="100%"
              >
                <HStack gap={2}>
                  <Box
                    bg="blue.500"
                    color="white"
                    width="24px"
                    height="24px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {spot.order || index + 1}
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      {spot.details?.name || spot.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {spot.time_slot}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      ) : (
        <Box p={6} textAlign="center">
          <Text fontSize="2xl" color="gray.400" mb={2}>
            🗺️
          </Text>
          <Text color="gray.500" fontSize="sm">
            ルートを生成するとここに表示されます
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default RouteDetail;

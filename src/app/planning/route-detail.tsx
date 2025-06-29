import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { LuClock, LuMapPin, LuNavigation } from "react-icons/lu";

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
}

const RouteDetail = ({
  selectedSpots,
  onGenerateRoute,
  isGeneratingRoute = false,
  routeInfo,
}: RouteDetailProps) => {
  const spotsByTimeSlot = {
    午前: selectedSpots.filter((spot) => spot.timeSlot === "午前"),
    午後: selectedSpots.filter((spot) => spot.timeSlot === "午後"),
    夜: selectedSpots.filter((spot) => spot.timeSlot === "夜"),
  };

  const totalSpots = selectedSpots.length;

  return (
    <VStack width="100%" gap={4}>
      {/* Route Summary */}
      <Box
        width="100%"
        p={4}
        bg="blue.50"
        borderRadius="xl"
        border="2px solid"
        borderColor="blue.200"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold" fontSize="lg" color="blue.800">
            ルート概要
          </Text>
          <HStack gap={2} fontSize="sm" color="blue.600">
            <LuMapPin />
            <Text>{totalSpots} スポット</Text>
          </HStack>
        </HStack>

        {routeInfo ? (
          <HStack gap={4} fontSize="sm" color="blue.700">
            <HStack gap={1}>
              <LuClock />
              <Text>{routeInfo.duration}</Text>
            </HStack>
            <HStack gap={1}>
              <LuNavigation />
              <Text>{routeInfo.distance}</Text>
            </HStack>
          </HStack>
        ) : (
          <Text fontSize="sm" color="blue.600">
            スポットを選択してルートを生成してください
          </Text>
        )}
      </Box>

      {/* Generate Route Button */}
      <Button
        width="100%"
        colorScheme="blue"
        size="lg"
        onClick={onGenerateRoute}
        disabled={totalSpots === 0}
        loading={isGeneratingRoute}
        loadingText="ルート生成中..."
      >
        <HStack gap={2}>
          <LuNavigation />
          <Text>ルートを生成</Text>
        </HStack>
      </Button>

      {/* Selected Spots by Time Slot */}
      <VStack width="100%" gap={4}>
        {(["午前", "午後", "夜"] as const).map((timeSlot) => {
          const spots = spotsByTimeSlot[timeSlot];
          if (spots.length === 0) return null;

          return (
            <Box key={timeSlot} width="100%">
              <Text
                fontWeight="bold"
                fontSize="sm"
                color="gray.600"
                mb={2}
                px={2}
              >
                {timeSlot} ({spots.length}件)
              </Text>
              <VStack gap={2}>
                {spots.map((spot, index) => (
                  <Box
                    key={spot.pinId}
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
                        {routeInfo?.waypoints.find((w) => w.name === spot.name)
                          ?.order || index + 1}
                      </Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.800">
                        {spot.name}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          );
        })}
      </VStack>

      {/* Empty State */}
      {totalSpots === 0 && (
        <Box p={6} textAlign="center">
          <Text fontSize="2xl" color="gray.400" mb={2}>
            🗺️
          </Text>
          <Text color="gray.500" fontSize="sm">
            スポットタブから行きたい場所を選択してください
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default RouteDetail;

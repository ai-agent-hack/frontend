import {
  Box,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@chakra-ui/react";
import type { RecommendedSpots } from "@/types/mastra";
import RouteDetail from "./route-detail";
import SpotDetail from "./spot-detail";

interface DetailPaneProps {
  recommendedSpots: RecommendedSpots;
  selectedTimeSlot: "午前" | "午後" | "夜";
  onTimeSlotChange: (timeSlot: "午前" | "午後" | "夜") => void;
  onSpotSelect: (spotId: string, isSelected: boolean) => void;
  onPinClick: (pinId: string) => void;
  setSelectedPinId: (pinId: string | null) => void;
  onGenerateRoute?: () => void;
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

const DetailPane = ({
  recommendedSpots,
  selectedTimeSlot,
  onTimeSlotChange,
  onSpotSelect,
  onPinClick,
  setSelectedPinId,
  onGenerateRoute,
  isGeneratingRoute,
  routeInfo,
}: DetailPaneProps) => {
  // Get selected spots for route detail
  const selectedSpots = recommendedSpots.recommend_spots.flatMap((timeSlot) =>
    timeSlot.spots
      .filter((spot) => spot.selected)
      .map((spot, index) => ({
        pinId: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
        spotId: spot.spot_id,
        name: spot.details.name,
        timeSlot: timeSlot.time_slot,
      })),
  );

  return (
    <Box width="100%" height="100%">
      <TabsRoot
        defaultValue="spots"
        variant="plain"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <TabsList
          mb={0}
          borderBottom="1px solid"
          borderColor="gray.200"
          gap={4}
          px={4}
          pt={4}
          justifyContent="center"
        >
          <TabsTrigger
            value="spots"
            pb={3}
            borderBottom="2px solid"
            borderColor="transparent"
            _selected={{
              borderColor: "purple.500",
              color: "purple.600",
            }}
            _hover={{
              color: "purple.600",
            }}
          >
            <Text fontWeight="medium" fontSize="sm" whiteSpace="nowrap">
              スポット
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="route"
            pb={3}
            borderBottom="2px solid"
            borderColor="transparent"
            _selected={{
              borderColor: "purple.500",
              color: "purple.600",
            }}
            _hover={{
              color: "purple.600",
            }}
          >
            <Text fontWeight="medium" fontSize="sm" whiteSpace="nowrap">
              ルート
            </Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spots">
          <SpotDetail
            recommendedSpots={recommendedSpots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={onTimeSlotChange}
            onSpotSelect={onSpotSelect}
            onPinClick={onPinClick}
            setSelectedPinId={setSelectedPinId}
          />
        </TabsContent>

        <TabsContent value="route">
          <RouteDetail
            selectedSpots={selectedSpots}
            onGenerateRoute={onGenerateRoute || (() => {})}
            isGeneratingRoute={isGeneratingRoute}
            routeInfo={routeInfo}
          />
        </TabsContent>
      </TabsRoot>
    </Box>
  );
};

export default DetailPane;

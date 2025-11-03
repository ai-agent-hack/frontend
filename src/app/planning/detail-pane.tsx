import { Box } from "@chakra-ui/react";
import type { RecommendedSpots } from "@/types/mastra";
import SpotDetail from "./spot-detail";

interface DetailPaneProps {
  recommendedSpots: RecommendedSpots;
  onSpotSelect: (spotId: string, isSelected: boolean) => void;
  onPinClick: (pinId: string) => void;
  setSelectedPinId: (pinId: string | null) => void;
}

const DetailPane = ({
  recommendedSpots,
  onSpotSelect,
  onPinClick,
  setSelectedPinId,
}: DetailPaneProps) => {
  return (
    <Box width="100%" height="100%">
      <SpotDetail
        recommendedSpots={recommendedSpots}
        onSpotSelect={onSpotSelect}
        onPinClick={onPinClick}
        setSelectedPinId={setSelectedPinId}
      />
    </Box>
  );
};

export default DetailPane;

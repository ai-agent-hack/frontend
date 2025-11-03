/** biome-ignore-all lint/suspicious/noExplicitAny: FIXME: This is a temporary use of any type */
"use client";

import {
  Box,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import GoogleMap, { type MapPin } from "@/components/google-map";
import TutorialPopover, {
  type TutorialStep,
} from "@/components/tutorial-popover";
import { useTutorial } from "@/components/use-tutorial";
import type { RecommendedSpots } from "@/types/mastra";
import { apiClient } from "@/lib/api-client";
import ChatPane from "./chat-pane";
import DetailPane from "./detail-pane";

function PlanningContent() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [recommendedSpots, setRecommendedSpots] =
    useState<RecommendedSpots | null>(null);
  const [planId, setPlanId] = useState<string>("");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const [polyline, setPolyline] = useState<string>("");
  const [isRouteShown, setIsRouteShown] = useState<boolean>(false);
  const [routeGenerationAttempted, setRouteGenerationAttempted] =
    useState<boolean>(false);
  const searchParams = useSearchParams();
  const encodedPlanInfo = searchParams.get("plan_info");

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = useMemo(
    () => [
      {
        id: "step1",
        title: "おすすめスポットを確認しましょう",
        content:
          "おすすめされたスポットを見てみましょう。AIにその場所について聞くことができます。気に入ったらチェックをつけてみましょう！",
        position: "left",
        targetSelector: "[data-tutorial='detail-pane']",
      },
      {
        id: "step2",
        title: "AIに質問してみましょう",
        content:
          "スポットについて追加の情報を聞いてみましょう。例えば「リラックスできる温泉を教えて」などと質問できます。\n\nチャットのボタンをクリックして、AIに質問してみましょう！",
        position: "left",
        targetSelector: "[data-tutorial='chat-pane']",
      },
      {
        id: "step3",
        title: "気に入ったスポットを選択しましょう",
        content: "出てきた気に入った温泉を選択してルートを作成してみましょう！",
        position: "top",
        targetSelector: "[data-tutorial='create-route-button']",
      },
      {
        id: "step4",
        title: "旅行の準備は万全ですか？",
        content:
          "いい感じの予定ができました！そういえば、旅行中の天気は大丈夫でしょうか？チャットのボタンで聞いてみましょう。",
        position: "left",
        targetSelector: "[data-tutorial='chat-pane']",
      },
    ],
    [],
  );

  const {
    currentStep,
    isOpen: isTutorialOpen,
    isCompleted: isTutorialCompleted,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial,
    skipTutorial,
  } = useTutorial({
    steps: tutorialSteps,
    autoStart: false,
    storageKey: "planning-tutorial-completed",
  });

  const selectedSpots =
    recommendedSpots?.spots
      .filter((spot) => spot.liked)
      .map((spot, index) => ({
        pinId: `${spot.spot_id}-${index}`,
        spotId: spot.spot_id,
        name: spot.details.name,
      })) ?? [];

  useEffect(() => {
    (async () => {
      if (!encodedPlanInfo) return;

      try {
        // Base64デコード
        const decodedPlanInfo = JSON.parse(
          decodeURIComponent(atob(encodedPlanInfo))
        ) as { region: string; atmosphere: string };

        const message = `
**こんにちは！**

**最高の旅を作るお手伝いをします** 🎉

---

### 📋 いただいた旅行プラン

**📍 旅行先**
${decodedPlanInfo.region}

**✨ 雰囲気**
${decodedPlanInfo.atmosphere}な感じ

---

**最高のスポット探してきますね〜** 🔍✨
*少々お待ちください！*`;

        setInitialMessage(message);

        const spots = await apiClient.getInitialRecommendedSpots({
          plan_info_id: encodedPlanInfo,
        });

        const pins: MapPin[] = spots.recommend_spots.spots.map((spot, index) => ({
          id: `${spot.spot_id}-${index}`,
          position: {
            lat: spot.latitude,
            lng: spot.longitude,
          },
          title: spot.details.name,
          description: spot.recommendation_reason,
          imageUrl: spot.google_map_image_url ?? undefined,
          websiteUrl: spot.website_url ?? undefined,
          selected: spot.liked,
        }));
        setRecommendedSpots(spots.recommend_spots);
        const planId = spots.plan_id;
        setPlanId(planId);
        setMapPins(pins);

        // Start tutorial if not completed
        if (!isTutorialCompleted) {
          setTimeout(() => startTutorial(), 2000);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    })();
  }, [encodedPlanInfo, isTutorialCompleted, startTutorial]);

  const handleRecommendSpotUpdate = useCallback(
    (recommendSpot: RecommendedSpots) => {
      setRecommendedSpots(recommendSpot);
      setIsRouteShown(false);

      const pins: MapPin[] = recommendSpot.spots.map((spot, index) => ({
        id: `${spot.spot_id}-${index}`,
        position: { lat: spot.latitude, lng: spot.longitude },
        title: spot.details.name,
        description: spot.recommendation_reason,
        imageUrl: spot.google_map_image_url ?? undefined,
        websiteUrl: spot.website_url ?? undefined,
        selected: spot.liked,
      }));
      setMapPins(pins);
    },
    [],
  );

  const handleSpotSelect = useCallback(
    (spotId: string, isSelected: boolean) => {
      if (!recommendedSpots) return;

      const updatedSpots = { ...recommendedSpots };
      updatedSpots.spots = updatedSpots.spots.map((spot, index) => {
        const pinId = `${spot.spot_id}-${index}`;
        if (pinId === spotId) {
          return { ...spot, liked: isSelected };
        }
        return spot;
      });

      setRecommendedSpots(updatedSpots);

      const pins: MapPin[] = updatedSpots.spots.map((spot, index) => ({
        id: `${spot.spot_id}-${index}`,
        position: { lat: spot.latitude, lng: spot.longitude },
        title: spot.details.name,
        description: spot.recommendation_reason,
        imageUrl: spot.google_map_image_url ?? undefined,
        websiteUrl: spot.website_url ?? undefined,
        selected: spot.liked,
      }));
      setMapPins(pins);
    },
    [recommendedSpots],
  );

  const handlePinClick = useCallback((pinId: string) => {
    setSelectedPinId(pinId);
  }, []);

  const handlePolylineUpdate = useCallback((polyline: string) => {
    setPolyline(polyline);
  }, []);

  const handleOrderedSpotsUpdate = useCallback((orderedSpots: any[]) => {
    setRouteGenerationAttempted(true);
    if (orderedSpots && orderedSpots.length > 0) {
      setIsRouteShown(true);
    }
  }, []);

  // Tutorial step progression logic
  useEffect(() => {
    if (!isTutorialOpen) return;

    const currentStepData = tutorialSteps[currentStep];

    // Auto-advance tutorial based on user actions
    if (currentStepData.id === "step1" && selectedSpots.length > 0) {
      // User has selected some spots, move to step 2
      setTimeout(() => nextStep(), 1000);
    } else if (currentStepData.id === "step2" && selectedSpots.length >= 2) {
      // User has selected multiple spots, move to step 3
      setTimeout(() => nextStep(), 1000);
    } else if (currentStepData.id === "step3" && routeGenerationAttempted) {
      // Route has been generated, move to step 4
      setTimeout(() => nextStep(), 1000);
    }
  }, [
    currentStep,
    selectedSpots.length,
    routeGenerationAttempted,
    isTutorialOpen,
    nextStep,
    tutorialSteps,
  ]);

  return (
    <Box height="100vh" p={4}>
      <HStack height="100%" gap={"15px"} position="relative">
        {/* Map Section */}
        <Box
          width="calc(100% - 812px)"
          height="100%"
          position="relative"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid"
          shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
          borderColor="border"
        >
          <GoogleMap
            apiKey={GOOGLE_MAPS_API_KEY}
            pins={mapPins}
            onSpotSelect={handleSpotSelect}
            selectedPinId={selectedPinId}
            setSelectedPinId={setSelectedPinId}
            polyline={polyline}
            setTriggerMessage={setTriggerMessage}
            isRouteView={isRouteShown}
          />
        </Box>

        {/* Details Section */}
        <VStack
          width="350px"
          height="100%"
          borderRadius="2xl"
          gap={0}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="border"
          shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
          data-tutorial="detail-pane"
        >
          <Box width="100%" p={4} borderBottom="1px solid" borderColor="border">
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="lg" color="purple.fg">
                おすすめスポット
              </Text>
            </HStack>
            <Text fontSize="sm" color="purple.fg" mt={1}>
              気になるスポットをチェックしましょう。
            </Text>
          </Box>
          <Box width="90%" flex="1" overflowY="auto">
            {recommendedSpots ? (
              <DetailPane
                recommendedSpots={recommendedSpots}
                onSpotSelect={handleSpotSelect}
                onPinClick={handlePinClick}
                setSelectedPinId={setSelectedPinId}
                selectedPinId={selectedPinId}
              />
            ) : (
              <Box p={6} textAlign="center">
                <Text color="gray.500" fontSize="sm">
                  スポット情報を読み込み中...
                </Text>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Chat Section */}
        <VStack
          width="450px"
          height="100%"
          borderRadius="2xl"
          gap={0}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="border"
          shadow="0px 0px 15px rgba(0, 0, 0, 0.2)"
          data-tutorial="chat-pane"
        >
          <Box width="100%" p={4} borderBottom="1px solid" borderColor="border">
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="lg" color="blue.fg">
                旅行アシスタント
              </Text>
            </HStack>
            <Text fontSize="sm" color="blue.fg" mt={1}>
              AIがあなたの旅行をサポートします
            </Text>
          </Box>
          <Box width="100%" flex="1" overflow="hidden">
            <ChatPane
              onRecommendSpotUpdate={handleRecommendSpotUpdate}
              onPolylineUpdate={handlePolylineUpdate}
              onOrderedSpotsUpdate={handleOrderedSpotsUpdate}
              initialMessage={initialMessage}
              recommendedSpots={recommendedSpots}
              planId={planId}
              triggerMessage={triggerMessage}
              onTriggerMessageHandled={() => setTriggerMessage(null)}
            />
          </Box>
        </VStack>
      </HStack>

      {/* Tutorial Popover */}
      {!isTutorialCompleted && (
        <TutorialPopover
          steps={tutorialSteps}
          currentStep={currentStep}
          isOpen={isTutorialOpen}
          onClose={closeTutorial}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
        />
      )}
    </Box>
  );
}

export default function Planning() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanningContent />
    </Suspense>
  );
}

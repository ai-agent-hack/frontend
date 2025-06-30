"use client";

import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import type { PreInfo } from "@/types/pre-info";
import { getMyTrips } from "./action";

export default function Home() {
  const [trips, setTrips] = useState<PreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // 사용자가 로그인하지 않은 경우 등 에러 핸들링이 필요할 수 있습니다.
        const fetchedTrips = await getMyTrips();
        console.log("Fetched trips data:", fetchedTrips);
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        // 사용자에게 에러를 알리는 UI를 추가할 수 있습니다.
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <VStack h="100vh" w="100%" gap={0} align="stretch" bg="gray.100">
      <Box px={4} pt={4}>
        <Header />
      </Box>
      <HStack
        flex={1}
        w="100%"
        align="stretch"
        p={4}
        gap={4}
        h="calc(100vh - 80px)"
      >
        {/* 여행 기록을 위한 사이드바 */}
        <VStack
          w="280px"
          h="full"
          bg="white"
          p={4}
          gap={4}
          align="stretch"
          borderRadius="lg"
          shadow="sm"
          overflow="hidden"
        >
          <Heading size="md" color="gray.700">
            私の旅行記録
          </Heading>
          <VStack
            gap={3}
            align="stretch"
            overflowY="auto"
            flex={1}
            css={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#CBD5E0",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#A0AEC0",
              },
            }}
          >
            {isLoading ? (
              <Text>旅行記録を読み込み中...</Text>
            ) : trips.length > 0 ? (
              trips.map((trip) => (
                <Link
                  href={`/planning?pre_info_id=${trip.id}`}
                  key={trip.id}
                  passHref
                >
                  <Box
                    as="a"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    _hover={{
                      bg: "gray.200",
                      cursor: "pointer",
                    }}
                    transition="background-color 0.2s"
                    w="full"
                    display="block"
                  >
                    <Text fontWeight="medium" color="gray.800">
                      {trip.region} 旅行
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(trip.start_date).toLocaleDateString("ja-JP")}
                    </Text>
                  </Box>
                </Link>
              ))
            ) : (
              <Text>過去の旅行記録がありません。</Text>
            )}
          </VStack>
        </VStack>

        {/* 메인 컨텐츠 */}
        <Center flex={1} flexDirection="column">
          <VStack gap={6}>
            <Heading as="h1" size="2xl" textAlign="center" color="gray.800">
              次の旅行はどこへ行きますか？
            </Heading>
            <Link href="/register" passHref>
              <Button
                as="a"
                colorScheme="purple"
                size="lg"
                px={10}
                py={7}
                fontWeight="bold"
                fontSize="xl"
                borderRadius="full"
                shadow="md"
                _hover={{
                  transform: "scale(1.05)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
              >
                旅行を始める
              </Button>
            </Link>
          </VStack>
        </Center>
      </HStack>
    </VStack>
  );
}

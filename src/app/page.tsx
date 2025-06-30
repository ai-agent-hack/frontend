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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import type { PreInfo } from "@/types/pre-info";
import { getMyTrips } from "./action";

export default function Home() {
  const [trips, setTrips] = useState<PreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Unnecessary for initial redirect
  useEffect(() => {
    router.push("/register");
    return;

    // biome-ignore lint/correctness/noUnreachable: FIXME: This is a temporary fix to redirect to register page
    const fetchTrips = async () => {
      try {
        const fetchedTrips = await getMyTrips();
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <VStack h="100vh" w="100%" gap={0} align="stretch">
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
        <VStack
          w="280px"
          h="full"
          bg="bg.subtle"
          p={4}
          gap={4}
          align="stretch"
          borderRadius="xl"
          shadow="sm"
          overflow="hidden"
        >
          <Heading size="md">あなたの旅行記録</Heading>
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
                    bg="bg.emphasized"
                    borderRadius="lg"
                    _hover={{
                      cursor: "pointer",
                    }}
                    transition="background-color 0.2s"
                    w="full"
                    display="block"
                  >
                    <Text fontWeight="medium">{trip.region} 旅行</Text>
                    <Text fontSize="sm">
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

        <Center flex={1} flexDirection="column">
          <VStack gap={6}>
            <Heading as="h1" size="2xl" textAlign="center">
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
                _hover={{
                  transform: "scale(1.1)",
                }}
                shadow="md"
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

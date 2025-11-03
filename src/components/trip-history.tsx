"use client";

import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { apiClient } from "@/lib/api-client";
import type { Trip } from "@/types/trip";

export default function TripHistory() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await apiClient.getMyTrips();
        setTrips(data);
      } catch (err) {
        setError("旅行履歴の取得に失敗しました");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (isLoading) {
    return (
      <Center h="100%">
        <Spinner size="lg" color="purple.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100%" p={4}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <VStack h="100%" align="stretch" gap={0}>
      <Box p={4} borderBottom="1px solid" borderColor="border">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            旅行履歴
          </Text>
          <Link href="/register" passHref>
            <Button as="a" size="sm" colorScheme="purple" borderRadius="full">
              <HStack gap={1}>
                <Icon as={FaPlus} boxSize={3} />
                <Text>新規作成</Text>
              </HStack>
            </Button>
          </Link>
        </HStack>
      </Box>

      <Box flex={1} overflow="auto" p={4}>
        {trips.length === 0 ? (
          <Center h="100%" flexDirection="column" gap={4}>
            <Text color="fg.subtle">まだ旅行計画がありません</Text>
            <Link href="/register" passHref>
              <Button as="a" colorScheme="purple" borderRadius="full">
                <HStack gap={2}>
                  <Icon as={FaPlus} />
                  <Text>最初の旅行を計画する</Text>
                </HStack>
              </Button>
            </Link>
          </Center>
        ) : (
          <VStack align="stretch" gap={3}>
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/planning?plan_info_id=${trip.id}`}
                passHref
              >
                <Box
                  as="a"
                  display="block"
                  p={4}
                  bg="bg.subtle"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="border"
                  _hover={{
                    bg: "bg.muted",
                    borderColor: "purple.500",
                    transform: "translateY(-2px)",
                    shadow: "sm",
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <VStack align="start" gap={2}>
                    <HStack gap={2}>
                      <Icon as={FaMapMarkerAlt} color="purple.500" />
                      <Text fontWeight="bold" fontSize="md">
                        {trip.region}
                      </Text>
                    </HStack>
                    <HStack gap={4} fontSize="sm" color="fg.subtle">
                      <HStack gap={1}>
                        <Icon as={FaCalendarAlt} boxSize={3} />
                        <Text>
                          {new Date(trip.start_date).toLocaleDateString(
                            "ja-JP",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </Text>
                      </HStack>
                      <Text>・</Text>
                      <Text>{trip.participants_count}人</Text>
                      <Text>・</Text>
                      <Text>¥{trip.budget.toLocaleString()}</Text>
                    </HStack>
                    <Text fontSize="sm" color="fg.subtle" lineClamp={2}>
                      {trip.atmosphere}
                    </Text>
                  </VStack>
                </Box>
              </Link>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}

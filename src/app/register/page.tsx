/** biome-ignore-all lint/suspicious/noExplicitAny: Temporary */
"use client";

import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import Header from "@/components/header";
import { formatDate } from "@/utils/format-date";

const RequiredMark = () => (
  <Text as="span" color="red.500" ml={1} fontSize="lg">
    *
  </Text>
);

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<number>(0);
  const [atmosphere, setAtmosphere] = useState<string>("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!departure || !destination || !startDate || !endDate || !atmosphere) {
      setError("必須項目をすべて入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        departure_location: departure,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        atmosphere: atmosphere,
        budget: budget,
        region: destination,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pre_info/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          credentials: "include",
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "APIリクエストに失敗しました。");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "不明なエラーです。");
      } else {
        setError("不明なエラーです。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack h="100%" gap={0} p={4}>
      <Header />
      <Center
        w="100%"
        maxW="3xl"
        mx="auto"
        py={12}
        px={{ base: 4, sm: 6, lg: 8 }}
      >
        <VStack gap={8} align="stretch" width={"100%"}>
          <Text mt={2} fontSize="lg" fontWeight="medium" textAlign={"center"}>
            あなたの理想の旅を教えてください!
          </Text>

          <Box flex={1}>
            <Text display="block" mb={3} fontWeight="semibold">
              出発地
              <RequiredMark />
            </Text>
            <Input
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="例: 東京、大阪"
              disabled={isLoading}
            />
          </Box>

          <Box flex={1}>
            <Text display="block" mb={3} fontWeight="semibold">
              地域
              <RequiredMark />
            </Text>
            <Input
              name="region"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例: 北海道、沖縄、京都"
              disabled={isLoading}
            />
          </Box>

          <Box>
            <Text mb={3} fontSize="md" fontWeight="semibold">
              旅行期間
              <RequiredMark />
            </Text>
            <HStack gap={6} align="flex-start" w="full">
              <Box flex={1}>
                <Text mb={2} fontSize="sm">
                  開始日
                </Text>
                <Input
                  type="date"
                  value={formatDate(startDate)}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  disabled={isLoading}
                />
              </Box>
              <Box flex={1}>
                <Text mb={2} fontSize="sm">
                  終了日
                </Text>
                <Input
                  type="date"
                  value={formatDate(endDate)}
                  onChange={(e) =>
                    setEndDate(e.target.value ? new Date(e.target.value) : null)
                  }
                  disabled={isLoading}
                />
              </Box>
            </HStack>
          </Box>

          <Box>
            <Text mb={3} fontWeight="semibold">
              予算 (円)
            </Text>
            <Input
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min={0}
              placeholder="例: 50000"
              disabled={isLoading}
            />
          </Box>

          <Box>
            <Text mb={3} fontWeight="semibold">
              旅行の雰囲気
              <RequiredMark />
            </Text>
            <Textarea
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value)}
              placeholder="例: 自然を満喫したい、歴史的な場所を巡りたい、グルメを楽しみたい、のんびりリラックスしたい..."
              rows={4}
              disabled={isLoading}
            />
          </Box>

          <Button onClick={handleSubmit} disabled={isLoading}>
            <HStack>
              {isLoading && <Spinner size="sm" />}
              <Text>旅行計画ページへ行く!</Text>
            </HStack>
          </Button>

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
        </VStack>
      </Center>
    </VStack>
  );
};

export default RegisterPage;

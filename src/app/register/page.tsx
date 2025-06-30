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
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import Header from "@/components/header";
import { formatDate } from "@/utils/format-date";
import { registerPreInfo } from "./action";

const RequiredMark = () => (
  <Text as="span" color="red.500" ml={1} fontSize="lg">
    *
  </Text>
);

const atmosphereTags = [
  "自然を満喫したい",
  "歴史的な場所を巡りたい",
  "グルメを楽しみたい",
  "のんびりリラックスしたい",
  "アクティビティを楽しみたい",
  "温泉でゆっくりしたい",
  "写真映えスポットを巡りたい",
  "地元の文化を体験したい",
];

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number>(1);
  const [budget, setBudget] = useState<number>(0);
  const [atmosphere, setAtmosphere] = useState<string>("");
  const router = useRouter();

  const handleTagClick = (tagText: string) => {
    if (atmosphere) {
      setAtmosphere(`${atmosphere}、${tagText}`);
    } else {
      setAtmosphere(tagText);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (destination === "" || !date || participantsCount === 0 || !atmosphere) {
      setError("必須項目をすべて入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        region: destination,
        start_date: new Date(date.setHours(9, 0, 0, 0)).toISOString(),
        end_date: new Date(date.setHours(21, 0, 0, 0)).toISOString(),
        participants_count: participantsCount,
        atmosphere: atmosphere,
        budget: budget,
      };

      const preInfo = await registerPreInfo(requestBody);
      if (!preInfo) {
        setError("旅行計画の登録に失敗しました。");
        return;
      }
      router.push(`/planning?pre_info_id=${preInfo.id}`);
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
              旅行先
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
              旅行日
              <RequiredMark />
            </Text>

            <Input
              type="date"
              value={formatDate(date)}
              onChange={(e) =>
                setDate(e.target.value ? new Date(e.target.value) : null)
              }
              disabled={isLoading}
            />
          </Box>

          <Box>
            <Text mb={3} fontWeight="semibold">
              参加人数 (人)
            </Text>
            <Input
              value={participantsCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (Number.isNaN(value) || value < 0) {
                  setParticipantsCount(0);
                  return;
                }
                setParticipantsCount(value);
              }}
              min={0}
              placeholder="例: 3"
              disabled={isLoading}
            />
          </Box>

          <Box>
            <Text mb={3} fontWeight="semibold">
              予算 (円)
            </Text>
            <Input
              value={budget}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (Number.isNaN(value) || value < 0) {
                  setBudget(0);
                  return;
                }
                setBudget(value);
              }}
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
            <HStack wrap="wrap" gap={2} mb={3}>
              {atmosphereTags.map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="subtle"
                  colorScheme="gray"
                  borderRadius="full"
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="medium"
                  bg="gray.100"
                  color="gray.800"
                  onClick={() => handleTagClick(tag)}
                  disabled={isLoading}
                  _hover={{
                    bg: "gray.200",
                    transform: "translateY(-1px)",
                    boxShadow: "sm",
                  }}
                  transition="all 0.2s"
                >
                  {tag}
                </Button>
              ))}
            </HStack>
            <Textarea
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value)}
              placeholder="タグをクリックして選択、または自由に入力してください"
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

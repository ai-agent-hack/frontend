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
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import Header from "@/components/header";
import { registerPlanInfo } from "./action";

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
  const [atmosphere, setAtmosphere] = useState<string>("");
  const router = useRouter();
  const auth = getAuth();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("ユーザーがログインしていません。");
  }

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

    if (destination === "" || !atmosphere) {
      setError("必須項目をすべて入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        region: destination,
        atmosphere: atmosphere,
      };

      const planInfo = await registerPlanInfo(
        requestBody,
        await user.getIdToken(),
      );
      if (!planInfo) {
        setError("旅行計画の登録に失敗しました。");
        return;
      }
      router.push(`/planning?plan_info_id=${planInfo.id}`);
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
              size="lg"
              borderRadius="xl"
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
              size="lg"
              borderRadius="xl"
            />
          </Box>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            size="lg"
            borderRadius="xl"
          >
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

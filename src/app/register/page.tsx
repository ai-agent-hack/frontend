"use client";

import React, { useReducer, useState } from "react";
import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  SimpleGrid,
  Spinner,
  Alert,
  Code,
} from "@chakra-ui/react";
import { DateRangePicker } from "./DateRangePicker"; // パスは適宜調整
import { TimeOfDayPicker } from "./TimeOfDayPicker"; // パスは適宜調整

// フォームのデータを定義するインターフェース
interface TravelPlanFormData {
  departureLocation: string;
  startDate: Date | null;
  endDate: Date | null;
  timeOfDay: string;
  travelAtmosphere: string;
  budget: number | string;
  region: string;
}

// Actionの型定義
type Action =
  | { type: "SET_FIELD"; field: keyof TravelPlanFormData; value: any }
  | { type: "SET_DATES"; startDate: Date | null; endDate: Date | null };

// Reducer関数
const formReducer = (
  state: TravelPlanFormData,
  action: Action,
): TravelPlanFormData => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_DATES":
      return { ...state, startDate: action.startDate, endDate: action.endDate };
    default:
      return state;
  }
};

// このページコンポーネント
const RegisterPage: React.FC = () => {
  // フォームのデータ状態
  const [formData, dispatch] = useReducer(formReducer, {
    departureLocation: "",
    startDate: null,
    endDate: null,
    timeOfDay: "",
    travelAtmosphere: "",
    budget: "",
    region: "",
  });

  // API通信の状態管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用のstate
  const [apiResponse, setApiResponse] = useState<any | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    dispatch({
      type: "SET_FIELD",
      field: name as keyof TravelPlanFormData,
      value:
        name === "budget" ? (value === "" ? "" : parseInt(value, 10)) : value,
    });
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    dispatch({ type: "SET_DATES", startDate: start, endDate: end });
  };

  // フォーム送信時にAPIを叩く処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // 送信時に過去のエラーをクリア
    setApiResponse(null);

    try {
      const response = await fetch("/api/generate-travel-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "APIリクエストに失敗しました。");
      }
      
      setApiResponse(result);

    } catch (error: any) {
      console.error("API Error:", error);
      setError(error.message || "不明なエラーです。"); // 変更点: エラーメッセージをstateに保存
    } finally {
      setIsLoading(false);
    }
  };

  const RequiredMark = () => (
    <Text as="span" color="red.400" ml={1}>*</Text>
  );

  return (
    <Box>
      <Center
        minH="100vh"
        bg="gray.100"
        py={12}
        px={{ base: 4, sm: 6, lg: 8 }}
      >
        {/* フォーム部分のBox */}
        <Box
          maxW="3xl"
          w="full"
          bg="black"
          color="white"
          p={{ base: 6, md: 8 }}
          rounded="xl"
          shadow="2xl"
        >
          <form onSubmit={handleSubmit}>
            <VStack gap={8} align="stretch">
              <Box textAlign="center">
                <Heading as="h1" size="xl" fontWeight="extrabold">
                  旅行計画の入力
                </Heading>
                <Text mt={2} fontSize="sm" color="gray.400">
                  あなたの理想の旅を教えてください
                </Text>
              </Box>

              {/* ... (フォームの各入力欄は変更なし) ... */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <Box>
                  <Text as="label" htmlContent="departureLocation" display="block" mb={2}>出発地<RequiredMark /></Text>
                  <Input id="departureLocation" name="departureLocation" value={formData.departureLocation} onChange={handleChange} placeholder="例: 東京、大阪" size="lg" h="60px" fontSize="lg" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _placeholder={{ color: "gray.500" }} />
                </Box>
                <Box>
                  <Text as="label" htmlContent="region" display="block" mb={2}>地域<RequiredMark /></Text>
                  <Input id="region" name="region" value={formData.region} onChange={handleChange} placeholder="例: 北海道、沖縄、京都" size="lg" h="60px" fontSize="lg" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _placeholder={{ color: "gray.500" }} />
                </Box>
              </SimpleGrid>
              <Box>
                <Text as="label" display="block" mb={2}>期間 (何泊何日)<RequiredMark /></Text>
                <DateRangePicker startDate={formData.startDate} endDate={formData.endDate} onDateChange={handleDateChange} />
              </Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <Box>
                  <Text as="label" htmlContent="budget" display="block" mb={2}>予算 (円)</Text>
                  <Input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} min={0} placeholder="例: 50000" size="lg" h="60px" fontSize="lg" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _placeholder={{ color: "gray.500" }} />
                </Box>
                <Box>
                  <Text as="label" display="block" mb={2}>旅行する時間帯<RequiredMark /></Text>
                  <TimeOfDayPicker selectedTime={formData.timeOfDay} onTimeChange={(value) => dispatch({ type: "SET_FIELD", field: "timeOfDay", value })} />
                </Box>
              </SimpleGrid>
              <Box>
                <Text as="label" htmlContent="travelAtmosphere" display="block" mb={2}>旅行の雰囲気 (自由記述)</Text>
                <Textarea id="travelAtmosphere" name="travelAtmosphere" value={formData.travelAtmosphere} onChange={handleChange} placeholder="例: 自然を満喫したい、歴史的な場所を巡りたい" rows={4} size="lg" fontSize="lg" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _placeholder={{ color: "gray.500" }} />
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="lg"
                w="full"
                py={6}
                mt={4}
                shadow="lg"
                h="60px"
                loadingText="リクエスト中..."
                _hover={{
                  bg: "blue.600",
                  transform: "scale(1.02)",
                }}
                transition="all 0.15s ease-in-out"
              >
                旅行計画を生成する
              </Button>
            </VStack>
          </form>
        </Box>
      </Center>

      {/* APIレスポンス表示エリア */}
      <Box maxW="3xl" mx="auto" my={10} p={6}>
        {/* ローディング表示 */}
        {isLoading && (
          <Box textAlign="center">
            <Spinner size="xl" />
            <Text mt={4}>旅行プランを生成しています...</Text>
          </Box>
        )}
        {/* 変更点: エラーメッセージをAlertで表示 */}
        {error && (
          <Text>
            error
          </Text>
        )}
        {/* 成功レスポンス表示 */}
        {apiResponse && (
          <Box bg="gray.800" color="white" rounded="md">
            <Heading size="lg" mb={4} p={4}>生成されたプラン（API応答）</Heading>
            <Box as="pre" p={4} bg="black" rounded="md" whiteSpace="pre-wrap" fontSize="sm">
              <Code colorScheme="whiteAlpha" w="full" bg="transparent">
                {JSON.stringify(apiResponse, null, 2)}
              </Code>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RegisterPage;
// app/register/page.tsx
"use client";

import React, { useReducer } from "react";
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
} from "@chakra-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { TimeOfDayPicker } from "./TimeOfDayPicker";

// (インターフェース、型定義、Reducer関数は変更なし)
// ...
export interface TravelPlanFormData {
  departureLocation: string;
  startDate: Date | null;
  endDate: Date | null;
  timeOfDay: string;
  travelAtmosphere: string;
  budget: number | string;
  region: string;
}

type Action =
  | { type: "SET_FIELD"; field: keyof TravelPlanFormData; value: any }
  | { type: "SET_DATES"; startDate: Date | null; endDate: Date | null };

function formReducer(
  state: TravelPlanFormData,
  action: Action
): TravelPlanFormData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_DATES":
      return { ...state, startDate: action.startDate, endDate: action.endDate };
    default:
      return state;
  }
}

// propsの型定義にisLoadingを追加
interface TravelPlanFormProps {
  onSubmit: (data: TravelPlanFormData) => void;
}


const TravelPlanFormReducer: React.FC<TravelPlanFormProps> = ({ onSubmit }) => {
  // (stateやハンドラ関数は変更なし)
  // ...
  const [formData, dispatch] = useReducer(formReducer, {
    departureLocation: "",
    startDate: null,
    endDate: null,
    timeOfDay: "",
    travelAtmosphere: "",
    budget: "",
    region: "",
  });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const RequiredMark = () => (
    <Text as="span" color="red.400" ml={1}>
      *
    </Text>
  );

  return (
    <Center
      minH="100vh"
      // 変更点1: 背景を白系に戻す
      bg="gray.100"
      py={12}
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <form onSubmit={handleSubmit}>
        <Box
          maxW="3xl"
          w="full"
          // 変更点2: カードの背景を黒に、文字を白に
          bg="black"
          color="white"
          p={{ base: 6, md: 8 }}
          rounded="xl"
          shadow="2xl"
        >
          <VStack gap={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h2" size="xl" fontWeight="extrabold">
                旅行計画の入力
              </Heading>
              <Text mt={2} fontSize="sm" color="gray.400">
                あなたの理想の旅を教えてください
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text as="label" htmlContent="departureLocation" display="block" mb={2}>
                  出発地<RequiredMark />
                </Text>
                <Input
                  id="departureLocation"
                  name="departureLocation"
                  value={formData.departureLocation}
                  onChange={handleChange}
                  placeholder="例: 東京、大阪"
                  size="lg"
                  h="60px"
                  fontSize="lg"
                  // 変更点3: 入力欄のスタイルをダークモード用に設定
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _placeholder={{ color: "gray.500" }}
                />
              </Box>

              <Box>
                <Text as="label" htmlContent="region" display="block" mb={2}>
                  地域<RequiredMark />
                </Text>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="例: 北海道、沖縄、京都"
                  size="lg"
                  h="60px"
                  fontSize="lg"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _placeholder={{ color: "gray.500" }}
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text as="label" display="block" mb={2}>
                期間 (何泊何日)<RequiredMark />
              </Text>
              <DateRangePicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                onDateChange={handleDateChange}
              />
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              <Box>
                <Text as="label" htmlContent="budget" display="block" mb={2}>
                  予算 (円)
                </Text>
                <Input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min={0}
                  placeholder="例: 50000"
                  size="lg"
                  h="60px"
                  fontSize="lg"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _placeholder={{ color: "gray.500" }}
                />
              </Box>

              <Box>
                <Text as="label" display="block" mb={2}>
                  旅行する時間帯<RequiredMark />
                </Text>
                <TimeOfDayPicker
                  selectedTime={formData.timeOfDay}
                  onTimeChange={(value) =>
                    dispatch({ type: "SET_FIELD", field: "timeOfDay", value })
                  }
                />
              </Box>
            </SimpleGrid>
            
            <Box>
              <Text as="label" htmlContent="travelAtmosphere" display="block" mb={2}>
                旅行の雰囲気 (自由記述)
              </Text>
              <Textarea
                id="travelAtmosphere"
                name="travelAtmosphere"
                value={formData.travelAtmosphere}
                onChange={handleChange}
                placeholder="例: 自然を満喫したい、歴史的な場所を巡りたい"
                rows={4}
                size="lg"
                fontSize="lg"
                borderColor="gray.600"
                _hover={{ borderColor: "gray.500" }}
                _placeholder={{ color: "gray.500" }}
              />
            </Box>

            <Button
              type="submit"
              colorScheme="blue" // 黒背景に映えるように調整
              size="lg"
              fontSize="lg"
              w="full"
              py={6}
              mt={4}
              shadow="lg"
              h="60px"
              _hover={{
                bg: "blue.600",
                transform: "scale(1.02)",
              }}
              transition="all 0.15s ease-in-out"
            >
              旅行計画を送信
            </Button>
          </VStack>
        </Box>
      </form>
    </Center>
  );
};

export default TravelPlanFormReducer;
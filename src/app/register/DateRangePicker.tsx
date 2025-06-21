"use client";

import React from "react";
import { Input, HStack, Box, Text } from "@chakra-ui/react";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split("T")[0];
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  return (
    <HStack gap={4} align="flex-start" w="full">
      <Box flex={1}>
        <Text as="label" htmlContent="startDate" display="block" mb={2}>
          開始日
        </Text>
        <Input
          type="date"
          id="startDate"
          value={formatDate(startDate)}
          onChange={(e) =>
            onDateChange(e.target.value ? new Date(e.target.value) : null, endDate)
          }
          size="lg"
          // 修正点: 高さとフォントサイズを大きくする
          h="60px"
          fontSize="lg"
        />
      </Box>
      <Box flex={1}>
        <Text as="label" htmlContent="endDate" display="block" mb={2}>
          終了日
        </Text>
        <Input
          type="date"
          id="endDate"
          value={formatDate(endDate)}
          onChange={(e) =>
            onDateChange(startDate, e.target.value ? new Date(e.target.value) : null)
          }
          size="lg"
          // 修正点: 高さとフォントサイズを大きくする
          h="60px"
          fontSize="lg"
        />
      </Box>
    </HStack>
  );
};
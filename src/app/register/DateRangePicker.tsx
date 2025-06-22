"use client";

import { Box, HStack, Input, Text } from "@chakra-ui/react";
import type React from "react";

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
    <HStack gap={6} align="flex-start" w="full">
      <Box flex={1}>
        <Text
          as="label"
          htmlContent="startDate"
          display="block"
          mb={2}
          fontSize="sm"
          fontWeight="medium"
          color="gray.600"
        >
          開始日
        </Text>
        <Input
          type="date"
          value={formatDate(startDate)}
          onChange={(e) =>
            onDateChange(
              e.target.value ? new Date(e.target.value) : null,
              endDate,
            )
          }
          size="lg"
          h="60px"
          fontSize="lg"
          borderColor="gray.300"
          borderWidth="2px"
          rounded="xl"
          bg="gray.50"
          _hover={{
            borderColor: "blue.400",
            bg: "white",
            shadow: "md",
          }}
          _focus={{
            borderColor: "blue.500",
            bg: "white",
            shadow: "lg",
            transform: "scale(1.01)",
          }}
          transition="all 0.2s ease"
        />
      </Box>
      <Box flex={1}>
        <Text
          as="label"
          htmlContent="endDate"
          display="block"
          mb={2}
          fontSize="sm"
          fontWeight="medium"
          color="gray.600"
        >
          終了日
        </Text>
        <Input
          type="date"
          value={formatDate(endDate)}
          onChange={(e) =>
            onDateChange(
              startDate,
              e.target.value ? new Date(e.target.value) : null,
            )
          }
          size="lg"
          h="60px"
          fontSize="lg"
          borderColor="gray.300"
          borderWidth="2px"
          rounded="xl"
          bg="gray.50"
          _hover={{
            borderColor: "blue.400",
            bg: "white",
            shadow: "md",
          }}
          _focus={{
            borderColor: "blue.500",
            bg: "white",
            shadow: "lg",
            transform: "scale(1.01)",
          }}
          transition="all 0.2s ease"
        />
      </Box>
    </HStack>
  );
};

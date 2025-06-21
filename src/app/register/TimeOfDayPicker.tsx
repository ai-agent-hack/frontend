"use client";

import React from "react";
import { Button, HStack } from "@chakra-ui/react";

interface TimeOfDayPickerProps {
  selectedTime: string;
  onTimeChange: (value: string) => void;
}

export const TimeOfDayPicker: React.FC<TimeOfDayPickerProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  const options = ["午前", "午後", "終日", "夜間"];

  return (
    <HStack gap={4} width="100%">
      {options.map((option) => (
        <Button
          key={option}
          onClick={() => onTimeChange(option)}
          colorScheme={selectedTime === option ? "blue" : "gray"}
          variant={selectedTime === option ? "solid" : "outline"}
          flex={1}
          // 修正点: ボタンのサイズを大きくする
          size="lg"
          // 高さを他の入力欄と合わせる
          h="60px" 
        >
          {option}
        </Button>
      ))}
    </HStack>
  );
};
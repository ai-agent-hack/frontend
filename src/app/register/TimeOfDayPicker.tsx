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
					variant={selectedTime === option ? "solid" : "outline"}
					flex={1}
					size="lg"
					h="60px"
					fontSize="lg"
					fontWeight="semibold"
					rounded="xl"
					borderWidth="2px"
					bg={selectedTime === option ? "blue.500" : "gray.50"}
					color={selectedTime === option ? "white" : "gray.700"}
					borderColor={selectedTime === option ? "blue.500" : "gray.300"}
					_hover={{
						bg: selectedTime === option ? "blue.600" : "white",
						borderColor: selectedTime === option ? "blue.600" : "blue.400",
						transform: "translateY(-2px)",
						shadow: "md",
					}}
					_active={{
						transform: "translateY(0px)",
					}}
					transition="all 0.2s ease"
				>
					{option}
				</Button>
			))}
		</HStack>
	);
};

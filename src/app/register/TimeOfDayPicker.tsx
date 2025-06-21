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
		<HStack spaceX={4} spaceY={4} align="center" width="100%">
			{options.map((option) => (
				<Button
					key={option}
					// ボタンがクリックされたら、そのボタンの値を親コンポーネントに渡す
					onClick={() => onTimeChange(option)}
					// 選択されているボタンのスタイルを変更する
					colorScheme={selectedTime === option ? "blue" : "gray"}
					variant={selectedTime === option ? "solid" : "outline"}
					flex={1} // ボタンが均等に幅を占めるようにする
				>
					{option}
				</Button>
			))}
		</HStack>
	);
};

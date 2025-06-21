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
	// タイムゾーンのオフセットを考慮
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
		<HStack spaceX={4} spaceY={4} align="flex-end">
			<Box flex={1}>
				{/* FormLabelの代わりにTextをlabelとして使用 */}
				<Text
					as="label"
					htmlContent="startDate"
					fontSize="md"
					mb={2}
					display="block"
				>
					開始日 *
				</Text>
				<Input
					type="date"
					id="startDate"
					name="startDate"
					value={formatDate(startDate)}
					onChange={(e) =>
						onDateChange(
							e.target.value ? new Date(e.target.value) : null,
							endDate,
						)
					}
					size="lg"
				/>
			</Box>
			<Box flex={1}>
				{/* FormLabelの代わりにTextをlabelとして使用 */}
				<Text
					as="label"
					htmlContent="endDate"
					fontSize="md"
					mb={2}
					display="block"
				>
					終了日 *
				</Text>
				<Input
					type="date"
					id="endDate"
					name="endDate"
					value={formatDate(endDate)}
					onChange={(e) =>
						onDateChange(
							startDate,
							e.target.value ? new Date(e.target.value) : null,
						)
					}
					size="lg"
				/>
			</Box>
		</HStack>
	);
};

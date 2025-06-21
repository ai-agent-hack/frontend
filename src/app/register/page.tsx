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
} from "@chakra-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { TimeOfDayPicker } from "./TimeOfDayPicker";

// フォームのデータを定義するインターフェース
interface TravelPlanFormData {
	departureLocation: string;
	startDate: Date | null;
	endDate: Date | null;
	timeOfDay: string;
	travelAtmosphere: string;
	budget: number | "";
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

interface TravelPlanFormProps {
	onSubmit: (data: TravelPlanFormData) => void;
}

const TravelPlanFormReducer: React.FC<TravelPlanFormProps> = ({ onSubmit }) => {
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

	// 必須マーク用のコンポーネント
	const RequiredMark = () => (
		<Text as="span" color="red.500" ml={1}>
			*
		</Text>
	);

	return (
		<Center
			minH="100vh"
			bgGradient="linear(to-br, indigo.50, purple.100)"
			py={12}
			px={{ base: 4, sm: 6, lg: 8 }}
		>
			<form onSubmit={handleSubmit}>
				<Box>
					{/* VStackのpropsを修正 (spaceX/Y → spacing) */}
					<VStack spaceX={6} spaceY={6} align="stretch">
						<Box textAlign="center">
							<Heading as="h2" size="xl" fontWeight="extrabold">
								旅行計画の入力
							</Heading>
							<Text mt={2} fontSize="sm" color="gray.600">
								あなたの理想の旅を教えてください
							</Text>
						</Box>

						<VStack spaceX={6} spaceY={6} align="stretch">
							{/* 出発地 */}

							<Box>
								<Text
									as="label"
									htmlContent="departureLocation"
									display="block"
									mb={2}
								>
									出発地
									<RequiredMark />
								</Text>
								<Input
									id="departureLocation"
									name="departureLocation"
									value={formData.departureLocation}
									onChange={handleChange}
									placeholder="例: 東京、大阪"
									size="lg"
								/>
							</Box>
							{/* 期間 */}
							<Box>
								<Text as="label" display="block" mb={2}>
									期間 (何泊何日)
									<RequiredMark />
								</Text>
								<DateRangePicker
									startDate={formData.startDate}
									endDate={formData.endDate}
									onDateChange={handleDateChange}
								/>
							</Box>

							{/* 時間帯 */}
							<Box>
								<Text as="label" display="block" mb={2}>
									旅行する時間帯
									<RequiredMark />
								</Text>
								<TimeOfDayPicker
									selectedTime={formData.timeOfDay}
									onTimeChange={(value) =>
										dispatch({ type: "SET_FIELD", field: "timeOfDay", value })
									}
								/>
							</Box>

							{/* 旅行の雰囲気 */}
							<Box>
								<Text
									as="label"
									htmlContent="travelAtmosphere"
									display="block"
									mb={2}
								>
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
								/>
							</Box>

							{/* 予算 */}
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
								/>
							</Box>

							{/* 地域 */}
							<Box>
								<Text as="label" htmlContent="region" display="block" mb={2}>
									地域
									<RequiredMark />
								</Text>
								<Input
									id="region"
									name="region"
									value={formData.region}
									onChange={handleChange}
									placeholder="例: 北海道、沖縄、京都"
									size="lg"
								/>
							</Box>

							{/* 送信ボタン */}
							<Button
								type="submit"
								colorScheme="indigo"
								size="lg"
								fontSize="lg"
								w="full"
								py={6}
								mt={4}
								shadow="lg"
								transform="auto"
								_hover={{
									_dark: { bg: "indigo.500" },
									bg: "indigo.700",
									transform: "scale(1.02)",
								}}
								transition="all 0.15s ease-in-out"
							>
								旅行計画を送信
							</Button>
						</VStack>
					</VStack>
				</Box>
			</form>
		</Center>
	);
};

export default TravelPlanFormReducer;

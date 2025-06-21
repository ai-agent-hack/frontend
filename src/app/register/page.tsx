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

// フォームのデータを定義するインターフェース
interface TravelPlanFormData {
	departureLocation: string;
	startDate: Date | null;
	endDate: Date | null;
	atmosphere: string;
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
		atmosphere: "",
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

		// バリデーション
		if (!formData.departureLocation || !formData.region || !formData.startDate || !formData.endDate || !formData.atmosphere) {
			setError("必須項目をすべて入力してください。");
			setIsLoading(false);
			return;
		}

		try {
			// APIスキーマに合わせてデータを変換
			const requestBody = {
				departure_location: formData.departureLocation,
				start_date: formData.startDate.toISOString(),
				end_date: formData.endDate.toISOString(),
				atmosphere: formData.atmosphere, // atmosphereをtime_of_dayとして送信
				budget: typeof formData.budget === 'number' ? formData.budget : 0,
				region: formData.region
			};

      console.log("Sending request:", requestBody); // デバッグ用ログ

			const response = await fetch("http://localhost:8000/api/v1/pre_info/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},

				body: JSON.stringify(requestBody),
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
		<Text as="span" color="red.500" ml={1} fontSize="lg">
			*
		</Text>
	);

	return (
		<Box>
			<Center
				minH="100vh"
				bgGradient="linear(to-br, blue.50, purple.50, pink.50)"
				py={12}
				px={{ base: 4, sm: 6, lg: 8 }}
			>
				{/* フォーム部分のBox */}
				<Box
					maxW="4xl"
					w="full"
					bg="white"
					color="gray.800"
					p={{ base: 8, md: 12 }}
					rounded="3xl"
					shadow="2xl"
					border="1px"
					borderColor="gray.200"
					position="relative"
					_before={{
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						bgGradient: "linear(45deg, blue.400, purple.400, pink.400)",
						rounded: "3xl",
						p: "2px",
						zIndex: -1,
					}}
				>
					<form onSubmit={handleSubmit}>
						<VStack gap={10} align="stretch">
							<Box textAlign="center" mb={2}>
								<Heading
									as="h1"
									size="2xl"
									fontWeight="bold"
									bgGradient="linear(to-r, blue.600, purple.600, pink.600)"
									bgClip="text"
									mb={3}
								>
									✈️ 旅行計画の入力
								</Heading>
								<Text mt={2} fontSize="lg" color="gray.600" fontWeight="medium">
									あなたの理想の旅を教えてください ✨
								</Text>
							</Box>

							{/* ... (フォームの各入力欄は変更なし) ... */}
							<SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
								<Box>
									<Text
										as="label"
										htmlContent="departureLocation"
										display="block"
										mb={3}
										fontSize="md"
										fontWeight="semibold"
										color="gray.700"
									>
										📍 出発地
										<RequiredMark />
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
										_placeholder={{ color: "gray.400" }}
										transition="all 0.2s ease"
									/>
								</Box>
								<Box>
									<Text
										as="label"
										htmlContent="region"
										display="block"
										mb={3}
										fontSize="md"
										fontWeight="semibold"
										color="gray.700"
									>
										🗺️ 地域
										<RequiredMark />
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
										_placeholder={{ color: "gray.400" }}
										transition="all 0.2s ease"
									/>
								</Box>
							</SimpleGrid>
							<Box>
								<Text
									as="label"
									display="block"
									mb={3}
									fontSize="md"
									fontWeight="semibold"
									color="gray.700"
								>
									📅 期間 (何泊何日)
									<RequiredMark />
								</Text>
								<DateRangePicker
									startDate={formData.startDate}
									endDate={formData.endDate}
									onDateChange={handleDateChange}
								/>
							</Box>
							
							<Box>
								<Text
									as="label"
									htmlContent="budget"
									display="block"
									mb={3}
									fontSize="md"
									fontWeight="semibold"
									color="gray.700"
								>
									💰 予算 (円)
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
									_placeholder={{ color: "gray.400" }}
									transition="all 0.2s ease"
								/>
							</Box>

							<Box>
								<Text
									as="label"
									htmlContent="atmosphere"
									display="block"
									mb={3}
									fontSize="md"
									fontWeight="semibold"
									color="gray.700"
								>
									🌟 旅行の雰囲気
									<RequiredMark />
								</Text>
								<Textarea
									id="atmosphere"
									name="atmosphere"
									value={formData.atmosphere}
									onChange={handleChange}
									placeholder="例: 自然を満喫したい、歴史的な場所を巡りたい、グルメを楽しみたい、のんびりリラックスしたい..."
									rows={4}
									size="lg"
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
									_placeholder={{ color: "gray.400" }}
									transition="all 0.2s ease"
								/>
							</Box>

							<Button
								type="submit"
								size="lg"
								fontSize="xl"
								fontWeight="bold"
								w="full"
								h="70px"
								mt={6}
								bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
								color="white"
								rounded="xl"
								shadow="xl"
								loadingText="✨ 旅行プランを生成中..."
								_hover={{
									bgGradient: "linear(to-r, blue.600, purple.600, pink.600)",
									transform: "translateY(-2px)",
									shadow: "2xl",
								}}
								_active={{
									transform: "translateY(0px)",
									shadow: "lg",
								}}
								transition="all 0.2s ease"
							>
								🚀 旅行計画を生成する
							</Button>
						</VStack>
					</form>
				</Box>
			</Center>

			{/* APIレスポンス表示エリア */}
			<Box maxW="4xl" mx="auto" my={10} p={8}>
				{/* ローディング表示 */}
				{isLoading && (
					<Box
						textAlign="center"
						bg="white"
						p={12}
						rounded="3xl"
						shadow="xl"
						border="1px"
						borderColor="gray.200"
					>
						<Spinner size="xl" color="blue.500" />
						<Text mt={6} fontSize="xl" fontWeight="semibold" color="gray.700">
							✨ 旅行プランを生成しています...
						</Text>
						<Text mt={2} color="gray.500">
							あなたの理想の旅を考えています 🤔
						</Text>
					</Box>
				)}
				{/* エラーメッセージ表示 */}
				{error && (
					<Box
						bg="red.50"
						border="2px"
						borderColor="red.200"
						p={6}
						rounded="xl"
						textAlign="center"
					>
						<Text fontSize="xl" mb={2}>
							❌
						</Text>
						<Text fontWeight="semibold" color="red.700">
							エラーが発生しました
						</Text>
						<Text color="red.600" mt={2}>
							{error}
						</Text>
					</Box>
				)}
				{/* 成功レスポンス表示 */}
				{apiResponse && (
					<Box
						bg="white"
						border="2px"
						borderColor="green.200"
						rounded="3xl"
						shadow="xl"
						overflow="hidden"
					>
						<Box bg="green.50" p={6} borderBottom="2px" borderColor="green.200">
							<Text fontSize="2xl" mb={2} textAlign="center">
								🎉
							</Text>
							<Heading size="xl" mb={2} textAlign="center" color="green.700">
								生成されたプラン
							</Heading>
							<Text textAlign="center" color="green.600">
								あなたの素敵な旅行プランが完成しました！
							</Text>
						</Box>
						<Box p={6}>
							<Box
								as="pre"
								p={6}
								bg="gray.900"
								color="green.300"
								rounded="xl"
								whiteSpace="pre-wrap"
								fontSize="sm"
								border="1px"
								borderColor="gray.700"
								overflow="auto"
								maxH="500px"
							>
								<Code colorScheme="green" w="full" bg="transparent">
									{JSON.stringify(apiResponse, null, 2)}
								</Code>
							</Box>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default RegisterPage;

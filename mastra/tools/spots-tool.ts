import { MessageSchema, RecommendedSpots } from "../../src/types/mastra";

type Message = {
	role: "user" | "assistant";
	message: string;
}

function convertMessageSchemaToMessage(message: MessageSchema): Message {
	return {
		role: message.role as "user" | "assistant",
		message: message.content,
	}
}

// 独立した検索関数として切り出し
export async function searchSpots(input: { chat_history: MessageSchema[], recommend_spots: RecommendedSpots, plan_id: string }): Promise<RecommendedSpots> {
	const { chat_history, recommend_spots, plan_id } = input;
	
	// BACKEND_API_URLが設定されていない場合のデフォルト値
	const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
	const url = `${backendUrl}/api/v1/trip/${plan_id}/refine`;
	
	const response = await fetch(url, {
		method: 'POST',
		credentials: 'include', // session cookie
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_history: chat_history.map(convertMessageSchemaToMessage),
			recommend_spots,
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}
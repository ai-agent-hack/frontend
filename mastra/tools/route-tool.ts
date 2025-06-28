import { Route, Coordinates } from "../../src/types/mastra";

export async function routeTool(input: { planId: string }): Promise<Coordinates> {
	const { planId } = input;

	/* // テスト用に異なる座標を返す（大阪周辺の座標）
	return [
		{ lat: 34.6937, lng: 135.5023 }, // 大阪駅
		{ lat: 34.6853, lng: 135.5259 }, // 新大阪駅
		{ lat: 34.7024, lng: 135.4960 }, // 梅田
		{ lat: 34.6693, lng: 135.5022 }, // 難波
		{ lat: 34.6509, lng: 135.5138 }, // 天王寺
	]; */
	
	// BACKEND_API_URLが設定されていない場合のデフォルト値
	const backendUrl = process.env.NEXT_PUBLIC_API_URL;
	const url = `${backendUrl}/route/coordinates`;
	const response = await fetch(url, {
		method: 'POST',
		credentials: 'include', // session cookie
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			plan_id: planId,
			travel_mode: "TRANSIT",
			optimize_for: "distance",
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data: Route = await response.json();
	
	// Transform Route to Coordinates format
	if (data.coordinates) {
		return data.coordinates.map(coord => ({
			lat: coord[0],
			lng: coord[1]
		}));
	}
	
	return [];
}
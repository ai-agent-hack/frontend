import { Route, Coordinates } from "../../src/types/mastra";

export async function routeTool(input: { planId: string }): Promise<Coordinates> {
	const { planId } = input;

	return [{ lat: 0, lng: 0 }];
	
	// BACKEND_API_URLが設定されていない場合のデフォルト値
	const backendUrl = process.env.NEXT_PUBLIC_API_URL;
	const url = `${backendUrl}/route/calculate-detailed`;
	
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
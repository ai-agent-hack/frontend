import { type RouteFullDetail } from "../../src/types/mastra";

export async function routeTool(input: { planId: string }): Promise<{ polyline: string, orderedSpots: any }> {
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
    const url = `${backendUrl}/route/calculate-detailed`;
    const response = await fetch(url, {
        method: "POST",
        credentials: "include", // session cookie
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            plan_id: planId,
            travel_mode: "driving",
            optimize_for: "distance",
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Route calculation failed:", errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RouteFullDetail = await response.json();
    console.log("Full route data received:", JSON.stringify(data, null, 2));

    // Extract the polyline from the first day's route geometry.
    // Note: This logic might need adjustment if routes can span multiple days.
    const polyline = data.route_days?.[0]?.route_geometry?.polyline;
    const orderedSpotsData = data.route_days?.[0]?.ordered_spots;
    
    console.log("Extracted polyline:", polyline);
    console.log("Route days count:", data.route_days?.length);
    console.log("First route day:", data.route_days?.[0]);
    console.log("Route geometry:", data.route_days?.[0]?.route_geometry);
    console.log("[RouteTool] ordered_spots object:", orderedSpotsData);
    console.log("[RouteTool] ordered_spots keys:", Object.keys(orderedSpotsData || {}));
    
    // Check if ordered_spots has a spots property or if it is an array itself
    let orderedSpots: any[] = [];
    if (orderedSpotsData) {
        if ((orderedSpotsData as any).spots && Array.isArray((orderedSpotsData as any).spots)) {
            orderedSpots = (orderedSpotsData as any).spots;
        } else if (Array.isArray(orderedSpotsData)) {
            orderedSpots = orderedSpotsData as any[];
        } else {
            console.log("[RouteTool] Unexpected ordered_spots structure:", orderedSpotsData);
        }
    }
    
    console.log("[RouteTool] orderedSpots extracted:", orderedSpots);
    console.log("[RouteTool] orderedSpots type:", typeof orderedSpots);
    console.log("[RouteTool] orderedSpots is array:", Array.isArray(orderedSpots));
    console.log("[RouteTool] orderedSpots length:", orderedSpots.length);

    if (polyline) {
        console.log("Returning polyline as coordinates:", polyline);
        console.log("[RouteTool] Returning orderedSpots:", orderedSpots);
        return { polyline, orderedSpots };
    }

    console.warn("Polyline not found in the route data.");
    console.warn("Available route_days:", data.route_days);
    console.warn(
        "Route geometry structure:",
        data.route_days?.[0]?.route_geometry
    );
    return { polyline: "", orderedSpots: [] };
}

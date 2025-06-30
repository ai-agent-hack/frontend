import { type RouteFullDetail } from "../../src/types/mastra";

export async function routeTool(input: {
    planId: string;
}): Promise<{ polyline: string; orderedSpots: any }> {
    const { planId } = input;

    console.log("[RouteTool] Starting route calculation for planId:", planId);

    // BACKEND_API_URLが設定されていない場合のデフォルト値
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("[RouteTool] Backend URL:", backendUrl);

    const url = `${backendUrl}/route/calculate-detailed`;
    console.log("[RouteTool] Request URL:", url);

    const requestBody = {
        plan_id: planId,
        travel_mode: "driving",
        optimize_for: "distance",
    };
    console.log("[RouteTool] Request body:", JSON.stringify(requestBody));

    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include", // session cookie
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log("[RouteTool] Response status:", response.status);
        console.log("[RouteTool] Response ok:", response.ok);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("[RouteTool] Response error body:", errorBody);
            throw new Error(
                `HTTP error! status: ${response.status}, body: ${errorBody}`
            );
        }

        const data: RouteFullDetail = await response.json();
        console.log(
            "[RouteTool] Full route data received:",
            JSON.stringify(data, null, 2)
        );

        // Extract the polyline from the first day's route geometry.
        // Note: This logic might need adjustment if routes can span multiple days.
        const polyline = data.route_days?.[0]?.route_geometry?.polyline;
        const orderedSpotsData = data.route_days?.[0]?.ordered_spots;

        console.log("[RouteTool] Extracted polyline:", polyline);
        console.log("[RouteTool] Route days count:", data.route_days?.length);
        console.log("[RouteTool] First route day:", data.route_days?.[0]);
        console.log(
            "[RouteTool] Route geometry:",
            data.route_days?.[0]?.route_geometry
        );
        console.log("[RouteTool] ordered_spots object:", orderedSpotsData);
        console.log(
            "[RouteTool] ordered_spots keys:",
            Object.keys(orderedSpotsData || {})
        );

        // Check if ordered_spots has a spots property or if it is an array itself
        let orderedSpots: any[] = [];
        if (orderedSpotsData) {
            if (
                (orderedSpotsData as any).spots &&
                Array.isArray((orderedSpotsData as any).spots)
            ) {
                orderedSpots = (orderedSpotsData as any).spots;
            } else if (Array.isArray(orderedSpotsData)) {
                orderedSpots = orderedSpotsData as any[];
            } else {
                console.log(
                    "[RouteTool] Unexpected ordered_spots structure:",
                    orderedSpotsData
                );
            }
        }

        console.log("[RouteTool] orderedSpots extracted:", orderedSpots);
        console.log("[RouteTool] orderedSpots type:", typeof orderedSpots);
        console.log(
            "[RouteTool] orderedSpots is array:",
            Array.isArray(orderedSpots)
        );
        console.log("[RouteTool] orderedSpots length:", orderedSpots.length);

        if (polyline) {
            console.log(
                "[RouteTool] Returning polyline as coordinates:",
                polyline
            );
            console.log("[RouteTool] Returning orderedSpots:", orderedSpots);
            return { polyline, orderedSpots };
        }

        console.warn("[RouteTool] Polyline not found in the route data.");
        console.warn("[RouteTool] Available route_days:", data.route_days);
        console.warn(
            "[RouteTool] Route geometry structure:",
            data.route_days?.[0]?.route_geometry
        );
        return { polyline: "", orderedSpots: [] };
    } catch (error) {
        console.error("[RouteTool] Error occurred:", error);
        if (error instanceof Error) {
            console.error("[RouteTool] Error message:", error.message);
            console.error("[RouteTool] Error stack:", error.stack);
        }
        throw error; // Re-throw the error to be handled by the workflow
    }
}

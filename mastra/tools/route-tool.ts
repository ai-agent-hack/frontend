import { readFileSync } from "fs";
import { join } from "path";
import type { RouteFullDetail } from "../../src/types/mastra";

export async function routeTool(input: {
  planId: string;
}): Promise<{ polyline: string; orderedSpots: any }> {
  const { planId } = input;

  console.log("[RouteTool] Starting route calculation for planId:", planId);

  try {
    // Read response from file
    const fileName = "route-tool-response.json";
    const filePath = join(process.cwd(), "mastra", "tool-responses", fileName);
    const fileContent = readFileSync(filePath, "utf-8");
    const data: RouteFullDetail = JSON.parse(fileContent);
    console.log("[RouteTool] Response loaded from:", filePath);
    console.log(
      "[RouteTool] Full route data loaded:",
      JSON.stringify(data, null, 2),
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
      data.route_days?.[0]?.route_geometry,
    );
    console.log("[RouteTool] ordered_spots object:", orderedSpotsData);
    console.log(
      "[RouteTool] ordered_spots keys:",
      Object.keys(orderedSpotsData || {}),
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
          orderedSpotsData,
        );
      }
    }

    console.log("[RouteTool] orderedSpots extracted:", orderedSpots);
    console.log("[RouteTool] orderedSpots type:", typeof orderedSpots);
    console.log(
      "[RouteTool] orderedSpots is array:",
      Array.isArray(orderedSpots),
    );
    console.log("[RouteTool] orderedSpots length:", orderedSpots.length);

    if (polyline) {
      console.log("[RouteTool] Returning polyline as coordinates:", polyline);
      console.log("[RouteTool] Returning orderedSpots:", orderedSpots);
      return { polyline, orderedSpots };
    }

    console.warn("[RouteTool] Polyline not found in the route data.");
    console.warn("[RouteTool] Available route_days:", data.route_days);
    console.warn(
      "[RouteTool] Route geometry structure:",
      data.route_days?.[0]?.route_geometry,
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

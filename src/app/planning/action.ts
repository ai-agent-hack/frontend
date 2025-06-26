import type { RecommendedSpots } from "@/types/mastra";
import type { PreInfo } from "@/types/pre-info";

export interface GetInitialRecommendedSpotsInput {
  pre_info_id: string;
}

type GetInitialRecommendedSpotsOutput = {
  recommend_spots: RecommendedSpots;
  plan_id: string;
};

export const getInitialRecommendedSpots = async (
  input: GetInitialRecommendedSpotsInput,
): Promise<GetInitialRecommendedSpotsOutput> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trip/seed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok)
    throw new Error(result.message || "APIリクエストに失敗しました。");

  return result as GetInitialRecommendedSpotsOutput;
};

export const getPreInfo = async (preInfoId: string): Promise<PreInfo> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/pre_info/${preInfoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok)
    throw new Error(result.message || "事前情報の取得に失敗しました。");

  return result as PreInfo;
};

type RouteDay = {
  day_number: number;
  start_location: string;
  end_location: string;
  // biome-ignore lint/suspicious/noExplicitAny: return type is not defined in the API
  route_geometry: any;
  // biome-ignore lint/suspicious/noExplicitAny: return type is not defined in the API
  route_segments: any;
};

type Route = {
  plan_id: string;
  route_days: RouteDay[];
};

export const createRoute = async (preInfoId: string): Promise<Route> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/route/calculate-detailed`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: preInfoId,
        version: 0,
        departure_location: "兵庫",
        hotel_location: "東京",
        travel_mode: "TRANSIT",
        optimize_for: "distance",
      }),
      credentials: "include",
    },
  );

  const result = await response.json();
  console.log("Route creation response:", result);

  if (!response.ok)
    throw new Error(result.message || "事前情報の取得に失敗しました。");

  return result as Route;
};

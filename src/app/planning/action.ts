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

export const saveTrip = (planId: string, spots: RecommendedSpots) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/trip/${planId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recommend_spots: spots }),
    credentials: "include",
  });
};

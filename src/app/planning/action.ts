"use server";

import type { RecommendedSpots } from "@/types/mastra";
import type { PlanInfo } from "@/types/plan-info.ts";

export interface GetInitialRecommendedSpotsInput {
  plan_info_id: string;
}

type GetInitialRecommendedSpotsOutput = {
  recommend_spots: RecommendedSpots;
  plan_id: string;
};

export const getInitialRecommendedSpots = async (
  input: GetInitialRecommendedSpotsInput,
  userToken: string,
): Promise<GetInitialRecommendedSpotsOutput> => {
  // モックデータをインポートして返す
  const mockResponse = await import(
    "../../../mastra/tool-responses/getInitialRecommendedSpots-response.json"
  );
  return mockResponse.default as GetInitialRecommendedSpotsOutput;
};

export const getPlanInfo = async (
  planInfoId: string,
  userToken: string,
): Promise<PlanInfo> => {
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/pre_info/${preInfoId}`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   },
  // );

  // const result = await response.json();

  // if (!response.ok)
  //   throw new Error(result.message || "事前情報の取得に失敗しました。");
  const result = {
    atmosphere: "自然を満喫したい",
    region: "東京",
    id: 1,
    user_id: 1,
  };

  return result as PlanInfo;
};

export const saveTrip = async (planId: string, spots: RecommendedSpots) => {
  // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/trip/${planId}/save`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ recommend_spots: spots }),
  //   credentials: "include",
  // });
};

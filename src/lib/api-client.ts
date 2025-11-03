import type { RecommendedSpots } from "@/types/mastra";
import type { PlanInfo } from "@/types/plan-info";
import type { Trip } from "@/types/trip";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export interface RegisterPlanInfoInput {
  region: string;
  atmosphere: string;
}

export interface GetInitialRecommendedSpotsInput {
  plan_info_id: string;
}

type GetInitialRecommendedSpotsOutput = {
  recommend_spots: RecommendedSpots;
  plan_id: string;
};

export const apiClient = {
  async registerPlanInfo(
    input: RegisterPlanInfoInput,
    userToken: string,
  ): Promise<PlanInfo> {
    const response = await fetch(`${getBaseUrl()}/api/plan-info/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "プラン情報の登録に失敗しました。");
    }

    return result;
  },

  async getPlanInfo(planInfoId: string, userToken: string): Promise<PlanInfo> {
    const response = await fetch(
      `${getBaseUrl()}/api/plan-info/${planInfoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "事前情報の取得に失敗しました。");
    }

    return result;
  },

  async getInitialRecommendedSpots(
    input: GetInitialRecommendedSpotsInput,
    userToken: string,
  ): Promise<GetInitialRecommendedSpotsOutput> {
    const response = await fetch(
      `${getBaseUrl()}/api/plan/recommended-spots`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(input),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "推奨スポットの取得に失敗しました。");
    }

    return result;
  },

  async saveTrip(
    planId: string,
    spots: RecommendedSpots,
    userToken: string,
  ): Promise<{ success: boolean; planId: string }> {
    const response = await fetch(`${getBaseUrl()}/api/trip/${planId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ recommend_spots: spots }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "旅行の保存に失敗しました。");
    }

    return result;
  },

  async getMyTrips(userToken: string): Promise<Trip[]> {
    const response = await fetch(`${getBaseUrl()}/api/my-trips`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "旅行履歴の取得に失敗しました。");
    }

    return result;
  },
};

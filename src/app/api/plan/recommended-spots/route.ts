import type { RecommendedSpots } from "@/types/mastra";
import { NextResponse } from "next/server";

export interface GetInitialRecommendedSpotsInput {
  plan_info_id: string;
}

type GetInitialRecommendedSpotsOutput = {
  recommend_spots: RecommendedSpots;
  plan_id: string;
};

export async function POST(req: Request) {
  try {
    const input: GetInitialRecommendedSpotsInput = await req.json();

    // TODO: 実際のAPI呼び出しを実装
    // モックデータをインポートして返す
    const mockResponse = await import(
      "@/../mastra/tool-responses/getInitialRecommendedSpots-response.json"
    );

    const result: GetInitialRecommendedSpotsOutput = {
      ...mockResponse.default,
      plan_info_id: input.plan_info_id,
    } as GetInitialRecommendedSpotsOutput;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get initial recommended spots error:", error);
    return NextResponse.json(
      { error: "推奨スポットの取得に失敗しました" },
      { status: 500 }
    );
  }
}

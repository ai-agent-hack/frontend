import type { RecommendedSpots } from "@/types/mastra";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await req.json();
    const spots: RecommendedSpots = body.recommend_spots;

    // TODO: 実際のAPI呼び出しを実装
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/trip/${planId}/save`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${userToken}`,
    //     },
    //     body: JSON.stringify({ recommend_spots: spots }),
    //     credentials: "include",
    //   }
    // );

    // if (!response.ok) {
    //   throw new Error("旅行の保存に失敗しました");
    // }

    // モック: 成功を返す
    return NextResponse.json({ success: true, planId });
  } catch (error) {
    console.error("Save trip error:", error);
    return NextResponse.json(
      { error: "旅行の保存に失敗しました" },
      { status: 500 }
    );
  }
}

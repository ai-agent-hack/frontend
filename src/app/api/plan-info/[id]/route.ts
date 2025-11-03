import type { PlanInfo } from "@/types/plan-info.ts";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planInfoId } = await params;

    // TODO: 実際のAPI呼び出しを実装
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/pre_info/${planInfoId}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${userToken}`,
    //     },
    //     credentials: "include",
    //   },
    // );

    // const result = await response.json();

    // if (!response.ok)
    //   throw new Error(result.message || "事前情報の取得に失敗しました。");

    // モックデータを返す
    const result: PlanInfo = {
      atmosphere: "自然を満喫したい",
      region: "東京",
      id: Number(planInfoId),
      user_id: 1,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Plan info fetch error:", error);
    return NextResponse.json(
      { error: "プラン情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

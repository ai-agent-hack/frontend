import type { PlanInfo } from "@/types/plan-info.ts";
import { NextResponse } from "next/server";

export interface RegisterPlanInfoInput {
  region: string;
  atmosphere: string;
}

export async function POST(req: Request) {
  try {
    const input: RegisterPlanInfoInput = await req.json();

    // TODO: 実際のAPI呼び出しを実装
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/pre_info/register`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${userToken}`,
    //     },
    //     body: JSON.stringify(input),
    //   },
    // );

    // const result = await response.json();

    // if (!response.ok) {
    //   throw new Error(result.message || "APIリクエストに失敗しました。");
    // }

    // モックデータを返す
    const result: PlanInfo = {
      id: 1,
      region: input.region,
      atmosphere: input.atmosphere,
      user_id: 1,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Plan info registration error:", error);
    return NextResponse.json(
      { error: "プラン情報の登録に失敗しました" },
      { status: 500 }
    );
  }
}

import type { Trip } from "@/types/trip";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    const userToken = authHeader?.replace("Bearer ", "");

    if (!userToken) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // TODO: 実際のAPI呼び出しを実装
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_URL}/trips/my`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${userToken}`,
    //     },
    //   },
    // );

    // const result = await response.json();

    // if (!response.ok) {
    //   throw new Error(result.message || "旅行履歴の取得に失敗しました。");
    // }

    // モック: 空の配列を返す
    const result: Trip[] = [];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get my trips error:", error);
    return NextResponse.json(
      { error: "旅行履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}

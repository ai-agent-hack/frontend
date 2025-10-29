"use server";

import type { PlanInfo } from "@/types/plan-info.ts";

export interface RegisterPlanInfoInput {
  region: string;
  atmosphere: string;
}

export const registerPlanInfo = async (
  input: RegisterPlanInfoInput,
  user_token: string,
): Promise<PlanInfo> => {
  // IDトークンを取得（期限切れなら自動リフレッシュ）
  // const idToken = await user.getIdToken();

  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/pre_info/register`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${idToken}`,
  //     },
  //     body: JSON.stringify(input),
  //   },
  // );

  // const result = await response.json();

  // if (!response.ok) {
  //   throw new Error(result.message || "APIリクエストに失敗しました。");
  // }
  const result = { id: 1 };

  return result as PlanInfo;
};

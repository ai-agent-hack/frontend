import type { PreInfo } from "@/types/pre-info";

export interface RegisterPreInfoInput {
  region: string;
  start_date: string;
  end_date: string;
  atmosphere: string;
  budget: number;
}

export const registerPreInfo = async (
  input: RegisterPreInfoInput,
): Promise<PreInfo> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/pre_info/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok)
    throw new Error(result.message || "APIリクエストに失敗しました。");

  return result as PreInfo;
};

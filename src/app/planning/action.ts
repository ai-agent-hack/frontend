import type { RecommendedSpots } from "@/types/mastra";

export interface GetInitialRecommendedSpotsInput {
  pre_info_id: string;
}

export const getInitialRecommendedSpots = async (
  input: GetInitialRecommendedSpotsInput,
): Promise<RecommendedSpots> => {
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

  return result as RecommendedSpots;
};

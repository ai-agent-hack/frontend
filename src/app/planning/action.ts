import type { RecommendedSpots } from "@/types/recommended-spots";

export const getInitialRecommendedSpots =
  async (): Promise<RecommendedSpots> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pre_info/?skip=0&limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    if (!response.ok)
      throw new Error("Failed to fetch initial recommended spots");

    const data = await response.json();
    return data as RecommendedSpots;
  };

import type { RecommendedSpots } from "@/types/recommended-spots";

export const getInitialRecommendedSpots =
	async (): Promise<RecommendedSpots> => {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/spot/pre_info`,
			{
				method: "POST",
				body: JSON.stringify({
					pre_info_id: "1234567890",
				}),
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

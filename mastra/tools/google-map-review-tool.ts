export interface GoogleMapReview {
  rating: number;
  relative_time_description: string;
  text: string;
}

export interface GoogleMapReviewResponse {
  place_id: string;
  place_name: string;
  overall_rating: number;
  total_reviews: number;
  reviews: GoogleMapReview[];
}

// Google Maps Places API implementation
export async function googleMapReviewTool(input: { 
  placeId: string;
}): Promise<GoogleMapReviewResponse> {
  const { placeId } = input;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('環境変数 GOOGLE_MAPS_API_KEY が未設定です');
  }

  const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
  const url = new URL(endpoint);
  
  url.search = new URLSearchParams({
    place_id: placeId,
    fields: 'name,rating,user_ratings_total,reviews',
    language: 'ja',
    key: apiKey,
  }).toString();

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as {
      status: string;
      error_message?: string;
      result?: {
        name?: string;
        rating?: number;
        user_ratings_total?: number;
        reviews?: GoogleMapReview[];
      };
    };

    if (data.status !== 'OK') {
      throw new Error(`Places API error: ${data.status} ${data.error_message ?? ''}`);
    }

    const result = data.result || {};
    const rawReviews = result.reviews || [];

    // 必要なフィールドのみを抽出
    const reviews: GoogleMapReview[] = rawReviews.slice(0, 5).map((review: any) => ({
      rating: review.rating,
      relative_time_description: review.relative_time_description,
      text: review.text,
    }));
    
    return {
      place_id: placeId,
      place_name: result.name || 'Unknown Place',
      overall_rating: result.rating || 0,
      total_reviews: result.user_ratings_total || 0,
      reviews: reviews,
    };

  } catch (error) {
    console.error('Error fetching Google Maps reviews:', error);
    
    // エラー時のフォールバック
    return {
      place_id: placeId,
      place_name: '場所情報を取得できませんでした',
      overall_rating: 0,
      total_reviews: 0,
      reviews: []
    };
  }
}


import { z } from "zod";
import { recommendedSpotsSchema } from "./recommended-spots";

export const outputSchema = z.object({
    message: z.string().optional(), // ストリーミング途中は undefined の可能性がある
    recommendSpotObject: recommendedSpotsSchema.optional(),
    polyline: z.string().optional(), // polyline string from route calculation
    orderedSpots: z.array(z.object({
        spot_id: z.string(),
        name: z.string(),
        time_slot: z.string(),
        order: z.number().optional(),
        is_spot: z.boolean().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        selected: z.boolean().optional(),
        spot_name: z.string().optional(),
        details: z.object({
            name: z.string().optional(),
            address: z.string().optional(),
            description: z.string().optional(),
            image_url: z.string().optional(),
            rating: z.number().optional(),
            review_count: z.number().optional(),
            price: z.number().optional(),
            congestion: z.array(z.number()).optional(),
            business_hours: z.record(z.object({
                open_time: z.string(),
                close_time: z.string(),
            })).optional(),
            website_url: z.string().optional(),
            location_index: z.number().optional(),
            similarity_score: z.number().nullable().optional(),
            recommendation_reason: z.string().optional(),
        }).optional(),
    })).optional(),
});

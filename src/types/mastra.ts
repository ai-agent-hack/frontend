import type { z } from "zod";
import type {
    coordinatesSchema,
    routeSchema,
} from "../../mastra/schema/coordinates";
import type {
    messageSchema,
    recommendSpotInputSchema,
} from "../../mastra/schema/message";
import type { outputSchema } from "../../mastra/schema/output";
import type {
    businessHoursSchema,
    recommendedSpotsSchema,
    spotDetailsSchema,
    spotItemSchema,
    timeSlotSpotsSchema,
} from "../../mastra/schema/recommended-spots";

// Output関連の型
export type OutputSchema = z.infer<typeof outputSchema>;

// Message関連の型
export type MessageSchema = z.infer<typeof messageSchema>;
export type RecommendSpotInputSchema = z.infer<typeof recommendSpotInputSchema>;

// RecommendedSpots関連の型
export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type SpotDetails = z.infer<typeof spotDetailsSchema>;
export type SpotItem = z.infer<typeof spotItemSchema>;
export type TimeSlotSpots = z.infer<typeof timeSlotSpotsSchema>;
export type RecommendedSpots = z.infer<typeof recommendedSpotsSchema>;

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Route = z.infer<typeof routeSchema>;

export interface Message {
    role: "user" | "assistant";
    content: string;
}

export type RouteFullDetail = {
    id: number;
    plan_id: string;
    version: number;
    total_days: number;
    departure_location?: string;
    hotel_location?: string;
    total_distance_km?: number;
    total_duration_minutes?: number;
    total_spots_count?: number;
    calculated_at: string;
    google_maps_data?: Record<string, unknown>;
    route_days: {
        id: number;
        route_id: number;
        day_number: number;
        start_location?: string;
        end_location?: string;
        ordered_spots: Record<string, unknown>;
        day_distance_km?: number;
        day_duration_minutes?: number;
        route_geometry?: {
            polyline?: string;
        };
        route_segments: Record<string, unknown>[];
    }[];
    route_summary?: Record<string, unknown>;
    daily_summary?: Record<string, unknown>[];
    optimization_details?: Record<string, unknown>;
    calculation_time_seconds?: number;
    created_by_calculation?: boolean;
};

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

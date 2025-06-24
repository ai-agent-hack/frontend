import { z } from "zod";

export const businessHoursSchema = z.object({
  MONDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  TUESDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  WEDNESDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  THURSDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  FRIDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  SATURDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  SUNDAY: z.object({ open_time: z.string(), close_time: z.string() }),
  HOLIDAY: z.object({ open_time: z.string(), close_time: z.string() }),
});

export const spotDetailsSchema = z.object({
  name: z.string(),
  business_hours: businessHoursSchema,
  congestion: z.array(z.number()),
  price: z.number(),
});

export const spotItemSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  recommendation_reason: z.string(),
  selected: z.boolean(),
  spot_id: z.string(),
  details: spotDetailsSchema,
  google_map_image_url: z.string().optional(),
  website_url: z.string().optional(),
});

export const timeSlotSpotsSchema = z.object({
  time_slot: z.enum(["午前", "午後", "夜"]),
  spots: z.array(spotItemSchema),
});

export const recommendedSpotsSchema = z.object({
  recommend_spot_id: z.string(),
  recommend_spots: z.array(timeSlotSpotsSchema),
});
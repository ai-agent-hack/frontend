import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

export const recommendSpotSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  bestTime: z.string(),
  description: z.string(),
  reason: z.string(),
});

export const recommendSpotInputSchema = z.object({
  messages: z.array(MessageSchema),
  recommendSpotObject: recommendSpotSchema.optional(),
});

export const outputSchema = z.object({
  message: z.string().optional(), // ストリーミング途中は undefined の可能性がある
  recommendSpotObject: recommendSpotSchema.optional(),
});
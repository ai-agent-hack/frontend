import { z } from "zod";
import { recommendedSpotsSchema } from "./recommended-spots";

export const messageSchema = z.object({
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
	planId: z.string(),
	messages: z.array(messageSchema),
	recommendSpotObject: recommendedSpotsSchema.optional(),
});

import { z } from "zod";
import { recommendedSpotsSchema } from "./recommended-spots";

export const outputSchema = z.object({
    message: z.string().optional(), // ストリーミング途中は undefined の可能性がある
    recommendSpotObject: recommendedSpotsSchema.optional(),
    coordinates: z.string().optional(), // polyline string from route calculation
});

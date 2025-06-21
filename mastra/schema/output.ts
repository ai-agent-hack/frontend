import { z } from "zod";
import { recommendSpotSchema } from "./recommend-spot";

export const outputSchema = z.object({
	message: z.string().optional(), // ストリーミング途中は undefined の可能性がある
	recommendSpotObject: recommendSpotSchema.optional(),
});

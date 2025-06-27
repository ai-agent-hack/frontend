import { z } from "zod";

export const coordinatesSchema = z.array(z.object({
  lat: z.number(),
  lng: z.number(),
}));

export const routeSchema = z.object({
  coordinates: z.array(z.array(z.number())).optional(), // [[lat, lng], [lat, lng], ...]
});
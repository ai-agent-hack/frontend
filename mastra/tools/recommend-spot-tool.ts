import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const recommendSpotTool = createTool({
  id: 'recommend-spot',
  description: 'Recommend a spot for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async ({ context }) => {
    return { text: "test" }
  },
});
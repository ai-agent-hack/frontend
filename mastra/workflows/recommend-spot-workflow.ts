import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

const recommendSpotInputSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  }))
});

const recommendSpotOutputSchema = z.object({
  text: z.string()
});

const callRecommendSpotAgentStep = createStep({
  id: 'callRecommendSpotAgent',
  inputSchema: recommendSpotInputSchema,
  outputSchema: recommendSpotOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages } = inputData;
    
    if (!messages) {
      throw new Error('No messages provided');
    }

    const agent = mastra.getAgent('recommendSpotAgent');
    const result = await agent.generate(messages as any);
    
    return { text: result.text };
  },
});

export const recommendSpotWorkflow = createWorkflow({
  id: 'recommend-spot-workflow',
  inputSchema: recommendSpotInputSchema,
  outputSchema: recommendSpotOutputSchema,
  steps: [callRecommendSpotAgentStep],
})
.then(callRecommendSpotAgentStep)
.commit();
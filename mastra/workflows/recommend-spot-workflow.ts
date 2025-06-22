import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

import { Message } from '@ai-sdk/ui-utils';
import { messageSchema, recommendSpotInputSchema } from '../schema/message';
import { outputSchema } from '../schema/output';
import type { RecommendedSpots } from '../../src/types/mastra';
import { setInitialRecommendSpots, getRecommendSpots } from '../tools/manage-recommend-spots-tool';

function convertMessages(messages: z.infer<typeof messageSchema>[]): Message[] {
  return messages.map(message => ({
    id: crypto.randomUUID(),
    role: message.role as "user" | "assistant",
    content: message.content,
  }));
}

const callRecommendSpotAgentStep = createStep({
  id: 'callRecommendSpotAgent',
  inputSchema: recommendSpotInputSchema,
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject } = inputData;
    
    if (!messages) {
      throw new Error('No messages provided');
    }

    const agent = mastra.getAgent('recommendSpotAgent');
    
    // recommendSpotsがある場合は、共有ストアに設定
    if (recommendSpotObject) {
      setInitialRecommendSpots(recommendSpotObject);
    }
    
    const result = await agent.generate(convertMessages(messages));
    
    // Agentが処理した後の更新されたデータを取得
    const updatedRecommendSpots = getRecommendSpots();
    const finalRecommendSpots: RecommendedSpots = updatedRecommendSpots
      ? updatedRecommendSpots
      : {
          recommend_spot_id: "",
          recommend_spots: [],
        };

    return {
      message: result.text,
      recommendSpotObject: finalRecommendSpots
    };
  },
});

export const recommendSpotWorkflow = createWorkflow({
  id: 'recommend-spot-workflow',
  inputSchema: recommendSpotInputSchema,
  outputSchema: outputSchema,
  steps: [callRecommendSpotAgentStep],
})
.then(callRecommendSpotAgentStep)
.commit();
import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

import { Message } from '@ai-sdk/ui-utils';
import { messageSchema, recommendSpotInputSchema } from '../schema/message';
import { outputSchema } from '../schema/output';
import type { RecommendedSpots } from '../../src/types/mastra';

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
    const { messages } = inputData;
    
    if (!messages) {
      throw new Error('No messages provided');
    }

    const agent = mastra.getAgent('recommendSpotAgent');
    const result = await agent.generate(convertMessages(messages));
    
    const mockRecommendedSpots: RecommendedSpots = {
      recommend_spot_id: crypto.randomUUID(),
      recommend_spots: [
        {
          time_slot: "午前",
          spots: [
            {
              latitude: 35.6586,
              longitude: 139.7454,
              recommendation_reason: "朝の澄んだ空気の中で東京の景色を一望できます",
              selected: false,
              spot_id: "tokyo_tower_1",
              details: {
                name: "東京タワー",
                business_hours: {
                  MONDAY: { open_time: "09:00", close_time: "23:00" },
                  TUESDAY: { open_time: "09:00", close_time: "23:00" },
                  WEDNESDAY: { open_time: "09:00", close_time: "23:00" },
                  THURSDAY: { open_time: "09:00", close_time: "23:00" },
                  FRIDAY: { open_time: "09:00", close_time: "23:00" },
                  SATURDAY: { open_time: "09:00", close_time: "23:00" },
                  SUNDAY: { open_time: "09:00", close_time: "23:00" },
                  HOLIDAY: { open_time: "09:00", close_time: "23:00" }
                },
                congestion: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.9, 0.8, 0.7, 0.6, 0.5],
                price: 1200
              }
            }
          ]
        },
        {
          time_slot: "午後",
          spots: [
            {
              latitude: 35.7100,
              longitude: 139.8107,
              recommendation_reason: "スカイツリーからの眺望と周辺の商業施設でショッピングを楽しめます",
              selected: false,
              spot_id: "skytree_1",
              details: {
                name: "東京スカイツリー",
                business_hours: {
                  MONDAY: { open_time: "10:00", close_time: "21:00" },
                  TUESDAY: { open_time: "10:00", close_time: "21:00" },
                  WEDNESDAY: { open_time: "10:00", close_time: "21:00" },
                  THURSDAY: { open_time: "10:00", close_time: "21:00" },
                  FRIDAY: { open_time: "10:00", close_time: "21:00" },
                  SATURDAY: { open_time: "10:00", close_time: "21:00" },
                  SUNDAY: { open_time: "10:00", close_time: "21:00" },
                  HOLIDAY: { open_time: "10:00", close_time: "21:00" }
                },
                congestion: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                price: 2100
              }
            }
          ]
        },
        {
          time_slot: "夜",
          spots: [
            {
              latitude: 35.6654,
              longitude: 139.7707,
              recommendation_reason: "ライトアップされた東京の夜景を楽しめる絶好のスポットです",
              selected: false,
              spot_id: "roppongi_hills_1",
              details: {
                name: "六本木ヒルズ展望台",
                business_hours: {
                  MONDAY: { open_time: "10:00", close_time: "23:00" },
                  TUESDAY: { open_time: "10:00", close_time: "23:00" },
                  WEDNESDAY: { open_time: "10:00", close_time: "23:00" },
                  THURSDAY: { open_time: "10:00", close_time: "23:00" },
                  FRIDAY: { open_time: "10:00", close_time: "01:00" },
                  SATURDAY: { open_time: "10:00", close_time: "01:00" },
                  SUNDAY: { open_time: "10:00", close_time: "23:00" },
                  HOLIDAY: { open_time: "10:00", close_time: "23:00" }
                },
                congestion: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.9, 0.8, 0.7, 0.6, 0.5],
                price: 1800
              }
            }
          ]
        }
      ]
    };

    return {
      message: result.text,
      recommendSpotObject: mockRecommendedSpots
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
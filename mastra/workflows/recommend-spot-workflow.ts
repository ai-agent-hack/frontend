import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

import { Message } from '@ai-sdk/ui-utils';
import { messageSchema, recommendSpotInputSchema } from '../schema/message';
import { outputSchema } from '../schema/output';
import { setInitialRecommendSpots } from '../tools/manage-recommend-spots-tool';
import { searchSpots } from '../tools/spots-tool';

function convertMessages(messages: z.infer<typeof messageSchema>[]): Message[] {
  return messages.map(message => ({
    id: crypto.randomUUID(),
    role: message.role as "user" | "assistant",
    content: message.content,
  }));
}

// Step 0: ユーザーの意図を判別
const checkIntentStep = createStep({
  id: 'checkIntent',
  inputSchema: recommendSpotInputSchema,
  outputSchema: z.object({
    isSpotSearch: z.boolean(),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { planId, messages, recommendSpotObject } = inputData;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // 意図判別用のエージェントを取得
    const intentAgent = mastra.getAgent('intentClassifierAgent');
    
    // 最後のメッセージを取得
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || "";
    
    // 意図分類エージェントで判定
    const intentResult = await intentAgent.generate(
      [
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: userInput,
        }
      ],
      {
        output: z.object({
          isSpotSearch: z.boolean(),
          confidence: z.number().min(0).max(1),
          reason: z.string(),
        }),
      }
    );
    
    return {
      isSpotSearch: intentResult.object.isSpotSearch,
      messages: messages,
      recommendSpotObject: recommendSpotObject,
      planId: planId,
    };
  },
});

// スポット検索でない場合の返答ステップ
const nonSpotResponseStep = createStep({
  id: 'nonSpotResponse',
  inputSchema: z.object({
    isSpotSearch: z.boolean(),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject } = inputData;

    const recommendAgent = mastra.getAgent('recommendSpotAgent');
    const result = await recommendAgent.generate(convertMessages(messages));
    
    return {
      message: result.text || "申し訳ございません。お手伝いできることがありましたらお申し付けください。",
      recommendSpotObject: recommendSpotObject || {
        recommend_spot_id: "",
        recommend_spots: [],
      }
    };
  },
});



// スポット検索の処理チェーン
const spotSearchChain = createStep({
  id: 'spotSearchChain',
  inputSchema: z.object({
    isSpotSearch: z.boolean(),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject, planId } = inputData;

    console.log("recommendSpotObject", recommendSpotObject);
    
    if (recommendSpotObject) {
      setInitialRecommendSpots(recommendSpotObject);
    }
    
    const spotResult = await searchSpots({
      chat_history: messages,
      recommend_spots: recommendSpotObject,
      plan_id: planId,
    });

    // 両エージェントの応答を結合
    const combinedMessage = `更新しました！`;

    return {
      message: combinedMessage,
      recommendSpotObject: spotResult,
    };
  },
});

export const recommendSpotWorkflow = createWorkflow({
  id: 'recommend-spot-workflow',
  inputSchema: recommendSpotInputSchema,
  outputSchema: outputSchema,
  steps: [checkIntentStep, nonSpotResponseStep, spotSearchChain],
})
.then(checkIntentStep)
.branch([
  // スポット検索でない場合
  [async ({ inputData }) => !inputData.isSpotSearch, nonSpotResponseStep],
  // スポット検索の場合
  [async ({ inputData }) => inputData.isSpotSearch, spotSearchChain]
])
.commit();
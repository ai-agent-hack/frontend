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

// Step 0: ユーザーの意図を判別
const checkIntentStep = createStep({
  id: 'checkIntent',
  inputSchema: recommendSpotInputSchema,
  outputSchema: z.object({
    isSpotSearch: z.boolean(),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject } = inputData;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // 意図判別用のエージェントを取得
    const intentAgent = mastra.getAgent('intentClassifierAgent');
    const recommendAgent = mastra.getAgent('recommendSpotAgent');
    
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
    
    const intentData = intentResult.object;
    
    if (!intentData.isSpotSearch) {
      // スポット検索でない場合は、通常の会話として返答
      const generalMessages = [
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: userInput,
        }
      ];
      
      const result = await recommendAgent.generate(generalMessages);
      
      return {
        isSpotSearch: false,
        response: result.text,
        messages: messages,
        recommendSpotObject: recommendSpotObject,
      };
    }
    
    return {
      isSpotSearch: true,
      messages: messages,
      recommendSpotObject: recommendSpotObject,
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
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData }) => {
    const { response, recommendSpotObject } = inputData;
    
    return {
      message: response || "申し訳ございません。お手伝いできることがありましたらお申し付けください。",
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
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject } = inputData;
    
    // Step 1: スポット推薦エージェントを呼び出す
    const spotRecommenderAgent = mastra.getAgent('spotRecommenderAgent');
    
    if (recommendSpotObject) {
      setInitialRecommendSpots(recommendSpotObject);
    }
    
    const spotResult = await spotRecommenderAgent.generate(convertMessages(messages));
    
    // Step 2: データ管理エージェントを呼び出す
    const dataManagerAgent = mastra.getAgent('dataManagerAgent');
    
    const dataManagerMessages = [
      ...convertMessages(messages),
      {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: spotResult.text,
      },
      {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: '上記の推薦結果をrecommend_spotsデータに反映してください。',
      }
    ];
    
    const dataManagerResult = await dataManagerAgent.generate(dataManagerMessages);
    
    // 更新されたデータを取得
    const updatedRecommendSpots = getRecommendSpots();
    const finalRecommendSpots: RecommendedSpots = updatedRecommendSpots
      ? updatedRecommendSpots
      : {
          recommend_spot_id: "",
          recommend_spots: [],
        };

    // 両エージェントの応答を結合
    const combinedMessage = `${dataManagerResult.text}`;

    return {
      message: combinedMessage,
      recommendSpotObject: finalRecommendSpots
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
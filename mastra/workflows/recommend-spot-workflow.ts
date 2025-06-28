import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

import { Message } from '@ai-sdk/ui-utils';
import { messageSchema, recommendSpotInputSchema } from '../schema/message';
import { outputSchema } from '../schema/output';
import { setInitialRecommendSpots } from '../tools/manage-recommend-spots-tool';
import { searchSpots } from '../tools/spots-tool';
import { routeTool } from '../tools/route-tool';

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
    intentType: z.enum(['spot_search', 'route_creation_confirm', 'general_chat', 'route_creation_execute']),
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

    // 最後のメッセージを取得
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || "";
    
    // 文字列一致による意図判定
    let intentType: 'spot_search' | 'route_creation_confirm' | 'general_chat' | 'route_creation_execute' = 'general_chat';
    
    // 最後の「旅行ルート作成を開始して」のインデックスを見つける
    let lastRouteRequestIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].content.includes('旅行ルート作成を開始して')) {
        lastRouteRequestIndex = i;
        break;
      }
    }
    
    // 最後の「旅行ルート作成を開始して」以降に「はい、お願いします 👍」があるかチェック
    let hasApprovalAfterLastRequest = false;
    if (lastRouteRequestIndex !== -1) {
      for (let i = lastRouteRequestIndex + 1; i < messages.length - 1; i++) { // 現在のメッセージは除外
        if (messages[i].role === 'user' && messages[i].content === 'はい、お願いします 👍') {
          hasApprovalAfterLastRequest = true;
          break;
        }
      }
    }
    
    if (userInput === "旅行ルート作成を開始して") {
      // ボタンからの初回リクエスト
      intentType = 'route_creation_confirm';
    } else if (lastRouteRequestIndex !== -1 && !hasApprovalAfterLastRequest) {
      // 最後のルート作成リクエスト後、まだ承認されていない
      if (userInput === "はい、お願いします 👍") {
        // 承認（ボタンクリックのみ）
        intentType = 'route_creation_execute';
      } else {
        // 条件修正のリクエストとして扱う（どんな入力でも）
        intentType = 'route_creation_confirm';
      }
    } else {
      // 通常の意図判定
      const intentAgent = mastra.getAgent('intentClassifierAgent');
      
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
      
      intentType = intentResult.object.isSpotSearch ? 'spot_search' : 'general_chat';
    }
    
    return {
      intentType: intentType,
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
    intentType: z.enum(['spot_search', 'route_creation_confirm', 'general_chat', 'route_creation_execute']),
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
    intentType: z.enum(['spot_search', 'route_creation_confirm', 'general_chat', 'route_creation_execute']),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject, planId } = inputData;
    
    if (recommendSpotObject) {
      setInitialRecommendSpots(recommendSpotObject);
    }
    
    const spotResult = await searchSpots({
      chat_history: messages,
      recommend_spots: recommendSpotObject,
      plan_id: planId,
    });

    // スポット更新サマリーエージェントを使用してメッセージを生成
    const summaryAgent = mastra.getAgent('spotUpdateSummaryAgent');
    const userRequest = messages[messages.length - 1]?.content || "スポットを探してください";
    const spotsInfo = spotResult.recommend_spots ? JSON.stringify(spotResult.recommend_spots) : "[]";
    
    const summaryResult = await summaryAgent.generate(
      [
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: `以下の情報をもとに、ユーザーに対して追加されたスポットについて簡潔に説明してください。\n\nユーザーのリクエスト: ${userRequest}\n\n追加されたスポット情報: ${spotsInfo}`,
        }
      ]
    );

    return {
      message: summaryResult.text || "スポット情報を更新しました！",
      recommendSpotObject: spotResult,
    };
  },
});

// 旅行ルート作成の確認ステップ
const routeCreationConfirmStep = createStep({
  id: 'routeCreationConfirm',
  inputSchema: z.object({
    intentType: z.enum(['spot_search', 'route_creation_confirm', 'general_chat', 'route_creation_execute']),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { recommendSpotObject, messages } = inputData;
    
    // 選択されているスポットを確認
    const selectedSpots = recommendSpotObject?.recommend_spots?.flatMap((timeSlot: any) =>
      timeSlot.spots.filter((spot: any) => spot.selected)
    ) || [];
    
    if (selectedSpots.length === 0) {
      return {
        message: "スポットが選択されていません。地図上のピンをクリックして、お気に入りのスポットを選んでください。",
        recommendSpotObject: recommendSpotObject || {
          recommend_spot_id: "",
          recommend_spots: [],
        }
      };
    }
    
    // 旅行ルート作成確認エージェントを使用
    const confirmAgent = mastra.getAgent('routeCreationConfirmAgent');
    
    // 選択されたスポット情報と過去のチャット履歴を整形してエージェントに渡す
    const spotsInfo = JSON.stringify({
      selectedSpots: selectedSpots.map((spot: any) => ({
        name: spot.details.name,
        timeSlot: spot.time_slot,
        address: spot.details.formatted_address,
        type: spot.details.types,
      })),
      totalCount: selectedSpots.length
    });
    
    const chatHistory = messages.slice(0, -1).map((msg: any) => 
      `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`
    ).join('\n');
    
    const result = await confirmAgent.generate([
      {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: `以下の情報を基に、旅行ルート作成の条件を確認してください。\n\n【選択されたスポット情報】\n${spotsInfo}\n\n【過去のチャット履歴】\n${chatHistory}`,
      }
    ]);
    
    return {
      message: result.text || "ルート作成を開始して良いですか？",
      recommendSpotObject: recommendSpotObject,
    };
  },
});

// 旅行ルート作成の実行ステップ
const routeCreationExecuteStep = createStep({
  id: 'routeCreationExecute',
  inputSchema: z.object({
    intentType: z.enum(['spot_search', 'route_creation_confirm', 'general_chat', 'route_creation_execute']),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData }) => {
    const { recommendSpotObject, planId } = inputData;
    
    // 選択されているスポットを確認
    const selectedSpots = recommendSpotObject?.recommend_spots?.flatMap((timeSlot: any) =>
      timeSlot.spots.filter((spot: any) => spot.selected)
    ) || [];
    
    if (selectedSpots.length === 0) {
      return {
        message: "スポットが選択されていません。地図上のピンをクリックして、お気に入りのスポットを選んでください。",
        recommendSpotObject: recommendSpotObject || {
          recommend_spot_id: "",
          recommend_spots: [],
        }
      };
    }
    
    try {
      // route-toolを使用してルート座標を取得
      const coordinates = await routeTool({ planId });
      
      const spotsInfo = selectedSpots.map((spot: any) => `${spot.details.name}（${spot.time_slot}）`).join('、');
      
      return {
        message: `次のスポットで旅行ルートを作成しました！\n\n${spotsInfo}\n\n素敵な旅行になりますように！`,
        recommendSpotObject: recommendSpotObject,
        coordinates: coordinates,
      };
    } catch (error) {
      console.error('ルート作成エラー:', error);
      return {
        message: "ルート作成中にエラーが発生しました。もう一度お試しください。",
        recommendSpotObject: recommendSpotObject,
      };
    }
  },
});

export const recommendSpotWorkflow = createWorkflow({
  id: 'recommend-spot-workflow',
  inputSchema: recommendSpotInputSchema,
  outputSchema: outputSchema,
  steps: [checkIntentStep, nonSpotResponseStep, spotSearchChain, routeCreationConfirmStep, routeCreationExecuteStep],
})
.then(checkIntentStep)
.branch([
  // 旅行ルート作成確認の場合
  [async ({ inputData }) => inputData.intentType === 'route_creation_confirm', routeCreationConfirmStep],
  // 旅行ルート作成実行の場合
  [async ({ inputData }) => inputData.intentType === 'route_creation_execute', routeCreationExecuteStep],
  // スポット検索の場合
  [async ({ inputData }) => inputData.intentType === 'spot_search', spotSearchChain],
  // 一般的なチャットの場合
  [async ({ inputData }) => inputData.intentType === 'general_chat', nonSpotResponseStep],
])
.commit();
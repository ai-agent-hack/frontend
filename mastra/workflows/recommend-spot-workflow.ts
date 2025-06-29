import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

import { Message } from '@ai-sdk/ui-utils';
import { messageSchema, recommendSpotInputSchema } from '../schema/message';
import { outputSchema } from '../schema/output';
import { setInitialRecommendSpots } from '../tools/manage-recommend-spots-tool';
import { searchSpots } from '../tools/spots-tool';
import { routeTool } from '../tools/route-tool';
import { googleMapReviewTool } from '../tools/google-map-review-tool';

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
    intentType: z.enum(['spot_search', 'general_chat', 'spot_detail', 'route_creation_execute']),
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
    let intentType: 'spot_search' | 'general_chat' | 'spot_detail' | 'route_creation_execute' = 'general_chat';
    
    if (userInput === "旅行ルート作成を開始して") {
      // ボタンからの初回リクエスト - 直接実行
      intentType = 'route_creation_execute';
    } else if (userInput.includes("(place_id:")) {
      intentType = 'spot_detail';
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
    intentType: z.enum(['spot_search', 'general_chat', 'spot_detail', 'route_creation_execute']),
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
    intentType: z.enum(['spot_search', 'general_chat', 'spot_detail', 'route_creation_execute']),
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

// スポット詳細ステップ
const spotDetailStep = createStep({
  id: 'spotDetail',
  inputSchema: z.object({
    intentType: z.enum(['spot_search', 'general_chat', 'spot_detail', 'route_creation_execute']),
    response: z.string().optional(),
    messages: z.array(messageSchema),
    recommendSpotObject: z.any().optional(),
    planId: z.string(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData, mastra }) => {
    const { messages, recommendSpotObject } = inputData;
    
    // 最後のメッセージから場所情報を抽出
    const lastMessage = messages[messages.length - 1]?.content || "";
    const placeIdMatch = lastMessage.match(/place_id:\s*([^\)]+)\)/);
    
    if (!placeIdMatch) {
      return {
        message: "場所の情報が見つかりませんでした。もう一度お試しください。",
        recommendSpotObject: recommendSpotObject || {
          recommend_spot_id: "",
          recommend_spots: [],
        }
      };
    }
    
    const rawPlaceId = placeIdMatch[1].trim();
    // 時間帯プレフィックス（午前-、午後-、夜-）とインデックスサフィックス（-数字）を除去
    const placeId = rawPlaceId
      .replace(/^(午前|午後|夜)-/, '')  // プレフィックスを除去
      .replace(/-\d+$/, '');            // サフィックスを除去
    
    try {
      // Google Mapのレビュー情報を取得
      const reviewData = await googleMapReviewTool({
        placeId: placeId,
      });
      
      // spot-recommendation-explanation-agentを使用して説明を生成
      const explanationAgent = mastra.getAgent('spotRecommendationExplanationAgent');
      
      // チャット履歴から旅行の文脈を抽出（直近の10メッセージ）
      const recentMessages = messages.slice(-10);
      const chatContext = recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const explanationResult = await explanationAgent.generate(
        [
          {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: `
              以下の情報を元に、「${reviewData.place_name}」をユーザーにおすすめする理由を説明してください。

              チャット履歴:
              ${chatContext}

              場所の情報:
              - 場所名: ${reviewData.place_name}
              - 総合評価: ${reviewData.overall_rating}/5.0
              - レビュー数: ${reviewData.total_reviews}件

              レビュー情報:
              ${reviewData.reviews.map(review => `
              - 評価: ${review.rating}/5.0 (${review.relative_time_description})
                「${review.text}」
              `).join('\n')}`,
          }
        ]
      );
      
      return {
        message: explanationResult.text || `${reviewData.place_name}についての詳細情報です。`,
        recommendSpotObject: recommendSpotObject,
      };
      
    } catch (error) {
      console.error('スポット詳細取得エラー:', error);
      return {
        message: "スポット情報の取得中にエラーが発生しました。もう一度お試しください。",
        recommendSpotObject: recommendSpotObject,
      };
    }
  },
});

// 旅行ルート作成の実行ステップ
const routeCreationExecuteStep = createStep({
  id: 'routeCreationExecute',
  inputSchema: z.object({
    intentType: z.enum(['spot_search', 'general_chat', 'spot_detail', 'route_creation_execute']),
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
  steps: [checkIntentStep, nonSpotResponseStep, spotSearchChain, spotDetailStep, routeCreationExecuteStep],
})
.then(checkIntentStep)
.branch([
  // 旅行ルート作成実行の場合
  [async ({ inputData }) => inputData.intentType === 'route_creation_execute', routeCreationExecuteStep],
  // スポット検索の場合
  [async ({ inputData }) => inputData.intentType === 'spot_search', spotSearchChain],
  // 一般的なチャットの場合
  [async ({ inputData }) => inputData.intentType === 'general_chat', nonSpotResponseStep],
  // スポット詳細の場合
  [async ({ inputData }) => inputData.intentType === 'spot_detail', spotDetailStep],
])
.commit();
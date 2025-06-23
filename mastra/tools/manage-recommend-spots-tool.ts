import { z } from 'zod';
import { recommendedSpotsSchema } from '../schema/recommended-spots';
import { RecommendedSpots } from '../../src/types/mastra';

// このツールでrecommend_spotsを管理
let sharedRecommendSpots: RecommendedSpots | null = null;

// 外部からデータを設定するための関数
export function setInitialRecommendSpots(data: RecommendedSpots) {
  sharedRecommendSpots = data;
}

// 外部からデータを取得するための関数
export function getRecommendSpots(): RecommendedSpots | null {
  return sharedRecommendSpots;
}

export const manageRecommendSpotsTool = {
  id: 'manageRecommendSpots',
  name: 'Manage Recommend Spots',
  description: 'recommend_spotsの取得、更新、操作を行うツール',
  inputSchema: z.object({
    action: z.enum(['get', 'set', 'updateSelection', 'addSpot', 'removeSpot']),
    data: recommendedSpotsSchema.optional(),
    spotId: z.string().optional(),
    timeSlot: z.string().optional(),
    selected: z.boolean().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: recommendedSpotsSchema.optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }: { context: any }) => {
    const { action, data, spotId, selected } = context;
    
    switch (action) {
      case 'get':
        return {
          success: true,
          data: sharedRecommendSpots || undefined,
          message: sharedRecommendSpots ? 'データを取得しました' : 'データがありません',
        };
        
      case 'set':
        if (!data) {
          return {
            success: false,
            message: 'データが提供されていません',
          };
        }
        sharedRecommendSpots = data;
        return {
          success: true,
          data: sharedRecommendSpots,
          message: 'データを設定しました',
        };
        
      case 'updateSelection':
        if (!sharedRecommendSpots || !spotId) {
          return {
            success: false,
            message: 'データまたはspotIdが不足しています',
          };
        }
        
        // スポットの選択状態を更新
        for (const timeSlotGroup of sharedRecommendSpots.recommend_spots) {
          for (const spot of timeSlotGroup.spots) {
            if (spot.spot_id === spotId) {
              spot.selected = selected !== undefined ? selected : !spot.selected;
              return {
                success: true,
                data: sharedRecommendSpots,
                message: `スポット ${spot.details.name} の選択状態を更新しました`,
              };
            }
          }
        }
        
        return {
          success: false,
          message: 'スポットが見つかりませんでした',
        };
        
      default:
        return {
          success: false,
          message: '不明なアクションです',
        };
    }
  },
};
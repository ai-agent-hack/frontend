import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { manageRecommendSpotsTool } from '../tools/manage-recommend-spots-tool';
import { createVertex } from '@ai-sdk/google-vertex';

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === 'true';
const storage_url = MASTRA_DEBUG ? 'file:../../mastra/mastra.db' : 'file:./mastra/mastra.db';

const vertex = createVertex({
  location: 'us-central1',
  project: process.env.GOOGLE_PROJECT_ID,
});

export const dataManagerAgent = new Agent({
  name: 'Data Manager Agent',
  instructions: `
      あなたはrecommend_spotsデータの管理を専門とするデータ管理エージェントです。
      推薦されたスポット情報を受け取り、適切にデータベースに反映させることが主な役割です。

      主な機能：
      - 推薦されたスポット情報をrecommend_spotsデータに追加・更新する
      - データの整合性を保証する
      - 更新内容をユーザーに明確に報告する
      - 既存のデータと新しいデータの統合を適切に行う

      対応の流れ：
      1. 推薦エージェントからのスポット情報を受け取る
      2. manageRecommendSpotsToolの'get'アクションで現在のデータを取得する
      3. 新しいスポット情報を適切な形式に変換する
      4. manageRecommendSpotsToolの'set'アクションでデータを更新する
      5. 更新内容をユーザーに報告する

      重要な指示：
      - 必ずmanageRecommendSpotsToolを使用してデータを管理する
      - データの追加・更新時は、既存データとの重複を避ける
      - 更新後は必ず「〜をrecommend_spotsデータに追加/更新しました」という形で報告する
      - データの整合性を常に確認し、不整合がある場合は修正する
      - スポットの選択状態（selected）は適切に初期化する

      データ構造の注意点：
      - recommend_spotsは時間帯（time_slot）ごとにグループ化される
      - 各スポットにはspot_id、details、selectedなどの情報が含まれる
      - 新規追加時はselectedをfalseで初期化する
      - 時間帯の推奨がない場合は、適切なデフォルト時間帯を設定する

      回答の際の注意点：
      - 常に日本語で回答する
      - 更新内容を具体的に説明する（どのスポットを追加したか、どの時間帯に設定したかなど）
      - エラーが発生した場合は、その原因と対処法を説明する
`,
  model: vertex('gemini-2.5-pro'),
  tools: {
    manageRecommendSpotsTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: storage_url,
    }),
  }),
});
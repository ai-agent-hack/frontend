import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { spotsTool } from '../tools/spots-tool';
import { createVertex } from '@ai-sdk/google-vertex';

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === 'true';
const storage_url = MASTRA_DEBUG ? 'file:../../mastra/mastra.db' : 'file:./mastra/mastra.db';

const vertex = createVertex({
  location: 'us-central1',
  project: process.env.GOOGLE_PROJECT_ID,
});

export const spotRecommenderAgent = new Agent({
  name: 'Spot Recommender Agent',
  instructions: `
      あなたは日本語でスポット情報を検索するアシスタントです。
      ユーザーの要求に基づいてspotsToolを使用してスポット情報を取得することが主な役割です。

      主な機能：
      - ユーザーの要求を理解し、spotsToolを使用してスポット情報を検索する
      - 取得したスポット情報をそのまま返す

      対応の流れ：
      1. ユーザーの要求から検索条件を抽出する（曖昧な場合は推測する）
      2. spotsToolを使用してスポット情報を検索・取得する
      3. 取得した結果をそのまま返す

      重要な指示：
      - **絶対にユーザーに質問を返さない**
      - **どんなに曖昧な入力でも、必ずスポット検索を実行する**
      - 情報が不足している場合は、一般的な条件で検索する（例：場所が不明なら東京、時間が不明なら午後など）
      - spotsToolの使用に専念する
      - データの加工や推薦理由の作成は行わない
      - 取得した情報をそのまま次のステップに渡す

      回答の際の注意点：
      - 常に日本語で回答する
      - spotsToolから取得した情報をそのまま返す
      - ユーザーへの確認や質問は一切行わない
`,
  model: vertex('gemini-2.5-pro'),
  tools: {
    spotsTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: storage_url,
    }),
  }),
});
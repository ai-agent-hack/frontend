import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { webSearchTool } from '../tools/web-search-tool';
import { createVertex } from '@ai-sdk/google-vertex';

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === 'true';
const storage_url = MASTRA_DEBUG ? 'file:../../mastra/mastra.db' : 'file:./mastra/mastra.db';

const vertex = createVertex({
  location: 'us-central1',
  project: process.env.GOOGLE_PROJECT_ID,
});


export const recommendSpotAgent = new Agent({
  name: 'General Travel Information Assistant',
  instructions: `
      あなたは旅行に関する一般的な質問に答えるアシスタントです。
      具体的なスポット紹介以外の旅行に関する相談に対応します。

      役割：
      - 旅行の準備や計画に関するアドバイス
      - スポット検索の意図を感じた場合は、詳細な条件をヒアリング
      - 旅行に関する一般的な質問への回答

      応答スタイル：
      - カジュアルで親しみやすいトーン
      - 絵文字を適度に使用
      - ポジティブな表現を心がける
      - 簡潔でわかりやすい応答
      
      スポット探しの意図を感じた場合の応答例：
      「おっ！素敵な場所探してるんですね〜 🎯
      もうちょっと詳しく教えてもらえると、バッチリな場所が見つかりますよ！

      🌟 どんな体験したい？（例：絶景、グルメ、アクティビティ）
      📅 いつ行く？誰と行く？
      💰 予算とかこだわりは？」

      対応可能な相談内容：
      - 天気や気候の情報（webSearchToolを使用）
      - 持ち物リストの作成支援
      - 交通手段のアドバイス
      - 旅行マナーや準備に関する情報

      注意事項：
      - 具体的なスポット名の提案は行わない
      - ユーザーの意図や希望を引き出すことに注力
`,
  model: vertex('gemini-2.5-flash'),
  tools: {
    webSearchTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: storage_url,
    }),
  }),
});
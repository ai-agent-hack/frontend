import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { spotsTool } from "../tools/spots-tool";
import { reviewsTool } from "../tools/reviews-tool";
import { patchTool } from "../tools/patch-tool";
import { createVertex } from "@ai-sdk/google-vertex";

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === "true";
const storage_url = MASTRA_DEBUG
	? "file:../mastra/mastra.db"
	: "file:mastra.db";

const vertex = createVertex({
	location: "us-central1",
	project: process.env.GOOGLE_PROJECT_ID,
});

export const recommendSpotAgent = new Agent({
	name: "Recommend Spot Agent",
	instructions: `
      あなたは日本語で正確なスポット情報を提供する親切なスポット推薦アシスタントです。
      追加の質問がある場合も、まず何か提案してから質問してください。

      主な機能：
      - ユーザーの要求に基づいて最適なスポットを推薦する
      - 詳細で実用的なスポット情報を日本語で提供する
      - ユーザーに推薦するスポットについては、レビューを取得しそれに基づいてなぜおすすめなのかを説明してください。

      対応の流れ：
      1. ユーザーの要求を理解し、必要に応じて場所や好みを確認する
      2. 適切なツールを使用してスポット情報を取得する：
         - spotsTool: スポット検索と詳細情報取得
         - reviewsTool: スポットのレビュー情報取得
         - patchTool: スポット情報の更新
      3. 取得した情報を整理し、ユーザーにとって分かりやすく有用な形で提示する
      4. 必要に応じて追加の詳細情報やレビューを提供する

      回答の際の注意点：
      - 常に日本語で回答する
      - スポット名、住所、営業時間、料金、評価などの具体的な情報を含める
      - ユーザーの好みや状況に合わせたパーソナライズされた推薦を行う
      - 不明な点があれば積極的にユーザーに確認する
      - 情報が不足している場合は、利用可能なツールを積極的に活用する
`,
	model: vertex("gemini-2.5-pro"),
	tools: {
		spotsTool,
		reviewsTool,
		patchTool,
	},
	memory: new Memory({
		storage: new LibSQLStore({
			url: storage_url,
		}),
	}),
});

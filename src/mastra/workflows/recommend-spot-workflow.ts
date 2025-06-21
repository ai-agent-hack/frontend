import { createWorkflow, createStep } from "@mastra/core";
import type { z } from "zod";

import type { Message } from "@ai-sdk/ui-utils";
import {
	type messageSchema,
	recommendSpotInputSchema,
} from "../schema/message";
import { outputSchema } from "../schema/output";

function convertMessages(messages: z.infer<typeof messageSchema>[]): Message[] {
	return messages.map((message) => ({
		id: crypto.randomUUID(),
		role: message.role as "user" | "assistant",
		content: message.content,
	}));
}

const callRecommendSpotAgentStep = createStep({
	id: "callRecommendSpotAgent",
	inputSchema: recommendSpotInputSchema,
	outputSchema: outputSchema,
	execute: async ({ inputData, mastra }) => {
		const { messages } = inputData;

		if (!messages) {
			throw new Error("No messages provided");
		}

		// エージェントを使ってメッセージを生成
		const agent = mastra.getAgent("recommendSpotAgent");
		const result = await agent.generate(convertMessages(messages));

		// モック実装：recommendSpotObjectはモックデータ
		const mockRecommendSpot = {
			name: "東京タワー",
			lat: 35.6586,
			lng: 139.7454,
			bestTime: "夕方〜夜",
			description: "東京のシンボル的な電波塔で、夜景が美しい観光スポットです。",
			reason:
				"東京の夜景を楽しむのに最適で、特に夕方から夜にかけての時間帯がおすすめです。",
		};

		return {
			message: result.text,
			recommendSpotObject: mockRecommendSpot,
		};
	},
});

export const recommendSpotWorkflow = createWorkflow({
	id: "recommend-spot-workflow",
	inputSchema: recommendSpotInputSchema,
	outputSchema: outputSchema,
	steps: [callRecommendSpotAgentStep],
})
	.then(callRecommendSpotAgentStep)
	.commit();

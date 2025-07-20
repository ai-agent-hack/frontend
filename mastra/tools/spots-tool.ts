import { readFileSync } from "fs";
import { join } from "path";
import type { MessageSchema, RecommendedSpots } from "../../src/types/mastra";

type Message = {
  role: "user" | "assistant";
  message: string;
};

function convertMessageSchemaToMessage(message: MessageSchema): Message {
  return {
    role: message.role as "user" | "assistant",
    message: message.content,
  };
}

// 独立した検索関数として切り出し
export async function searchSpots(input: {
  chat_history: MessageSchema[];
  recommend_spots: RecommendedSpots;
  plan_id: string;
}): Promise<RecommendedSpots> {
  const { chat_history, recommend_spots, plan_id } = input;

  // Read response from file
  const fileName = "spots-tool-response.json";
  const filePath = join(process.cwd(), "mastra", "tool-responses", fileName);
  const fileContent = readFileSync(filePath, "utf-8");
  const data: RecommendedSpots = JSON.parse(fileContent);
  console.log("[SpotsTool] Response loaded from:", filePath);

  return data;
}

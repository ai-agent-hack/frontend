/** biome-ignore-all lint/suspicious/noExplicitAny: Receive mastra results as any */

import type { OutputSchema, RecommendSpotInputSchema } from "@/types/mastra";
import { mastra } from "../../../../mastra";
import { recommendSpotInputSchema } from "../../../../mastra/schema/message";
import { outputSchema } from "../../../../mastra/schema/output";

export async function POST(req: Request) {
  const requestData = await req.json();

  console.log("requestData", requestData);

  const validatedRequestData: RecommendSpotInputSchema =
    recommendSpotInputSchema.parse(requestData);

  try {
    const workflow = mastra.getWorkflow("recommendSpotWorkflow");
    const run = workflow.createRun();
    const result = await run.start({ inputData: validatedRequestData });

    console.log("result", result);

    const text =
      (result as any)?.result?.nonSpotResponse?.message ??
      (result as any)?.result?.spotSearchChain?.message ??
      (result as any)?.result?.spotDetail?.message ??
      (result as any)?.result?.routeCreationExecute?.message ??
      "すみません、スポット情報を探している途中でエラーになってしまいました。\nもう一度、どんな場所をお探しか教えてもらえますか？";

    const recommendSpotData =
      (result as any)?.result?.nonSpotResponse?.recommendSpotObject ||
      (result as any)?.result?.spotSearchChain?.recommendSpotObject ||
      (result as any)?.result?.spotDetail?.recommendSpotObject ||
      (result as any)?.result?.routeCreationExecute?.recommendSpotObject;

    const coordinates =
      (result as any)?.result?.nonSpotResponse?.coordinates ||
      (result as any)?.result?.spotSearchChain?.coordinates ||
      (result as any)?.result?.spotDetail?.coordinates ||
      (result as any)?.result?.routeCreationExecute?.coordinates;

    const responseData: OutputSchema = {
      message: text,
      recommendSpotObject: recommendSpotData || undefined,
      coordinates: coordinates || undefined,
    };

    // outputSchemaでバリデーション
    const validatedResponse = outputSchema.parse(responseData);

    return new Response(JSON.stringify(validatedResponse), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("chat API error:", err);
    // エラーストリームを即返却
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

/** biome-ignore-all lint/suspicious/noExplicitAny: Receive mastra results as any */
import type { z } from "zod";
import { mastra } from "../../../../mastra";
import { outputSchema } from "../../../../mastra/schema/output";
import { recommendSpotInputSchema } from "../../../../mastra/schema/recommend-spot";

export async function POST(req: Request) {
  const requestData = await req.json();

  const validatedRequestData = recommendSpotInputSchema.parse(requestData);

  try {
    const workflow = mastra.getWorkflow("recommendSpotWorkflow");
    const run = workflow.createRun();
    const result = await run.start({ inputData: validatedRequestData });

    const text =
      (result as any)?.result?.message ??
      (result as any)?.message ??
      "No response";

    const recommendSpotData =
      (result as any)?.result?.recommendSpotObject ||
      (result as any)?.recommendSpotObject;

    const responseData: z.infer<typeof outputSchema> = {
      message: text,
      recommendSpotObject: recommendSpotData
        ? {
            name: recommendSpotData.name || "",
            lat: recommendSpotData.lat || 0,
            lng: recommendSpotData.lng || 0,
            bestTime: recommendSpotData.bestTime || "",
            description: recommendSpotData.description || "",
            reason: recommendSpotData.reason || "",
          }
        : undefined,
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

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { conciseRouteExplanationAgent } from "./agents/concise-route-explanation-agent";
import { intentClassifierAgent } from "./agents/intent-classifier-agent";
import { recommendSpotAgent } from "./agents/recommend-spot-agent";
import { spotRecommendationExplanationAgent } from "./agents/spot-recommendation-explanation-agent";
import { spotUpdateSummaryAgent } from "./agents/spot-update-summary-agent";
import { recommendSpotWorkflow } from "./workflows/recommend-spot-workflow";

export const mastra = new Mastra({
  agents: {
    recommendSpotAgent,
    intentClassifierAgent,
    spotUpdateSummaryAgent,
    spotRecommendationExplanationAgent,
    conciseRouteExplanationAgent,
  },
  workflows: {
    recommendSpotWorkflow,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});

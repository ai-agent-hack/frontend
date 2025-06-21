import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { recommendSpotTool } from "../tools/recommend-spot-tool";
import { createVertex } from "@ai-sdk/google-vertex";

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === "true";
const storage_url = MASTRA_DEBUG
	? "file:../../mastra/mastra.db"
	: "file:./mastra/mastra.db";

const vertex = createVertex({
	location: "us-central1",
	project: process.env.GOOGLE_PROJECT_ID,
});

export const recommendSpotAgent = new Agent({
	name: "Recommend Spot Agent",
	instructions: `
      You are a helpful spot assistant that provides accurate spot information in Japanese.

      Your primary function is to help users get spot details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like spot conditions, spot type, spot rating, spot price, spot address, spot phone number, spot website, spot hours, spot parking, spot directions, spot photos, spot videos, spot reviews, spot tips, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat, spot things to drink, spot things to buy, spot things to do, spot things to see, spot things to eat
`,
	model: vertex("gemini-2.5-pro"),
	tools: { recommendSpotTool },
	memory: new Memory({
		storage: new LibSQLStore({
			url: storage_url,
		}),
	}),
});

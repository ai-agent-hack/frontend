import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";

import { recommendSpotAgent } from "./agents/recommend-spot-agent";
import { recommendSpotWorkflow } from "./workflows/recommend-spot-workflow";

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === "true";
const storage_url = MASTRA_DEBUG
	? "file:../../src/mastra/mastra.db"
	: "file:./src/mastra/mastra.db";

export const mastra = new Mastra({
	agents: { recommendSpotAgent },
	workflows: { recommendSpotWorkflow },
	storage: new LibSQLStore({
		url: storage_url,
	}),
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
});

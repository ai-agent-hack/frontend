import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { recommendSpotAgent } from './agents/recommend-spot-agent';
import { intentClassifierAgent } from './agents/intent-classifier-agent';
import { spotUpdateSummaryAgent } from './agents/spot-update-summary-agent';
import { routeCreationConfirmAgent } from './agents/route-creation-confirm-agent';
import { recommendSpotWorkflow } from './workflows/recommend-spot-workflow';

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === 'true';
const storage_url = MASTRA_DEBUG ? 'file:../../mastra/mastra.db' : 'file:./mastra/mastra.db';

export const mastra = new Mastra({
  agents: { 
    recommendSpotAgent,
    intentClassifierAgent,
    spotUpdateSummaryAgent,
    routeCreationConfirmAgent
  },
  workflows: { recommendSpotWorkflow},
  storage: new LibSQLStore({
    url: storage_url,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
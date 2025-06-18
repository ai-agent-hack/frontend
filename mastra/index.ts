import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { weatherAgent } from './agents/weather-agent';

const MASTRA_DEBUG = process.env.MASTRA_DEBUG === 'true';
const storage_url = MASTRA_DEBUG ? 'file:../../mastra/mastra.db' : 'file:./mastra/mastra.db';

export const mastra = new Mastra({
  agents: { weatherAgent },
  storage: new LibSQLStore({
    url: storage_url,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

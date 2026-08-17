import { createApp } from "filamentjs";

import { registerRoutes as metaRoutes } from "./routes/meta.js";
import { registerRoutes as openAiRoutes } from "./routes/openai.js";
import { registerRoutes as wwwRoutes } from "./routes/www.js";
import { defaultMeta } from "./types/types.js";
import { getLogger } from "./lib/logger.js";
import { format } from "node:util";
import setupLogging from "./middleware/endpoint-logging.js";

const MODULE = 'server';

export default function startServer() {

  const log = getLogger(MODULE, startServer);

  log.debug('Creating app');
  const app = createApp(defaultMeta);

  log.debug('Setting up middleware');
  setupLogging(app);

  log.debug('Registering routes');
  metaRoutes(app);
  openAiRoutes(app);
  wwwRoutes(app);

  log.debug('Starting service');
  const port = Number(process.env.PORT ?? 3000);

  log.info(format('Service listening on port %s', port));
  app.listen(port);
}

import { createApp } from "filamentjs";

import * as requestLogging from "@filamentjs/request-logging";

import { registerRoutes as metaRoutes } from "./routes/meta.js";
import { registerRoutes as openAiRoutes } from "./routes/openai.js";
import { registerRoutes as wwwRoutes } from "./routes/www.js";
import { AppMeta, Context } from "./types/types.js";
import { getLogger } from "./lib/logger.js";
import { format } from "node:util";

const MODULE = 'server';

type CombinedAppMeta = AppMeta & requestLogging.AppMeta;
type CombinedContextMeta = Context;

const defaultAppMeta = {
  application: {
    maxRequestSize: '1MiB',
    observability: {
      enabled: true
    }
  }
};
const defaultContextMeta = {};

export default function startServer() {

  const log = getLogger(MODULE, startServer);

  log.debug('Creating app');
  const app = createApp<CombinedAppMeta, CombinedContextMeta>(
    defaultAppMeta, defaultContextMeta
  );

  log.debug('Setting up middleware');
  requestLogging.setup(app);

  log.debug('Registering routes');
  metaRoutes(app);
  openAiRoutes(app);
  wwwRoutes(app);

  log.debug('Starting service');
  const port = Number(process.env.PORT ?? 3000);

  log.info(format('Service listening on port %s', port));
  app.listen(port);
}

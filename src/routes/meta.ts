/**
 * @module Endpoints to get metadata about the operating enviornment
 * @param app 
 */

import { Application, Request, Response } from "filamentjs";
import { getLogger } from "../lib/logger.js";
import { AppMeta, ServiceConfigMode } from "../types/types.js";
import { getConnectivityMode } from "../dispatch.js";
import { end, failIfNotReady } from "../lib/http-tools.js";

const MODULE = 'routes/meta';

export function registerRoutes(app: Application<AppMeta>) {

  const log = getLogger(MODULE, registerRoutes);

  log.verbose('Registering GET /health');

  // // Health check (handy for Continue diagnostics)
  app.get("/health", async (req: Request<AppMeta>, res: Response) => {
    if (!failIfNotReady(res)) {
      const message:Record<string, any> = {status: 'ok'};
      if (req.body) {
        const ctHeader = req.headers.get('Content-Type');
        message.echo = {
          body: req.body.toString(),
          'Content-Type': ctHeader || 'application/json'
        }
      }
      end(res, 200, JSON.stringify(message));
    }
  });

  log.verbose('Registering GET /v1/probe/[force]');

  app.get(
    "/v1/probe", "/v1/probe/force",
    async (req: Request<AppMeta>, res: Response
  ) => {
    const log = getLogger(MODULE, 'PUT', req.path);
    res.headers.set('Content-Type', 'application/json');
    let mode!:ServiceConfigMode
    let modeCheck:'always'|'recent'|'less' = 'less';
    if (req.path === "/v1/probe/force") {
      modeCheck = 'always';
    }
    log.debug('Getting connectivity mode (check "%s")', modeCheck);
    mode = await getConnectivityMode(modeCheck);
    log.debug('Got connectivity mode: %s', JSON.stringify(mode));
    const result = {
      name: mode.name,
      displayName: mode.displayName,
      icon: mode.icon
    }
    res.send(JSON.stringify(result));
  });

  log.verbose('Registered all meta routes');
}

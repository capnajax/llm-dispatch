/**
 * @module Endpoints to get metadata about the operating enviornment
 * @param app
 */
import { getLogger } from "../lib/logger.js";
import { LOG_COLLAPSE } from "../types/types.js";
import { getConnectivityMode } from "../dispatch.js";
import { end, failIfNotReady } from "../lib/http-tools.js";
const MODULE = 'routes/meta';
export function registerRoutes(app) {
    const log = getLogger(MODULE, registerRoutes);
    log.verbose('Registering GET /health');
    // // Health check (handy for Continue diagnostics)
    app.get("/health", LOG_COLLAPSE, async (req, res) => {
        if (!failIfNotReady(res)) {
            const message = { status: 'ok' };
            if (req.body) {
                const ctHeader = req.headers.getHeader('Content-Type');
                message.echo = {
                    body: req.body.toString(),
                    'Content-Type': ctHeader || 'application/json'
                };
            }
            end(res, 200, JSON.stringify(message));
        }
    });
    log.verbose('Registering GET /v1/probe/[force]');
    app.get("/v1/probe", "/v1/probe/force", async (req, res) => {
        const log = getLogger(MODULE, 'PUT', req.path);
        res.setHeader('Content-Type', 'application/json');
        let mode;
        let modeCheck = 'less';
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
        };
        res.send(JSON.stringify(result));
    });
    log.verbose('Registered all meta routes');
}
//# sourceMappingURL=meta.js.map
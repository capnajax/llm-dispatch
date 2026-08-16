import { fetchModels } from "../dispatch.js";
import { end, failIfNotReady } from '../lib/http-tools.js';
import { getLogger } from '../lib/logger.js';
const MODULE = 'routes/openai';
export function registerRoutes(app) {
    // Chat Completions (primary endpoint for Continue + chat apps)
    // app.post("/v1/chat/completions", async (req: Request, res: Response) => {
    // });
    // // Embeddings
    // app.post("/v1/embeddings", async (req: Request, res: Response) => {
    //   res.send(await proxy.embeddings(await req.body?.toString() || ''));
    // });
    // Model listing (useful for tooling compatibility)
    app.get("/v1/models", async (req, res) => {
        const log = getLogger(MODULE, 'GET', req.path);
        let check = 'recent';
        if (req.params.force) {
            check = 'always';
        }
        if (!failIfNotReady(res)) {
            const models = await fetchModels(check);
            log.verbose('models(%s): %s', check, models);
            end(res, 200, JSON.stringify(models));
        }
    });
}
//# sourceMappingURL=openai.js.map
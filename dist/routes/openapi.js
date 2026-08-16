import { fetchModels } from "../dispatch.js";
import { end, failIfNotReady } from '../lib/http-tools.js';
export function registerRoutes(app) {
    // Chat Completions (primary endpoint for Continue + chat apps)
    // app.post("/v1/chat/completions", async (req: Request, res: Response) => {
    // });
    // // Legacy completions endpoint
    // app.post("/v1/completions", async (req: Request, res: Response) => {
    //   res.send(await proxy.completions(await req.body?.toString() || ''));
    // });
    // // Embeddings
    // app.post("/v1/embeddings", async (req: Request, res: Response) => {
    //   res.send(await proxy.embeddings(await req.body?.toString() || ''));
    // });
    // Model listing (useful for tooling compatibility)
    app.get("/v1/models", async (req, res) => {
        let check = 'recent';
        if (req.params.force) {
            check = 'always';
        }
        if (!failIfNotReady(res)) {
            end(res, 200, JSON.stringify(await fetchModels(check)));
        }
    });
    // // Health check (handy for Continue diagnostics)
    app.get("/health", async (req, res) => {
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
}
//# sourceMappingURL=openapi.js.map
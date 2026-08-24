import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Application, Request, Response } from "filamentjs";
import type { AppMeta } from "../types/types.js";
import { getLogger } from "../lib/logger.js";

const MODULE = "routes/www";
const webRoot = fileURLToPath(new URL("../www", import.meta.url));
const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

async function sendFile(res: Response, relativePath: string, immutable = false): Promise<void> {
  try {
    const body = await readFile(join(webRoot, relativePath));
    res.headers.set("Content-Type", mimeTypes[extname(relativePath)] ?? "application/octet-stream");
    res.headers.set("Cache-Control", immutable ? "public, max-age=31536000, immutable" : "no-cache");
    await res.send(body);
  } catch (error) {
    getLogger(MODULE, sendFile).error("Unable to serve web asset %s: %s", relativePath, error);
    res.statusCode = 404;
    await res.send("Not found");
  }
}

export function registerRoutes(app: Application<AppMeta>): void {
  app.get("/assets/:asset", async (req: Request<AppMeta>, res: Response) => {
    const asset = req.params.asset;
    if (!/^[a-zA-Z0-9._-]+$/.test(asset)) { res.statusCode = 400; await res.send("Invalid asset"); return; }
    await sendFile(res, `assets/${asset}`, true);
  });
  const shell = async (_req: Request<AppMeta>, res: Response) => sendFile(res, "index.html");
  app.get("/", shell);
  app.get("/c/:conversationId", shell);
}

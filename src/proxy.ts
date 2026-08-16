import { ProxyConfig } from "./types/types.js";

export class LLMProxy {
  constructor(private config: ProxyConfig) {}

  private async forward(method: string, path: string, body?: unknown): Promise<string> {
    const url = `${this.config.backendUrl}${path}`;

    const fetchInit: Record<string, unknown> = {
      method,
      headers: {}
    }
    body && (fetchInit.body = JSON.stringify(body));

    const res = await fetch(url, fetchInit);
    const json = await res.json();

    console.log(JSON.stringify({json}));

    return JSON.stringify(json);
  }

  chatCompletions(body: string): Promise<string> {
    return this.forward('POST', "/v1/chat/completions", body);
  }

  completions(body: string): Promise<string> {
    return this.forward('POST', "/v1/completions", body);
  }

  embeddings(body: string): Promise<string> {
    return this.forward('POST', "/v1/embeddings", body);
  }

  models() {
    return this.forward('GET', "/v1/models");
  }
}
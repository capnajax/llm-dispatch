export class LLMProxy {
    config;
    constructor(config) {
        this.config = config;
    }
    async forward(method, path, body) {
        const url = `${this.config.backendUrl}${path}`;
        const fetchInit = {
            method,
            headers: {}
        };
        body && (fetchInit.body = JSON.stringify(body));
        const res = await fetch(url, fetchInit);
        const json = await res.json();
        console.log(JSON.stringify({ json }));
        return JSON.stringify(json);
    }
    chatCompletions(body) {
        return this.forward('POST', "/v1/chat/completions", body);
    }
    completions(body) {
        return this.forward('POST', "/v1/completions", body);
    }
    embeddings(body) {
        return this.forward('POST', "/v1/embeddings", body);
    }
    models() {
        return this.forward('GET', "/v1/models");
    }
}
//# sourceMappingURL=proxy.js.map
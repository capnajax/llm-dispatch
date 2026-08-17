export interface StreamResult { content: string; model?: string }

export async function streamCompletion(
  messages: Array<{ role: string; content: string }>,
  signal: AbortSignal,
  onText: (content: string) => void,
): Promise<StreamResult> {
  const response = await fetch("/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "auto", messages, stream: true }),
    signal,
  });
  if (!response.ok) throw new Error(`Inference returned ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.body || !contentType.includes("text/event-stream")) {
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content ?? "";
    onText(content);
    return { content, model: payload.model };
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let model: string | undefined;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const chunk = JSON.parse(data);
      model ||= chunk.model;
      const delta = chunk.choices?.[0]?.delta?.content ?? "";
      if (delta) { content += delta; onText(content); }
    }
    if (done) break;
  }
  return { content, model };
}

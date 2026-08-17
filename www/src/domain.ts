import type { Message } from "../schema";

export function deriveTitle(input: string, max = 48): string {
  const first = input.trim().split(/\r?\n/, 1)[0]?.replace(/\s+/g, " ") ?? "";
  if (!first) return "New conversation";
  if (first.length <= max) return first;
  const slice = first.slice(0, max + 1);
  const breakAt = slice.lastIndexOf(" ");
  return `${slice.slice(0, breakAt >= Math.floor(max * 0.65) ? breakAt : max).trimEnd()}…`;
}

export function visibleMessages(messages: Message[]): Message[] {
  return messages
    .filter((message) => message.status !== "deleted" && message.content !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function apiContext(messages: Message[]): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return visibleMessages(messages).flatMap((message) =>
    message.content && (message.role === "system" || message.role === "user" || (message.role === "assistant" && message.status === "complete"))
      ? [{ role: message.role as "system" | "user" | "assistant", content: message.content }]
      : [],
  );
}

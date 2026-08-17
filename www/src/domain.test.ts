import { describe, expect, it } from "vitest";
import { apiContext, deriveTitle, visibleMessages } from "./domain";
import type { Message } from "../schema";

const message = (overrides: Partial<Message>): Message => ({ id: "1", organizationId: "o", conversationId: "c", parentMessageId: null, rootMessageId: "1", role: "user", authorUserId: "u", content: "Hello", status: "complete", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", deletedAt: null, revision: 1, ...overrides });

describe("domain helpers", () => {
  it("derives compact titles", () => expect(deriveTitle("  A   useful prompt with spacing  ")).toBe("A useful prompt with spacing"));
  it("sorts and hides tombstones", () => expect(visibleMessages([message({ id: "b" }), message({ id: "a" }), message({ id: "x", status: "deleted", content: null, deletedAt: "x" })]).map((x) => x.id)).toEqual(["a", "b"]));
  it("excludes incomplete assistant context", () => expect(apiContext([message({}), message({ id: "2", role: "assistant", status: "error", content: "partial" })])).toEqual([{ role: "user", content: "Hello" }]));
});

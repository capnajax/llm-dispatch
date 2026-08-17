import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { appendMessage, createConversationWithMessage, deleteConversation, getStubIdentity, listConversationMessages, listLiveConversations, openDatabase, renameConversation } from "./database";
import type { Conversation, Message } from "./types";

const databases: IDBDatabase[] = [];
afterEach(() => { for (const database of databases) database.close(); databases.length = 0; });

describe("conversation persistence", () => {
  it("creates, appends, renames, reopens, and tombstones a conversation", async () => {
    const name = `test-${crypto.randomUUID()}`;
    const database = await openDatabase(name); databases.push(database);
    const identity = await getStubIdentity(database);
    const createdAt = "2026-01-01T00:00:00.000Z";
    const conversation: Conversation = { id: crypto.randomUUID(), organizationId: identity.organization.id, createdByUserId: identity.user.id, title: "Hello", titleSource: "generated", createdAt, updatedAt: createdAt, deletedAt: null, revision: 1 };
    const root: Message = { id: crypto.randomUUID(), organizationId: conversation.organizationId, conversationId: conversation.id, parentMessageId: null, rootMessageId: "", role: "user", authorUserId: identity.user.id, content: "Hello", status: "complete", createdAt, updatedAt: createdAt, deletedAt: null, revision: 1 };
    root.rootMessageId = root.id;
    await createConversationWithMessage(database, { conversation, message: root });
    const second: Message = { ...root, id: crypto.randomUUID(), parentMessageId: root.id, rootMessageId: root.id, role: "assistant", authorUserId: null, content: "Hi", createdAt: "2026-01-01T00:00:01.000Z", updatedAt: "2026-01-01T00:00:01.000Z" };
    await appendMessage(database, second, conversation.id);
    const renamed = await renameConversation(database, conversation.id, "Greeting");
    expect(renamed.titleSource).toBe("manual");
    expect((await listConversationMessages(database, conversation.id)).map((value) => value.id)).toEqual([root.id, second.id]);
    database.close(); databases.pop();
    const reopened = await openDatabase(name); databases.push(reopened);
    expect((await listLiveConversations(reopened, identity.organization.id))[0]?.title).toBe("Greeting");
    await deleteConversation(reopened, conversation.id);
    expect(await listLiveConversations(reopened, identity.organization.id)).toEqual([]);
    expect((await listConversationMessages(reopened, conversation.id)).every((value) => value.status === "deleted" && value.content === null)).toBe(true);
  });
});

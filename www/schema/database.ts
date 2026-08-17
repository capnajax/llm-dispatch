import {
  DATA_SCHEMA_VERSION,
  JOURNAL_PROTOCOL_VERSION,
  type AppMetaRecord,
  type Conversation,
  type Message,
  type Organization,
  type OrganizationMembership,
  type StubIdentity,
  type User,
} from "./types.js";

export const DATABASE_NAME = "llm-dispatch";
export const DATABASE_VERSION = 1;

export const STORE_NAMES = {
  appMeta: "appMeta",
  organizations: "organizations",
  users: "users",
  organizationMemberships: "organizationMemberships",
  conversations: "conversations",
  messages: "messages",
} as const;

type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });

export const transactionComplete = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });

function createVersionOne(database: IDBDatabase): void {
  database.createObjectStore(STORE_NAMES.appMeta, { keyPath: "key" });
  database.createObjectStore(STORE_NAMES.organizations, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.users, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.organizationMemberships, {
    keyPath: ["organizationId", "userId"],
  });

  const conversations = database.createObjectStore(STORE_NAMES.conversations, { keyPath: "id" });
  conversations.createIndex("byOrganizationUpdatedAt", ["organizationId", "updatedAt"]);
  conversations.createIndex("byDeletedAt", "deletedAt");

  const messages = database.createObjectStore(STORE_NAMES.messages, { keyPath: "id" });
  messages.createIndex("byConversationCreatedAt", ["conversationId", "createdAt"]);
  messages.createIndex("byConversationRootCreatedAt", ["conversationId", "rootMessageId", "createdAt"]);
  messages.createIndex("byParentMessageId", "parentMessageId");
  messages.createIndex("byRootMessageId", "rootMessageId");
  messages.createIndex("byDeletedAt", "deletedAt");
}

export async function openDatabase(name = DATABASE_NAME): Promise<IDBDatabase> {
  const request = indexedDB.open(name, DATABASE_VERSION);
  request.onupgradeneeded = (event) => {
    if (event.oldVersion < 1) createVersionOne(request.result);
  };
  const database = await requestResult(request);
  database.onversionchange = () => database.close();
  await initializeDatabase(database);
  return database;
}

async function initializeDatabase(database: IDBDatabase): Promise<void> {
  const transaction = database.transaction(Object.values(STORE_NAMES), "readwrite");
  const meta = transaction.objectStore(STORE_NAMES.appMeta);
  const existingClientId = await requestResult(meta.get("clientId"));

  if (!existingClientId) {
    const now = new Date().toISOString();
    const identity = createStubIdentity(now);
    const records: AppMetaRecord[] = [
      { key: "clientId", value: crypto.randomUUID() },
      { key: "dataSchemaVersion", value: DATA_SCHEMA_VERSION },
      { key: "journalProtocolVersion", value: JOURNAL_PROTOCOL_VERSION },
      { key: "createdAt", value: now },
      { key: "lastServerSequence", value: null },
    ];
    for (const record of records) meta.add(record);
    transaction.objectStore(STORE_NAMES.organizations).add(identity.organization);
    transaction.objectStore(STORE_NAMES.users).add(identity.user);
    transaction.objectStore(STORE_NAMES.organizationMemberships).add(identity.membership);
  }

  await transactionComplete(transaction);
}

export function createStubIdentity(now = new Date().toISOString()): StubIdentity {
  const organizationId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  return {
    organization: { id: organizationId, name: "Local organization", createdAt: now, updatedAt: now },
    user: { id: userId, displayName: "Local user", createdAt: now, updatedAt: now },
    membership: {
      organizationId,
      userId,
      role: "owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  };
}

export interface NewConversationWithMessage {
  conversation: Conversation;
  message: Message;
}

export async function getStubIdentity(database: IDBDatabase): Promise<StubIdentity> {
  const transaction = database.transaction(
    [STORE_NAMES.organizations, STORE_NAMES.users, STORE_NAMES.organizationMemberships],
    "readonly",
  );
  const [organizations, users, memberships] = await Promise.all([
    requestResult(transaction.objectStore(STORE_NAMES.organizations).getAll()) as Promise<Organization[]>,
    requestResult(transaction.objectStore(STORE_NAMES.users).getAll()) as Promise<User[]>,
    requestResult(transaction.objectStore(STORE_NAMES.organizationMemberships).getAll()) as Promise<OrganizationMembership[]>,
  ]);
  await transactionComplete(transaction);
  const organization = organizations[0];
  const user = users[0];
  const membership = memberships.find((value) => value.organizationId === organization?.id && value.userId === user?.id);
  if (!organization || !user || !membership) throw new Error("Local identity is incomplete");
  return { organization, user, membership };
}

export async function listLiveConversations(database: IDBDatabase, organizationId: string): Promise<Conversation[]> {
  const transaction = database.transaction(STORE_NAMES.conversations, "readonly");
  const values = (await requestResult(transaction.objectStore(STORE_NAMES.conversations).getAll())) as Conversation[];
  await transactionComplete(transaction);
  return values
    .filter((value) => value.organizationId === organizationId && value.deletedAt === null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id));
}

export async function getConversation(database: IDBDatabase, id: string): Promise<Conversation | undefined> {
  const transaction = database.transaction(STORE_NAMES.conversations, "readonly");
  const value = (await requestResult(transaction.objectStore(STORE_NAMES.conversations).get(id))) as Conversation | undefined;
  await transactionComplete(transaction);
  return value?.deletedAt === null ? value : undefined;
}

export async function appendMessage(
  database: IDBDatabase,
  message: Message,
  conversationId: string,
): Promise<Conversation> {
  const transaction = database.transaction([STORE_NAMES.conversations, STORE_NAMES.messages], "readwrite");
  const conversations = transaction.objectStore(STORE_NAMES.conversations);
  const conversation = (await requestResult(conversations.get(conversationId))) as Conversation | undefined;
  if (!conversation || conversation.deletedAt !== null) {
    transaction.abort();
    throw new Error(`Unknown conversation: ${conversationId}`);
  }
  validateMessage(message, conversation);
  const updated = { ...conversation, updatedAt: message.updatedAt, revision: conversation.revision + 1 };
  transaction.objectStore(STORE_NAMES.messages).add(message);
  conversations.put(updated);
  await transactionComplete(transaction);
  return updated;
}

export async function renameConversation(database: IDBDatabase, id: string, title: string): Promise<Conversation> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Conversation title cannot be empty");
  const transaction = database.transaction(STORE_NAMES.conversations, "readwrite");
  const store = transaction.objectStore(STORE_NAMES.conversations);
  const conversation = (await requestResult(store.get(id))) as Conversation | undefined;
  if (!conversation || conversation.deletedAt !== null) {
    transaction.abort();
    throw new Error(`Unknown conversation: ${id}`);
  }
  const updated = { ...conversation, title: trimmed, titleSource: "manual" as const, updatedAt: new Date().toISOString(), revision: conversation.revision + 1 };
  store.put(updated);
  await transactionComplete(transaction);
  return updated;
}

export async function deleteConversation(database: IDBDatabase, id: string): Promise<void> {
  const deletedAt = new Date().toISOString();
  const transaction = database.transaction([STORE_NAMES.conversations, STORE_NAMES.messages], "readwrite");
  const conversations = transaction.objectStore(STORE_NAMES.conversations);
  const conversation = (await requestResult(conversations.get(id))) as Conversation | undefined;
  if (!conversation || conversation.deletedAt !== null) {
    transaction.abort();
    throw new Error(`Unknown conversation: ${id}`);
  }
  conversations.put({ ...conversation, deletedAt, updatedAt: deletedAt, revision: conversation.revision + 1 });
  const messages = transaction.objectStore(STORE_NAMES.messages);
  const index = messages.index("byConversationCreatedAt");
  const range = IDBKeyRange.bound([id, ""], [id, "\uffff"]);
  const values = (await requestResult(index.getAll(range))) as Message[];
  for (const message of values) {
    if (message.status !== "deleted") messages.put({ ...message, content: null, status: "deleted", deletedAt, updatedAt: deletedAt, revision: message.revision + 1 });
  }
  await transactionComplete(transaction);
}

export async function removeEmptyAssistant(database: IDBDatabase, id: string): Promise<void> {
  const transaction = database.transaction(STORE_NAMES.messages, "readwrite");
  transaction.objectStore(STORE_NAMES.messages).delete(id);
  await transactionComplete(transaction);
}

export async function createConversationWithMessage(
  database: IDBDatabase,
  value: NewConversationWithMessage,
): Promise<void> {
  validateMessage(value.message, value.conversation);
  const transaction = database.transaction([STORE_NAMES.conversations, STORE_NAMES.messages], "readwrite");
  transaction.objectStore(STORE_NAMES.conversations).add(value.conversation);
  transaction.objectStore(STORE_NAMES.messages).add(value.message);
  await transactionComplete(transaction);
}

export async function updateMessage(
  database: IDBDatabase,
  message: Message,
  conversation: Conversation,
): Promise<void> {
  validateMessage(message, conversation);
  const transaction = database.transaction([STORE_NAMES.conversations, STORE_NAMES.messages], "readwrite");
  transaction.objectStore(STORE_NAMES.messages).put(message);
  transaction.objectStore(STORE_NAMES.conversations).put(conversation);
  await transactionComplete(transaction);
}

export async function tombstoneMessage(
  database: IDBDatabase,
  messageId: string,
  deletedAt = new Date().toISOString(),
): Promise<Message> {
  const transaction = database.transaction([STORE_NAMES.conversations, STORE_NAMES.messages], "readwrite");
  const messages = transaction.objectStore(STORE_NAMES.messages);
  const message = (await requestResult(messages.get(messageId))) as Message | undefined;
  if (!message) {
    transaction.abort();
    throw new Error(`Unknown message: ${messageId}`);
  }
  const tombstone: Message = {
    ...message,
    content: null,
    status: "deleted",
    deletedAt,
    updatedAt: deletedAt,
    revision: message.revision + 1,
  };
  messages.put(tombstone);
  const conversations = transaction.objectStore(STORE_NAMES.conversations);
  const conversation = (await requestResult(conversations.get(message.conversationId))) as Conversation | undefined;
  if (conversation) conversations.put({ ...conversation, updatedAt: deletedAt, revision: conversation.revision + 1 });
  await transactionComplete(transaction);
  return tombstone;
}

export async function listConversationMessages(
  database: IDBDatabase,
  conversationId: string,
): Promise<Message[]> {
  const transaction = database.transaction(STORE_NAMES.messages, "readonly");
  const index = transaction.objectStore(STORE_NAMES.messages).index("byConversationCreatedAt");
  const range = IDBKeyRange.bound([conversationId, ""], [conversationId, "\uffff"]);
  const messages = (await requestResult(index.getAll(range))) as Message[];
  await transactionComplete(transaction);
  return messages.sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id));
}

export function validateMessage(message: Message, conversation: Conversation): void {
  if (message.conversationId !== conversation.id || message.organizationId !== conversation.organizationId) {
    throw new Error("Message and conversation ownership must match");
  }
  if (message.parentMessageId === null && message.rootMessageId !== message.id) {
    throw new Error("A root message must reference itself as rootMessageId");
  }
  if (message.status === "deleted" ? message.content !== null || message.deletedAt === null : message.deletedAt !== null) {
    throw new Error("Message deletion state is inconsistent");
  }
}

export type { AppMetaRecord, Conversation, Message, Organization, OrganizationMembership, StoreName, User };

export const DATA_SCHEMA_VERSION = 1;
export const JOURNAL_PROTOCOL_VERSION = 1;

export type UUID = string;
export type Timestamp = string;

export type AppMetaRecord =
  | { key: "clientId"; value: UUID }
  | { key: "dataSchemaVersion"; value: number }
  | { key: "journalProtocolVersion"; value: number }
  | { key: "createdAt"; value: Timestamp }
  | { key: "lastServerSequence"; value: number | null };

export interface Organization {
  id: UUID;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: UUID;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrganizationMembership {
  organizationId: UUID;
  userId: UUID;
  role: "owner";
  status: "active";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ConversationTitleSource = "manual" | "generated" | "imported";

export interface Conversation {
  id: UUID;
  organizationId: UUID;
  createdByUserId: UUID;
  title: string;
  titleSource: ConversationTitleSource;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  revision: number;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageStatus = "pending" | "complete" | "cancelled" | "error" | "deleted";

export interface Message {
  id: UUID;
  organizationId: UUID;
  conversationId: UUID;
  parentMessageId: UUID | null;
  rootMessageId: UUID;
  role: MessageRole;
  authorUserId: UUID | null;
  content: string | null;
  status: MessageStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  revision: number;
}

export interface StubIdentity {
  organization: Organization;
  user: User;
  membership: OrganizationMembership;
}

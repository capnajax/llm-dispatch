BEGIN;

CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE organization_memberships (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner')),
  status text NOT NULL CHECK (status IN ('active')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  title_source text NOT NULL CHECK (title_source IN ('manual', 'generated', 'imported')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  deleted_at timestamptz,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0)
);

CREATE INDEX conversations_organization_updated_at_idx
  ON conversations (organization_id, updated_at);
CREATE INDEX conversations_deleted_at_idx ON conversations (deleted_at);

CREATE TABLE messages (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  parent_message_id uuid REFERENCES messages(id) DEFERRABLE INITIALLY DEFERRED,
  root_message_id uuid NOT NULL REFERENCES messages(id) DEFERRABLE INITIALLY DEFERRED,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  author_user_id uuid REFERENCES users(id),
  content text,
  status text NOT NULL CHECK (status IN ('pending', 'complete', 'cancelled', 'error', 'deleted')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  deleted_at timestamptz,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK ((status = 'deleted' AND content IS NULL AND deleted_at IS NOT NULL)
      OR (status <> 'deleted' AND deleted_at IS NULL)),
  CHECK (parent_message_id IS NOT NULL OR root_message_id = id)
);

CREATE INDEX messages_conversation_created_at_idx
  ON messages (conversation_id, created_at, id);
CREATE INDEX messages_conversation_root_created_at_idx
  ON messages (conversation_id, root_message_id, created_at, id);
CREATE INDEX messages_parent_message_id_idx ON messages (parent_message_id);
CREATE INDEX messages_root_message_id_idx ON messages (root_message_id);
CREATE INDEX messages_deleted_at_idx ON messages (deleted_at);

CREATE TABLE clients (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  last_pulled_server_sequence bigint CHECK (last_pulled_server_sequence IS NULL OR last_pulled_server_sequence >= 0)
);

CREATE SEQUENCE journal_server_sequence AS bigint;

CREATE TABLE journal_operations (
  operation_id uuid PRIMARY KEY,
  protocol_version integer NOT NULL CHECK (protocol_version > 0),
  client_id uuid NOT NULL REFERENCES clients(id),
  user_id uuid NOT NULL REFERENCES users(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  operation_type text NOT NULL CHECK (operation_type IN (
    'conversation.create', 'conversation.update', 'conversation.delete',
    'message.create', 'message.update', 'message.delete',
    'conversation.split', 'messages.repoint'
  )),
  entity_type text NOT NULL CHECK (entity_type IN ('conversation', 'message', 'messages')),
  entity_id uuid NOT NULL,
  base_revision bigint CHECK (base_revision IS NULL OR base_revision > 0),
  payload jsonb NOT NULL,
  client_created_at timestamptz NOT NULL,
  server_sequence bigint NOT NULL DEFAULT nextval('journal_server_sequence') UNIQUE,
  accepted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_receipt_confirmed_at timestamptz
);

CREATE INDEX journal_operations_authorized_pull_idx
  ON journal_operations (organization_id, server_sequence);
CREATE INDEX journal_operations_unconfirmed_receipt_idx
  ON journal_operations (client_id, accepted_at)
  WHERE client_receipt_confirmed_at IS NULL;

COMMIT;

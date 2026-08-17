import { useState } from "react";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import type { Conversation } from "../../schema";
import { IconButton } from "./IconButton";

export interface ConversationRowProps {
  conversation: Conversation;
  active: boolean;
  select: () => void;
  rename: () => void;
  remove: () => void;
}

function relativeTime(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(value)) / 60000),
  );
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return days < 7
    ? `${days}d`
    : new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
}

export function ConversationRow({
  conversation,
  active,
  select,
  rename,
  remove,
}: ConversationRowProps) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="conversation-row">
      <button
        className="conversation-link"
        aria-current={active ? "page" : undefined}
        onClick={select}
      >
        <span>{conversation.title}</span>
        <time>{relativeTime(conversation.updatedAt)}</time>
      </button>
      <IconButton
        label={`Actions for ${conversation.title}`}
        icon={<Ellipsis />}
        onClick={() => setMenu(!menu)}
      />
      {menu && (
        <div className="row-menu">
          <button
            onClick={() => {
              setMenu(false);
              rename();
            }}
          >
            <Pencil />
            Rename
          </button>
          <button
            className="danger"
            onClick={() => {
              setMenu(false);
              remove();
            }}
          >
            <Trash2 />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

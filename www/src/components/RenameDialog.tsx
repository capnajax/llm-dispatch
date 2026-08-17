import { useState } from "react";
import { X } from "lucide-react";
import type { Conversation } from "../../schema";
import { IconButton } from "./IconButton";

export interface RenameDialogProps {
  conversation: Conversation;
  close: () => void;
  save: (title: string) => void;
}

export function RenameDialog({
  conversation,
  close,
  save,
}: RenameDialogProps) {
  const [title, setTitle] = useState(conversation.title);
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-title"
        onSubmit={(e) => {
          e.preventDefault();
          void save(title);
        }}
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="dialog-heading">
          <h2 id="rename-title">Rename conversation</h2>
          <IconButton label="Close" icon={<X />} onClick={close} />
        </div>
        <label>
          Title
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <div className="dialog-actions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="primary" disabled={!title.trim()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

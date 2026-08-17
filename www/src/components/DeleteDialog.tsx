import { Trash2, X } from "lucide-react";
import type { Conversation } from "../../schema";
import { IconButton } from "./IconButton";

export interface DeleteDialogProps {
  conversation: Conversation;
  close: () => void;
  remove: () => void;
}

export function DeleteDialog({
  conversation,
  close,
  remove,
}: DeleteDialogProps) {
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="dialog-heading">
          <h2 id="delete-title">Delete “{conversation.title}”?</h2>
          <IconButton label="Close" icon={<X />} onClick={close} />
        </div>
        <p>
          This permanently removes the local conversation from this browser.
        </p>
        <div className="dialog-actions">
          <button onClick={close}>Cancel</button>
          <button
            className="danger-button"
            autoFocus
            onClick={() => void remove()}
          >
            <Trash2 />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

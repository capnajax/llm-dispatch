import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export interface EmptyProps {
  icon: ReactNode;
  title: string;
  text: string;
  action?: () => void;
}

export function Empty({ icon, title, text, action }: EmptyProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h1>{title}</h1>
      <p>{text}</p>
      {action && (
        <button className="primary" onClick={action}>
          <Plus />
          New conversation
        </button>
      )}
    </div>
  );
}

import { forwardRef } from "react";
import { CircleStop, Send } from "lucide-react";

export interface ComposerProps {
  value: string;
  setValue: (value: string) => void;
  send: () => void;
  stop: () => void;
  generating: boolean;
  disabled: boolean;
}

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  function Composer(
    { value, setValue, send, stop, generating, disabled },
    ref,
  ) {
    return (
      <footer className="composer-wrap">
        <div className="composer">
          <textarea
            ref={ref}
            value={value}
            rows={1}
            placeholder="Message llm-dispatch…"
            aria-label="Message"
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = "auto";
              const height = Math.min(e.target.scrollHeight, 192);
              e.target.style.height = `${height}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            className="send-button"
            aria-label={generating ? "Stop generating" : "Send message"}
            onClick={generating ? stop : send}
            disabled={!generating && (!value.trim() || disabled)}
          >
            {generating ? <CircleStop /> : <Send />}
          </button>
        </div>
        <p>Responses may be inaccurate. Local history stays on this browser.</p>
      </footer>
    );
  },
);

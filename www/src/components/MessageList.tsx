import { CircleStop, Copy, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../schema";

export interface MessageListProps {
  messages: Message[];
  generating: boolean;
  copy: (text: string) => void;
  retry: (message?: Message) => void;
  stop: () => void;
}

export function MessageList({
  messages,
  generating,
  copy,
  retry,
  stop,
}: MessageListProps) {
  const tail = messages.at(-1);
  return (
    <div className="message-column">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`message ${message.role}`}
          tabIndex={0}
        >
          {message.role === "assistant" && (
            <div className="assistant-mark">ld</div>
          )}
          <div className="message-body">
            {message.role === "user" ? (
              <p className="plain">{message.content}</p>
            ) : message.role === "tool" ? (
              <details>
                <summary>Technical message</summary>
                <pre>{message.content}</pre>
              </details>
            ) : message.role === "system" ? (
              <p className="system-note">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => (
                    <a {...props} target="_blank" rel="noreferrer" />
                  ),
                  code: ({ className, children, ...props }) => (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            {message.status === "pending" && (
              <span className="caret" aria-label="Generating" />
            )}
            {message.status === "cancelled" && (
              <p className="message-state">Stopped</p>
            )}
            {message.status === "error" && (
              <p className="message-state error">
                Response failed. You can retry.
              </p>
            )}
            <div className="message-actions">
              <button onClick={() => copy(message.content!)}>
                <Copy />
                Copy
              </button>
              {(message.status === "cancelled" ||
                message.status === "error") && (
                <button onClick={() => retry(message)}>
                  <RefreshCw />
                  Retry
                </button>
              )}
              {message.status === "pending" && (
                <button onClick={stop}>
                  <CircleStop />
                  Stop
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
      {tail?.role === "user" && !generating && (
        <button className="retry-tail" onClick={() => retry()}>
          <RefreshCw />
          Retry response
        </button>
      )}
    </div>
  );
}

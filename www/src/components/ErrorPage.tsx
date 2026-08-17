import { Archive, RefreshCw } from "lucide-react";

export interface ErrorPageProps {
  error: Error;
  retry: () => void;
}

export function ErrorPage({ error, retry }: ErrorPageProps) {
  return (
    <main className="error-page">
      <div className="empty-icon">
        <Archive />
      </div>
      <h1>Local history is unavailable</h1>
      <p>llm-dispatch couldn’t open storage in this browser.</p>
      <button className="primary" onClick={retry}>
        <RefreshCw />
        Try again
      </button>
      <details>
        <summary>Technical details</summary>
        <pre>{error.message}</pre>
      </details>
    </main>
  );
}

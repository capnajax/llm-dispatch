export type InferenceState = "connecting" | "ready" | "offline";

export interface StatusProps {
  state: InferenceState;
}

export function Status({ state }: StatusProps) {
  return (
    <span className={`status ${state}`}>
      <i />
      {state === "ready"
        ? "Ready"
        : state === "connecting"
          ? "Connecting"
          : "Inference offline"}
    </span>
  );
}

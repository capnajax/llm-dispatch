import type { ReactNode } from "react";

export interface IconButtonProps {
  label: string;
  icon: ReactNode;
  className?: string;
  onClick: () => void;
}

export function IconButton({
  label,
  icon,
  className = "",
  onClick,
}: IconButtonProps) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

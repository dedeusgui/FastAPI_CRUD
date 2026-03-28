import type { ReactNode } from "react";

interface StatusBadgeProps {
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`status-badge status-${tone.toLowerCase()}`}>{children}</span>;
}

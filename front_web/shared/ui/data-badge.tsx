import type { ReactNode } from "react";

export type BadgeTone = "accent" | "success" | "danger" | "warning" | "violet" | "neutral" | "dark";

const TONE_CLASSES: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  neutral: "border border-line bg-surface-subtle text-ink",
  dark: "bg-plan-enterprise text-white",
};

export function DataBadge({
  tone,
  dot = false,
  children,
}: {
  tone: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-2xs font-extrabold ${
        dot ? "rounded-full px-2 py-0.5" : "rounded px-2 py-0.5"
      } ${TONE_CLASSES[tone]}`}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type StatTone = "accent" | "success" | "danger" | "warning" | "violet";

const TONE_CLASSES: Record<StatTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
};

export type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  /** Direction of the change line. "up" = green, "down" = red. Defaults to "up". */
  direction?: "up" | "down";
  icon: LucideIcon;
  tone: StatTone;
  index?: number;
};

export function StatCard({ label, value, change, direction = "up", icon, tone, index = 0 }: StatCardProps) {
  const TrendIcon = direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className="min-w-0 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs font-bold leading-4 text-muted">{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${TONE_CLASSES[tone]}`} aria-hidden="true">
          <Icon icon={icon} />
        </span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold leading-none tracking-[-0.055em] text-ink">{value}</p>
      {change ? (
        <p className={`mt-2 flex items-center gap-1 text-2xs font-bold ${direction === "up" ? "text-success" : "text-danger"}`}>
          <TrendIcon className="size-3" strokeWidth={2} aria-hidden="true" />
          {change}
        </p>
      ) : null}
    </article>
  );
}

function Icon({ icon: IconComponent }: { icon: LucideIcon }) {
  return <IconComponent className="size-4" strokeWidth={1.8} />;
}

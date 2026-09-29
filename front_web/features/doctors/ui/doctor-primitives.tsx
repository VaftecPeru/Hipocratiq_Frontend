import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const doctorCard =
  "rounded-[10px] border border-line bg-surface shadow-[0_2px_12px_rgb(16_27_51/4%)]";

type Tone = "blue" | "green" | "orange" | "red" | "violet" | "slate";

const toneStyles: Record<Tone, string> = {
  blue: "bg-accent-soft text-accent",
  green: "bg-success-soft text-success",
  orange: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  violet: "bg-violet-soft text-violet",
  slate: "bg-surface-subtle text-muted",
};

export function DoctorCard({
  children,
  className = "",
  id,
}: Readonly<{ children: React.ReactNode; className?: string; id?: string }>) {
  return <article className={`${doctorCard} ${className}`} id={id}>{children}</article>;
}

export function DoctorAvatar({
  initials,
  tone = "blue",
  size = "md",
}: Readonly<{
  initials: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}>) {
  const sizeClass = size === "sm" ? "size-7 text-[0.55rem]" : size === "lg" ? "size-12 text-xs" : "size-9 text-[0.6rem]";

  return (
    <span className={`grid shrink-0 place-items-center rounded-full border-2 border-white font-extrabold shadow-[0_1px_4px_rgb(16_27_51/16%)] ${sizeClass} ${toneStyles[tone]}`}>
      {initials}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  trend,
  detail,
  href,
  trendTone = "green",
  icon: Icon,
  tone = "blue",
}: Readonly<{
  label: string;
  value: string;
  trend?: string;
  detail?: string;
  href?: string;
  trendTone?: Tone;
  icon: LucideIcon;
  tone?: Tone;
}>) {
  return (
    <DoctorCard className="min-w-0 p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-[10px] ${toneStyles[tone]}`}>
          <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.68rem] font-extrabold text-ink" title={label}>{label}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <strong className="font-mono text-[1.65rem] leading-none tracking-[-0.07em] text-ink">{value}</strong>
            {trend ? <span className={`shrink-0 text-[0.62rem] font-extrabold ${toneStyles[trendTone].split(" ")[1]}`}>{trend}</span> : detail ? <span className="shrink-0 text-right text-[0.56rem] font-bold text-ink-secondary">{detail}</span> : null}
          </div>
        </div>
      </div>
      {href ? <Link className="mt-3 inline-flex text-[0.65rem] font-extrabold text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" href={href}>Ver detalle</Link> : null}
    </DoctorCard>
  );
}

export function SectionHeading({
  title,
  action,
  actionHref,
  onAction,
}: Readonly<{ title: string; action?: string; actionHref?: string; onAction?: () => void }>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[0.86rem] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
      {action && actionHref ? (
        <Link className="inline-flex shrink-0 items-center gap-1 text-[0.62rem] font-extrabold text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" href={actionHref}>
          {action}
          <ChevronRight className="size-3" strokeWidth={2.2} aria-hidden="true" />
        </Link>
      ) : action && onAction ? (
        <button className="inline-flex shrink-0 items-center gap-1 text-[0.62rem] font-extrabold text-accent hover:text-accent-hover focus-visible:outline-3 focus-visible:outline-focus" type="button" onClick={onAction}>
          {action}
          <ChevronRight className="size-3" strokeWidth={2.2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "blue",
}: Readonly<{ children: React.ReactNode; tone?: Tone }>) {
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.58rem] font-extrabold ${toneStyles[tone]}`}>{children}</span>;
}

export function LegendDot({ tone = "blue" }: Readonly<{ tone?: Tone }>) {
  return <span className={`size-2 shrink-0 rounded-full ${toneStyles[tone].split(" ")[0]}`} aria-hidden="true" />;
}

export function Toggle({
  label,
  checked = true,
  onChange,
  disabled = false,
}: Readonly<{ label: string; checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }>) {
  return (
    <button
      className={`relative h-4 w-7 shrink-0 rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-accent" : "bg-line-strong"}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
    >
      <span className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-3.5" : "translate-x-0.5"}`} />
    </button>
  );
}

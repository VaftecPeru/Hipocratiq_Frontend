import type { ReactNode } from "react";

export type DonutSegment = {
  label: string;
  value: string;
  percentage: number;
  /** CSS color: a token like "var(--accent)" or a hex value. */
  color: string;
};

function buildConicGradient(segments: DonutSegment[]): string {
  if (segments.every((segment) => segment.percentage === 0)) {
    return "var(--surface-subtle)";
  }

  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.percentage;

    return `${segment.color} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function DonutChart({
  title,
  centerValue,
  centerLabel,
  segments,
  action,
}: {
  title: string;
  centerValue: string;
  centerLabel: string;
  segments: DonutSegment[];
  action?: ReactNode;
}) {
  const background = buildConicGradient(segments);
  const description = segments.map((segment) => `${segment.label} ${segment.percentage}%`).join(", ");

  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xs font-extrabold">{title}</h2>
        {action}
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div
          className="grid size-28 shrink-0 place-items-center rounded-full p-4"
          style={{ background }}
          role="img"
          aria-label={`${title}: ${description}`}
        >
          <div className="grid size-full place-items-center rounded-full bg-surface text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <div>
              <span className="block font-mono text-lg font-bold leading-none tracking-[-0.05em]">{centerValue}</span>
              <span className="mt-0.5 block text-[0.6rem] font-semibold text-muted">{centerLabel}</span>
            </div>
          </div>
        </div>

        <dl className="grid min-w-0 flex-1 gap-2">
          {segments.map((segment) => (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-2xs" key={segment.label}>
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} aria-hidden="true" />
              <dt className="truncate font-semibold text-ink">{segment.label}</dt>
              <dd className="font-mono whitespace-nowrap text-muted">
                {segment.value} <span className="text-muted/80">({segment.percentage}%)</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

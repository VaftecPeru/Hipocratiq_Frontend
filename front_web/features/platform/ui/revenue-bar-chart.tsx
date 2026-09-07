import { RevenueBarChartInteractive } from "@/features/platform/ui/revenue-bar-chart-interactive";

export type RevenueBarChartPoint = Readonly<{
  id: string;
  label: string;
  amountCents: number | null | undefined;
}>;

type RevenueBarChartProps = Readonly<{
  points: readonly RevenueBarChartPoint[];
  title: string;
  eyebrow?: string;
  description?: string;
  totalLabel?: string;
  totalCents?: number | null;
  chartLabel?: string;
  chartHeightClassName?: string;
  billingHref?: string;
  className?: string;
  id: string;
}>;

type NormalizedRevenuePoint = Readonly<{
  key: string;
  id: string;
  label: string;
  amountCents: number | null;
}>;

const currencyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function normalizeAmount(amountCents: number | null | undefined): number | null {
  return typeof amountCents === "number" && Number.isFinite(amountCents) ? amountCents : null;
}

function formatAmount(amountCents: number | null): string {
  return amountCents === null ? "Sin importe" : currencyFormatter.format(amountCents / 100);
}

function formatChange(current: number, previous: { amountCents: number; label: string } | undefined): string | null {
  if (!previous) return null;
  if (previous.amountCents === 0) return current > 0 ? `Actividad nueva vs. ${previous.label}` : `Sin movimiento vs. ${previous.label}`;

  const change = ((current - previous.amountCents) / Math.abs(previous.amountCents)) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs. ${previous.label}`;
}

export function formatRevenueMonth(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month || "Sin periodo";
  return new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: "UTC" }).format(date);
}

export function RevenueBarChart({
  points,
  title,
  eyebrow,
  description,
  totalLabel = "Total del periodo",
  totalCents,
  chartLabel = "Ingresos mensuales confirmados",
  chartHeightClassName = "h-48",
  billingHref = "/billing",
  className = "",
  id,
}: RevenueBarChartProps) {
  const normalizedPoints: NormalizedRevenuePoint[] = points.map((point, index) => ({
    key: `${point.id || "point"}-${index}`,
    id: point.id || `point-${index}`,
    label: point.label || "Sin periodo",
    amountCents: normalizeAmount(point.amountCents),
  }));
  const realPoints = normalizedPoints.filter((point) => point.amountCents !== null);
  const periodTotalCents = realPoints.reduce((sum, point) => sum + (point.amountCents ?? 0), 0);
  const maxAmountCents = realPoints.reduce((max, point) => Math.max(max, point.amountCents ?? 0), 0);
  const displayTotalCents = normalizeAmount(totalCents) ?? periodTotalCents;
  const pointViews = normalizedPoints.map((point, index) => {
    const amountCents = point.amountCents;
    const previousRealPoint = normalizedPoints
      .slice(0, index)
      .findLast((candidate): candidate is NormalizedRevenuePoint & { amountCents: number } => candidate.amountCents !== null);
    const view = {
      ...point,
      amountLabel: formatAmount(amountCents),
      shareLabel: amountCents === null || periodTotalCents === 0 ? (amountCents === null ? "Sin participación" : "0.0% del periodo") : `${((amountCents / periodTotalCents) * 100).toFixed(1)}% del periodo`,
      changeLabel: amountCents === null ? null : formatChange(amountCents, previousRealPoint),
      heightPercent: amountCents === null || maxAmountCents <= 0 ? 0 : Math.max(0, (amountCents / maxAmountCents) * 100),
    };

    return view;
  });

  const hasPositiveAmount = realPoints.some((point) => (point.amountCents ?? 0) > 0);
  const emptyStateLabel = realPoints.length === 0
    ? "No hay datos de ingresos para este periodo."
    : hasPositiveAmount
      ? null
      : "Sin ingresos confirmados en este periodo.";

  return (
    <article className={`min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)] sm:p-5 ${className}`} aria-labelledby={`${id}-title`}>
      <header className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-accent uppercase">{eyebrow}</p> : null}
          <h2 className="mt-1 text-sm font-extrabold" id={`${id}-title`}>{title}</h2>
          {description ? <p className="mt-0.5 text-2xs text-muted">{description}</p> : null}
        </div>
        <div className="sm:text-right">
          <p className="text-2xs font-semibold text-muted">{totalLabel}</p>
          <p className="mt-0.5 font-mono text-xl font-bold tracking-tighter">{currencyFormatter.format(displayTotalCents / 100)}</p>
        </div>
      </header>
      <RevenueBarChartInteractive points={pointViews} chartLabel={chartLabel} chartHeightClassName={chartHeightClassName} billingHref={billingHref} emptyStateLabel={emptyStateLabel} />
    </article>
  );
}

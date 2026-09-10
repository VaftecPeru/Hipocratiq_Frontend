"use client";

import { useState } from "react";

type RevenueBarChartPointView = {
  key: string;
  id: string;
  label: string;
  amountCents: number | null;
  amountLabel: string;
  shareLabel: string;
  changeLabel: string | null;
  heightPercent: number;
};

type RevenueBarChartInteractiveProps = Readonly<{
  points: readonly RevenueBarChartPointView[];
  chartLabel: string;
  chartHeightClassName: string;
  billingHref: string;
  emptyStateLabel: string | null;
}>;

export function RevenueBarChartInteractive({
  points,
  chartLabel,
  chartHeightClassName,
  billingHref,
  emptyStateLabel,
}: RevenueBarChartInteractiveProps) {
  const initialPoint = [...points].reverse().find((point) => point.amountCents !== null);
  const [selectedId, setSelectedId] = useState(initialPoint?.id ?? null);
  const selected = points.find((point) => point.id === selectedId) ?? initialPoint;

  return (
    <>
      {points.length ? (
        <div
          className={`relative mt-4 grid items-end gap-1.5 border-b border-line px-1 ${chartHeightClassName}`}
          style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
          aria-label={chartLabel}
          role="group"
        >
          {points.map((point) => {
            const isSelected = point.id === selected?.id;

            return (
              <button
                className={`group flex h-full min-w-0 flex-col justify-end border-0 bg-transparent p-0 text-left focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:transition-[background-color,transform] motion-safe:duration-200 ${isSelected ? "rounded-lg bg-accent-soft/60" : "rounded-lg hover:bg-surface-subtle"}`}
                type="button"
                key={point.key}
                aria-label={`Seleccionar ${point.label}: ${point.amountLabel}. ${point.shareLabel} del periodo.`}
                aria-pressed={isSelected}
                data-selected={isSelected}
                onClick={() => setSelectedId(point.id)}
              >
                <span className="flex min-h-0 flex-1 items-end px-1.5 pt-3" aria-hidden="true">
                  <span
                    className={`block w-full rounded-t ${point.amountCents !== null && point.amountCents <= 0 ? "min-h-1" : ""} ${isSelected ? "bg-accent-hover" : "bg-accent"} motion-safe:transition-[height,background-color] motion-safe:duration-200`}
                    style={{ height: `${point.heightPercent}%` }}
                  />
                </span>
                <span className={`w-full truncate px-1 py-2 text-center text-[0.55rem] font-bold capitalize ${isSelected ? "text-accent" : "text-muted"}`}>
                  {point.label}
                </span>
              </button>
            );
          })}
          {emptyStateLabel ? <p className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-xs font-semibold text-muted">{emptyStateLabel}</p> : null}
        </div>
      ) : (
        <div className={`mt-4 grid place-items-center rounded-lg bg-surface-subtle px-4 text-center ${chartHeightClassName}`} role="group" aria-label={chartLabel}>
          <p className="text-xs font-semibold text-muted">{emptyStateLabel ?? "No hay puntos para este periodo."}</p>
        </div>
      )}

      {selected ? (
        <div className="mt-3 rounded-xl border border-line bg-paper px-3 py-2.5" aria-live="polite">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">Periodo</dt>
              <dd className="mt-0.5 truncate text-xs font-bold text-ink">{selected.label}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">Importe</dt>
              <dd className="mt-0.5 truncate font-mono text-xs font-bold text-ink">{selected.amountLabel}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">Participación</dt>
              <dd className="mt-0.5 truncate font-mono text-xs font-bold text-ink">{selected.shareLabel}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">Cambio</dt>
              <dd className="mt-0.5 truncate text-xs font-bold text-ink">{selected.changeLabel ?? "No comparable"}</dd>
            </div>
          </dl>
          <a className="mt-2 inline-flex min-h-7 items-center text-2xs font-bold text-accent underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" href={billingHref}>
            Ver detalle de pagos
          </a>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

/**
 * Piezas de formulario compartidas por los modales de la plataforma.
 * Mantienen métrica y tokens idénticos en todos los módulos.
 */

const FIELD_BASE =
  "h-10 w-full rounded-lg border border-line bg-surface-input px-3 text-xs font-medium text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40";

export function ModalField({
  id,
  label,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
  hint,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-2xs font-bold text-muted" htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      <input className={FIELD_BASE} defaultValue={defaultValue} id={id} max={max} min={min} onChange={onChange} placeholder={placeholder} step={step} type={type} value={value} />
      {hint ? <p className="text-2xs text-muted">{hint}</p> : null}
    </div>
  );
}

export type ModalSelectOption = string | { value: string; label: string };

export function ModalSelect({
  id,
  label,
  options,
  defaultValue,
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: ModalSelectOption[];
  defaultValue?: string;
  required?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-2xs font-bold text-muted" htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      <div className="relative">
        <select className={`${FIELD_BASE} appearance-none pr-9`} defaultValue={defaultValue} id={id} onChange={onChange} value={value}>
          {options.map((option) => {
            const item = typeof option === "string" ? { value: option, label: option } : option;

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function ModalTextarea({
  id,
  label,
  defaultValue,
  placeholder,
  rows = 3,
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-2xs font-bold text-muted" htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      <textarea
        className="w-full resize-none rounded-lg border border-line bg-surface-input p-3 text-xs leading-5 text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40"
        defaultValue={defaultValue}
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </div>
  );
}

/** Cuadrícula responsive para agrupar campos en dos columnas desde `sm`. */
export function ModalGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 }) {
  return <div className={`grid gap-3 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>;
}

/** Fila de detalle etiqueta/valor para modales de solo lectura. */
export function ModalDetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <dt className="shrink-0 text-2xs font-bold text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-xs font-semibold text-ink">{children}</dd>
    </div>
  );
}

export function ModalPrimaryButton({
  children,
  onClick,
  tone = "accent",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "accent" | "danger";
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-bold text-white transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex-initial sm:px-5 ${
        tone === "danger" ? "bg-danger hover:bg-danger/90" : "bg-accent hover:bg-accent-hover"
      }`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function ModalSecondaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      className="flex min-h-9 flex-1 items-center justify-center rounded-lg border border-line bg-surface px-4 text-xs font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-3 focus-visible:outline-focus sm:flex-initial sm:px-5"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

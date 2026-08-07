import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Primitivas compartidas por las vistas de Configuración. Centralizan el
 * tamaño de controles, tipografía y comportamiento responsive para que los
 * seis módulos se vean y escalen igual.
 */

/** Tarjeta base de cada bloque de configuración. */
export function SettingsCard({
  title,
  description,
  icon,
  action,
  titleId,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  titleId: string;
  className?: string;
  children: ReactNode;
}) {
  const Icon = icon;

  return (
    <article
      className={`min-w-0 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] sm:p-4 ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon ? (
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold sm:text-sm" id={titleId}>{title}</h2>
            {description ? <p className="mt-0.5 text-2xs leading-4 text-muted">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}

export type SettingsStatTone = "accent" | "success" | "danger" | "warning" | "violet";

const STAT_TONE: Record<SettingsStatTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
};

export type SettingsStat = {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "success" | "muted";
  icon: LucideIcon;
  tone: SettingsStatTone;
};

/** Tarjeta de indicador de la fila superior de cada módulo. */
export function SettingsStatCard({ stat, index = 0 }: { stat: SettingsStat; index?: number }) {
  const Icon = stat.icon;

  return (
    <article
      className="min-w-0 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both] sm:p-3.5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 ${STAT_TONE[stat.tone]}`} aria-hidden="true">
          <Icon className="size-3.5 sm:size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xs font-bold text-muted">{stat.label}</p>
          <p className="mt-0.5 truncate font-mono text-base font-bold leading-none tracking-[-0.04em] text-ink sm:text-lg">{stat.value}</p>
          {stat.hint ? (
            <p className={`mt-1 truncate text-2xs ${stat.hintTone === "success" ? "font-bold text-success" : "text-muted"}`}>{stat.hint}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Fila de indicadores: 1 columna en móvil muy angosto, 2 en móvil, 4 en escritorio. */
export function SettingsStatGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-2.5 min-[26rem]:grid-cols-2 sm:gap-3 xl:grid-cols-4" aria-label={label}>
      {children}
    </section>
  );
}

const CONTROL_BASE =
  "h-9 w-full rounded-lg border border-line bg-surface-input px-3 text-xs font-medium text-ink outline-none transition-colors focus:border-accent focus:bg-surface focus:ring-3 focus:ring-focus/40";

/** Select con chevron consistente en todos los módulos. */
export function SettingsSelect({
  id,
  label,
  value,
  options,
  valueClassName = "",
  children,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  valueClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-2xs font-bold text-muted" htmlFor={id}>{label}</label>
      <div className="relative">
        {children}
        <select
          className={`${CONTROL_BASE} appearance-none pr-8 ${children ? "pl-10" : ""} ${valueClassName}`}
          defaultValue={value}
          id={id}
        >
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" strokeWidth={1.9} aria-hidden="true" />
      </div>
    </div>
  );
}

/** Campo de texto con la misma métrica que SettingsSelect. */
export function SettingsInput({ id, label, value, type = "text" }: { id: string; label: string; value: string; type?: string }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label className="text-2xs font-bold text-muted" htmlFor={id}>{label}</label>
      <input className={CONTROL_BASE} defaultValue={value} id={id} type={type} />
    </div>
  );
}

/** Interruptor accesible usado en todos los módulos. */
export function SettingsToggle({ label, checked }: { label: string; checked: boolean }) {
  return (
    <button
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${checked ? "bg-accent" : "bg-line"}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-surface shadow-[0_0.0625rem_0.25rem_rgb(16_27_51/25%)] transition-all ${checked ? "left-4.5" : "left-0.5"}`}
        aria-hidden="true"
      />
    </button>
  );
}

/** Nota informativa al pie de una tarjeta. */
export function SettingsNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg bg-accent-soft/60 p-2.5 text-2xs leading-4 text-muted">
      <Info className="mt-px size-3.5 shrink-0 text-accent" strokeWidth={1.9} aria-hidden="true" />
      {children}
    </p>
  );
}

/** Botón de acción principal de cabecera. */
export function SettingsPrimaryButton({ icon, children }: { icon: LucideIcon; children: ReactNode }) {
  const Icon = icon;

  return (
    <button
      className="flex min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
      type="button"
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />{children}
    </button>
  );
}

/** Enlace de acción al pie de una tarjeta o tabla. */
export function SettingsFooterLink({ children }: { children: ReactNode }) {
  return (
    <button
      className="mt-2.5 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg text-2xs font-bold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus"
      type="button"
    >
      {children}<span aria-hidden="true">→</span>
    </button>
  );
}

/** Cabecera de página compartida por los seis módulos. */
export function SettingsPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.15rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">{title}</h1>
        <p className="mt-0.5 text-2xs text-muted sm:text-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}

/**
 * Contenedor de tabla responsive: la tabla se muestra desde `lg`, y por debajo
 * el llamador renderiza tarjetas. Sigue el patrón de /users y /billing.
 */
export function SettingsTableWrap({ children }: { children: ReactNode }) {
  return <div className="mt-3 hidden overflow-x-auto lg:block">{children}</div>;
}

/** Lista de tarjetas que sustituye a la tabla por debajo de `lg`. */
export function SettingsCardList({ children }: { children: ReactNode }) {
  return <ul className="mt-3 grid gap-2.5 lg:hidden">{children}</ul>;
}

/** Encabezado `<thead>` con el estilo compartido. */
export function SettingsTableHead({ columns }: { columns: Array<{ label: string; srOnly?: boolean; align?: "right" }> }) {
  return (
    <thead>
      <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
        {columns.map((column) => (
          <th className={`px-3 py-2.5 font-bold ${column.align === "right" ? "text-right" : ""}`} scope="col" key={column.label}>
            {column.srOnly ? <span className="sr-only">{column.label}</span> : column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Cabecera de página en estado de carga, alineada con SettingsPageHeader. */
export function SettingsHeaderSkeleton({ titleWidth = "12rem", actionWidth = "9rem" }: { titleWidth?: string; actionWidth?: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
      <div className="min-w-0">
        <div className="h-6 rounded-lg bg-line/70 sm:h-7" style={{ width: titleWidth }} />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-line/50" />
      </div>
      <div className="h-9 w-full rounded-lg bg-accent-soft sm:w-auto" style={{ minWidth: actionWidth }} />
    </div>
  );
}

/** Fila de indicadores en estado de carga, alineada con SettingsStatGrid. */
export function SettingsStatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[26rem]:grid-cols-2 sm:gap-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div className="animate-pulse rounded-xl border border-line bg-surface p-3 sm:p-3.5" key={index} style={{ animationDelay: `${index * 70}ms` }}>
          <div className="flex items-center gap-2.5">
            <div className="size-8 shrink-0 rounded-lg bg-accent-soft sm:size-9" />
            <div className="min-w-0 space-y-1.5">
              <div className="h-2.5 w-24 rounded bg-line/50" />
              <div className="h-4 w-16 rounded bg-line/70" />
              <div className="h-2.5 w-20 rounded bg-line/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

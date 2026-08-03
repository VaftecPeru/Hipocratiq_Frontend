"use client";

import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CirclePause,
  Eye,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useReducer, useRef, useState, useTransition } from "react";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import UnitedStatesFlag from "country-flag-icons/react/3x2/US";
import type {
  Clinic,
  ClinicActivity,
  ClinicCountryCode,
  ClinicsDashboardPageData,
  ClinicsFilters,
  ClinicPlan,
  ClinicStatus,
} from "@/features/clinics/model/clinic.types";

type ClinicsDashboardProps = {
  initialData: ClinicsDashboardPageData;
  initialFilters: ClinicsFilters;
};

type FiltersAction =
  | { type: "search"; value: string }
  | { type: "country"; value: ClinicCountryCode | "all" }
  | { type: "plan"; value: ClinicPlan | "all" }
  | { type: "status"; value: ClinicStatus | "all" }
  | { type: "page"; value: number }
  | { type: "previousPage" }
  | { type: "nextPage"; totalPages: number }
  | { type: "clear" };

function filtersReducer(state: ClinicsFilters, action: FiltersAction): ClinicsFilters {
  switch (action.type) {
    case "search":
    case "country":
    case "plan":
    case "status":
      return { ...state, [action.type]: action.value, page: 1 };
    case "page":
      return { ...state, page: action.value };
    case "previousPage":
      return { ...state, page: Math.max(1, state.page - 1) };
    case "nextPage":
      return { ...state, page: Math.min(action.totalPages, state.page + 1) };
    case "clear":
      return { search: "", country: "all", plan: "all", status: "all", page: 1 };
  }
}

const PLAN_LABELS: Record<ClinicPlan, string> = {
  enterprise: "Enterprise",
  professional: "Profesional",
  basic: "Básico",
};

const PLAN_BADGE_CLASSES: Record<ClinicPlan, string> = {
  enterprise: "bg-plan-enterprise text-white",
  professional: "bg-plan-professional text-white",
  basic: "border border-line bg-surface-subtle text-ink",
};

const PLAN_DOT_CLASSES: Record<ClinicPlan, string> = {
  enterprise: "bg-plan-enterprise",
  professional: "bg-plan-professional",
  basic: "bg-plan-basic",
};

const COUNTRY_OPTIONS: Array<{ value: ClinicCountryCode | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "MX", label: "México" },
  { value: "PE", label: "Perú" },
  { value: "US", label: "Estados Unidos" },
];

const PLAN_OPTIONS: Array<{ value: ClinicPlan | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  ...(Object.entries(PLAN_LABELS) as Array<[ClinicPlan, string]>).map(([value, label]) => ({ value, label })),
];

const STATUS_OPTIONS: Array<{ value: ClinicStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activas" },
  { value: "suspended", label: "Suspendidas" },
];

const SEARCH_DEBOUNCE_MS = 350;

// Dropdown propio: el `<select>` nativo no permite estilar las `<option>` en
// Windows (el SO pinta la lista con su tema), así que usamos un listbox custom.
// Se sigue el mismo patrón que `CountrySelect`: el teclado vive en el botón y el
// foco permanece ahí (al cerrar no se pierde), la lista solo resalta visualmente.
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelId = useId();
  const listboxId = `${labelId}-options`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? "";

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = listRef.current?.querySelectorAll("[role=option]");
      (items?.[focusedIndex] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  function open() {
    setIsOpen(true);
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function select(index: number) {
    const option = options[index];

    if (option) onChange(option.value);

    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          select(focusedIndex);
        } else {
          toggle();
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        } else {
          open();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(0);
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setFocusedIndex(options.length - 1);
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  return (
    <div className="grid gap-1 text-2xs font-bold text-muted" ref={containerRef}>
      <span id={labelId}>{label}</span>
      <div className="relative">
        <button
          type="button"
          className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-line bg-surface pr-2.5 pl-2.5 text-xs font-medium text-ink outline-none transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus/40 md:h-8"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          onClick={toggle}
          onKeyDown={handleKeyDown}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`size-3.5 shrink-0 text-muted transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </button>
        {isOpen ? (
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-[calc(100%+0.25rem)] left-0 z-20 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface p-1 shadow-[0_0.5rem_1.5rem_rgb(16_27_51/12%)] motion-safe:animate-[field-error-enter_150ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;

              return (
                <li
                  role="option"
                  aria-selected={isSelected}
                  key={option.value}
                  className={`flex min-h-8 cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-75 ${
                    isFocused ? "bg-surface-subtle" : ""
                  } ${isSelected ? "font-bold text-accent" : "font-medium text-ink"}`}
                  onClick={() => select(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <Check className="size-3.5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

const ACTIVITY_STYLES: Record<ClinicActivity["type"], { icon: typeof Building2; className: string }> = {
  clinic: { icon: Building2, className: "bg-success-soft text-success" },
  plan: { icon: FilePlus2, className: "bg-accent-soft text-accent" },
  payment: { icon: CircleDollarSign, className: "bg-warning-soft text-warning" },
  user: { icon: UserPlus, className: "bg-violet-soft text-violet" },
  suspension: { icon: CirclePause, className: "bg-danger-soft text-danger" },
};

const numberFormatter = new Intl.NumberFormat("es-MX");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function percentageOf(value: number, total: number): string {
  return total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);
}

function paginationItems(currentPage: number, lastPage: number): Array<number | "ellipsis"> {
  const pages = Array.from(
    new Set(
      [1, lastPage, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
        .filter((page) => page >= 1 && page <= lastPage),
    ),
  ).sort((a, b) => a - b);

  return pages.flatMap((page, index) => {
    const previous = pages[index - 1];

    return previous && page - previous > 1 ? ["ellipsis", page] : [page];
  });
}

function CountryFlag({ countryCode }: { countryCode: ClinicCountryCode }) {
  const Flag = countryCode === "MX" ? MexicoFlag : countryCode === "PE" ? PeruFlag : UnitedStatesFlag;

  return <Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" />;
}

function MetricCard({
  label,
  value,
  helper,
  tone,
  index = 0,
}: {
  label: string;
  value: number;
  helper: string;
  tone: "accent" | "warning" | "violet";
  index?: number;
}) {
  const toneClasses = {
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    violet: "bg-violet-soft text-violet",
  }[tone];
  const borderClasses = {
    accent: "border-t-accent",
    warning: "border-t-warning",
    violet: "border-t-violet",
  }[tone];
  const Icon = tone === "warning" ? CirclePause : Building2;

  return (
    <article
      className={`flex min-h-22 items-center gap-3 rounded-xl border border-line border-t-2 ${borderClasses} bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneClasses}`} aria-hidden="true">
        <Icon className="size-4" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="font-mono text-base font-bold leading-tight tracking-[-0.04em] text-ink">{numberFormatter.format(value)}</p>
        <p className={`mt-0.5 text-2xs font-bold ${tone === "warning" ? "text-warning" : tone === "violet" ? "text-violet" : "text-accent"}`}>{helper}</p>
      </div>
    </article>
  );
}

function PlanDistributionCard({ data }: { data: ClinicsDashboardPageData["planDistribution"] }) {
  const enterprisePct = data.find((d) => d.plan === "enterprise")?.percentage ?? 0;
  const professionalPct = data.find((d) => d.plan === "professional")?.percentage ?? 0;
  const basicPct = data.find((d) => d.plan === "basic")?.percentage ?? 0;
  const hasSubscriptions = data.some((item) => item.count > 0);
  const stop1 = enterprisePct;
  const stop2 = stop1 + professionalPct;
  const background = hasSubscriptions
    ? `conic-gradient(var(--plan-enterprise) 0 ${stop1}%, var(--plan-professional) ${stop1}% ${stop2}%, var(--plan-basic) ${stop2}% 100%)`
    : "var(--surface-subtle)";
  const distributionLabel = hasSubscriptions
    ? `Enterprise ${enterprisePct}%, Profesional ${professionalPct}% y Básico ${basicPct}%`
    : "No hay suscripciones activas";

  return (
    <article className="grid min-h-22 grid-cols-[3.25rem_1fr] items-center gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]" style={{ animationDelay: "240ms" }}>
      <div
        className="size-13 rounded-full p-1.5"
        style={{ background }}
        role="img"
        aria-label={distributionLabel}
      >
        <div className="size-full rounded-full bg-surface" />
      </div>
      <div>
        <h2 className="text-xs font-extrabold">Distribución por plan</h2>
        <ul className="mt-1.5 grid min-w-32 gap-1">
          {data.map((item) => (
            <li className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-2xs" key={item.plan}>
              <span className={`size-1.5 rounded-full ${PLAN_DOT_CLASSES[item.plan]}`} aria-hidden="true" />
              <span>{PLAN_LABELS[item.plan]}</span>
              <span className="font-mono text-muted">{item.count} ({item.percentage}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ClinicActions({ clinicName }: { clinicName: string }) {
  return (
    <div className="flex justify-end gap-1">
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Ver ${clinicName}`} disabled title="Disponible al conectar el detalle de clínicas">
        <Eye className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Editar ${clinicName}`} disabled title="Disponible al conectar la edición de clínicas">
        <Pencil className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Más acciones para ${clinicName}`} disabled title="Disponible al conectar acciones de clínicas">
        <MoreHorizontal className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
    </div>
  );
}

function PlanBadge({ plan }: { plan: ClinicPlan }) {
  return <span className={`inline-flex rounded px-2 py-0.5 text-2xs font-extrabold ${PLAN_BADGE_CLASSES[plan]}`}>{PLAN_LABELS[plan]}</span>;
}

function StatusBadge({ status }: { status: ClinicStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-extrabold ${status === "active" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status === "active" ? "Activa" : "Suspendida"}
    </span>
  );
}

function ClinicsTable({
  clinics,
  rowOffset,
  hasActiveFilters,
}: {
  clinics: Clinic[];
  rowOffset: number;
  hasActiveFilters: boolean;
}) {
  if (clinics.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center px-6 py-12 text-center" role="status">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent-soft text-accent" aria-hidden="true"><Search className="size-5" /></span>
          <h3 className="mt-4 text-xs font-extrabold">
            {hasActiveFilters ? "No encontramos coincidencias" : "Todavía no hay clínicas registradas"}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
            {hasActiveFilters
              ? "Prueba otro nombre o limpia filtros para ampliar resultados."
              : "Las clínicas aparecerán aquí cuando se complete el primer registro."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">Clínicas y tenants administrados</caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="w-10 px-3 py-2.5 font-bold" scope="col">#</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Clínica / Tenant</th>
              <th className="px-3 py-2.5 font-bold" scope="col">País / Ciudad</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Plan</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Usuarios</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Pacientes</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Estado</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Facturación</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Último pago</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {clinics.map((clinic, index) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={clinic.id}>
                <td className="px-3 py-2 font-mono text-muted">{rowOffset + index + 1}.</td>
                <th className="px-3 py-2" scope="row">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-subtle text-muted" aria-hidden="true"><Building2 className="size-3.5" strokeWidth={1.7} /></span>
                    <span className="whitespace-nowrap font-bold">{clinic.name}</span>
                  </div>
                </th>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2"><CountryFlag countryCode={clinic.countryCode} /><span className="leading-3.5 text-muted">{clinic.country}<br />{clinic.city}</span></div>
                </td>
                <td className="px-3 py-2"><PlanBadge plan={clinic.plan} /></td>
                <td className="px-3 py-2 text-right font-mono">{numberFormatter.format(clinic.users)}</td>
                <td className="px-3 py-2 text-right font-mono">{numberFormatter.format(clinic.patients)}</td>
                <td className="px-3 py-2"><StatusBadge status={clinic.status} /></td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{currencyFormatter.format(clinic.monthlyBilling)}</td>
                <td className="whitespace-nowrap px-3 py-2">{clinic.lastPayment ?? "—"}</td>
                <td className="px-2 py-1.5"><ClinicActions clinicName={clinic.name} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {clinics.map((clinic) => (
          <article className="rounded-xl border border-line p-4" key={clinic.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-subtle text-muted" aria-hidden="true"><Building2 className="size-4" /></span>
                <div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{clinic.name}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><CountryFlag countryCode={clinic.countryCode} />{clinic.city}, {clinic.country}</p></div>
              </div>
              <StatusBadge status={clinic.status} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3 text-xs">
              <div><dt className="text-muted">Plan</dt><dd className="mt-1"><PlanBadge plan={clinic.plan} /></dd></div>
              <div><dt className="text-muted">Usuarios</dt><dd className="mt-1 font-mono font-bold">{clinic.users}</dd></div>
              <div><dt className="text-muted">Pacientes</dt><dd className="mt-1 font-mono font-bold">{numberFormatter.format(clinic.patients)}</dd></div>
            </dl>
            <div className="mt-2 flex items-center justify-between"><p className="text-xs text-muted">{currencyFormatter.format(clinic.monthlyBilling)} / mes</p><ClinicActions clinicName={clinic.name} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

function SummaryPanel({ data }: { data: ClinicsDashboardPageData }) {
  const summaryRows = [
    { label: "Total de clínicas", value: numberFormatter.format(data.totals.clinics), icon: Building2 },
    { label: "Total de usuarios", value: numberFormatter.format(data.totals.users), icon: Users },
    { label: "Total de pacientes", value: numberFormatter.format(data.totals.patients), icon: UserPlus },
    { label: "Ingresos mensuales", value: currencyFormatter.format(data.totals.monthlyRevenue), icon: CircleDollarSign },
    { label: "Ingresos anuales (YTD)", value: currencyFormatter.format(data.totals.annualRevenue), icon: TrendingUp },
  ];

  return (
    <aside className="grid content-start gap-3" aria-label="Resumen y actividad">
      <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
        <h2 className="text-xs font-extrabold">Resumen general</h2>
        <dl className="mt-3 grid gap-2.5">
          {summaryRows.map((item) => {
            const Icon = item.icon;
            return <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.label}><span className="grid size-7 place-items-center rounded-md bg-surface-subtle text-muted" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span><dt className="text-xs text-muted">{item.label}</dt><dd className="font-mono text-xs font-bold">{item.value}</dd></div>;
          })}
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-extrabold">Actividad reciente</h2><span className="size-2 rounded-full bg-success shadow-[0_0_0_0.2rem_var(--success-soft)]" aria-label="Datos cargados desde el servidor" /></div>
        <ol className="mt-3 grid gap-3">
          {data.recentActivity.length === 0 ? (
            <li className="rounded-lg bg-surface-subtle px-3 py-4 text-center text-xs text-muted">
              Aún no hay actividad de clínicas.
            </li>
          ) : null}
          {data.recentActivity.map((activity) => {
            const activityStyle = ACTIVITY_STYLES[activity.type];
            const Icon = activityStyle.icon;
            return (
              <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2" key={activity.id}>
                <span className={`grid size-7 place-items-center rounded-md ${activityStyle.className}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span>
                <div><p className="text-xs font-extrabold">{activity.title}</p><p className="mt-0.5 text-2xs text-muted">{activity.detail}</p></div>
                <time className="whitespace-nowrap text-2xs text-muted">{activity.occurredAt}</time>
              </li>
            );
          })}
        </ol>
        <button className="mt-3 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la actividad global">Ver toda la actividad<ArrowUpRight className="size-3" aria-hidden="true" /></button>
      </section>
    </aside>
  );
}

export function ClinicsDashboard({ initialData, initialFilters }: ClinicsDashboardProps) {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  const { search, country, plan, status } = filters;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPage = initialData.pagination.currentPage;
  const totalPages = initialData.pagination.lastPage;
  const rowOffset = (currentPage - 1) * initialData.pagination.perPage;
  const hasActiveFilters =
    Boolean(search.trim()) ||
    country !== "all" ||
    plan !== "all" ||
    status !== "all";

  useEffect(() => () => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
  }, []);

  function navigate(next: ClinicsFilters) {
    const params = new URLSearchParams();

    if (next.search.trim()) params.set("q", next.search.trim());
    if (next.country !== "all") params.set("country", next.country);
    if (next.plan !== "all") params.set("plan", next.plan);
    if (next.status !== "all") params.set("status", next.status);
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  function cancelSearchDebounce() {
    if (searchDebounce.current) {
      clearTimeout(searchDebounce.current);
      searchDebounce.current = null;
    }
  }

  function updateFilter(action: FiltersAction) {
    cancelSearchDebounce();
    const next = filtersReducer(filters, action);

    dispatch(action);
    navigate(next);
  }

  // El input se actualiza al instante (foco intacto); la navegación se difiere
  // para no refetchear en cada tecla ni remontar el dashboard mientras se escribe.
  function updateSearch(value: string) {
    const next = filtersReducer(filters, { type: "search", value });

    dispatch({ type: "search", value });
    cancelSearchDebounce();
    searchDebounce.current = setTimeout(() => navigate(next), SEARCH_DEBOUNCE_MS);
  }

  function clearFilters() {
    updateFilter({ type: "clear" });
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div>
        <p className="text-xs font-bold tracking-[0.13em] text-accent uppercase">Administración global</p>
        <h1 className="mt-0.5 font-display text-[clamp(1.3rem,1.8vw,1.6rem)] italic tracking-[-0.02em]">Clínicas <span className="not-italic font-sans font-extrabold text-muted">/ Tenants</span></h1>
        <p className="mt-0.5 text-xs text-muted">Administra clínicas, planes y estado operativo desde un solo lugar.</p>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(11rem,0.8fr))_minmax(19rem,1.45fr)]" aria-label="Indicadores de clínicas">
        <MetricCard label="Clínicas activas" value={initialData.totals.activeClinics} helper={`${percentageOf(initialData.totals.activeClinics, initialData.totals.clinics)}% del total`} tone="accent" index={0} />
        <MetricCard label="Clínicas suspendidas" value={initialData.totals.suspendedClinics} helper={`${percentageOf(initialData.totals.suspendedClinics, initialData.totals.clinics)}% del total`} tone="warning" index={1} />
        <MetricCard label="Total de clínicas" value={initialData.totals.clinics} helper="Datos consolidados del sistema" tone="violet" index={2} />
        <PlanDistributionCard data={initialData.planDistribution} />
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de clínicas">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(8rem,1fr))_minmax(15rem,1.6fr)_auto]">
          <FilterSelect
            label="País"
            value={country}
            options={COUNTRY_OPTIONS}
            onChange={(value) => updateFilter({ type: "country", value })}
          />
          <FilterSelect
            label="Plan"
            value={plan}
            options={PLAN_OPTIONS}
            onChange={(value) => updateFilter({ type: "plan", value })}
          />
          <FilterSelect
            label="Estado"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(value) => updateFilter({ type: "status", value })}
          />
          <label className="grid gap-1 text-2xs font-bold text-muted">Buscar clínica<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" value={search} placeholder="Nombre de la clínica..." onChange={(event) => updateSearch(event.target.value)} /></span></label>
          <button className={`mt-auto flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus md:min-h-8 ${hasActiveFilters ? "border-accent bg-accent-soft text-accent hover:bg-accent-soft-hover" : "border-line text-muted"}`} type="button" onClick={clearFilters} disabled={!hasActiveFilters}><SlidersHorizontal className="size-3" strokeWidth={1.7} aria-hidden="true" />{hasActiveFilters ? "Limpiar" : "Filtros"}</button>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="clinics-results-title" aria-busy={isPending}>
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="clinics-results-title">{hasActiveFilters ? `${numberFormatter.format(initialData.pagination.total)} coincidencias` : `${numberFormatter.format(initialData.totals.clinics)} clínicas encontradas`}</h2>{isPending ? <span className="text-2xs font-bold text-accent" role="status">Actualizando...</span> : <span className="hidden text-2xs text-muted sm:block">Datos operativos consolidados</span>}</div>
          <ClinicsTable clinics={initialData.clinics} rowOffset={rowOffset} hasActiveFilters={hasActiveFilters} />
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-2xs text-muted">Mostrando {initialData.pagination.from ?? 0} a {initialData.pagination.to ?? 0} de {initialData.pagination.total} clínicas</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página anterior" disabled={currentPage === 1 || isPending} onClick={() => updateFilter({ type: "previousPage" })}><ChevronLeft className="size-3" aria-hidden="true" /></button>
              {paginationItems(currentPage, totalPages).map((item, index) => item === "ellipsis"
                ? <span className="grid size-7 place-items-center text-xs text-muted" key={`ellipsis-${index}`} aria-hidden="true">…</span>
                : <button className={`grid size-7 place-items-center rounded-md text-xs font-bold focus-visible:outline-3 focus-visible:outline-focus ${item === currentPage ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={item} aria-label={`Página ${item}`} aria-current={item === currentPage ? "page" : undefined} disabled={isPending} onClick={() => updateFilter({ type: "page", value: item })}>{item}</button>)}
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página siguiente" disabled={currentPage === totalPages || isPending} onClick={() => updateFilter({ type: "nextPage", totalPages })}><ChevronRight className="size-3" aria-hidden="true" /></button>
            </div>
          </div>
        </section>
        <SummaryPanel data={initialData} />
      </div>
    </div>
  );
}

"use client";

import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CirclePause,
  Eye,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";
import MexicoFlag from "country-flag-icons/react/3x2/MX";
import PeruFlag from "country-flag-icons/react/3x2/PE";
import type {
  Clinic,
  ClinicActivity,
  ClinicCountryCode,
  ClinicPlan,
  ClinicsDashboardData,
  ClinicStatus,
} from "@/features/clinics/model/clinic.types";

type ClinicsDashboardProps = {
  initialData: ClinicsDashboardData;
  initialSearch?: string;
};

const PLAN_LABELS: Record<ClinicPlan, string> = {
  enterprise: "Enterprise",
  professional: "Profesional",
  basic: "Básico",
};

const PLAN_BADGE_CLASSES: Record<ClinicPlan, string> = {
  enterprise: "bg-[#173a67] text-white",
  professional: "bg-accent text-white",
  basic: "bg-[#5798ef] text-white",
};

const PLAN_DOT_CLASSES: Record<ClinicPlan, string> = {
  enterprise: "bg-[#173a67]",
  professional: "bg-accent",
  basic: "bg-[#5798ef]",
};

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

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function CountryFlag({ countryCode }: { countryCode: ClinicCountryCode }) {
  const Flag = countryCode === "MX" ? MexicoFlag : PeruFlag;

  return <Flag className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" />;
}

function MetricCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  tone: "accent" | "warning" | "violet";
}) {
  const toneClasses = {
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    violet: "bg-violet-soft text-violet",
  }[tone];
  const Icon = tone === "warning" ? CirclePause : Building2;

  return (
    <article className="flex min-h-22 items-center gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneClasses}`} aria-hidden="true">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.62rem] font-semibold text-muted">{label}</p>
        <p className="font-mono text-lg font-bold leading-tight tracking-[-0.04em] text-ink">{numberFormatter.format(value)}</p>
        <p className={`mt-0.5 text-[0.58rem] font-bold ${tone === "warning" ? "text-warning" : tone === "violet" ? "text-violet" : "text-accent"}`}>{helper}</p>
      </div>
    </article>
  );
}

function PlanDistributionCard({ data }: { data: ClinicsDashboardData["planDistribution"] }) {
  return (
    <article className="grid min-h-22 grid-cols-[3.25rem_1fr] items-center gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <div
        className="size-13 rounded-full bg-[conic-gradient(#173a67_0_35%,#0862dd_35%_76%,#5798ef_76%_100%)] p-1.5"
        role="img"
        aria-label="Enterprise 35%, Profesional 41% y Básico 24%"
      >
        <div className="size-full rounded-full bg-surface" />
      </div>
      <div>
        <h2 className="text-[0.68rem] font-extrabold">Distribución por plan</h2>
        <ul className="mt-1.5 grid min-w-32 gap-1">
          {data.map((item) => (
            <li className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-[0.57rem]" key={item.plan}>
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
      <button className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Ver ${clinicName}`} disabled title="Disponible al conectar el detalle de clínicas">
        <Eye className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Editar ${clinicName}`} disabled title="Disponible al conectar la edición de clínicas">
        <Pencil className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" aria-label={`Más acciones para ${clinicName}`} disabled title="Disponible al conectar acciones de clínicas">
        <MoreHorizontal className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}

function PlanBadge({ plan }: { plan: ClinicPlan }) {
  return <span className={`inline-flex rounded px-2 py-0.5 text-[0.54rem] font-extrabold ${PLAN_BADGE_CLASSES[plan]}`}>{PLAN_LABELS[plan]}</span>;
}

function StatusBadge({ status }: { status: ClinicStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.54rem] font-extrabold ${status === "active" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status === "active" ? "Activa" : "Suspendida"}
    </span>
  );
}

function ClinicsTable({ clinics, rowOffset }: { clinics: Clinic[]; rowOffset: number }) {
  if (clinics.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center px-6 py-12 text-center" role="status">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent-soft text-accent" aria-hidden="true"><Search className="size-5" /></span>
          <h3 className="mt-4 text-sm font-extrabold">No encontramos clínicas</h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted">Prueba otro nombre o limpia filtros para ampliar resultados.</p>
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
            <tr className="border-b border-line bg-surface-subtle/50 text-[0.54rem] font-bold text-muted">
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
              <tr className="text-[0.62rem] transition-colors hover:bg-accent-soft/35" key={clinic.id}>
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
                <div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{clinic.name}</h3><p className="mt-1 flex items-center gap-1.5 text-[0.64rem] text-muted"><CountryFlag countryCode={clinic.countryCode} />{clinic.city}, {clinic.country}</p></div>
              </div>
              <StatusBadge status={clinic.status} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3 text-[0.62rem]">
              <div><dt className="text-muted">Plan</dt><dd className="mt-1"><PlanBadge plan={clinic.plan} /></dd></div>
              <div><dt className="text-muted">Usuarios</dt><dd className="mt-1 font-mono font-bold">{clinic.users}</dd></div>
              <div><dt className="text-muted">Pacientes</dt><dd className="mt-1 font-mono font-bold">{numberFormatter.format(clinic.patients)}</dd></div>
            </dl>
            <div className="mt-2 flex items-center justify-between"><p className="text-[0.62rem] text-muted">{currencyFormatter.format(clinic.monthlyBilling)} / mes</p><ClinicActions clinicName={clinic.name} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

function SummaryPanel({ data }: { data: ClinicsDashboardData }) {
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
            return <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.label}><span className="grid size-7 place-items-center rounded-md bg-surface-subtle text-muted" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span><dt className="text-[0.61rem] text-muted">{item.label}</dt><dd className="font-mono text-[0.61rem] font-bold">{item.value}</dd></div>;
          })}
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-extrabold">Actividad reciente</h2><span className="size-2 rounded-full bg-success shadow-[0_0_0_0.2rem_var(--success-soft)]" aria-label="Actualización en tiempo real" /></div>
        <ol className="mt-3 grid gap-3">
          {data.recentActivity.map((activity) => {
            const activityStyle = ACTIVITY_STYLES[activity.type];
            const Icon = activityStyle.icon;
            return (
              <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2" key={activity.id}>
                <span className={`grid size-7 place-items-center rounded-md ${activityStyle.className}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
                <div><p className="text-[0.61rem] font-extrabold">{activity.title}</p><p className="mt-0.5 text-[0.54rem] text-muted">{activity.detail}</p></div>
                <time className="whitespace-nowrap text-[0.52rem] text-muted">{activity.occurredAt}</time>
              </li>
            );
          })}
        </ol>
        <button className="mt-3 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg text-[0.61rem] font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la actividad global">Ver toda la actividad<ArrowUpRight className="size-3.5" aria-hidden="true" /></button>
      </section>
    </aside>
  );
}

export function ClinicsDashboard({ initialData, initialSearch = "" }: ClinicsDashboardProps) {
  const [search, setSearch] = useState(initialSearch);
  const [country, setCountry] = useState<ClinicCountryCode | "all">("all");
  const [plan, setPlan] = useState<ClinicPlan | "all">("all");
  const [status, setStatus] = useState<ClinicStatus | "all">("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const pageSize = 10;
  const normalizedSearch = normalizeSearch(deferredSearch);
  const cities = Array.from(new Set(initialData.clinics.map((clinic) => clinic.city))).sort((a, b) => a.localeCompare(b, "es"));
  const filteredClinics = initialData.clinics.filter((clinic) => {
    const searchableContent = normalizeSearch(`${clinic.name} ${clinic.country} ${clinic.city}`);
    return (
      (!normalizedSearch || searchableContent.includes(normalizedSearch)) &&
      (country === "all" || clinic.countryCode === country) &&
      (plan === "all" || clinic.plan === plan) &&
      (status === "all" || clinic.status === status) &&
      (city === "all" || clinic.city === city)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredClinics.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rowOffset = (currentPage - 1) * pageSize;
  const paginatedClinics = filteredClinics.slice(rowOffset, rowOffset + pageSize);
  const hasActiveFilters = Boolean(search) || country !== "all" || plan !== "all" || status !== "all" || city !== "all";

  function updateFilter(update: () => void) {
    startTransition(() => {
      update();
      setPage(1);
    });
  }

  function clearFilters() {
    startTransition(() => {
      setSearch("");
      setCountry("all");
      setPlan("all");
      setStatus("all");
      setCity("all");
      setPage(1);
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><p className="text-[0.56rem] font-bold tracking-[0.13em] text-accent uppercase">Administración global</p><h1 className="mt-0.5 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.035em]">Clínicas <span className="font-medium text-muted">/ Tenants</span></h1><p className="mt-0.5 text-[0.68rem] text-muted">Administra clínicas, planes y estado operativo desde un solo lugar.</p></div>
        <button className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-[0.68rem] font-bold text-white shadow-[0_0.3rem_0.8rem_rgb(8_98_221/16%)] transition-transform active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" disabled title="Disponible al habilitar el endpoint de creación"><Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />Nueva clínica</button>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(11rem,0.8fr))_minmax(19rem,1.45fr)]" aria-label="Indicadores de clínicas">
        <MetricCard label="Clínicas activas" value={initialData.totals.activeClinics} helper={`${((initialData.totals.activeClinics / initialData.totals.clinics) * 100).toFixed(1)}% del total`} tone="accent" />
        <MetricCard label="Clínicas suspendidas" value={initialData.totals.suspendedClinics} helper={`${((initialData.totals.suspendedClinics / initialData.totals.clinics) * 100).toFixed(1)}% del total`} tone="warning" />
        <MetricCard label="Total de clínicas" value={initialData.totals.clinics} helper="Cobertura MX + PE" tone="violet" />
        <PlanDistributionCard data={initialData.planDistribution} />
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de clínicas">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(8rem,1fr))_minmax(15rem,1.35fr)_auto]">
          <label className="grid gap-1 text-[0.58rem] font-bold text-muted">País<select className="h-11 rounded-lg border border-line bg-surface px-3 text-[0.68rem] font-medium text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-9" value={country} onChange={(event) => updateFilter(() => setCountry(event.target.value as ClinicCountryCode | "all"))}><option value="all">Todos</option><option value="MX">México</option><option value="PE">Perú</option></select></label>
          <label className="grid gap-1 text-[0.58rem] font-bold text-muted">Plan<select className="h-11 rounded-lg border border-line bg-surface px-3 text-[0.68rem] font-medium text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-9" value={plan} onChange={(event) => updateFilter(() => setPlan(event.target.value as ClinicPlan | "all"))}><option value="all">Todos</option>{Object.entries(PLAN_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="grid gap-1 text-[0.58rem] font-bold text-muted">Estado<select className="h-11 rounded-lg border border-line bg-surface px-3 text-[0.68rem] font-medium text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-9" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value as ClinicStatus | "all"))}><option value="all">Todos</option><option value="active">Activas</option><option value="suspended">Suspendidas</option></select></label>
          <label className="grid gap-1 text-[0.58rem] font-bold text-muted">Ciudad<select className="h-11 rounded-lg border border-line bg-surface px-3 text-[0.68rem] font-medium text-ink outline-none focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-9" value={city} onChange={(event) => updateFilter(() => setCity(event.target.value))}><option value="all">Todas</option>{cities.map((cityName) => <option value={cityName} key={cityName}>{cityName}</option>)}</select></label>
          <label className="grid gap-1 text-[0.58rem] font-bold text-muted">Buscar clínica<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" strokeWidth={1.8} aria-hidden="true" /><input className="h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-[0.68rem] font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-9" type="search" value={search} placeholder="Nombre, país o ciudad..." onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></span></label>
          <button className={`mt-auto flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 text-[0.68rem] font-bold transition-colors focus-visible:outline-3 focus-visible:outline-focus md:min-h-9 ${hasActiveFilters ? "border-accent bg-accent-soft text-accent hover:bg-[#dbeaff]" : "border-line text-muted"}`} type="button" onClick={clearFilters} disabled={!hasActiveFilters}><SlidersHorizontal className="size-3.5" strokeWidth={1.8} aria-hidden="true" />{hasActiveFilters ? "Limpiar" : "Filtros"}</button>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="clinics-results-title" aria-busy={isPending}>
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4"><h2 className="text-[0.68rem] font-extrabold" id="clinics-results-title">{hasActiveFilters ? `${filteredClinics.length} coincidencias` : `${numberFormatter.format(initialData.totals.clinics)} clínicas encontradas`}</h2>{isPending ? <span className="text-[0.56rem] font-bold text-accent" role="status">Actualizando...</span> : <span className="hidden text-[0.56rem] text-muted sm:block">Datos operativos consolidados</span>}</div>
          <ClinicsTable clinics={paginatedClinics} rowOffset={rowOffset} />
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-[0.58rem] text-muted">Mostrando {filteredClinics.length === 0 ? 0 : rowOffset + 1} a {Math.min(rowOffset + pageSize, filteredClinics.length)} de {filteredClinics.length} clínicas cargadas</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-8 place-items-center rounded-md border border-line text-muted disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft className="size-3.5" aria-hidden="true" /></button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button className={`grid size-8 place-items-center rounded-md text-[0.65rem] font-bold focus-visible:outline-3 focus-visible:outline-focus ${pageNumber === currentPage ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={pageNumber} aria-label={`Página ${pageNumber}`} aria-current={pageNumber === currentPage ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
              <button className="grid size-8 place-items-center rounded-md border border-line text-muted disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-focus" type="button" aria-label="Página siguiente" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight className="size-3.5" aria-hidden="true" /></button>
            </div>
          </div>
        </section>
        <SummaryPanel data={initialData} />
      </div>
    </div>
  );
}

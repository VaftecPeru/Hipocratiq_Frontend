"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart,
  Globe2,
  History,
  KeyRound,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  Stethoscope,
  TicketCheck,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAdminAuditEvents } from "@/features/platform/api/browser-audit";
import type { AuditEvent, AuditFilters, AuditSummary } from "@/features/platform/model/audit.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { PlatformModuleLoading } from "@/shared/ui/platform-module-loading";

const EMPTY_SUMMARY: AuditSummary = {
  totals: { events: 0, uniqueUsers: 0, countries: 0, critical: 0 },
  topModules: [],
  byCountry: [],
  criticalEvents: [],
  recentChanges: [],
  generatedAt: "",
};

const MODULE_META: Record<string, { label: string; icon: LucideIcon; classes: string }> = {
  authentication: { label: "Autenticación", icon: KeyRound, classes: "bg-violet-soft text-violet" },
  access_control: { label: "Control de acceso", icon: ShieldCheck, classes: "bg-violet-soft text-violet" },
  billing: { label: "Facturación", icon: CreditCard, classes: "bg-warning-soft text-warning" },
  clinics: { label: "Clínicas", icon: Building2, classes: "bg-accent-soft text-accent" },
  monitoring: { label: "Monitoreo", icon: Activity, classes: "bg-danger-soft text-danger" },
  reports: { label: "Reportes", icon: FileBarChart, classes: "bg-success-soft text-success" },
  support: { label: "Soporte", icon: TicketCheck, classes: "bg-accent-soft text-accent" },
  emergency: { label: "Emergencia", icon: Siren, classes: "bg-danger-soft text-danger" },
  memberships: { label: "Membresías", icon: UsersRound, classes: "bg-success-soft text-success" },
  settings: { label: "Configuración", icon: Settings2, classes: "bg-warning-soft text-warning" },
  specialties: { label: "Especialidades", icon: Stethoscope, classes: "bg-accent-soft text-accent" },
  users: { label: "Usuarios", icon: UserCog, classes: "bg-violet-soft text-violet" },
};

const ACTION_LABELS: Record<string, string> = {
  ticket_created: "Creó ticket",
  ticket_updated: "Actualizó ticket",
  ticket_commented: "Agregó nota al ticket",
  clinic_created: "Creó clínica",
  clinic_updated: "Actualizó clínica",
  specialty_created: "Creó especialidad",
  specialty_updated: "Actualizó especialidad",
  user_access_updated: "Actualizó acceso de usuario",
  user_updated: "Actualizó usuario",
  user_status_updated: "Actualizó estado de usuario",
  manual_payment_recorded: "Registró pago manual",
  manual_payment_refunded: "Reembolsó pago manual",
  billing_exported: "Exportó facturación",
  executive_report_exported: "Exportó reporte ejecutivo",
  incident_created: "Creó incidente",
  incident_status_updated: "Actualizó estado del incidente",
  incident_resolved: "Resolvió incidente",
  plan_created: "Creó plan",
  plan_updated: "Actualizó plan",
  subscription_created: "Creó suscripción",
  subscription_upgraded: "Actualizó suscripción",
  subscription_canceled: "Canceló suscripción",
  platform_region_updated: "Cambió configuración regional",
  login_succeeded: "Inicio de sesión exitoso",
  login_failed: "Intento de acceso fallido",
  logout: "Cerró sesión",
  logout_all: "Cerró todas las sesiones",
  password_reset: "Restableció contraseña",
  otp_failed: "OTP inválido",
  otp_verified: "OTP verificado",
  emergency_policy_updated: "Actualizó política de emergencia",
  emergency_policy_published: "Publicó política global de emergencia",
};

const numberFormatter = new Intl.NumberFormat("es-MX");
function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function moduleMeta(module: string) {
  return MODULE_META[module] ?? { label: module, icon: Activity, classes: "bg-surface-subtle text-muted" };
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replaceAll("_", " ");
}

function eventAction(event: AuditEvent): string {
  return actionLabel(event.action);
}

function EventResource({ event }: { event: AuditEvent }) {
  const label = event.resource?.label ?? event.clinic?.name ?? "Plataforma global";
  return <span className="block max-w-52 truncate text-2xs text-muted" title={label ?? undefined}>{label}</span>;
}

function Filters({ filters, modules, actions, countries, onChange }: { filters: AuditFilters; modules: string[]; actions: string[]; countries: string[]; onChange: (changes: Partial<AuditFilters>) => void }) {
  return (
    <section className="grid gap-3 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)] md:grid-cols-2 xl:grid-cols-[minmax(15rem,1.6fr)_repeat(3,minmax(9rem,1fr))]" aria-label="Filtros de auditoría">
      <label className="grid gap-1 text-2xs font-bold text-muted"><span>Buscar usuario, recurso, acción o IP</span><span className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2" /><input className="h-9 w-full rounded-lg border border-line bg-surface-input pl-9 pr-3 text-xs outline-none focus:border-accent focus:ring-3 focus:ring-focus/40" type="search" value={filters.search ?? ""} onChange={(event) => onChange({ search: event.target.value, page: 1 })} /></span></label>
      <FilterSelect label="Módulo" value={filters.module ?? ""} options={[{ value: "", label: "Todos" }, ...modules.map((module) => ({ value: module, label: moduleMeta(module).label }))]} onChange={(module) => onChange({ module: module || undefined, page: 1 })} />
      <FilterSelect label="Acción" value={filters.action ?? ""} options={[{ value: "", label: "Todas" }, ...actions.map((action) => ({ value: action, label: actionLabel(action) }))]} onChange={(action) => onChange({ action: action || undefined, page: 1 })} />
      <FilterSelect label="País" value={filters.countryCode ?? ""} options={[{ value: "", label: "Todos los países" }, ...countries.map((country) => ({ value: country, label: country }))]} onChange={(countryCode) => onChange({ countryCode: countryCode || undefined, page: 1 })} />
      <FilterSelect label="Severidad" value={filters.critical === undefined ? "" : filters.critical ? "critical" : "normal"} options={[{ value: "", label: "Todas" }, { value: "critical", label: "Críticos" }, { value: "normal", label: "No críticos" }]} onChange={(value) => onChange({ critical: value === "" ? undefined : value === "critical", page: 1 })} />
      <label className="grid gap-1 text-2xs font-bold text-muted"><span>Desde</span><input className="h-9 rounded-lg border border-line bg-surface px-3 text-xs" type="date" value={filters.dateFrom ?? ""} onChange={(event) => onChange({ dateFrom: event.target.value || undefined, page: 1 })} /></label>
      <label className="grid gap-1 text-2xs font-bold text-muted"><span>Hasta</span><input className="h-9 rounded-lg border border-line bg-surface px-3 text-xs" type="date" value={filters.dateTo ?? ""} onChange={(event) => onChange({ dateTo: event.target.value || undefined, page: 1 })} /></label>
    </section>
  );
}

function EventList({ title, events, critical = false }: { title: string; events: AuditEvent[]; critical?: boolean }) {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <h2 className="flex items-center gap-2 text-sm font-extrabold">{critical ? <AlertTriangle className="size-4 text-danger" /> : <History className="size-4 text-accent" />}{title}</h2>
      <ol className="mt-3 divide-y divide-line">
        {events.map((event) => <li className="py-2.5" key={event.id}><p className="truncate text-xs font-bold text-ink">{eventAction(event)}</p><p className="mt-1 truncate text-2xs text-muted">{event.actor?.name ?? "Sistema"} · {event.resource?.label ?? event.clinic?.name ?? event.countryCode ?? "Global"}</p><time className="mt-1 block text-2xs text-muted">{formatDate(event.occurredAt)}</time></li>)}
        {events.length === 0 ? <li className="py-8 text-center text-xs text-muted">Sin eventos para mostrar.</li> : null}
      </ol>
    </article>
  );
}

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, perPage: 20 });
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminAuditEvents>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);
      getAdminAuditEvents(filters, controller.signal)
        .then(setData)
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setError(requestError instanceof Error ? requestError.message : "No pudimos cargar la auditoría.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, filters.search ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters]);

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const stats = useMemo<Array<StatCardProps>>(() => [
    { label: "Eventos Totales", value: numberFormatter.format(summary.totals.events), change: "Filtros aplicados", direction: "up", icon: ShieldCheck, tone: "accent" },
    { label: "Usuarios Únicos", value: numberFormatter.format(summary.totals.uniqueUsers), change: "Actores identificados", direction: "up", icon: UserRound, tone: "violet" },
    { label: "Países Afectados", value: numberFormatter.format(summary.totals.countries), change: "Cobertura global", direction: "up", icon: Globe2, tone: "success" },
    { label: "Acciones Críticas", value: numberFormatter.format(summary.totals.critical), change: "Requieren supervisión", direction: summary.totals.critical > 0 ? "down" : "up", icon: AlertTriangle, tone: "danger" },
  ], [summary]);

  if (!data) {
    if (error) {
      return <main className="mx-auto grid min-h-[48vh] max-w-2xl place-items-center px-4"><p className="rounded-xl border border-danger/25 bg-danger-soft p-5 text-center text-xs text-danger" role="alert">{error}</p></main>;
    }

    return <PlatformModuleLoading label="Cargando auditoría global" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header><p className="text-xs font-bold tracking-[0.13em] text-accent uppercase">Supervisión global</p><h1 className="mt-0.5 text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Auditoría Global</h1><p className="mt-0.5 text-xs text-muted">Autenticación y cambios administrativos de todos los países, tenants y recursos.</p></header>
      {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de auditoría">{stats.map((stat, index) => <StatCard {...stat} index={index} key={stat.label} />)}</section>
       <div className="mt-4"><Filters filters={filters} modules={data?.options.modules ?? []} actions={data?.options.actions ?? []} countries={data?.options.countries ?? []} onChange={(changes) => setFilters((current) => ({ ...current, ...changes }))} /></div>

      <div className="mt-4 grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface" aria-labelledby="audit-log-title">
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-sm font-extrabold" id="audit-log-title">Registro unificado</h2><p className="mt-0.5 text-2xs text-muted">{numberFormatter.format(data?.meta.total ?? 0)} eventos</p></div>{isLoading ? <span className="text-2xs font-bold text-accent">Actualizando...</span> : null}</div>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[72rem] border-collapse text-left">
              <thead className="bg-surface-subtle text-2xs font-bold text-muted"><tr><th className="px-4 py-2.5">Fecha y hora</th><th className="px-3 py-2.5">Usuario</th><th className="px-3 py-2.5">País / Tenant</th><th className="px-3 py-2.5">Módulo</th><th className="px-3 py-2.5">Acción</th><th className="px-3 py-2.5">Recurso</th><th className="px-4 py-2.5">IP / Detalle</th></tr></thead>
              <tbody className="divide-y divide-line">
                {(data?.events ?? []).map((event) => {
                  const meta = moduleMeta(event.module);
                  const Icon = meta.icon;
                  return <tr className={event.isCritical ? "bg-danger-soft/20 text-xs" : "text-xs hover:bg-accent-soft/20"} key={event.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-2xs text-muted">{formatDate(event.occurredAt)}</td>
                    <td className="px-3 py-3"><p className="font-bold text-ink">{event.actor?.name ?? "Sistema"}</p><p className="mt-0.5 max-w-40 truncate text-2xs text-muted">{event.actor?.email ?? event.source}</p></td>
                    <td className="px-3 py-3"><p className="flex items-center gap-1.5 font-semibold"><CountryFlag countryCode={event.countryCode ?? ""} />{event.countryCode ?? "Global"}</p><p className="mt-0.5 max-w-40 truncate text-2xs text-muted">{event.clinic?.name ?? "Plataforma"}</p></td>
                    <td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-2xs font-extrabold ${meta.classes}`}><Icon className="size-3" />{meta.label}</span></td>
                    <td className="px-3 py-3"><p className={event.isCritical ? "font-bold text-danger" : "font-bold text-ink"}>{eventAction(event)}</p><p className="mt-0.5 text-2xs text-muted">{event.outcome}</p></td>
                    <td className="px-3 py-3"><EventResource event={event} /></td>
                    <td className="px-4 py-3"><p className="font-mono text-2xs text-muted">{event.ipAddress ?? "—"}</p>{Object.keys(event.metadata).length > 0 ? <details className="mt-1"><summary className="cursor-pointer text-2xs font-bold text-accent">Ver cambios</summary><pre className="mt-2 max-w-xs overflow-auto rounded-md bg-ink p-2 text-[0.65rem] text-white">{JSON.stringify(event.metadata, null, 2)}</pre></details> : null}</td>
                  </tr>;
                })}
                {!isLoading && (data?.events.length ?? 0) === 0 ? <tr><td className="px-4 py-10 text-center text-xs text-muted" colSpan={7}>No hay eventos para los filtros seleccionados.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-2xs text-muted"><span>Página {data?.meta.currentPage ?? 1} de {data?.meta.lastPage ?? 1}</span><div className="flex gap-1"><button className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40" type="button" aria-label="Página anterior" disabled={(data?.meta.currentPage ?? 1) <= 1 || isLoading} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}><ChevronLeft className="size-3.5" /></button><button className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40" type="button" aria-label="Página siguiente" disabled={(data?.meta.currentPage ?? 1) >= (data?.meta.lastPage ?? 1) || isLoading} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}><ChevronRight className="size-3.5" /></button></div></div>
        </section>

        <aside className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-1">
          <EventList title="Eventos críticos" events={summary.criticalEvents} critical />
          <EventList title="Cambios recientes" events={summary.recentChanges} />
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-surface p-4"><h2 className="text-sm font-extrabold">Módulos con mayor actividad</h2><ul className="mt-3 space-y-3">{summary.topModules.map((item) => <li key={item.module}><div className="flex justify-between text-xs"><span className="font-bold">{moduleMeta(item.module).label}</span><span className="font-mono text-muted">{item.count} · {item.percentage}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, item.percentage)}%` }} /></div></li>)}</ul></article>
        <article className="rounded-xl border border-line bg-surface p-4"><h2 className="text-sm font-extrabold">Actividad por país</h2><ul className="mt-3 divide-y divide-line">{summary.byCountry.map((item) => <li className="flex items-center justify-between py-2.5" key={item.countryCode}><span className="flex items-center gap-2 text-xs font-bold"><CountryFlag countryCode={item.countryCode} />{item.countryCode}</span><span className="font-mono text-xs font-bold">{numberFormatter.format(item.count)}</span></li>)}{summary.byCountry.length === 0 ? <li className="py-8 text-center text-xs text-muted">Sin actividad regional.</li> : null}</ul></article>
      </section>
    </div>
  );
}

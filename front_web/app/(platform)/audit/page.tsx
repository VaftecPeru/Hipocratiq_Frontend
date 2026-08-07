import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  UserX,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import type { BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart } from "@/shared/ui/donut-chart";
import { FilterField } from "@/shared/ui/filter-field";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { AuditFiltersButton } from "@/features/platform/ui/audit-modals";

export const metadata: Metadata = {
  title: "Auditoría Global",
};

type ModuleName = "Clínicas" | "Usuarios" | "Membresías" | "Facturación" | "Reportes" | "Configuración";

const MODULE_META: Record<ModuleName, { icon: LucideIcon; tone: BadgeTone }> = {
  Clínicas: { icon: Building2, tone: "accent" },
  Usuarios: { icon: Users, tone: "violet" },
  Membresías: { icon: CreditCard, tone: "success" },
  Facturación: { icon: FileText, tone: "warning" },
  Reportes: { icon: BarChart3, tone: "accent" },
  Configuración: { icon: Settings, tone: "neutral" },
};

const stats: Array<StatCardProps> = [
  { label: "Eventos Totales", value: "12,842", change: "+8.2% vs periodo anterior", direction: "up", icon: ShieldCheck, tone: "accent" },
  { label: "Usuarios Únicos", value: "146", change: "+6.5% vs periodo anterior", direction: "up", icon: Users, tone: "violet" },
  { label: "Tenants Afectados", value: "136", change: "+7.3% vs periodo anterior", direction: "up", icon: Building2, tone: "success" },
  { label: "Acciones Críticas", value: "28", change: "12.5% vs periodo anterior", direction: "down", icon: ShieldAlert, tone: "danger" },
];

type AuditEntry = {
  id: string;
  datetime: string;
  user: string;
  tenant: string;
  countryCode: CountryCode;
  module: ModuleName;
  action: string;
  resource: string;
  ip: string;
  critical?: boolean;
};

const auditLog: AuditEntry[] = [
  { id: "e-01", datetime: "15/05/2024 10:28 AM", user: "Ana Torres", tenant: "Clínica San José", countryCode: "MX", module: "Clínicas", action: "Crear clínica", resource: "Clínica San José", ip: "189.201.45.12" },
  { id: "e-02", datetime: "15/05/2024 10:15 AM", user: "Luis Martínez", tenant: "Clínica del Valle", countryCode: "MX", module: "Usuarios", action: "Editar usuario", resource: "Usuario: Dr. Pérez", ip: "189.201.45.12" },
  { id: "e-03", datetime: "15/05/2024 09:42 AM", user: "María González", tenant: "Clínica Arequipa", countryCode: "PE", module: "Membresías", action: "Cambio de plan", resource: "Plan Enterprise", ip: "190.116.23.45" },
  { id: "e-04", datetime: "15/05/2024 09:10 AM", user: "Carlos Mendoza", tenant: "Clínica San Pablo", countryCode: "PE", module: "Facturación", action: "Generar factura", resource: "Factura #F-45871", ip: "190.116.23.45" },
  { id: "e-05", datetime: "15/05/2024 08:55 AM", user: "Sofía Herrera", tenant: "Hospital Central", countryCode: "MX", module: "Reportes", action: "Exportó reporte", resource: "Reporte de Ingresos", ip: "189.201.45.12" },
  { id: "e-06", datetime: "15/05/2024 08:32 AM", user: "Diego Ramírez", tenant: "Clínica Los Olivos", countryCode: "PE", module: "Configuración", action: "Ajustó configuración", resource: "Parámetros del sistema", ip: "190.116.23.45" },
  { id: "e-07", datetime: "15/05/2024 07:58 AM", user: "Paola Jiménez", tenant: "Clínica del Sol", countryCode: "MX", module: "Usuarios", action: "Eliminar usuario", resource: "Usuario: jduran@clinic...", ip: "189.201.45.12", critical: true },
  { id: "e-08", datetime: "15/05/2024 07:33 AM", user: "Miguel Fernández", tenant: "Clínica San Borja", countryCode: "PE", module: "Clínicas", action: "Editar clínica", resource: "Clínica San Borja", ip: "189.201.45.12" },
  { id: "e-09", datetime: "15/05/2024 07:05 AM", user: "Valeria Castro", tenant: "Clínica Guadalajara", countryCode: "MX", module: "Membresías", action: "Activar membresía", resource: "Plan Profesional", ip: "189.201.45.12" },
  { id: "e-10", datetime: "15/05/2024 06:41 AM", user: "Andrés López", tenant: "Clínica Miraflores", countryCode: "PE", module: "Facturación", action: "Anular factura", resource: "Factura #F-45820", ip: "190.116.23.45", critical: true },
];

type CriticalEvent = { id: string; label: string; count: number; time: string; icon: LucideIcon; tone: BadgeTone };

const criticalEvents: CriticalEvent[] = [
  { id: "c-1", label: "Eliminación de usuario", count: 8, time: "Hoy, 10:15 AM", icon: UserX, tone: "danger" },
  { id: "c-2", label: "Cambios en membresías", count: 7, time: "Hoy, 09:42 AM", icon: CreditCard, tone: "warning" },
  { id: "c-3", label: "Ajustes de facturación", count: 6, time: "Hoy, 09:10 AM", icon: FileText, tone: "warning" },
  { id: "c-4", label: "Eliminación de clínica", count: 4, time: "Ayer, 06:22 PM", icon: Trash2, tone: "danger" },
  { id: "c-5", label: "Cambios en configuración", count: 3, time: "Ayer, 05:48 PM", icon: Settings, tone: "accent" },
];

type RecentChange = { id: string; title: string; detail: string; time: string; tone: BadgeTone };

const recentChanges: RecentChange[] = [
  { id: "rc-1", title: "Nueva clínica registrada", detail: "Clínica Santa Fe", time: "10:28 AM", tone: "success" },
  { id: "rc-2", title: "Usuario editado", detail: "Dr. Carlos Pérez", time: "10:15 AM", tone: "accent" },
  { id: "rc-3", title: "Plan actualizado", detail: "Clínica Arequipa → Enterprise", time: "09:42 AM", tone: "warning" },
  { id: "rc-4", title: "Factura generada", detail: "#F-45871", time: "09:10 AM", tone: "warning" },
  { id: "rc-5", title: "Reporte exportado", detail: "Reporte de Ingresos", time: "08:55 AM", tone: "accent" },
];

const activityByCountry = [
  { label: "México", value: "7,625", percentage: 59.4, color: "var(--accent)" },
  { label: "Perú", value: "5,217", percentage: 40.6, color: "var(--focus)" },
];

const topModules: Array<{ label: string; value: string; percentage: number }> = [
  { label: "Usuarios", value: "3,450", percentage: 26.9 },
  { label: "Clínicas", value: "2,980", percentage: 23.2 },
  { label: "Membresías", value: "2,210", percentage: 17.2 },
  { label: "Facturación", value: "1,890", percentage: 14.7 },
  { label: "Reportes", value: "1,260", percentage: 9.8 },
  { label: "Otros", value: "1,052", percentage: 8.2 },
];

const periodSummary: Array<{ label: string; value: string; change: string; direction: "up" | "down" }> = [
  { label: "Eventos totales", value: "12,842", change: "8.2%", direction: "up" },
  { label: "Usuarios únicos", value: "146", change: "6.5%", direction: "up" },
  { label: "Tenants afectados", value: "136", change: "7.3%", direction: "up" },
  { label: "Acciones críticas", value: "28", change: "12.5%", direction: "down" },
];

const numberFormatter = new Intl.NumberFormat("es-MX");

const TONE_ICON: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-surface-subtle text-muted",
  dark: "bg-plan-enterprise text-white",
};

const DOT_TONE: Record<BadgeTone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  violet: "bg-violet",
  neutral: "bg-muted",
  dark: "bg-plan-enterprise",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ModuleCell({ module }: { module: ModuleName }) {
  const meta = MODULE_META[module];
  const Icon = meta.icon;
  return (
    <span className="flex items-center gap-2">
      <span className={`grid size-5 shrink-0 place-items-center rounded ${TONE_ICON[meta.tone]}`} aria-hidden="true"><Icon className="size-3" strokeWidth={1.9} /></span>
      <span className="whitespace-nowrap font-semibold text-ink">{module}</span>
    </span>
  );
}

function AuditTable() {
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <caption className="sr-only">Registro de auditoría de la plataforma</caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="px-3 py-2.5 font-bold" scope="col">Fecha y Hora</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Usuario</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Tenant / Clínica</th>
              <th className="px-3 py-2.5 font-bold" scope="col">País</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Módulo</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Acción</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Recurso</th>
              <th className="px-3 py-2.5 font-bold" scope="col">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {auditLog.map((entry) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={entry.id}>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{entry.datetime}</td>
                <th className="px-3 py-2.5" scope="row">
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-2xs font-extrabold text-accent" aria-hidden="true">{getInitials(entry.user)}</span>
                    <span className="whitespace-nowrap font-bold text-ink">{entry.user}</span>
                  </span>
                </th>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{entry.tenant}</td>
                <td className="px-3 py-2.5"><CountryFlag countryCode={entry.countryCode} /></td>
                <td className="px-3 py-2.5"><ModuleCell module={entry.module} /></td>
                <td className="whitespace-nowrap px-3 py-2.5"><span className={entry.critical ? "font-bold text-danger" : "font-semibold text-ink"}>{entry.action}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{entry.resource}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 xl:hidden">
        {auditLog.map((entry) => (
          <article className="rounded-xl border border-line p-4" key={entry.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-2xs font-extrabold text-accent" aria-hidden="true">{getInitials(entry.user)}</span>
                <span className="min-w-0"><span className="block truncate text-xs font-extrabold">{entry.user}</span><span className="block truncate text-2xs text-muted">{entry.tenant}</span></span>
              </span>
              <CountryFlag countryCode={entry.countryCode} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs">
              <div><dt className="text-2xs text-muted">Módulo</dt><dd className="mt-1"><ModuleCell module={entry.module} /></dd></div>
              <div><dt className="text-2xs text-muted">Acción</dt><dd className={`mt-1 ${entry.critical ? "font-bold text-danger" : "font-semibold text-ink"}`}>{entry.action}</dd></div>
              <div><dt className="text-2xs text-muted">Recurso</dt><dd className="mt-1 truncate text-muted">{entry.resource}</dd></div>
              <div><dt className="text-2xs text-muted">Fecha</dt><dd className="mt-1 font-mono text-muted">{entry.datetime}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

function TopModulesCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="top-modules-title">
      <h2 className="text-sm font-extrabold" id="top-modules-title">Top Módulos por Actividad</h2>
      <ul className="mt-4 grid gap-3">
        {topModules.map((module) => (
          <li key={module.label}>
            <div className="flex items-center justify-between gap-3 text-2xs">
              <span className="font-bold text-ink">{module.label}</span>
              <span className="font-mono text-muted">{module.value} <span className="text-muted/80">({module.percentage}%)</span></span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
              <div className="h-full rounded-full bg-accent" style={{ width: `${module.percentage}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PeriodSummaryCard() {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="period-summary-title">
      <h2 className="text-sm font-extrabold" id="period-summary-title">Resumen del Periodo</h2>
      <p className="mt-1 flex items-center justify-between gap-2 text-2xs"><span className="text-muted">Periodo actual</span><span className="font-bold text-ink">01 May 2024 - 15 May 2024</span></p>
      <dl className="mt-3 divide-y divide-line">
        {periodSummary.map((row) => (
          <div className="flex items-center justify-between gap-3 py-2.5 text-xs" key={row.label}>
            <dt className="text-muted">{row.label}</dt>
            <dd className="flex items-center gap-2"><span className="font-mono font-bold text-ink">{row.value}</span><span className={`text-2xs font-bold ${row.direction === "up" ? "text-success" : "text-danger"}`}>{row.direction === "up" ? "↑" : "↓"} {row.change}</span></dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-2xs text-muted">Comparado con 16 Apr 2024 - 30 Apr 2024</p>
    </article>
  );
}

export default function AuditPage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Auditoría Global</h1>
          <p className="mt-0.5 text-xs text-muted">Consulta y monitorea todas las acciones realizadas en la plataforma.</p>
        </div>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de auditoría">
        {stats.map((item, index) => (
          <StatCard key={item.label} {...item} index={index} />
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de auditoría">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1440px]:grid-cols-6">
          <label className="grid gap-1 text-2xs font-bold text-muted">Usuario<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" placeholder="Buscar usuario..." /></span></label>
          <FilterField label="Módulo" value="Todos" />
          <FilterField label="Tenant / Clínica" value="Todas las clínicas" />
          <div className="grid gap-1">
            <span className="text-2xs font-bold text-muted">Fecha</span>
            <button className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface pr-2.5 pl-2.5 text-xs font-medium text-ink transition-colors hover:border-accent/60 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus/40 focus-visible:outline-none md:h-8" type="button" disabled title="Disponible al conectar el rango de fechas" aria-label="Filtro Fecha: 01/05/2024 - 15/05/2024">
              <span className="flex items-center gap-1.5 truncate"><Calendar className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />01/05/2024 - 15/05/2024</span>
            </button>
          </div>
          <FilterField label="País" value="Todos" />
          <FilterField label="Acción" value="Todas" />
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <span className="relative flex-1"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40" type="search" placeholder="Buscar en resultados..." aria-label="Buscar en resultados" /></span>
          <AuditFiltersButton />
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1600px]:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="audit-log-title">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="audit-log-title">Registro de Auditoría</h2><span className="hidden text-2xs text-muted sm:block">Datos de referencia</span></div>
          <AuditTable />
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-2xs text-muted">Mostrando 1 a 10 de 12,842 resultados</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página anterior" disabled>‹</button>
              {[1, 2, 3].map((page) => (
                <button className={`grid size-7 place-items-center rounded-md text-xs font-bold ${page === 1 ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={page} aria-current={page === 1 ? "page" : undefined}>{page}</button>
              ))}
              <span className="grid size-7 place-items-center text-xs text-muted" aria-hidden="true">…</span>
              <button className="grid size-7 place-items-center rounded-md border border-line text-xs font-bold text-muted hover:bg-surface-subtle" type="button">1,285</button>
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted hover:bg-surface-subtle" type="button" aria-label="Página siguiente">›</button>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3 md:grid-cols-2 min-[1600px]:grid-cols-1" aria-label="Eventos críticos y cambios recientes">
          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Eventos Críticos <span className="text-muted">(28)</span></h2>
            <ol className="mt-3 grid gap-2">
              {criticalEvents.map((event) => {
                const Icon = event.icon;
                return (
                  <li className="flex items-center gap-2.5" key={event.id}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-md ${TONE_ICON[event.tone]}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{event.label}</span>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full text-2xs font-extrabold ${TONE_ICON[event.tone]}`}>{event.count}</span>
                    <time className="hidden whitespace-nowrap text-2xs text-muted sm:block">{event.time}</time>
                    <span className="text-muted" aria-hidden="true">›</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Cambios Recientes</h2>
            <ol className="mt-3 grid gap-3">
              {recentChanges.map((change) => (
                <li className="grid grid-cols-[auto_1fr_auto] items-start gap-2.5" key={change.id}>
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${DOT_TONE[change.tone]}`} aria-hidden="true" />
                  <div className="min-w-0"><p className="truncate text-xs font-bold text-ink">{change.title}</p><p className="mt-0.5 truncate text-2xs text-muted">{change.detail}</p></div>
                  <time className="whitespace-nowrap text-2xs text-muted">{change.time}</time>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="Distribución de actividad">
        <DonutChart title="Actividad por País" centerValue={numberFormatter.format(12842)} centerLabel="Total" segments={activityByCountry} />
        <TopModulesCard />
        <PeriodSummaryCard />
      </section>

      <footer className="mt-4 flex items-center gap-1.5 border-t border-line py-4 text-2xs text-muted">
        <ShieldCheck className="size-3" aria-hidden="true" />Los datos se actualizan cada 10 minutos. Última actualización: Hoy, 10:30 AM
      </footer>
    </div>
  );
}

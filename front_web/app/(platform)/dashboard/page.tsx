import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Activity, Building2, Clock3, DollarSign, HeartPulse, LifeBuoy, ShieldCheck, UserRound, Users } from "lucide-react";
import { getAuthenticatedSession } from "@/features/auth/api/server-session";
import { getAdminDashboard } from "@/features/platform/api/server-dashboard";
import { DashboardUnavailable } from "@/shared/ui/dashboard-unavailable";
import type { AdminDashboardData, ServiceStatus } from "@/features/platform/model/admin-dashboard.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { formatRevenueMonth, RevenueBarChart } from "@/features/platform/ui/revenue-bar-chart";
import { BILLING_CURRENCIES, formatBillingAmount } from "@/features/platform/lib/billing-currency";

export const metadata: Metadata = { title: "Panel administrativo" };

const numberFormatter = new Intl.NumberFormat("es-MX");
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const countryNames: Record<string, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };

type Kpi = { label: string; value: string; helper: string; icon: LucideIcon; tone: string; alert?: boolean };

function percentChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "Actividad nueva este mes" : "Sin ingresos este mes";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs. mes anterior`;
}

function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.icon;
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs font-bold leading-4 text-muted">{item.label}</p>
        <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${item.tone}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span>
      </div>
      <p className="mt-3 font-mono text-xl font-bold leading-none tracking-[-0.055em] text-ink sm:text-[1.35rem]">{item.value}</p>
      <p className={`mt-2 text-2xs font-bold ${item.alert ? "text-danger" : "text-success"}`}>{item.helper}</p>
    </article>
  );
}

function CountryDistribution({ countries }: { countries: AdminDashboardData["countries"] }) {
  const total = countries.reduce((sum, country) => sum + country.clinics, 0);
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-[0_0.5rem_2rem_rgb(16_27_51/4%)]" aria-labelledby="distribution-title">
      <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Cobertura regional</p>
      <h2 className="mt-1 text-sm font-extrabold" id="distribution-title">Clínicas por país</h2>
      <p className="mt-5 font-mono text-4xl font-bold tracking-tighter">{numberFormatter.format(total)}</p><p className="text-2xs text-muted">clínicas activas</p>
      <dl className="mt-5 grid gap-3">
        {countries.length ? countries.map((country) => {
          const percentage = total ? (country.clinics / total) * 100 : 0;
          return <div key={country.countryCode}><div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-xs font-bold"><CountryFlag countryCode={country.countryCode} />{countryNames[country.countryCode] ?? country.countryCode}</dt><dd className="font-mono text-xs font-bold">{country.clinics} <span className="text-2xs font-medium text-muted">· {percentage.toFixed(0)}%</span></dd></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} /></div></div>;
        }) : <p className="text-xs text-muted">Aún no hay clínicas activas.</p>}
      </dl>
    </article>
  );
}

function RecentClinics({ data }: { data: AdminDashboardData }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="active-clinics-title">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Red operativa</p><h2 className="mt-1 text-sm font-extrabold" id="active-clinics-title">Clínicas recientes</h2></div><Link className="text-2xs font-bold text-accent" href="/clinics">Ver todas</Link></div>
      <ul className="mt-4 divide-y divide-line">
        {data.recentClinics.length ? data.recentClinics.map((clinic) => <li className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0" key={clinic.id}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true"><Building2 className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{clinic.name}</span><span className="mt-0.5 flex items-center gap-1.5 truncate text-2xs text-muted"><CountryFlag countryCode={clinic.countryCode} />{clinic.address}</span></span><span className="rounded-md bg-success-soft px-2 py-0.5 text-[0.58rem] font-bold text-success">Activa</span></li>) : <li className="py-6 text-center text-xs text-muted">No hay clínicas activas.</li>}
      </ul>
    </article>
  );
}

function RecentActivity({ activity }: { activity: AdminDashboardData["recentActivity"] }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="recent-activity-title">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Registro global</p><h2 className="mt-1 text-sm font-extrabold" id="recent-activity-title">Actividad reciente</h2></div><Link className="text-2xs font-bold text-accent" href="/audit">Abrir auditoría</Link></div>
      <ol className="mt-4 divide-y divide-line">
        {activity.length ? activity.map((event) => <li className="grid grid-cols-[2rem_1fr] gap-3 py-3 first:pt-1 last:pb-0" key={event.id}><span className={`grid size-8 place-items-center rounded-lg ${event.critical ? "bg-danger-soft text-danger" : "bg-violet-soft text-violet"}`} aria-hidden="true"><Activity className="size-3.5" /></span><div className="min-w-0"><p className="truncate text-xs font-bold">{event.action.replaceAll("_", " ")}</p><p className="mt-0.5 truncate text-2xs text-muted">{event.resourceLabel ?? event.module} · {event.actorName ?? "Sistema"}</p><time className="mt-1 block text-2xs font-semibold text-ink-secondary">{dateTimeFormatter.format(new Date(event.occurredAt))}</time></div></li>) : <li className="py-6 text-center text-xs text-muted">Sin actividad administrativa registrada.</li>}
      </ol>
    </article>
  );
}

const STATUS_STYLE: Record<ServiceStatus, string> = { operational: "text-success bg-success-soft", degraded: "text-warning bg-warning-soft", unavailable: "text-danger bg-danger-soft" };
const STATUS_LABEL: Record<ServiceStatus, string> = { operational: "Operativo", degraded: "Degradado", unavailable: "No disponible" };

function SystemHealth({ services }: { services: AdminDashboardData["system"] }) {
  const healthy = services.every((service) => service.status === "operational");
  return (
    <article className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="system-health-title">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-2xs font-semibold tracking-[0.14em] text-muted uppercase">Comprobación en vivo</p><h2 className="mt-1 text-sm font-extrabold" id="system-health-title">Salud del sistema</h2></div><HeartPulse className={`size-5 ${healthy ? "text-success" : "text-warning"}`} aria-hidden="true" /></div>
      <div className={`mt-4 rounded-xl border p-3 ${healthy ? "border-success/20 bg-success-soft/60" : "border-warning/20 bg-warning-soft/60"}`}><p className={`flex items-center gap-2 text-xs font-extrabold ${healthy ? "text-success" : "text-warning"}`}><ShieldCheck className="size-4" aria-hidden="true" />{healthy ? "Dependencias operativas" : "Requiere revisión"}</p></div>
      <dl className="mt-3 divide-y divide-line">{services.map((service) => <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-2" key={service.key}><div><dt className="text-xs font-semibold">{service.label}</dt><dd className="mt-0.5 text-2xs text-muted">{service.detail} · {service.latencyMs} ms</dd></div><dd className={`rounded-full px-2 py-1 text-[0.58rem] font-bold ${STATUS_STYLE[service.status]}`}>{STATUS_LABEL[service.status]}</dd></div>)}</dl>
      <Link className="mt-3 flex min-h-8 items-center justify-center rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft" href="/monitoring">Ver monitoreo detallado</Link>
    </article>
  );
}

export default async function DashboardPage() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/");
  const result = await getAdminDashboard();
  if (!result.ok) return <DashboardUnavailable description={result.message} retryHref="/dashboard" title="No se pudieron cargar los datos globales" />;
  const data = result.data;
  const kpis: Kpi[] = [
    { label: "Clínicas activas", value: numberFormatter.format(data.kpis.activeClinics), helper: `+${data.kpis.clinicsAddedThisMonth} este mes`, icon: Building2, tone: "bg-accent-soft text-accent" },
    { label: "Usuarios activos", value: numberFormatter.format(data.kpis.activeUsers), helper: `+${data.kpis.usersAddedThisMonth} este mes`, icon: Users, tone: "bg-violet-soft text-violet" },
    { label: "Pacientes activos", value: numberFormatter.format(data.kpis.activePatients), helper: "Perfiles con acceso activo", icon: UserRound, tone: "bg-success-soft text-success" },
     { label: `Ingresos del mes · ${data.revenueCurrency}`, value: formatBillingAmount(data.kpis.monthlyRevenueByCurrency[data.revenueCurrency], data.revenueCurrency), helper: percentChange(data.kpis.monthlyRevenueByCurrency[data.revenueCurrency], data.kpis.previousMonthRevenueByCurrency[data.revenueCurrency]), icon: DollarSign, tone: "bg-warning-soft text-warning" },
    { label: "Tickets abiertos", value: numberFormatter.format(data.kpis.openSupportTickets), helper: `${data.kpis.overdueSupportTickets} fuera de SLA`, icon: LifeBuoy, tone: "bg-danger-soft text-danger", alert: data.kpis.overdueSupportTickets > 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-2xs font-semibold tracking-[0.16em] text-accent uppercase">Super Administración</p><h1 className="mt-2 text-[clamp(1.65rem,4vw,2.45rem)] font-extrabold leading-none tracking-[-0.045em]">Panel de Control Global</h1><p className="mt-2 max-w-2xl text-xs leading-5 text-muted sm:text-sm">Hola, {session.user.name.split(" ")[0]}. Supervisa todos los países, tenants y operaciones de la plataforma.</p></div><p className="flex items-center gap-2 text-2xs font-semibold text-muted"><span className="size-2 rounded-full bg-success" aria-hidden="true" />Datos del backend · {dateTimeFormatter.format(new Date(data.generatedAt))}</p></header>
      <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-label="Indicadores clave">{kpis.map((item) => <KpiCard item={item} key={item.label} />)}</section>
       <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Resumen financiero y regional"><div className="grid min-w-0 gap-4">{BILLING_CURRENCIES.map((currency) => <RevenueBarChart key={currency} id={`dashboard-revenue-${currency.toLowerCase()}`} eyebrow="Rendimiento financiero" title={`Pagos confirmados · ${currency}`} description="Los importes se muestran sin convertir y no se suman entre monedas." currency={currency} points={data.revenueByCurrency[currency].map((item) => ({ id: item.month, label: formatRevenueMonth(item.month), amountCents: item.amountCents }))} chartHeightClassName="h-56" />)}</div><CountryDistribution countries={data.countries} /></section>
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Operación global"><RecentClinics data={data} /><RecentActivity activity={data.recentActivity} /><div className="md:col-span-2 xl:col-span-1"><SystemHealth services={data.system} /></div></section>
      <footer className="mt-8 flex flex-col gap-2 border-t border-line py-5 text-2xs text-muted sm:flex-row sm:items-center sm:justify-between"><p>Fuente: base transaccional, pagos, soporte y auditoría administrativa.</p><p className="flex items-center gap-1.5"><Clock3 className="size-3" aria-hidden="true" />Sin métricas simuladas</p></footer>
    </div>
  );
}

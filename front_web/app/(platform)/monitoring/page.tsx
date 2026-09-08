import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, Boxes, Clock3, Database, Gauge, Info, KeyRound, LifeBuoy, MonitorCheck, ShieldAlert, Users } from "lucide-react";
import { getAdminMonitoring } from "@/features/platform/api/server-dashboard";
import type { AdminMonitoringData, ServiceStatus } from "@/features/platform/model/admin-dashboard.types";
import { MonitoringRefreshButton } from "@/features/platform/ui/monitoring-refresh-button";
import { MonitoringIncidents } from "@/features/platform/ui/monitoring-incidents";
import { CountryFlag } from "@/shared/ui/country-flag";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return { title: t("monitoring") };
}

const numberFormatter = new Intl.NumberFormat("es-MX");
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const countryNames: Record<string, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };
const statusStyle: Record<ServiceStatus, string> = { operational: "bg-success-soft text-success", degraded: "bg-warning-soft text-warning", unavailable: "bg-danger-soft text-danger" };
const statusLabel: Record<ServiceStatus, string> = { operational: "Operativo", degraded: "Degradado", unavailable: "No disponible" };

type Metric = { label: string; value: number; helper: string; icon: LucideIcon; alert?: boolean };

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-3 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <div className="flex items-center gap-2"><span className={`grid size-7 shrink-0 place-items-center rounded-lg ${metric.alert ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.8} /></span><p className="truncate text-2xs font-bold text-muted">{metric.label}</p></div>
      <p className="mt-3 font-mono text-xl font-bold leading-none tracking-tight">{numberFormatter.format(metric.value)}</p>
      <p className={`mt-2 text-2xs font-bold ${metric.alert ? "text-danger" : "text-success"}`}>{metric.helper}</p>
    </article>
  );
}

function ServicesTable({ services }: { services: AdminMonitoringData["services"] }) {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="services-title">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold" id="services-title">Dependencias comprobadas <Info className="size-3 text-muted" aria-hidden="true" /></h2>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-lg border-collapse text-left"><caption className="sr-only">Estado actual de dependencias de plataforma</caption><thead><tr className="border-b border-line text-2xs text-muted"><th className="py-2 pr-3" scope="col">Servicio</th><th className="px-3 py-2" scope="col">Estado</th><th className="px-3 py-2" scope="col">Respuesta</th><th className="px-3 py-2" scope="col">Detalle real</th></tr></thead><tbody className="divide-y divide-line">{services.map((service) => <tr className="text-xs" key={service.key}><th className="whitespace-nowrap py-3 pr-3 font-bold" scope="row">{service.label}</th><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-2xs font-bold ${statusStyle[service.status]}`}>{statusLabel[service.status]}</span></td><td className="whitespace-nowrap px-3 py-3 font-mono text-muted">{service.latencyMs} ms</td><td className="px-3 py-3 text-muted">{service.detail}</td></tr>)}</tbody></table></div>
    </article>
  );
}

function CountryCoverage({ countries }: { countries: AdminMonitoringData["countries"] }) {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="regions-title">
      <h2 className="text-sm font-extrabold" id="regions-title">Cobertura operativa por país</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {countries.length ? countries.map((country) => <div className="rounded-xl border border-line p-4" key={country.countryCode}><div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-extrabold"><CountryFlag countryCode={country.countryCode} />{countryNames[country.countryCode] ?? country.countryCode}</h3><span className="rounded-full bg-success-soft px-2 py-1 text-2xs font-bold text-success">Activo</span></div><dl className="mt-4 grid grid-cols-2 gap-3"><div><dt className="text-2xs text-muted">Clínicas activas</dt><dd className="mt-1 font-mono text-xl font-bold">{numberFormatter.format(country.clinics)}</dd></div><div><dt className="text-2xs text-muted">Usuarios activos</dt><dd className="mt-1 font-mono text-xl font-bold">{numberFormatter.format(country.users)}</dd></div></dl></div>) : <p className="col-span-full py-8 text-center text-xs text-muted">No hay cobertura activa registrada.</p>}
      </div>
    </article>
  );
}

function OperationalSignals({ signals }: { signals: AdminMonitoringData["operationalSignals"] }) {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="signals-title">
      <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold" id="signals-title">Señales críticas recientes</h2><Link className="text-2xs font-bold text-accent" href="/audit">Ver auditoría</Link></div>
      <ul className="mt-3 divide-y divide-line">{signals.length ? signals.map((signal) => <li className="flex items-center gap-3 py-3" key={signal.id}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger" aria-hidden="true"><ShieldAlert className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold capitalize">{signal.action.replaceAll("_", " ")}</p><p className="mt-0.5 truncate text-2xs text-muted">{signal.resourceLabel ?? signal.module}</p><time className="mt-1 block text-2xs text-muted">{dateTimeFormatter.format(new Date(signal.occurredAt))}</time></div>{signal.countryCode ? <CountryFlag countryCode={signal.countryCode} /> : null}</li>) : <li className="py-8 text-center text-xs text-muted">No hay señales críticas registradas.</li>}</ul>
    </article>
  );
}

function EventVolume({ volume }: { volume: AdminMonitoringData["eventVolume"] }) {
  const items = [
    { label: "Administrativos", value: volume.administrative, tone: "bg-accent" },
    { label: "Autenticación", value: volume.authentication, tone: "bg-violet" },
    { label: "Críticos", value: volume.critical, tone: "bg-danger" },
    { label: "Accesos fallidos", value: volume.failedAuthentication, tone: "bg-warning" },
  ];
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="volume-title"><h2 className="text-sm font-extrabold" id="volume-title">Eventos de las últimas 24 horas</h2><dl className="mt-4 grid gap-4">{items.map((item) => <div key={item.label}><div className="flex items-center justify-between text-xs"><dt className="font-bold text-muted">{item.label}</dt><dd className="font-mono font-bold">{numberFormatter.format(item.value)}</dd></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-subtle"><span className={`block h-full rounded-full ${item.tone}`} style={{ width: `${Math.max(item.value ? 4 : 0, (item.value / max) * 100)}%` }} /></div></div>)}</dl></article>
  );
}

function LoadError({ message }: { message: string }) {
  return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-2xl border border-danger/25 bg-surface p-7 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" /><h1 className="mt-3 text-xl font-extrabold">Monitoreo no disponible</h1><p className="mt-2 text-sm text-muted">{message}</p></section></main>;
}

export default async function MonitoringPage() {
  const result = await getAdminMonitoring();
  if (!result.ok) return <LoadError message={result.message} />;
  const data = result.data;
  const metrics: Metric[] = [
    { label: "Sesiones activas", value: data.metrics.activeSessions, helper: "No revocadas y vigentes", icon: Users },
    { label: "Trabajos pendientes", value: data.metrics.pendingJobs, helper: "Cola actual", icon: Boxes, alert: data.metrics.pendingJobs > 100 },
    { label: "Fallos de cola", value: data.metrics.failedJobs24h, helper: "Últimas 24 horas", icon: AlertTriangle, alert: data.metrics.failedJobs24h > 0 },
    { label: "Eventos de auditoría", value: data.metrics.auditEvents24h, helper: "Últimas 24 horas", icon: Activity },
    { label: "Eventos críticos", value: data.metrics.criticalEvents24h, helper: "Requieren supervisión", icon: ShieldAlert, alert: data.metrics.criticalEvents24h > 0 },
    { label: "Accesos fallidos", value: data.metrics.authenticationFailures24h, helper: "Últimas 24 horas", icon: KeyRound, alert: data.metrics.authenticationFailures24h > 0 },
    { label: "Tickets abiertos", value: data.metrics.openSupportTickets, helper: "Carga de soporte", icon: LifeBuoy },
    { label: "Tickets fuera de SLA", value: data.metrics.overdueSupportTickets, helper: "Requieren atención", icon: Gauge, alert: data.metrics.overdueSupportTickets > 0 },
    { label: "Incidentes abiertos", value: data.metrics.openIncidents, helper: "Seguimiento operativo", icon: ShieldAlert, alert: data.metrics.openIncidents > 0 },
  ];
  const operational = data.overallStatus === "operational";

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start"><div><h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Monitoreo del Sistema</h1><p className="mt-0.5 text-xs text-muted">Estado verificable de backend, dependencias y operación global.</p></div><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1.5 text-2xs text-muted"><Clock3 className="size-3" aria-hidden="true" />{dateTimeFormatter.format(new Date(data.generatedAt))}</span><span className={`flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${operational ? "border-success/40 bg-success-soft text-success" : "border-warning/40 bg-warning-soft text-warning"}`}><MonitorCheck className="size-3.5" aria-hidden="true" />{operational ? "Operativo" : "Degradado"}</span><MonitoringRefreshButton /></div></header>
      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-9" aria-label="Métricas operativas">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <MonitoringIncidents incidents={data.incidents} />
      <section className="mt-4 grid gap-4 xl:grid-cols-2" aria-label="Cobertura y dependencias"><CountryCoverage countries={data.countries} /><ServicesTable services={data.services} /></section>
      <section className="mt-4 grid gap-4 xl:grid-cols-2" aria-label="Señales y eventos"><OperationalSignals signals={data.operationalSignals} /><EventVolume volume={data.eventVolume} /></section>
      <footer className="mt-4 flex items-center gap-1.5 border-t border-line py-4 text-2xs text-muted"><Database className="size-3" aria-hidden="true" />Solo se muestran métricas disponibles en fuentes reales; CPU, memoria, latencia histórica y deployments requieren integrar un proveedor de observabilidad.</footer>
    </div>
  );
}

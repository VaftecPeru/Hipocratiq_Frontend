import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, Building2, DollarSign, Download, LifeBuoy, UserRound, Users } from "lucide-react";
import { getAdminDashboard } from "@/features/platform/api/server-dashboard";
import type { AdminDashboardData } from "@/features/platform/model/admin-dashboard.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";

export const metadata: Metadata = { title: "Reportes" };

const numberFormatter = new Intl.NumberFormat("es-MX");
const currencyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const countryNames: Record<string, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };

function RevenueReport({ data }: { data: AdminDashboardData }) {
  const max = Math.max(...data.revenue.map((item) => item.amountCents), 1);
  const total = data.revenue.reduce((sum, item) => sum + item.amountCents, 0);
  return <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]"><header className="flex items-end justify-between gap-4 border-b border-line pb-3"><div><p className="font-mono text-2xs font-bold tracking-[0.12em] text-accent uppercase">Negocio</p><h2 className="mt-1 text-sm font-extrabold">Ingresos confirmados · 12 meses</h2></div><div className="text-right"><p className="text-2xs text-muted">Total</p><p className="font-mono text-lg font-bold">{currencyFormatter.format(total / 100)}</p></div></header><div className="mt-4 grid h-56 grid-cols-12 items-end gap-1.5 border-b border-line" role="img" aria-label="Reporte mensual de ingresos">{data.revenue.map((item) => <div className="flex h-full min-w-0 flex-col justify-end" key={item.month} title={`${item.month}: ${currencyFormatter.format(item.amountCents / 100)}`}><span className="min-h-1 rounded-t bg-success" style={{ height: `${item.amountCents ? Math.max(6, item.amountCents / max * 100) : 2}%` }} /><span className="py-2 text-center text-[0.55rem] font-bold capitalize text-muted">{monthFormatter.format(new Date(`${item.month}-01T00:00:00Z`))}</span></div>)}</div></article>;
}

function CountryReport({ data }: { data: AdminDashboardData }) {
  const maxUsers = Math.max(...data.countries.map((country) => country.users), 1);
  return <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]"><p className="font-mono text-2xs font-bold tracking-[0.12em] text-violet uppercase">Adopción</p><h2 className="mt-1 text-sm font-extrabold">Cobertura por país</h2><div className="mt-5 grid gap-5">{data.countries.length ? data.countries.map((country) => <div key={country.countryCode}><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-xs font-bold"><CountryFlag countryCode={country.countryCode} />{countryNames[country.countryCode] ?? country.countryCode}</h3><p className="font-mono text-xs font-bold">{numberFormatter.format(country.users)} usuarios</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-violet" style={{ width: `${country.users / maxUsers * 100}%` }} /></div><p className="mt-1.5 text-2xs text-muted">{country.clinics} clínicas activas</p></div>) : <p className="py-8 text-center text-xs text-muted">No hay cobertura activa.</p>}</div></article>;
}

function ActivityReport({ data }: { data: AdminDashboardData }) {
  return <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-2xs font-bold tracking-[0.12em] text-accent uppercase">Gobierno</p><h2 className="mt-1 text-sm font-extrabold">Cambios administrativos recientes</h2></div><Link className="text-2xs font-bold text-accent" href="/audit">Ver auditoría</Link></div><ol className="mt-4 divide-y divide-line">{data.recentActivity.length ? data.recentActivity.map((event) => <li className="flex items-center gap-3 py-3" key={event.id}><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${event.critical ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"}`} aria-hidden="true"><Activity className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold capitalize">{event.action.replaceAll("_", " ")}</p><p className="mt-0.5 truncate text-2xs text-muted">{event.resourceLabel ?? event.module} · {event.actorName ?? "Sistema"}</p></div><time className="hidden text-2xs text-muted sm:block">{dateTimeFormatter.format(new Date(event.occurredAt))}</time></li>) : <li className="py-8 text-center text-xs text-muted">Sin cambios registrados.</li>}</ol></article>;
}

export default async function ReportsPage() {
  const result = await getAdminDashboard();
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-2xl border border-danger/25 bg-surface p-7 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" /><h1 className="mt-3 text-xl font-extrabold">Reportes no disponibles</h1><p className="mt-2 text-sm text-muted">{result.message}</p></section></main>;
  const data = result.data;
  const stats: StatCardProps[] = [
    { label: "Ingresos del mes", value: currencyFormatter.format(data.kpis.monthlyRevenueCents / 100), change: "Pagos confirmados", direction: "up", icon: DollarSign, tone: "success" },
    { label: "Usuarios activos", value: numberFormatter.format(data.kpis.activeUsers), change: `+${data.kpis.usersAddedThisMonth} este mes`, direction: "up", icon: Users, tone: "violet" },
    { label: "Clínicas activas", value: numberFormatter.format(data.kpis.activeClinics), change: `+${data.kpis.clinicsAddedThisMonth} este mes`, direction: "up", icon: Building2, tone: "accent" },
    { label: "Pacientes activos", value: numberFormatter.format(data.kpis.activePatients), change: "Cobertura global", direction: "up", icon: UserRound, tone: "warning" },
    { label: "Tickets abiertos", value: numberFormatter.format(data.kpis.openSupportTickets), change: `${data.kpis.overdueSupportTickets} fuera de SLA`, direction: data.kpis.overdueSupportTickets ? "down" : "up", icon: LifeBuoy, tone: "danger" },
  ];

  return <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6"><header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Reportes</h1><p className="mt-0.5 text-xs text-muted">Resumen ejecutivo global basado en operación, pagos y auditoría reales.</p></div><Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-accent-hover" href="/backend/api/v1/auth/admin/reports/export" prefetch={false}><Download className="size-3.5" aria-hidden="true" />Exportar reporte CSV</Link></header><section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-label="Indicadores ejecutivos">{stats.map((stat, index) => <StatCard key={stat.label} {...stat} index={index} />)}</section><section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.65fr)]"><RevenueReport data={data} /><CountryReport data={data} /></section><section className="mt-4"><ActivityReport data={data} /></section><footer className="mt-4 border-t border-line py-4 text-2xs text-muted">Corte de datos: {dateTimeFormatter.format(new Date(data.generatedAt))}. Los reportes exportados quedan registrados en auditoría.</footer></div>;
}

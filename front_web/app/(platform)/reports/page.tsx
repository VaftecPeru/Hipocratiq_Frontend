import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, Building2, DollarSign, Download, LifeBuoy, UserRound, Users } from "lucide-react";
import { getAdminDashboard } from "@/features/platform/api/server-dashboard";
import type { AdminDashboardData } from "@/features/platform/model/admin-dashboard.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { formatRevenueMonth, RevenueBarChart } from "@/features/platform/ui/revenue-bar-chart";
import { BILLING_CURRENCIES, formatBillingAmount } from "@/features/platform/lib/billing-currency";

export const metadata: Metadata = { title: "Reportes" };

const numberFormatter = new Intl.NumberFormat("es-MX");
const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const countryNames: Record<string, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };

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
     { label: `Ingresos del mes · ${data.revenueCurrency}`, value: formatBillingAmount(data.kpis.monthlyRevenueByCurrency[data.revenueCurrency], data.revenueCurrency), change: "Pagos confirmados en la moneda base", direction: "up", icon: DollarSign, tone: "success" },
    { label: "Usuarios activos", value: numberFormatter.format(data.kpis.activeUsers), change: `+${data.kpis.usersAddedThisMonth} este mes`, direction: "up", icon: Users, tone: "violet" },
    { label: "Clínicas activas", value: numberFormatter.format(data.kpis.activeClinics), change: `+${data.kpis.clinicsAddedThisMonth} este mes`, direction: "up", icon: Building2, tone: "accent" },
    { label: "Pacientes activos", value: numberFormatter.format(data.kpis.activePatients), change: "Cobertura global", direction: "up", icon: UserRound, tone: "warning" },
    { label: "Tickets abiertos", value: numberFormatter.format(data.kpis.openSupportTickets), change: `${data.kpis.overdueSupportTickets} fuera de SLA`, direction: data.kpis.overdueSupportTickets ? "down" : "up", icon: LifeBuoy, tone: "danger" },
  ];

  return <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6"><header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Reportes</h1><p className="mt-0.5 text-xs text-muted">Resumen ejecutivo global basado en operación, pagos y auditoría reales.</p></div><Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-accent-hover" href="/backend/api/v1/auth/admin/reports/export?format=xlsx" prefetch={false}><Download className="size-3.5" aria-hidden="true" />Exportar Excel (.xlsx)</Link></header><section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-label="Indicadores ejecutivos">{stats.map((stat, index) => <div className={index === stats.length - 1 ? "col-span-2 sm:col-span-1" : undefined} key={stat.label}><StatCard {...stat} index={index} /></div>)}</section><section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.65fr)]"><div className="grid min-w-0 gap-4">{BILLING_CURRENCIES.map((currency) => <RevenueBarChart key={currency} id={`reports-revenue-${currency.toLowerCase()}`} eyebrow="Negocio" title={`Ingresos confirmados · ${currency}`} description="Cada moneda conserva su propio total; no se aplican conversiones implícitas." currency={currency} points={data.revenueByCurrency[currency].map((item) => ({ id: item.month, label: formatRevenueMonth(item.month), amountCents: item.amountCents }))} chartHeightClassName="h-56" />)}</div><CountryReport data={data} /></section><section className="mt-4"><ActivityReport data={data} /></section><footer className="mt-4 border-t border-line py-4 text-2xs text-muted">Corte de datos: {dateTimeFormatter.format(new Date(data.generatedAt))}. Los reportes exportados quedan registrados en auditoría.</footer></div>;
}

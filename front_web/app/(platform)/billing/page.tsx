import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, DollarSign, Download, ReceiptText, Search } from "lucide-react";
import { billingQuery, getAdminBilling } from "@/features/platform/api/server-billing";
import type { AdminBillingData, AdminBillingFilters, BillingCurrency, PaymentStatus } from "@/features/platform/model/admin-billing.types";
import { CountryFlag } from "@/shared/ui/country-flag";
import { FilterSelect } from "@/shared/ui/filter-select";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { NewManualPaymentButton, RefundManualPaymentButton } from "@/features/platform/ui/billing-operations";
import { formatRevenueMonth, RevenueBarChart } from "@/features/platform/ui/revenue-bar-chart";

export const metadata: Metadata = { title: "Facturación" };

const numberFormatter = new Intl.NumberFormat("es-MX");
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const countryNames: Record<string, string> = { MX: "México", PE: "Perú", US: "Estados Unidos" };
const statusLabels: Record<PaymentStatus, string> = { succeeded: "Exitoso", pending: "Pendiente", failed: "Fallido", refunded: "Reembolsado" };
const statusStyles: Record<PaymentStatus, string> = { succeeded: "bg-success-soft text-success", pending: "bg-warning-soft text-warning", failed: "bg-danger-soft text-danger", refunded: "bg-violet-soft text-violet" };
const billingCurrencies: BillingCurrency[] = ["USD", "MXN", "PEN"];

function money(cents: number, currency: BillingCurrency = "USD"): string {
  return new Intl.NumberFormat(currency === "PEN" ? "es-PE" : "es-MX", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
}

function percentage(current: number, previous: number): string {
  if (!previous) return current ? "Actividad nueva en USD" : "Sin movimiento en USD";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs. mes anterior en USD`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatCurrencyBreakdown(amounts: Record<BillingCurrency, number>): string {
  return billingCurrencies.map((currency) => money(amounts[currency], currency)).join(" · ");
}

function CountryRevenue({ data }: { data: AdminBillingData }) {
  const maxByCurrency = Object.fromEntries(
    billingCurrencies.map((currency) => [currency, Math.max(...data.summary.countries.map((country) => country.revenueByCurrency[currency]), 1)]),
  ) as Record<BillingCurrency, number>;

  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
      <h2 className="text-xs font-extrabold">Ingresos acumulados por país y moneda</h2>
      <div className="mt-4 grid gap-4">
        {data.summary.countries.length ? data.summary.countries.map((country) => (
          <div key={country.countryCode}>
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold"><CountryFlag countryCode={country.countryCode} />{countryNames[country.countryCode] ?? country.countryCode}</p>
              <p className="text-2xs text-muted">{country.clinics} clínicas · {numberFormatter.format(country.users)} usuarios</p>
            </div>
            <div className="mt-2 grid gap-2">
              {billingCurrencies.map((currency) => (
                <div key={currency}>
                  <div className="flex items-center justify-between gap-2 text-2xs"><span className="font-bold text-muted">{currency}</span><span className="font-mono font-bold">{money(country.revenueByCurrency[currency], currency)}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-subtle"><span className="block h-full rounded-full bg-accent" style={{ width: `${country.revenueByCurrency[currency] / maxByCurrency[currency] * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )) : <p className="py-8 text-center text-xs text-muted">Sin pagos por país.</p>}
      </div>
    </article>
  );
}

function BillingFilters({ data, filters }: { data: AdminBillingData; filters: AdminBillingFilters }) {
  return (
    <section className="mt-4 rounded-xl border border-line bg-surface p-3.5">
      <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,1fr)_auto]" action="/billing">
        <label className="grid gap-1 text-2xs font-bold text-muted">Buscar<span className="relative"><Search className="absolute top-1/2 left-2.5 size-3 -translate-y-1/2" aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-3 pl-8 text-xs text-ink" name="q" defaultValue={filters.search} placeholder="Clínica o referencia" /></span></label>
        <FilterSelect label="País" name="country" defaultValue={filters.country ?? ""} options={[{ value: "", label: "Todos" }, ...data.filters.countries.map((country) => ({ value: country, label: countryNames[country] ?? country }))]} />
        <FilterSelect label="Estado" name="status" defaultValue={filters.status ?? ""} options={[{ value: "", label: "Todos" }, ...data.filters.statuses.map((status) => ({ value: status, label: statusLabels[status] }))]} />
        <label className="grid gap-1 text-2xs font-bold text-muted">Desde<input className="h-9 rounded-lg border border-line bg-surface px-3 text-xs text-ink" type="date" name="from" defaultValue={filters.dateFrom} /></label>
        <label className="grid gap-1 text-2xs font-bold text-muted">Hasta<input className="h-9 rounded-lg border border-line bg-surface px-3 text-xs text-ink" type="date" name="to" defaultValue={filters.dateTo} /></label>
        <button className="mt-auto min-h-9 rounded-lg bg-accent px-4 text-xs font-bold text-white focus-visible:outline-3 focus-visible:outline-focus" type="submit">Filtrar</button>
      </form>
    </section>
  );
}

function buildHref(filters: AdminBillingFilters, page: number): string {
  const query = new URLSearchParams();
  if (filters.search) query.set("q", filters.search);
  if (filters.country) query.set("country", filters.country);
  if (filters.status) query.set("status", filters.status);
  if (filters.dateFrom) query.set("from", filters.dateFrom);
  if (filters.dateTo) query.set("to", filters.dateTo);
  if (page > 1) query.set("page", String(page));
  return `/billing${query.size ? `?${query}` : ""}`;
}

function PaymentCard({ payment }: { payment: AdminBillingData["payments"][number] }) {
  return (
    <article className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{payment.clinic.name}</h3><p className="mt-1 truncate font-mono text-2xs text-muted">{payment.reference}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-2xs font-bold ${statusStyles[payment.status]}`}>{statusLabels[payment.status]}</span></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-xs"><div><dt className="text-2xs text-muted">Plan</dt><dd className="mt-1 font-semibold">{payment.plan ?? "—"}</dd></div><div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{money(payment.amountCents, payment.currency)}</dd></div><div><dt className="text-2xs text-muted">Proveedor</dt><dd className="mt-1 text-muted">{payment.provider === "admin_manual" ? "Manual" : payment.provider}</dd></div><div><dt className="text-2xs text-muted">Fecha</dt><dd className="mt-1 text-muted">{formatDate(payment.refundedAt ?? payment.paidAt ?? payment.createdAt)}</dd></div></dl>
      <div className="mt-3 flex justify-end">{payment.provider === "admin_manual" && payment.status === "succeeded" ? <RefundManualPaymentButton payment={payment} /> : <span className="text-2xs text-muted">Sólo lectura</span>}</div>
    </article>
  );
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const rawStatus = value("status");
  const filters: AdminBillingFilters = {
    search: value("q"), country: value("country"), status: (["succeeded", "pending", "failed", "refunded"].includes(rawStatus ?? "") ? rawStatus : undefined) as PaymentStatus | undefined,
    dateFrom: value("from"), dateTo: value("to"), page: Math.max(1, Number(value("page")) || 1),
  };
  const result = await getAdminBilling(filters);
  if (!result.ok) return <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5"><section className="rounded-2xl border border-danger/25 bg-surface p-7 text-center" role="alert"><AlertTriangle className="mx-auto size-7 text-danger" aria-hidden="true" /><h1 className="mt-3 text-xl font-extrabold">Facturación no disponible</h1><p className="mt-2 text-sm text-muted">{result.message}</p></section></main>;
  const data = result.data;
  const monthlyByCurrency = Object.fromEntries(billingCurrencies.map((currency) => [currency, data.summary.byCurrency[currency].monthlyRevenueCents])) as Record<BillingCurrency, number>;
  const previousByCurrency = Object.fromEntries(billingCurrencies.map((currency) => [currency, data.summary.byCurrency[currency].previousMonthRevenueCents])) as Record<BillingCurrency, number>;
  const stats: StatCardProps[] = [
    { label: "Ingresos del mes · separados por moneda", value: formatCurrencyBreakdown(monthlyByCurrency), change: percentage(monthlyByCurrency.USD, previousByCurrency.USD), direction: monthlyByCurrency.USD >= previousByCurrency.USD ? "up" : "down", icon: DollarSign, tone: "accent" },
    { label: "Pagos exitosos", value: numberFormatter.format(data.summary.successfulPayments), change: "Total registrado", direction: "up", icon: CheckCircle2, tone: "success" },
    { label: "Pagos pendientes", value: numberFormatter.format(data.summary.pendingPayments), change: "Requieren conciliación", direction: data.summary.pendingPayments ? "down" : "up", icon: Clock3, tone: "warning" },
    { label: "Pagos fallidos", value: numberFormatter.format(data.summary.failedPayments), change: "Histórico", direction: data.summary.failedPayments ? "down" : "up", icon: AlertTriangle, tone: "danger" },
  ];
  const exportQuery = billingQuery({ ...filters, page: undefined });

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Facturación</h1><p className="mt-0.5 text-xs text-muted">Pagos y recaudación reales de todas las clínicas y países.</p></div><div className="flex flex-wrap gap-2"><Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-ink hover:bg-surface-subtle" href={`/backend/api/v1/auth/admin/billing/export?${exportQuery}&format=csv`} prefetch={false}><Download className="size-3.5" aria-hidden="true" />CSV</Link><Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white hover:bg-accent-hover" href={`/backend/api/v1/auth/admin/billing/export?${exportQuery}&format=xlsx`} prefetch={false}><Download className="size-3.5" aria-hidden="true" />Excel</Link><NewManualPaymentButton subscriptions={data.filters.manualSubscriptions} /></div></header>
      <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores de facturación">{stats.map((stat, index) => <StatCard key={stat.label} {...stat} index={index} />)}</section>
      <BillingFilters data={data} filters={filters} />
      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.7fr)]"><div className="grid gap-4">{billingCurrencies.map((currency) => { const series = data.summary.byCurrency[currency]; return <RevenueBarChart key={currency} id={`billing-revenue-${currency.toLowerCase()}`} title={`Ingresos confirmados · ${currency}`} description="Últimos 12 meses · pagos exitosos" currency={currency} totalCents={series.totalRevenueCents} points={series.revenue.map((item) => ({ id: item.month, label: formatRevenueMonth(item.month), amountCents: item.amountCents }))} chartHeightClassName="h-48" />; })}</div><CountryRevenue data={data} /></section>
      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface" aria-labelledby="payments-title"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="text-xs font-extrabold" id="payments-title">Pagos registrados</h2><span className="text-2xs text-muted">{numberFormatter.format(data.pagination.total)} resultados</span></div>{data.payments.length ? <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[60rem] text-left text-xs"><caption className="sr-only">Pagos registrados</caption><thead className="bg-surface-subtle text-2xs text-muted"><tr><th className="px-4 py-2.5" scope="col">Referencia</th><th className="px-4 py-2.5" scope="col">Clínica</th><th className="px-4 py-2.5" scope="col">Plan</th><th className="px-4 py-2.5" scope="col">Monto</th><th className="px-4 py-2.5" scope="col">Estado</th><th className="px-4 py-2.5" scope="col">Proveedor</th><th className="px-4 py-2.5" scope="col">Fecha</th><th className="px-4 py-2.5 text-right" scope="col">Acciones</th></tr></thead><tbody className="divide-y divide-line">{data.payments.map((payment) => <tr key={payment.id}><td className="px-4 py-3 font-mono text-2xs">{payment.reference}</td><td className="px-4 py-3"><span className="flex items-center gap-2 font-bold">{payment.clinic.countryCode ? <CountryFlag countryCode={payment.clinic.countryCode} /> : null}{payment.clinic.name}</span></td><td className="px-4 py-3 text-muted">{payment.plan ?? "—"}</td><td className="px-4 py-3 font-mono font-bold">{money(payment.amountCents, payment.currency)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-2xs font-bold ${statusStyles[payment.status]}`}>{statusLabels[payment.status]}</span></td><td className="px-4 py-3 capitalize text-muted">{payment.provider === "admin_manual" ? "Manual" : payment.provider}</td><td className="px-4 py-3 text-muted">{formatDate(payment.refundedAt ?? payment.paidAt ?? payment.createdAt)}</td><td className="px-4 py-3 text-right">{payment.provider === "admin_manual" && payment.status === "succeeded" ? <RefundManualPaymentButton payment={payment} /> : <span className="text-2xs text-muted">Sólo lectura</span>}</td></tr>)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{data.payments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)}</div></> : <div className="p-10 text-center text-xs text-muted"><ReceiptText className="mx-auto mb-2 size-6" aria-hidden="true" />No hay pagos con estos filtros.</div>}<footer className="flex items-center justify-between border-t border-line px-4 py-3 text-2xs text-muted"><p>Mostrando {data.pagination.from ?? 0}–{data.pagination.to ?? 0}</p><div className="flex gap-2"><Link className={`rounded-md border border-line px-3 py-1.5 font-bold ${data.pagination.currentPage <= 1 ? "pointer-events-none opacity-40" : "text-accent"}`} href={buildHref(filters, data.pagination.currentPage - 1)}>Anterior</Link><Link className={`rounded-md border border-line px-3 py-1.5 font-bold ${data.pagination.currentPage >= data.pagination.lastPage ? "pointer-events-none opacity-40" : "text-accent"}`} href={buildHref(filters, data.pagination.currentPage + 1)}>Siguiente</Link></div></footer></section>
    </div>
  );
}

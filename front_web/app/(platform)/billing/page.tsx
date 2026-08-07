"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileClock,
  FileText,
  MoreHorizontal,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Wallet,
  XCircle,
} from "lucide-react";
import { CountryFlag, type CountryCode } from "@/shared/ui/country-flag";
import { DataBadge, type BadgeTone } from "@/shared/ui/data-badge";
import { DonutChart } from "@/shared/ui/donut-chart";
import { FilterField } from "@/shared/ui/filter-field";
import { StatCard, type StatCardProps } from "@/shared/ui/stat-card";
import { AdvancedFiltersModal, ExportReportModal } from "@/shared/ui/common-modals";

type PlanName = "Básico" | "Profesional" | "Enterprise";
type PaymentStatus = "paid" | "pending" | "failed";

type Invoice = {
  id: string;
  clinic: string;
  countryCode: CountryCode;
  plan: PlanName;
  reference: string;
  period: string;
  amount: string;
  status: PaymentStatus;
  paidDate: string | null;
};

const PLAN_TONE: Record<PlanName, BadgeTone> = {
  Básico: "neutral",
  Profesional: "accent",
  Enterprise: "dark",
};

const PAYMENT: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Pagado", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  failed: { label: "Fallido", tone: "danger" },
};

const stats: Array<StatCardProps> = [
  { label: "Ingresos del Mes", value: "$342,850", change: "+9.2% vs. mes anterior", direction: "up", icon: DollarSign, tone: "accent" },
  { label: "Pagos Exitosos", value: "1,284", change: "+6.4% vs. mes anterior", direction: "up", icon: CheckCircle2, tone: "success" },
  { label: "Pagos Fallidos", value: "47", change: "-8.3% vs. mes anterior", direction: "down", icon: XCircle, tone: "danger" },
  { label: "Facturas Pendientes", value: "89", change: "+3 esta semana", direction: "up", icon: FileClock, tone: "warning" },
  { label: "ARPU", value: "$267", change: "+4.1% vs. mes anterior", direction: "up", icon: Wallet, tone: "violet" },
];

const invoices: Invoice[] = [
  { id: "i-01", clinic: "Clínica Salud Total", countryCode: "MX", plan: "Profesional", reference: "INV-2026-0142", period: "Jul 2026", amount: "$149.00", status: "paid", paidDate: "02 Jul 2026" },
  { id: "i-02", clinic: "Hospital Central", countryCode: "MX", plan: "Enterprise", reference: "INV-2026-0141", period: "Jul 2026", amount: "$399.00", status: "paid", paidDate: "02 Jul 2026" },
  { id: "i-03", clinic: "Clínica San Pablo", countryCode: "PE", plan: "Profesional", reference: "INV-2026-0140", period: "Jul 2026", amount: "$149.00", status: "pending", paidDate: null },
  { id: "i-04", clinic: "Clínica Bienestar", countryCode: "MX", plan: "Básico", reference: "INV-2026-0139", period: "Jul 2026", amount: "$49.00", status: "paid", paidDate: "01 Jul 2026" },
  { id: "i-05", clinic: "Clínica Salud Plus", countryCode: "PE", plan: "Básico", reference: "INV-2026-0138", period: "Jul 2026", amount: "$49.00", status: "failed", paidDate: null },
  { id: "i-06", clinic: "Centro Médico Lima", countryCode: "PE", plan: "Profesional", reference: "INV-2026-0137", period: "Jun 2026", amount: "$149.00", status: "paid", paidDate: "30 Jun 2026" },
  { id: "i-07", clinic: "Clínica del Valle", countryCode: "MX", plan: "Enterprise", reference: "INV-2026-0136", period: "Jun 2026", amount: "$399.00", status: "paid", paidDate: "29 Jun 2026" },
  { id: "i-08", clinic: "Clínica Arequipa", countryCode: "PE", plan: "Básico", reference: "INV-2026-0135", period: "Jun 2026", amount: "$49.00", status: "pending", paidDate: null },
  { id: "i-09", clinic: "Hospital San José", countryCode: "MX", plan: "Profesional", reference: "INV-2026-0134", period: "Jun 2026", amount: "$149.00", status: "paid", paidDate: "28 Jun 2026" },
  { id: "i-10", clinic: "Clínica Los Andes", countryCode: "PE", plan: "Enterprise", reference: "INV-2026-0133", period: "Jun 2026", amount: "$399.00", status: "failed", paidDate: null },
];

const revenueByCountry = [
  { label: "México", value: "$239.9K", percentage: 70, color: "var(--accent)" },
  { label: "Perú", value: "$102.9K", percentage: 30, color: "var(--focus)" },
];

const summaryRows: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: "Ingresos YTD", value: "$2,184,300", icon: DollarSign },
  { label: "Facturas Emitidas", value: "8,642", icon: FileText },
  { label: "Tasa de Cobro", value: "96.4%", icon: CheckCircle2 },
  { label: "Ticket Promedio", value: "$253", icon: Wallet },
];

const countrySummary: Array<{ code: CountryCode; label: string; value: string }> = [
  { code: "MX", label: "México", value: "$1,528,010" },
  { code: "PE", label: "Perú", value: "$656,290" },
];

type ActivityItem = { id: string; title: string; detail: string; time: string; icon: LucideIcon; tone: BadgeTone };

const recentActivity: ActivityItem[] = [
  { id: "a-1", title: "Pago recibido", detail: "Clínica Salud Total · $149", time: "Hace 12 min", icon: DollarSign, tone: "success" },
  { id: "a-2", title: "Factura emitida", detail: "Hospital Central · $399", time: "Hace 40 min", icon: FileText, tone: "accent" },
  { id: "a-3", title: "Pago fallido", detail: "Clínica Los Andes · $399", time: "Hace 1 hora", icon: XCircle, tone: "danger" },
  { id: "a-4", title: "Reembolso procesado", detail: "Clínica Arequipa · $49", time: "Hace 3 horas", icon: RotateCcw, tone: "violet" },
  { id: "a-5", title: "Recordatorio enviado", detail: "Clínica San Pablo", time: "Hace 5 horas", icon: Send, tone: "warning" },
];

const revenueMonths = [
  ["Ago", 54, 190],
  ["Sep", 116, 174],
  ["Oct", 178, 154],
  ["Nov", 240, 138],
  ["Dic", 302, 120],
  ["Ene", 364, 108],
  ["Feb", 426, 92],
  ["Mar", 488, 78],
  ["Abr", 550, 72],
  ["May", 612, 58],
  ["Jun", 674, 48],
  ["Jul", 736, 40],
] as const;

const TONE_ICON: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-surface-subtle text-muted",
  dark: "bg-plan-enterprise text-white",
};

function PlanBadge({ plan }: { plan: PlanName }) {
  return <DataBadge tone={PLAN_TONE[plan]}>{plan}</DataBadge>;
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT[status];
  return <DataBadge tone={config.tone} dot>{config.label}</DataBadge>;
}

function InvoiceActions({
  reference,
  onView,
  onDownload,
}: {
  reference: string;
  onView: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Ver ${reference}`}
        onClick={onView}
      >
        <Eye className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button
        className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Descargar ${reference}`}
        onClick={onDownload}
      >
        <Download className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
      <button
        className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-3 focus-visible:outline-focus"
        type="button"
        aria-label={`Más acciones para ${reference}`}
        onClick={onView}
      >
        <MoreHorizontal className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
      </button>
    </div>
  );
}

function InvoicesTable({
  onView,
  onDownload,
}: {
  onView: (reference: string) => void;
  onDownload: (reference: string) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">Facturas de la plataforma</caption>
          <thead>
            <tr className="border-b border-line bg-surface-subtle/50 text-2xs font-bold text-muted">
              <th className="w-10 px-3 py-2.5 font-bold" scope="col">#</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Clínica</th>
              <th className="px-3 py-2.5 font-bold" scope="col">País</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Plan</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Factura</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Periodo</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Monto</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Estado</th>
              <th className="px-3 py-2.5 font-bold" scope="col">Fecha de pago</th>
              <th className="px-3 py-2.5 text-right font-bold" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoices.map((invoice, index) => (
              <tr className="text-xs transition-colors hover:bg-accent-soft/35" key={invoice.id}>
                <td className="px-3 py-2.5 font-mono text-muted">{index + 1}.</td>
                <th className="whitespace-nowrap px-3 py-2.5 font-bold text-ink" scope="row">{invoice.clinic}</th>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2 text-muted"><CountryFlag countryCode={invoice.countryCode} />{invoice.countryCode === "MX" ? "México" : "Perú"}</span>
                </td>
                <td className="px-3 py-2.5"><PlanBadge plan={invoice.plan} /></td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{invoice.reference}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{invoice.period}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono font-bold text-ink">{invoice.amount}</td>
                <td className="px-3 py-2.5"><PaymentBadge status={invoice.status} /></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{invoice.paidDate ?? "—"}</td>
                <td className="px-2 py-1.5"><InvoiceActions reference={invoice.reference} onView={() => onView(invoice.reference)} onDownload={() => onDownload(invoice.reference)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {invoices.map((invoice) => (
          <article className="rounded-xl border border-line p-4" key={invoice.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-extrabold">{invoice.clinic}</h3>
                <p className="mt-0.5 font-mono text-2xs text-muted">{invoice.reference}</p>
              </div>
              <PaymentBadge status={invoice.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-xs">
              <div><dt className="text-2xs text-muted">Plan</dt><dd className="mt-1"><PlanBadge plan={invoice.plan} /></dd></div>
              <div><dt className="text-2xs text-muted">Monto</dt><dd className="mt-1 font-mono font-bold">{invoice.amount}</dd></div>
              <div><dt className="text-2xs text-muted">País</dt><dd className="mt-1 flex items-center gap-1.5"><CountryFlag countryCode={invoice.countryCode} />{invoice.countryCode === "MX" ? "México" : "Perú"}</dd></div>
              <div><dt className="text-2xs text-muted">{invoice.paidDate ? "Fecha de pago" : "Periodo"}</dt><dd className="mt-1 font-medium">{invoice.paidDate ?? invoice.period}</dd></div>
            </dl>
            <div className="mt-2 flex justify-end"><InvoiceActions reference={invoice.reference} onView={() => onView(invoice.reference)} onDownload={() => onDownload(invoice.reference)} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

function RevenueTrend() {
  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="billing-revenue-title">
      <header className="flex items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="text-xs font-extrabold" id="billing-revenue-title">Tendencia de Ingresos</h2>
          <p className="mt-0.5 text-2xs text-muted">Últimos 12 meses · USD</p>
        </div>
        <p className="inline-flex items-center gap-1 text-2xs font-bold text-success"><ArrowUpRight className="size-3" aria-hidden="true" />18.6% interanual</p>
      </header>

      <figure className="mt-3 overflow-x-auto pb-1">
        <svg className="h-auto min-w-lg" viewBox="0 0 780 260" role="img" aria-labelledby="billing-chart-title billing-chart-desc">
          <title id="billing-chart-title">Evolución de ingresos mensuales</title>
          <desc id="billing-chart-desc">Gráfico de área ascendente desde agosto hasta julio, cuando los ingresos alcanzan 342 mil 850 dólares.</desc>
          <defs>
            <linearGradient id="billing-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[40, 85, 130, 175, 220].map((y) => (
            <line key={y} x1="54" x2="748" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />
          ))}
          <text x="8" y="44" fill="var(--muted)" fontSize="10">$350k</text>
          <text x="8" y="89" fill="var(--muted)" fontSize="10">$300k</text>
          <text x="8" y="134" fill="var(--muted)" fontSize="10">$250k</text>
          <text x="8" y="179" fill="var(--muted)" fontSize="10">$200k</text>
          <text x="8" y="224" fill="var(--muted)" fontSize="10">$150k</text>

          <path
            d="M54 190 C80 186 90 170 116 174 C142 178 152 150 178 154 C204 158 214 133 240 138 C266 143 276 116 302 120 C328 124 338 105 364 108 C390 111 400 88 426 92 C452 96 462 72 488 78 C514 84 524 68 550 72 C576 76 586 52 612 58 C638 64 648 44 674 48 C700 52 710 34 736 40 L736 220 L54 220 Z"
            fill="url(#billing-area)"
          />
          <path
            d="M54 190 C80 186 90 170 116 174 C142 178 152 150 178 154 C204 158 214 133 240 138 C266 143 276 116 302 120 C328 124 338 105 364 108 C390 111 400 88 426 92 C452 96 462 72 488 78 C514 84 524 68 550 72 C576 76 586 52 612 58 C638 64 648 44 674 48 C700 52 710 34 736 40"
            fill="none"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {revenueMonths.map(([month, x, y], index) => (
            <g key={month}>
              <circle cx={x} cy={y} r={index === revenueMonths.length - 1 ? 5 : 3} fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
              <text x={x} y="246" fill="var(--muted)" fontSize="10" textAnchor="middle">{month}</text>
            </g>
          ))}
          <g transform="translate(674 10)">
            <rect width="76" height="24" rx="7" fill="var(--ink)" />
            <text x="38" y="16" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">$342,850</text>
          </g>
        </svg>
        <figcaption className="sr-only">Ingresos mensuales en crecimiento sostenido durante los últimos doce meses.</figcaption>
      </figure>
    </article>
  );
}

export default function BillingPage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-5 lg:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-extrabold tracking-[-0.03em]">Facturación</h1>
          <p className="mt-0.5 text-xs text-muted">Controla pagos, facturas e ingresos de todas las clínicas de la plataforma.</p>
        </div>
        <button className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" onClick={() => setExportOpen(true)}>
          <FileText className="size-3.5" strokeWidth={2} aria-hidden="true" />Generar Factura
        </button>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="Indicadores de facturación">
        {stats.map((item, index) => (
          <div className={index === stats.length - 1 ? "col-span-2 md:col-span-1" : ""} key={item.label}>
            <StatCard {...item} index={index} />
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-line bg-surface p-3.5 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-label="Filtros de facturación">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(8rem,1fr))_minmax(15rem,1.6fr)_auto]">
          <FilterField label="País" value="Todos" />
          <FilterField label="Plan" value="Todos" />
          <FilterField label="Estado de pago" value="Todos" />
          <FilterField label="Periodo" value="Julio 2026" />
          <label className="grid gap-1 text-2xs font-bold text-muted">Buscar factura<span className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted" strokeWidth={1.7} aria-hidden="true" /><input className="h-9 w-full rounded-lg border border-line bg-surface pr-2.5 pl-8 text-xs font-medium text-ink outline-none placeholder:text-muted/75 focus:border-accent focus:ring-3 focus:ring-focus/40 md:h-8" type="search" placeholder="Buscar por clínica, factura o monto..." /></span></label>
          <button className="mt-auto flex min-h-9 items-center justify-center gap-1 rounded-lg border border-line px-2.5 text-xs font-bold text-muted transition-colors hover:border-accent/60 focus-visible:outline-3 focus-visible:outline-focus md:min-h-8" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="size-3" strokeWidth={1.7} aria-hidden="true" />Filtros</button>
        </div>
      </section>

      <div className="mt-4 grid items-start gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]" aria-labelledby="invoices-results-title">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-3"><h2 className="text-2xs font-extrabold" id="invoices-results-title">1,420 facturas encontradas</h2><span className="hidden text-2xs text-muted sm:block">Datos de referencia</span></div>
          <InvoicesTable
            onView={(ref) => setExportOpen(true)}
            onDownload={(ref) => setExportOpen(true)}
          />
          <div className="flex min-h-14 flex-col items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:flex-row">
            <p className="text-2xs text-muted">Mostrando 1 a 10 de 1,420 facturas</p>
            <div className="flex items-center gap-1" aria-label="Paginación">
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40" type="button" aria-label="Página anterior" disabled>‹</button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button className={`grid size-7 place-items-center rounded-md text-xs font-bold ${page === 1 ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface-subtle"}`} type="button" key={page} aria-current={page === 1 ? "page" : undefined}>{page}</button>
              ))}
              <span className="grid size-7 place-items-center text-xs text-muted" aria-hidden="true">…</span>
              <button className="grid size-7 place-items-center rounded-md border border-line text-xs font-bold text-muted hover:bg-surface-subtle" type="button">142</button>
              <button className="grid size-7 place-items-center rounded-md border border-line text-muted hover:bg-surface-subtle" type="button" aria-label="Página siguiente">›</button>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-3" aria-label="Resumen y actividad">
          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Resumen General</h2>
            <p className="mt-0.5 text-2xs text-muted">Acumulado del año (YTD)</p>
            <dl className="mt-3 grid gap-2.5">
              {summaryRows.map((item) => {
                const Icon = item.icon;
                return <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.label}><span className="grid size-7 place-items-center rounded-md bg-surface-subtle text-muted" aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span><dt className="text-xs text-muted">{item.label}</dt><dd className="font-mono text-xs font-bold">{item.value}</dd></div>;
              })}
              {countrySummary.map((item) => (
                <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2" key={item.code}><span className="grid size-7 place-items-center" aria-hidden="true"><CountryFlag countryCode={item.code} /></span><dt className="text-xs text-muted">{item.label}</dt><dd className="font-mono text-xs font-bold">{item.value}</dd></div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(16_27_51/3%)]">
            <h2 className="text-xs font-extrabold">Actividad Reciente</h2>
            <ol className="mt-3 grid gap-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <li className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-2" key={activity.id}>
                    <span className={`grid size-7 place-items-center rounded-md ${TONE_ICON[activity.tone]}`} aria-hidden="true"><Icon className="size-3.5" strokeWidth={1.7} /></span>
                    <div><p className="text-xs font-extrabold">{activity.title}</p><p className="mt-0.5 text-2xs text-muted">{activity.detail}</p></div>
                    <time className="whitespace-nowrap text-2xs text-muted">{activity.time}</time>
                  </li>
                );
              })}
            </ol>
            <button className="mt-3 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-2xs font-bold text-accent hover:bg-accent-soft focus-visible:outline-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled title="Disponible al conectar la actividad de facturación">Ver toda la actividad</button>
          </section>
        </aside>
      </div>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]" aria-label="Análisis de ingresos">
        <DonutChart title="Facturación por País" centerValue="$342.8K" centerLabel="Este mes" segments={revenueByCountry} action={<span className="rounded-md bg-surface-subtle px-2 py-0.5 text-2xs font-bold text-muted"><CalendarClock className="mr-1 inline size-3 align-[-1px]" aria-hidden="true" />Jul</span>} />
        <RevenueTrend />
      </section>

      <ExportReportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <AdvancedFiltersModal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}

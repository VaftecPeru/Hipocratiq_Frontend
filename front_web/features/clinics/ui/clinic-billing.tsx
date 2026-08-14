"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Banknote,
  BrainCircuit,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Eye,
  Landmark,
  Plus,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

type InvoiceStatus = "Pagada" | "Pendiente" | "Vencida";
type Period = "Hoy" | "Esta semana" | "Este mes";
type Invoice = {
  id: string;
  initials: string;
  patient: string;
  concept: string;
  date: string;
  amount: string;
  method: "Tarjeta" | "Transferencia" | "Efectivo" | "Seguro";
  status: InvoiceStatus;
};

const invoices: readonly Invoice[] = [
  { id: "FAC-0241", initials: "AL", patient: "Ana López Hernández", concept: "Consulta", date: "6 Jun, 2026", amount: "$800.00", method: "Tarjeta", status: "Pagada" },
  { id: "FAC-0240", initials: "LM", patient: "Luis Martínez Sánchez", concept: "Procedimiento", date: "5 Jun, 2026", amount: "$2,450.00", method: "Transferencia", status: "Pagada" },
  { id: "FAC-0239", initials: "FO", patient: "Fernando Ortiz León", concept: "Laboratorio", date: "4 Jun, 2026", amount: "$1,200.00", method: "Efectivo", status: "Pendiente" },
  { id: "CR-0238", initials: "CR", patient: "Carlos Ruiz Jiménez", concept: "Control prenatal", date: "3 Jun, 2026", amount: "$1,100.00", method: "Seguro", status: "Pagada" },
  { id: "MV-0237", initials: "MV", patient: "María Vargas Peña", concept: "Consulta", date: "2 Jun, 2026", amount: "$900.00", method: "Tarjeta", status: "Vencida" },
  { id: "DM-0236", initials: "DM", patient: "Diego Morales Vega", concept: "Procedimiento", date: "1 Jun, 2026", amount: "$3,300.00", method: "Transferencia", status: "Pendiente" },
];

const statusStyles: Record<InvoiceStatus, string> = {
  Pagada: "bg-success-soft text-success",
  Pendiente: "bg-warning-soft text-warning",
  Vencida: "bg-danger-soft text-danger",
};

const methodIcons: Record<Invoice["method"], LucideIcon> = {
  Tarjeta: CreditCard,
  Transferencia: Landmark,
  Efectivo: Banknote,
  Seguro: ShieldCheck,
};

function MetricCard({ icon: Icon, label, value, helper, tone, badge }: { icon: LucideIcon; label: string; value: string; helper: string; tone: string; badge: string }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)] motion-safe:animate-[fade-up-in_400ms_ease-out_both]">
      <div className="flex items-start gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-2xs font-bold text-muted">{label}</p><p className="mt-1 font-mono text-xl font-bold tracking-[-0.04em]">{value}</p></div></div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2"><span className="text-[0.58rem] font-semibold text-muted">{helper}</span><span className={`rounded-full px-2 py-1 text-[0.54rem] font-extrabold ${tone}`}>{badge}</span></div>
    </article>
  );
}

function InvoiceTable({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-205 text-left">
        <caption className="sr-only">Facturas recientes de la clínica</caption>
        <thead className="bg-surface-subtle text-[0.56rem] font-extrabold uppercase tracking-wide text-muted"><tr><th className="px-4 py-2.5">Paciente</th><th className="px-3 py-2.5">Concepto</th><th className="px-3 py-2.5">Fecha</th><th className="px-3 py-2.5">Monto</th><th className="px-3 py-2.5">Método</th><th className="px-3 py-2.5">Estado</th><th className="px-4 py-2.5 text-right">Acciones</th></tr></thead>
        <tbody className="divide-y divide-line">{invoices.map((invoice, index) => { const MethodIcon = methodIcons[invoice.method]; return (
          <tr className="text-[0.64rem] transition-colors hover:bg-surface-hover" key={invoice.id}>
            <th className="px-4 py-2.5 font-normal"><div className="flex items-center gap-2.5"><span className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[0.52rem] font-bold ${index % 2 ? "bg-violet-soft text-violet" : "bg-accent-soft text-accent"}`}>{invoice.initials}</span><div><p className="font-extrabold">{invoice.patient}</p><p className="mt-0.5 font-mono text-[0.5rem] text-muted">{invoice.id}</p></div></div></th>
            <td className="px-3 py-2.5 font-bold text-ink-secondary">{invoice.concept}</td><td className="px-3 py-2.5 font-mono font-semibold text-ink-secondary">{invoice.date}</td><td className="px-3 py-2.5 font-mono font-extrabold">{invoice.amount}</td><td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 font-semibold text-ink-secondary"><MethodIcon className="size-3 text-muted" />{invoice.method}</span></td><td className="px-3 py-2.5"><span className={`rounded-md px-2 py-1 text-[0.55rem] font-extrabold ${statusStyles[invoice.status]}`}>{invoice.status}</span></td>
            <td className="px-4 py-2.5 text-right"><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent" type="button" aria-label={`Ver factura ${invoice.id}`} onClick={() => onNotice(`Abriendo factura ${invoice.id}`)}><Eye className="size-3.5" /></button></td>
          </tr>
        ); })}</tbody>
      </table>
    </div>
  );
}

function RevenueChart() {
  return (
    <figure className="mt-4" aria-labelledby="billing-chart-caption">
      <div className="h-52 w-full sm:h-60"><svg className="h-full w-full overflow-visible" viewBox="0 0 760 230" preserveAspectRatio="none" role="img" aria-labelledby="revenue-title revenue-desc"><title id="revenue-title">Ingresos y gastos mensuales</title><desc id="revenue-desc">Los ingresos crecen de 86 mil a 137 mil pesos entre enero y junio. Los gastos se mantienen por debajo de 85 mil pesos.</desc>{[28,72,116,160,204].map((y) => <line x1="0" x2="760" y1={y} y2={y} stroke="var(--line)" strokeDasharray="5 7" vectorEffect="non-scaling-stroke" key={y} />)}<path d="M8 178 C75 155 126 128 170 132 S270 174 332 168 S421 133 478 126 S586 116 632 106 S716 78 752 58" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" /><path d="M8 207 C72 202 119 189 170 191 S274 205 332 199 S424 181 478 178 S584 160 632 158 S714 141 752 134" fill="none" stroke="var(--focus)" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />{[[8,178],[170,132],[332,168],[478,126],[632,106],[752,58]].map(([x,y]) => <circle cx={x} cy={y} r="3.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" key={`${x}-${y}`} />)}</svg></div>
      <div className="grid grid-cols-6 text-center font-mono text-[0.58rem] font-semibold text-muted">{["Ene","Feb","Mar","Abr","May","Jun"].map((month) => <span key={month}>{month}</span>)}</div><figcaption className="sr-only" id="billing-chart-caption">Comparativa mensual de ingresos y gastos.</figcaption>
    </figure>
  );
}

function BillingSidebar() {
  return (
    <aside className="grid gap-3">
      <section className="rounded-xl border border-line bg-surface p-4"><h2 className="text-xs font-extrabold">Resumen de Cobros</h2><dl className="mt-3 divide-y divide-line">{[["Pagado hoy","$18,750.00","bg-success-soft text-success"],["Pendiente hoy","$7,450.00","bg-warning-soft text-warning"],["Reembolsos","-$1,250.00","bg-violet-soft text-violet"],["Ticket promedio","$1,450.00","bg-accent-soft text-accent"]].map(([label,value,tone]) => <div className="flex items-center gap-2 py-2.5" key={label}><span className={`grid size-7 place-items-center rounded-lg ${tone}`}><CircleDollarSign className="size-3.5" /></span><dt className="flex-1 text-[0.6rem] font-semibold text-muted">{label}</dt><dd className="font-mono text-[0.62rem] font-extrabold">{value}</dd></div>)}</dl></section>
      <section className="rounded-xl border border-line bg-surface p-4"><h2 className="text-xs font-extrabold">Métodos de Pago</h2><div className="mt-4 grid grid-cols-[5.5rem_1fr] items-center gap-3"><div className="grid size-20 place-items-center rounded-full" style={{ background: "conic-gradient(var(--accent) 0 45.8%, var(--success) 45.8% 70.8%, var(--danger) 70.8% 91.6%, var(--warning) 91.6% 100%)" }}><div className="grid size-14 place-items-center rounded-full bg-surface text-center"><span><strong className="block font-mono text-base">24</strong><span className="text-[0.5rem] text-muted">Total</span></span></div></div><ul className="grid gap-1.5">{[["Tarjeta","45.8%","bg-accent"],["Efectivo","25.0%","bg-success"],["Transferencia","20.8%","bg-danger"],["Seguro","8.4%","bg-warning"]].map(([method,percentage,color]) => <li className="flex items-center gap-1.5 text-[0.55rem]" key={method}><span className={`size-1.5 rounded-full ${color}`} /><span className="flex-1 text-muted">{method}</span><strong className="font-mono">{percentage}</strong></li>)}</ul></div></section>
      <section className="rounded-xl border border-line bg-surface p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><BrainCircuit className="size-4" /></span><h2 className="text-xs font-extrabold">IA Epidemiológica</h2></div><div className="mt-3 grid gap-2"><div className="rounded-lg border border-line p-2.5"><p className="flex items-center gap-2 text-[0.58rem] font-extrabold"><span className="size-1.5 rounded-full bg-accent" />1 alerta activa</p><p className="mt-1 pl-3.5 text-[0.52rem] text-muted">Casos inusuales detectados</p></div><div className="rounded-lg border border-line p-2.5"><p className="flex items-center gap-2 text-[0.58rem] font-extrabold"><span className="size-1.5 rounded-full bg-success" />Riesgo actual: Moderado</p><p className="mt-1 pl-3.5 text-[0.52rem] text-muted">Tendencia estable</p></div></div><button className="mt-3 inline-flex min-h-8 w-full items-center justify-center gap-1 text-[0.6rem] font-bold text-accent hover:bg-accent-soft" type="button">Ver IA Epidemiológica <ArrowUpRight className="size-3" /></button></section>
    </aside>
  );
}

export function ClinicBilling() {
  const [period, setPeriod] = useState<Period>("Este mes");
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2400); };

  return (
    <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
      {notice ? <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl" role="status"><Check className="size-4 text-success" />{notice}</div> : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Control financiero</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Facturación</h1><p className="mt-1 text-xs text-muted">Control de ingresos, pagos y facturas de la clínica.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Reporte preparado para exportar")}><Download className="size-3.5" />Exportar</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => showNotice("Formulario de factura listo para conectar")}><Plus className="size-3.5" />Nueva factura</button></div></header>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de facturación"><MetricCard icon={WalletCards} label="Ingresos del mes" value="$124,500" helper="MXN facturados" badge="+8.4%" tone="bg-success-soft text-success" /><MetricCard icon={ReceiptText} label="Facturas pagadas" value="86" helper="Cobros conciliados" badge="Al día" tone="bg-success-soft text-success" /><MetricCard icon={Clock3} label="Pendientes de cobro" value="14" helper="$7,450 por cobrar" badge="Pendiente" tone="bg-warning-soft text-warning" /><MetricCard icon={TriangleAlert} label="Vencidas" value="5" helper="Requieren seguimiento" badge="Vencida" tone="bg-danger-soft text-danger" /></section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]" aria-labelledby="recent-invoices-title"><div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center"><div><h2 className="text-xs font-extrabold" id="recent-invoices-title">Facturas Recientes</h2><p className="mt-0.5 text-[0.58rem] text-muted">Seguimiento de pagos y estados de cobro.</p></div><div className="flex rounded-lg bg-surface-subtle p-1 sm:ml-auto">{(["Hoy","Esta semana","Este mes"] as const).map((item) => <button className={`min-h-7 rounded-md px-3 text-[0.56rem] font-bold ${period === item ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div><button className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:bg-surface-hover" type="button" aria-label="Filtrar facturas" onClick={() => showNotice(`Mostrando: ${period}`)}><SlidersHorizontal className="size-3.5" /></button></div><InvoiceTable onNotice={showNotice} /><div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3"><p className="text-[0.58rem] text-muted">Mostrando 1 a 6 de 24 facturas</p><div className="flex gap-1">{[1,2,3,4].map((page) => <button className={`grid size-7 place-items-center rounded-md text-[0.58rem] font-bold ${page === 1 ? "bg-accent text-white" : "border border-line text-muted"}`} type="button" key={page}>{page}</button>)}</div></div></section>
          <section className="rounded-xl border border-line bg-surface p-4 shadow-[0_0.3rem_1rem_rgb(16_27_51/4%)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xs font-extrabold">Ingresos vs Gastos</h2><p className="mt-1 text-[0.58rem] text-muted">Comparativa mensual de ingresos y gastos.</p></div><div className="flex gap-3 text-[0.52rem] font-bold text-muted"><span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-accent" />Ingresos</span><span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-focus" />Gastos</span></div></div><RevenueChart /></section>
        </div>
        <BillingSidebar />
      </div>
    </div>
  );
}

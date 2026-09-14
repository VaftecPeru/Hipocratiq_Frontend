"use client";

import { ArrowUpRight, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, FileText, Loader2, Percent, RefreshCw, UserRoundCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getClinicAppointments, getClinicBillingReport, getClinicDashboard } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicAppointment, ClinicAppointmentSummary, ClinicBillingReport, ClinicDashboardData } from "@/features/clinics/model/clinic-admin.types";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ReportPeriod = "Hoy" | "Esta semana" | "Este mes";
type DailyCount = { label: string; count: number };

const REPORT_PERIODS: readonly ReportPeriod[] = ["Hoy", "Esta semana", "Este mes"];
const DAY_FORMATTER = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" });

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function periodRange(period: ReportPeriod): { from: string; to: string } {
  const from = new Date();
  const to = new Date();
  if (period === "Esta semana") {
    const day = from.getDay();
    from.setDate(from.getDate() - (day === 0 ? 6 : day - 1));
    to.setTime(from.getTime());
    to.setDate(from.getDate() + 6);
  } else if (period === "Este mes") {
    from.setDate(1);
    to.setMonth(to.getMonth() + 1, 0);
  }
  return { from: dateKey(from), to: dateKey(to) };
}

function chartDays(period: ReportPeriod): Date[] {
  const today = new Date();
  if (period === "Hoy") return [today];
  if (period === "Esta semana") {
    const mondayOffset = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - mondayOffset + index);
      return day;
    });
  }
  const count = Math.min(7, today.getDate());
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today.getFullYear(), today.getMonth(), 1);
    day.setDate(Math.max(1, today.getDate() - 6) + index);
    return day;
  });
}

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency, minimumFractionDigits: 2 }).format(minor / 100);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function LineChart({ daily }: Readonly<{ daily: DailyCount[] }>) {
  const max = Math.max(...daily.map((item) => item.count), 1);
  return <figure className="mt-5" aria-label="Citas registradas por día"><div className="grid h-48 grid-cols-7 items-end gap-2 border-b border-line sm:gap-4">{daily.map((item) => <div className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5" key={item.label}><span className="font-mono text-[0.52rem] font-bold text-ink-secondary">{item.count}</span><span className="w-full max-w-9 rounded-t-md bg-accent transition-[height]" style={{ height: `${Math.max((item.count / max) * 72, item.count ? 8 : 2)}%` }} /><span className="text-[0.52rem] font-semibold text-muted">{item.label}</span></div>)}</div><figcaption className="mt-2 text-[0.56rem] text-muted">Citas registradas en el periodo seleccionado.</figcaption></figure>;
}

function StatusDonut({ summary }: Readonly<{ summary: ClinicAppointmentSummary }>) {
  const total = Math.max(summary.periodTotal ?? summary.todayTotal, 1);
  const confirmed = (summary.confirmed / total) * 100;
  const pending = confirmed + (summary.pending / total) * 100;
  const attention = pending + (summary.inConsultation / total) * 100;
  return <div className="mt-5 flex items-center gap-5"><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--success) 0 ${confirmed}%, var(--warning) ${confirmed}% ${pending}%, var(--accent) ${pending}% ${attention}%, var(--danger) ${attention}% 100%)` }}><div className="grid size-20 place-items-center rounded-full bg-surface text-center"><strong className="font-mono text-2xl">{summary.periodTotal ?? summary.todayTotal}</strong><span className="text-[0.5rem] text-muted">Total</span></div></div><ul className="grid flex-1 gap-2 text-[0.58rem] font-semibold text-muted"><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-success" aria-hidden="true" />Confirmadas <b className="ml-auto text-ink">{summary.confirmed}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-warning" aria-hidden="true" />Pendientes <b className="ml-auto text-ink">{summary.pending}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-accent" aria-hidden="true" />En atención <b className="ml-auto text-ink">{summary.inConsultation}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-danger" aria-hidden="true" />No asistieron <b className="ml-auto text-ink">{summary.noShow}</b></li></ul></div>;
}

export function ReceptionistReports() {
  const [period, setPeriod] = useState<ReportPeriod>("Esta semana");
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [summary, setSummary] = useState<ClinicAppointmentSummary>({ todayTotal: 0, periodTotal: 0, confirmed: 0, pending: 0, waiting: 0, inConsultation: 0, noShow: 0, canceled: 0 });
  const [dashboard, setDashboard] = useState<ClinicDashboardData | null>(null);
  const [billingReport, setBillingReport] = useState<ClinicBillingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const { notice, showNotice } = useNotice();
  const range = useMemo(() => periodRange(period), [period]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => { if (active) setIsLoading(true); });
    Promise.all([
      getClinicDashboard(controller.signal),
      getClinicAppointments(range.from, range.to, controller.signal),
      getClinicBillingReport(range.from, range.to, controller.signal),
    ])
      .then(([clinicDashboard, agenda, report]) => {
        if (controller.signal.aborted) return;
        setDashboard(clinicDashboard);
        setAppointments(agenda.appointments);
        setSummary(agenda.summary);
        setBillingReport(report);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) showNotice(error instanceof Error ? error.message : "No pudimos cargar los reportes.");
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [range.from, range.to, refreshToken, showNotice]);

  const daily = useMemo<DailyCount[]>(() => chartDays(period).map((day) => ({
    label: DAY_FORMATTER.format(day).replace(".", ""),
    count: appointments.filter((appointment) => appointment.scheduledDate === dateKey(day)).length,
  })), [appointments, period]);
  const currencySummary = Object.values(billingReport?.byCurrency ?? {}).find((item) => item.currency === "MXN") ?? Object.values(billingReport?.byCurrency ?? {})[0];
  const patientsTotal = dashboard?.metrics.patientsTotal ?? 0;
  const appointmentTotal = summary.periodTotal ?? summary.todayTotal;
  const collectionRate = currencySummary && currencySummary.invoicedMinor > 0 ? (currencySummary.paidMinor / currencySummary.invoicedMinor) * 100 : null;
  const sourceRows = [
    { name: "Agenda clínica", type: "Operativo", value: `${appointments.length} citas`, href: "/clinic/agenda" },
    { name: "Directorio de pacientes", type: "Operativo", value: `${patientsTotal} perfiles`, href: "/clinic/pacientes" },
    { name: "Facturación de pacientes", type: "Financiero", value: currencySummary ? formatMoney(currencySummary.paidMinor, currencySummary.currency) : "Sin datos", href: "/clinic/caja-pagos" },
    { name: "No asistencias", type: "Operativo", value: `${summary.noShow} registros`, href: "/clinic/agenda" },
  ];

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · inteligencia operativa</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Reportes</h1><p className="mt-1 text-xs text-muted">Seguimiento operativo y financiero desde recepción.</p></div><button className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto" type="button" onClick={() => setRefreshToken((token) => token + 1)} disabled={isLoading}><RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar</button></header>
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de recepción"><AdminMetric icon={CalendarDays} label="Citas del periodo" value={isLoading ? "—" : String(appointmentTotal)} helper={`${range.from} — ${range.to}`} tone="bg-accent-soft text-accent" /><AdminMetric icon={UserRoundCheck} label="Pacientes registrados" value={isLoading ? "—" : String(patientsTotal)} helper="Perfiles de la clínica" tone="bg-success-soft text-success" /><AdminMetric icon={CircleDollarSign} label="Cobrado en el periodo" value={currencySummary ? formatMoney(currencySummary.paidMinor, currencySummary.currency) : "—"} helper={currencySummary ? `${currencySummary.currency} cobrado` : "Reporte no disponible"} tone="bg-accent-soft text-accent" /><AdminMetric icon={XCircle} label="No asistieron" value={isLoading ? "—" : String(summary.noShow)} helper="Seguimiento requerido" tone="bg-danger-soft text-danger" /></section>
    {isLoading ? <div className="mt-4 grid min-h-64 place-items-center rounded-xl border border-line bg-surface text-xs font-semibold text-muted" role="status"><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Cargando reportes...</div> : <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4"><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg bg-surface-subtle p-1">{REPORT_PERIODS.map((item) => <button className={`min-h-8 rounded-md px-3 text-[0.56rem] font-bold ${period === item ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div><span className="text-[0.58rem] text-muted">{range.from} — {range.to}</span></div><div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]"><SectionCard className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-extrabold">Citas registradas</h2><p className="mt-1 text-[0.56rem] text-muted">Actividad real de la agenda de recepción.</p></div><CalendarDays className="size-4 text-accent" aria-hidden="true" /></div><LineChart daily={daily} /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Estado de citas</h2><StatusDonut summary={summary} /></SectionCard></div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><SectionCard className="p-4"><div className="flex items-start justify-between"><div><h2 className="text-xs font-extrabold">Registros operativos</h2><p className="mt-1 text-[0.56rem] text-muted">Citas agrupadas por día del periodo.</p></div><span className="text-[0.52rem] font-bold text-accent">{period}</span></div><LineChart daily={daily} /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Resumen ejecutivo</h2><dl className="mt-3 divide-y divide-line"><div className="flex items-center gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-full bg-success-soft text-success"><CheckCircle2 className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] font-semibold text-muted">Citas confirmadas</dt><dd className="font-mono text-[0.6rem] font-extrabold">{summary.confirmed}</dd></div><div className="flex items-center gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-full bg-warning-soft text-warning"><Clock3 className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] font-semibold text-muted">Citas pendientes</dt><dd className="font-mono text-[0.6rem] font-extrabold">{summary.pending}</dd></div><div className="flex items-center gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent"><UserRoundCheck className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] font-semibold text-muted">Pacientes registrados</dt><dd className="font-mono text-[0.6rem] font-extrabold">{patientsTotal}</dd></div><div className="flex items-center gap-2 py-2.5"><span className="grid size-6 place-items-center rounded-full bg-danger-soft text-danger"><XCircle className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] font-semibold text-muted">No asistieron</dt><dd className="font-mono text-[0.6rem] font-extrabold">{summary.noShow}</dd></div></dl></SectionCard></div>
        <SectionCard className="overflow-hidden"><div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center"><div><h2 className="text-xs font-extrabold">Fuentes operativas</h2><p className="mt-0.5 text-[0.56rem] text-muted">Accesos a los módulos que originan cada indicador.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-180 text-left"><caption className="sr-only">Fuentes operativas disponibles para recepción</caption><thead className="bg-surface-subtle text-[0.5rem] font-bold uppercase text-muted"><tr><th className="px-3 py-2" scope="col">Fuente</th><th className="px-3 py-2" scope="col">Tipo</th><th className="px-3 py-2" scope="col">Dato disponible</th><th className="px-3 py-2 text-right" scope="col">Acción</th></tr></thead><tbody className="divide-y divide-line">{sourceRows.map((row) => <tr className="text-[0.55rem]" key={row.name}><th className="px-3 py-2.5 font-extrabold" scope="row"><span className="inline-flex items-center gap-2"><FileText className="size-3 text-accent" aria-hidden="true" />{row.name}</span></th><td className="px-3 font-semibold text-ink-secondary">{row.type}</td><td className="px-3 font-semibold text-ink-secondary">{row.value}</td><td className="px-3 text-right"><Link className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-focus" href={row.href}>Abrir <ArrowUpRight className="size-3" aria-hidden="true" /></Link></td></tr>)}</tbody></table></div></SectionCard>
      </div>
      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Indicadores clave</h2><dl className="mt-3 divide-y divide-line"><div className="flex items-center gap-2 py-2.5"><Percent className="size-3.5 text-accent" aria-hidden="true" /><dt className="flex-1 text-[0.56rem] text-muted">Tasa de cancelación</dt><dd className="font-mono text-[0.58rem] font-extrabold">{appointments.length ? formatPercent((summary.canceled / appointments.length) * 100) : "—"}</dd></div><div className="flex items-center gap-2 py-2.5"><CircleDollarSign className="size-3.5 text-success" aria-hidden="true" /><dt className="flex-1 text-[0.56rem] text-muted">Cobranza efectiva</dt><dd className="font-mono text-[0.58rem] font-extrabold">{collectionRate === null ? "—" : formatPercent(collectionRate)}</dd></div><div className="flex items-center gap-2 py-2.5"><CheckCircle2 className="size-3.5 text-accent" aria-hidden="true" /><dt className="flex-1 text-[0.56rem] text-muted">Pagos registrados</dt><dd className="font-mono text-[0.58rem] font-extrabold">{currencySummary?.paymentCount ?? "—"}</dd></div><div className="flex items-center gap-2 py-2.5"><Clock3 className="size-3.5 text-warning" aria-hidden="true" /><dt className="flex-1 text-[0.56rem] text-muted">Saldo pendiente</dt><dd className="font-mono text-[0.58rem] font-extrabold">{currencySummary ? formatMoney(currencySummary.outstandingMinor, currencySummary.currency) : "—"}</dd></div></dl></SectionCard><SectionCard className="p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><CircleDollarSign className="size-4" aria-hidden="true" /></span><h2 className="text-xs font-extrabold">Caja y pagos</h2></div><p className="mt-3 text-[0.58rem] leading-relaxed text-muted">Registra pagos y consulta facturas de pacientes desde el módulo de caja.</p><Link className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1 text-[0.58rem] font-bold text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-focus" href="/clinic/caja-pagos">Ver caja <ArrowUpRight className="size-3" aria-hidden="true" /></Link></SectionCard></aside>
    </div>}
  </div>;
}

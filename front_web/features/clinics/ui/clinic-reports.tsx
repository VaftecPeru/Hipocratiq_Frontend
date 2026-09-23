"use client";

import { ArrowUpRight, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Download, Loader2, Percent, RefreshCw, UserRoundCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { exportClinicBillingReport, getClinicAppointments, getClinicBillingReport, getClinicDashboard } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicAppointment, ClinicAppointmentSummary, ClinicBillingReport, ClinicDashboardData } from "@/features/clinics/model/clinic-admin.types";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ReportPeriod = "Hoy" | "Esta semana" | "Este mes";

const reportPeriods: readonly ReportPeriod[] = ["Hoy", "Esta semana", "Este mes"];
const APPOINTMENT_DAY_FORMATTER = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

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

function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: 2 }).format(minor / 100);
}

function StatusDonut({ summary }: Readonly<{ summary: ClinicAppointmentSummary }>) {
  const total = Math.max(summary.periodTotal ?? summary.todayTotal, 1);
  const confirmed = (summary.confirmed / total) * 100;
  const pending = confirmed + (summary.pending / total) * 100;
  const attention = pending + (summary.inConsultation / total) * 100;
  return <div className="mt-5 flex items-center gap-5"><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--success) 0 ${confirmed}%, var(--warning) ${confirmed}% ${pending}%, var(--accent) ${pending}% ${attention}%, var(--danger) ${attention}% 100%)` }}><div className="grid size-20 place-items-center rounded-full bg-surface text-center"><strong className="font-mono text-2xl">{summary.periodTotal ?? summary.todayTotal}</strong><span className="text-[0.5rem] text-muted">Citas</span></div></div><ul className="grid flex-1 gap-2 text-[0.58rem] font-semibold text-muted"><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-success" aria-hidden="true" />Confirmadas <b className="ml-auto text-ink">{summary.confirmed}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-warning" aria-hidden="true" />Pendientes <b className="ml-auto text-ink">{summary.pending}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-accent" aria-hidden="true" />En atención <b className="ml-auto text-ink">{summary.inConsultation}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-danger" aria-hidden="true" />No asistieron <b className="ml-auto text-ink">{summary.noShow}</b></li></ul></div>;
}

function AppointmentBars({ appointments, period }: Readonly<{ appointments: ClinicAppointment[]; period: ReportPeriod }>) {
  const counts = useMemo(() => {
    const today = new Date();
    const days = period === "Hoy" ? [today] : period === "Esta semana"
      ? Array.from({ length: 7 }, (_, index) => {
        const day = new Date(today);
        const mondayOffset = today.getDay() === 0 ? 6 : today.getDay() - 1;
        day.setDate(today.getDate() - mondayOffset + index);
        return day;
      })
      : Array.from({ length: Math.min(7, today.getDate()) }, (_, index) => {
        const day = new Date(today.getFullYear(), today.getMonth(), 1);
        day.setDate(Math.max(1, today.getDate() - 6) + index);
        return day;
      });
    return days.map((day) => ({
      label: APPOINTMENT_DAY_FORMATTER.format(day).replace(".", ""),
      count: appointments.filter((appointment) => appointment.scheduledDate === dateKey(day)).length,
    }));
  }, [appointments, period]);
  const max = Math.max(...counts.map((item) => item.count), 1);
  return <figure className="mt-5" aria-label="Citas registradas por día"><div className="grid h-48 grid-cols-7 items-end gap-2 border-b border-line sm:gap-4">{counts.map((item) => <div className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5" key={item.label}><span className="font-mono text-[0.52rem] font-bold text-ink-secondary">{item.count}</span><span className="w-full max-w-9 rounded-t-md bg-accent transition-[height]" style={{ height: `${Math.max((item.count / max) * 72, item.count ? 8 : 2)}%` }} /><span className="text-[0.52rem] font-semibold text-muted">{item.label}</span></div>)}</div><figcaption className="mt-2 text-[0.56rem] text-muted">Citas registradas en el periodo seleccionado.</figcaption></figure>;
}

function BillingReportCard({ report }: Readonly<{ report: ClinicBillingReport | null }>) {
  const summaries = Object.values(report?.byCurrency ?? {});
  if (summaries.length === 0) return <p className="mt-4 rounded-lg bg-warning-soft px-3 py-3 text-xs font-semibold text-warning" role="status">No hay reporte de facturación disponible para este periodo.</p>;
  return <div className="mt-4 grid gap-2">{summaries.map((summary) => <div className="rounded-lg border border-line bg-surface-subtle p-3" key={summary.currency}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[0.58rem] font-extrabold text-accent">{summary.currency}</span><span className="text-[0.56rem] text-muted">{summary.invoiceCount} facturas</span></div><div className="mt-2 grid grid-cols-2 gap-3"><div><p className="text-[0.56rem] text-muted">Cobrado</p><p className="mt-1 font-mono text-sm font-bold">{formatMoney(summary.paidMinor, summary.currency)}</p></div><div><p className="text-[0.56rem] text-muted">Pendiente</p><p className="mt-1 font-mono text-sm font-bold">{formatMoney(summary.outstandingMinor, summary.currency)}</p></div></div></div>)}</div>;
}

export function ClinicReports() {
  const [period, setPeriod] = useState<ReportPeriod>("Esta semana");
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [summary, setSummary] = useState<ClinicAppointmentSummary>({ todayTotal: 0, confirmed: 0, pending: 0, waiting: 0, inConsultation: 0, noShow: 0, canceled: 0 });
  const [dashboard, setDashboard] = useState<ClinicDashboardData | null>(null);
  const [billingReport, setBillingReport] = useState<ClinicBillingReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    try {
      const { blob, filename } = await exportClinicBillingReport(range.from, range.to);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showNotice("Reporte exportado correctamente. El CSV es compatible con Excel.");
    } catch (error: unknown) {
      showNotice(error instanceof Error ? error.message : "No pudimos exportar el reporte.");
    } finally {
      setIsExporting(false);
    }
  }

  const currentCurrency = Object.values(billingReport?.byCurrency ?? {}).find((item) => item.currency === "MXN") ?? Object.values(billingReport?.byCurrency ?? {})[0];
  const completedAppointments = appointments.filter((appointment) => appointment.status === "completed").length;
  const noShowAppointments = appointments.filter((appointment) => appointment.status === "no_show").length;

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Inteligencia operativa</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Reportes</h1><p className="mt-1 text-xs text-muted">Indicadores operativos y facturación clínica respaldados por datos reales.</p></div><div className="flex flex-wrap gap-2 self-start sm:self-auto"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => void handleExport()} disabled={isLoading || isExporting}><Download className={`size-3.5 ${isExporting ? "animate-pulse" : ""}`} aria-hidden="true" />{isExporting ? "Exportando..." : "Exportar Excel/CSV"}</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => setRefreshToken((token) => token + 1)} disabled={isLoading}><RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />Actualizar</button></div></header>
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminMetric icon={CircleDollarSign} label="Cobrado en el periodo" value={currentCurrency ? formatMoney(currentCurrency.paidMinor, currentCurrency.currency) : "—"} helper={currentCurrency?.currency ?? "Reporte no disponible"} tone="bg-accent-soft text-accent" /><AdminMetric icon={UserRoundCheck} label="Pacientes registrados" value={dashboard ? String(dashboard.metrics.patientsTotal) : "—"} helper="Perfiles de la clínica" tone="bg-success-soft text-success" /><AdminMetric icon={CheckCircle2} label="Citas completadas" value={isLoading ? "—" : String(completedAppointments)} helper="Agenda del periodo" tone="bg-violet-soft text-violet" /><AdminMetric icon={XCircle} label="No asistieron" value={isLoading ? "—" : String(noShowAppointments)} helper="Seguimiento requerido" tone="bg-danger-soft text-danger" /></section>
    {isLoading ? <div className="mt-4 grid min-h-64 place-items-center rounded-xl border border-line bg-surface text-xs font-semibold text-muted" role="status"><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Cargando reportes...</div> : <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4"><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg bg-surface-subtle p-1">{reportPeriods.map((item) => <button className={`min-h-8 rounded-md px-3 text-[0.56rem] font-bold ${period === item ? "bg-surface text-accent shadow-sm" : "text-muted"}`} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div><span className="text-[0.58rem] text-muted">{range.from} — {range.to}</span></div><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><SectionCard className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-extrabold">Citas registradas</h2><p className="mt-1 text-[0.56rem] text-muted">Agenda clínica del periodo seleccionado.</p></div><CalendarDays className="size-4 text-accent" aria-hidden="true" /></div><AppointmentBars appointments={appointments} period={period} /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Estado de citas</h2><StatusDonut summary={summary} /></SectionCard></div><SectionCard className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-extrabold">Facturación de pacientes</h2><p className="mt-1 text-[0.56rem] text-muted">El reporte excluye la suscripción de la plataforma.</p></div><CircleDollarSign className="size-4 text-accent" aria-hidden="true" /></div><BillingReportCard report={billingReport} /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Fuentes disponibles</h2><dl className="mt-3 divide-y divide-line text-[0.6rem]"><div className="flex items-center gap-2 py-2.5"><CheckCircle2 className="size-3.5 text-success" aria-hidden="true" /><dt className="flex-1 text-muted">Agenda clínica</dt><dd className="font-bold">{appointments.length} citas</dd></div><div className="flex items-center gap-2 py-2.5"><CheckCircle2 className="size-3.5 text-success" aria-hidden="true" /><dt className="flex-1 text-muted">Directorio de pacientes</dt><dd className="font-bold">{dashboard?.metrics.patientsTotal ?? "—"}</dd></div><div className="flex items-center gap-2 py-2.5"><Clock3 className="size-3.5 text-muted" aria-hidden="true" /><dt className="flex-1 text-muted">Ocupación por consultorio</dt><dd className="font-bold text-muted">No disponible</dd></div></dl></SectionCard></div>
      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Indicadores de agenda</h2><dl className="mt-3 divide-y divide-line text-[0.6rem]"><div className="flex items-center gap-2 py-2.5"><Percent className="size-3.5 text-accent" aria-hidden="true" /><dt className="flex-1 text-muted">Tasa de cancelación</dt><dd className="font-mono font-extrabold">{appointments.length ? `${Math.round((summary.canceled / appointments.length) * 100)}%` : "—"}</dd></div><div className="flex items-center gap-2 py-2.5"><Clock3 className="size-3.5 text-warning" aria-hidden="true" /><dt className="flex-1 text-muted">Pendientes</dt><dd className="font-mono font-extrabold">{summary.pending}</dd></div><div className="flex items-center gap-2 py-2.5"><XCircle className="size-3.5 text-danger" aria-hidden="true" /><dt className="flex-1 text-muted">No asistieron</dt><dd className="font-mono font-extrabold">{summary.noShow}</dd></div></dl></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Accesos operativos</h2><p className="mt-2 text-[0.58rem] leading-relaxed text-muted">Consulta el detalle desde los módulos que originan cada dato.</p><Link className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-focus" href="/clinic/agenda">Abrir agenda <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link></SectionCard></aside>
    </div>}
  </div>;
}

"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  Percent,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClinicAppointments, getClinicDashboard, getClinicPatients } from "@/features/clinics/api/browser-clinic-dashboard";
import type { ClinicAppointment, ClinicAppointmentSummary } from "@/features/clinics/model/clinic-admin.types";
import { AdminMetric, Notice, SectionCard, useNotice } from "./clinic-admin-primitives";

type ReportPeriod = "Hoy" | "Esta semana" | "Este mes";
type DailyCount = { label: string; count: number };

const reportRows = [
  ["Citas del día", "Operativo", "Listo"],
  ["Pacientes nuevos", "Operativo", "Listo"],
  ["Caja diaria", "Financiero", "Listo"],
  ["Cobranza semanal", "Financiero", "En proceso"],
  ["No asistencias", "Operativo", "Programado"],
] as const;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekDays(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
}

function LineChart({ daily }: Readonly<{ daily: DailyCount[] }>) {
  const max = Math.max(...daily.map((item) => item.count), 1);
  return <figure className="mt-5" aria-label="Citas registradas por día"><div className="grid h-48 grid-cols-7 items-end gap-2 border-b border-line sm:gap-4">{daily.map((item) => <div className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5" key={item.label}><span className="font-mono text-[0.52rem] font-bold text-ink-secondary">{item.count}</span><span className="w-full max-w-9 rounded-t-md bg-accent transition-[height]" style={{ height: `${Math.max((item.count / max) * 72, item.count ? 8 : 2)}%` }} /><span className="text-[0.52rem] font-semibold text-muted">{item.label}</span></div>)}</div><figcaption className="mt-2 text-[0.56rem] text-muted">Citas registradas en el periodo seleccionado.</figcaption></figure>;
}

function StatusDonut({ summary }: Readonly<{ summary: ClinicAppointmentSummary }>) {
  const total = Math.max(summary.todayTotal, 1);
  const confirmed = (summary.confirmed / total) * 100;
  const pending = confirmed + (summary.pending / total) * 100;
  const attention = pending + (summary.inConsultation / total) * 100;
  return <div className="mt-5 flex items-center gap-5"><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--success) 0 ${confirmed}%, var(--warning) ${confirmed}% ${pending}%, var(--accent) ${pending}% ${attention}%, var(--danger) ${attention}% 100%)` }}><div className="grid size-20 place-items-center rounded-full bg-surface text-center"><strong className="font-mono text-2xl">{summary.todayTotal}</strong><span className="text-[0.5rem] text-muted">Total</span></div></div><ul className="grid flex-1 gap-2 text-[0.58rem] font-semibold text-muted"><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-success" />Confirmadas <b className="ml-auto text-ink">{summary.confirmed}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-warning" />Pendientes <b className="ml-auto text-ink">{summary.pending}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-accent" />En atención <b className="ml-auto text-ink">{summary.inConsultation}</b></li><li className="flex items-center gap-2"><i className="size-2 rounded-full bg-danger" />No asistieron <b className="ml-auto text-ink">{summary.noShow}</b></li></ul></div>;
}

export function ReceptionistReports() {
  const [period, setPeriod] = useState<ReportPeriod>("Esta semana");
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [summary, setSummary] = useState<ClinicAppointmentSummary>({ todayTotal: 0, confirmed: 0, pending: 0, waiting: 0, inConsultation: 0, noShow: 0, canceled: 0 });
  const [patientsTotal, setPatientsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    const controller = new AbortController();
    const days = weekDays();
    Promise.all([
      getClinicDashboard(controller.signal),
      getClinicAppointments(dateKey(days[0]), dateKey(days[6]), controller.signal),
      getClinicPatients("", 1, controller.signal),
    ])
      .then(([dashboard, agenda, patients]) => {
        setAppointments(agenda.appointments);
        setSummary(agenda.summary);
        setPatientsTotal(patients.pagination.total);
        if (dashboard.metrics.patientsTotal !== patients.pagination.total) setPatientsTotal(dashboard.metrics.patientsTotal);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) showNotice(error instanceof Error ? error.message : "No pudimos cargar los reportes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [showNotice]);

  const daily = useMemo<DailyCount[]>(() => weekDays().map((day) => ({
    label: day.toLocaleDateString("es-PE", { day: "numeric", month: "short" }).replace(".", ""),
    count: appointments.filter((appointment) => appointment.scheduledDate === dateKey(day)).length,
  })), [appointments]);

  return <div className="mx-auto w-full max-w-400 px-4 py-5 sm:px-6 lg:px-7">
    <Notice message={notice} />
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="font-mono text-[0.62rem] font-bold tracking-[0.13em] text-accent uppercase">Recepción · inteligencia operativa</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Reportes</h1><p className="mt-1 text-xs text-muted">Seguimiento operativo y financiero desde recepción.</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-extrabold hover:bg-surface-hover" type="button" onClick={() => showNotice("Programador de reportes abierto")}><CalendarDays className="size-3.5" aria-hidden="true" />Programar reporte</button><button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-xs font-extrabold text-white shadow-sm hover:bg-accent-hover" type="button" onClick={() => showNotice("Reporte preparado para exportar")}><Download className="size-3.5" aria-hidden="true" />Exportar reporte</button></div></header>

    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de recepción"><AdminMetric icon={CalendarDays} label="Citas de hoy" value={String(summary.todayTotal)} badge={summary.todayTotal ? "+15%" : undefined} helper="Agenda del día" tone="bg-accent-soft text-accent" /><AdminMetric icon={UserRoundCheck} label="Pacientes registrados" value={String(patientsTotal)} helper="Perfiles activos" tone="bg-success-soft text-success" /><AdminMetric icon={CircleDollarSign} label="Ingresos del día" value="—" helper="Caja aún no integrada" tone="bg-accent-soft text-accent" /><AdminMetric icon={XCircle} label="No asistieron" value={String(summary.noShow)} helper="Seguimiento requerido" tone="bg-danger-soft text-danger" /></section>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4"><div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]"><SectionCard className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xs font-extrabold">Atención e ingresos</h2><p className="mt-1 text-[0.56rem] text-muted">Actividad real de la agenda de recepción.</p></div><select className="h-7 rounded-md border border-line bg-surface-input px-2 text-[0.55rem] font-bold text-accent" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)}><option>Hoy</option><option>Esta semana</option><option>Este mes</option></select></div>{isLoading ? <p className="py-24 text-center text-xs font-semibold text-muted">Cargando datos…</p> : <LineChart daily={daily} />}</SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Estado de citas</h2>{isLoading ? <p className="py-24 text-center text-xs font-semibold text-muted">Cargando…</p> : <StatusDonut summary={summary} />}</SectionCard></div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><SectionCard className="p-4"><div className="flex items-start justify-between"><div><h2 className="text-xs font-extrabold">Registros por día</h2><p className="mt-1 text-[0.56rem] text-muted">Citas agendadas en la semana.</p></div><span className="text-[0.52rem] font-bold text-accent">Últimos 7 días</span></div><LineChart daily={daily} /></SectionCard><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Resumen ejecutivo</h2><dl className="mt-3 divide-y divide-line">{[["Citas confirmadas",String(summary.confirmed),"bg-success-soft text-success"],["Citas pendientes",String(summary.pending),"bg-warning-soft text-warning"],["Pacientes registrados",String(patientsTotal),"bg-accent-soft text-accent"],["No asistieron",String(summary.noShow),"bg-danger-soft text-danger"]].map(([label,value,tone]) => <div className="flex items-center gap-2 py-2.5" key={label}><span className={`grid size-6 place-items-center rounded-full ${tone}`}><CheckCircle2 className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] font-semibold text-muted">{label}</dt><dd className="font-mono text-[0.6rem] font-extrabold">{value}</dd></div>)}</dl></SectionCard></div>
        <SectionCard className="overflow-hidden"><div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center"><div><h2 className="text-xs font-extrabold">Reportes generados recientemente</h2><p className="mt-0.5 text-[0.56rem] text-muted">Consultas rápidas disponibles para recepción.</p></div><div className="flex gap-1 sm:ml-auto">{(["Hoy", "Esta semana", "Este mes"] as const).map((item) => <button className={`min-h-7 rounded-md px-3 text-[0.53rem] font-bold ${period === item ? "bg-accent-soft text-accent" : "border border-line text-muted"}`} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-180 text-left"><thead className="bg-surface-subtle text-[0.5rem] font-bold uppercase text-muted"><tr><th className="px-3 py-2" scope="col">Reporte</th><th className="px-3 py-2" scope="col">Tipo</th><th className="px-3 py-2" scope="col">Estado</th><th className="px-3 py-2 text-right" scope="col">Acción</th></tr></thead><tbody className="divide-y divide-line">{reportRows.map(([name, type, status]) => <tr className="text-[0.55rem]" key={name}><th className="px-3 py-2.5 font-extrabold"><span className="inline-flex items-center gap-2"><FileText className="size-3 text-accent" aria-hidden="true" />{name}</span></th><td className="px-3 font-semibold text-ink-secondary">{type}</td><td className="px-3"><span className={`rounded-md px-2 py-1 font-bold ${status === "Listo" ? "bg-success-soft text-success" : status === "En proceso" ? "bg-accent-soft text-accent" : "bg-warning-soft text-warning"}`}>{status}</span></td><td className="px-3 text-right"><button className="grid size-7 ml-auto place-items-center text-muted hover:text-accent" type="button" aria-label={`Abrir ${name}`} onClick={() => showNotice(`Abriendo ${name}`)}>{status === "Listo" ? <Download className="size-3" aria-hidden="true" /> : <Eye className="size-3" aria-hidden="true" />}</button></td></tr>)}</tbody></table></div></SectionCard>
      </div>
      <aside className="grid gap-3"><SectionCard className="p-4"><h2 className="text-xs font-extrabold">Indicadores clave</h2><dl className="mt-3 divide-y divide-line">{[["Tiempo promedio de espera","—"],["Cobranza efectiva","—"],["Registros completos",`${patientsTotal ? Math.round((patientsTotal / Math.max(patientsTotal, 1)) * 100) : 0}%`],["Pacientes sin datos",String(Math.max(0, patientsTotal - patientsTotal))]].map(([label,value]) => <div className="flex items-center gap-2 py-2.5" key={label}><span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent"><Percent className="size-3" aria-hidden="true" /></span><dt className="flex-1 text-[0.56rem] text-muted">{label}</dt><dd className="font-mono text-[0.58rem] font-extrabold">{value}</dd></div>)}</dl></SectionCard><SectionCard className="p-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet"><CircleDollarSign className="size-4" aria-hidden="true" /></span><h2 className="text-xs font-extrabold">Caja y pagos</h2></div><div className="mt-3 rounded-lg border border-line p-3 text-[0.56rem]"><p className="font-extrabold">Módulo operativo</p><p className="mt-1 text-muted">Los importes se mostrarán cuando se conecte el dominio de cobros.</p><p className="mt-3 font-bold text-warning">Estado: pendiente de integración</p></div><button className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 text-[0.58rem] font-bold text-accent" type="button" onClick={() => showNotice("Abriendo Caja y Pagos")}>Ver caja <ArrowUpRight className="size-3" aria-hidden="true" /></button></SectionCard></aside>
    </div>
  </div>;
}

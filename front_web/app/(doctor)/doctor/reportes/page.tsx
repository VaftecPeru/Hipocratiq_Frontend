"use client";

import { BarChart3, CheckCircle2, ClipboardList, FlaskConical, ShieldCheck, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { getDoctorReports, type DoctorReports } from "@/features/doctors/api/doctor-clinical";
import { DoctorCard, MetricCard, StatusBadge } from "@/features/doctors/ui/doctor-primitives";
import { DoctorModuleAlert, DoctorModuleError, DoctorModuleLoading } from "@/features/doctors/ui/doctor-module-state";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export default function DoctorReportsPage() {
  const [reports, setReports] = useState<DoctorReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getDoctorReports(controller.signal)
      .then(setReports)
      .catch((caught: unknown) => { if (!(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "No pudimos cargar los reportes."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) return <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6"><DoctorModuleLoading label="Cargando reportes…" /></div>;
  if (!reports) return <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6"><DoctorModuleError message={error ?? "No pudimos cargar los reportes."} /></div>;

  const { metrics } = reports;
  const metricCards = [
    { label: "Consultas del período", value: String(metrics.consultations), icon: ClipboardList, tone: "blue" as const },
    { label: "Pacientes atendidos", value: String(metrics.patients), icon: Users, tone: "green" as const },
    { label: "Recetas emitidas", value: String(metrics.prescriptions), icon: BarChart3, tone: "red" as const },
    { label: "Teleconsultas", value: String(metrics.teleconsultations), icon: Video, tone: "violet" as const },
  ];
  const sources = Object.entries(reports.sources);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      <header className="mb-5"><h1 className="text-[1.45rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">Reportes</h1><p className="mt-1 text-[0.68rem] font-bold text-ink-secondary">Indicadores calculados desde los registros clínicos de tu práctica.</p></header>
      {error ? <DoctorModuleAlert>{error}</DoctorModuleAlert> : null}
      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Resumen de reportes">{metricCards.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]" aria-label="Reporte operativo">
        <DoctorCard className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[0.86rem] font-extrabold">Actividad clínica</h2><p className="mt-1 text-[0.58rem] font-bold text-ink-secondary">Período: {formatDate(reports.period.from)} – {formatDate(reports.period.to)}</p></div><BarChart3 className="size-5 text-accent" aria-hidden="true" /></div><dl className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Consultas completadas</dt><dd className="mt-1 text-lg font-extrabold">{metrics.completedConsultations}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Consultas firmadas</dt><dd className="mt-1 text-lg font-extrabold">{metrics.signedConsultations}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Solicitudes de laboratorio</dt><dd className="mt-1 text-lg font-extrabold">{metrics.laboratoryOrders}</dd></div><div className="rounded-lg border border-line bg-surface-subtle p-3"><dt className="text-[0.57rem] font-extrabold text-ink-secondary">Resultados críticos</dt><dd className="mt-1 text-lg font-extrabold text-danger">{metrics.criticalLaboratoryOrders}</dd></div></dl></DoctorCard>
        <DoctorCard className="p-4"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-success-soft text-success"><CheckCircle2 className="size-4" aria-hidden="true" /></span><h2 className="text-[0.86rem] font-extrabold">Fuentes disponibles</h2></div><p className="mt-2 text-[0.58rem] font-bold text-ink-secondary">Cada indicador se calcula con datos propios; no se muestran valores de demostración.</p><ul className="mt-4 grid gap-2">{sources.map(([source, available]) => <li className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5" key={source}><ShieldCheck className={`size-3.5 ${available ? "text-success" : "text-muted"}`} aria-hidden="true" /><span className="flex-1 text-[0.59rem] font-extrabold capitalize">{source}</span><StatusBadge tone={available ? "green" : "slate"}>{available ? "Disponible" : "Sin datos"}</StatusBadge></li>)}</ul></DoctorCard>
      </section>
      <DoctorCard className="mt-4 p-4"><div className="flex items-center gap-2"><FlaskConical className="size-4 text-accent" aria-hidden="true" /><h2 className="text-[0.82rem] font-extrabold">Estado del informe</h2></div><p className="mt-2 text-[0.59rem] font-bold text-ink-secondary">Generado el {formatDate(reports.generatedAt)} desde la información clínica disponible. Exportación de archivos y reportes programados requieren una decisión de producto adicional.</p></DoctorCard>
    </div>
  );
}
